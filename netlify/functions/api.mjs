// UGC.KZ — серверная часть (Netlify Functions).
// Все запросы /api/* попадают сюда. Данные хранятся в Supabase (PostgreSQL),
// а здесь — логика: фильтрация, подсчёт рейтинга, статистика, проверка
// и сохранение сообщений и отзывов.

const SUPABASE_URL = (process.env.SUPABASE_URL || "https://uhxybewgjkpqdjihyenn.supabase.co").replace(/\/$/, "");
// anon-ключ публичный (данные защищены RLS-правилами в БД); service_role здесь не используется.
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoeHliZXdnamtwcWRqaWh5ZW5uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwMjI4NjksImV4cCI6MjEwNzU5ODg2OX0.QWtdioVQH4B3oHSWGXP6ZjJfuw8eu5cJndqjXMh7NN4";

const CITIES = ["Актау","Актобе","Алматы","Астана","Атырау","Жезказган","Караганда","Кокшетау","Костанай","Кызылорда","Павлодар","Петропавловск","Семей","Талдыкорган","Тараз","Уральск","Усть-Каменогорск","Шымкент"];

const json = (data, status = 200, extra = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*", ...extra },
  });

class HttpError extends Error { constructor(status, msg) { super(msg); this.status = status; } }

// Запрос к БД (Supabase REST). token — JWT пользователя, чтобы работали RLS-правила.
async function db(path, { method = "GET", body, token, prefer } = {}) {
  const headers = { apikey: SUPABASE_KEY, Authorization: "Bearer " + (token || SUPABASE_KEY), "Content-Type": "application/json" };
  if (prefer) headers.Prefer = prefer;
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const text = await r.text();
  if (!r.ok) {
    if (/23505|duplicate/i.test(text)) throw new HttpError(409, "duplicate");
    if (r.status === 401 || r.status === 403 || /row-level security/i.test(text)) throw new HttpError(403, "forbidden");
    throw new HttpError(502, "db_error");
  }
  return text ? JSON.parse(text) : null;
}

// Проверяем токен пользователя на сервере и получаем его id, email, имя, роль.
async function getUser(req) {
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token) throw new HttpError(401, "login_required");
  const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + token } });
  if (!r.ok) throw new HttpError(401, "invalid_token");
  const u = await r.json();
  const m = u.user_metadata || {};
  return { token, id: u.id, email: String(u.email || "").toLowerCase(), name: String(m.name || u.email.split("@")[0]).slice(0, 80), role: m.role || "biz" };
}

const num = (v, d = 0) => (Number.isFinite(+v) ? +v : d);

// Рейтинг и число отзывов считаются на сервере из таблицы reviews.
function withRatings(creators, reviews) {
  const agg = new Map();
  for (const r of reviews) {
    const a = agg.get(r.creator_id) || { sum: 0, n: 0 };
    a.sum += num(r.rating); a.n += 1; agg.set(r.creator_id, a);
  }
  return creators.map(c => {
    const a = agg.get(c.id);
    return { ...c, r: a ? Math.round((a.sum / a.n) * 10) / 10 : 0, c: a ? a.n : 0 };
  });
}

async function loadAll() {
  const [creators, brands, reviews] = await Promise.all([
    db("creators?select=*&order=id.desc"),
    db("brands?select=id,name,owner_id,created_at&order=id.desc"),
    db("reviews?select=*&order=id.desc"),
  ]);
  return { creators: withRatings(creators, reviews), brands, reviews };
}

// Фильтры каталога: ?q=&city=&cat=&type=&max=&sort=r|p_asc|p_desc|new
function filterCreators(list, p) {
  const q = (p.get("q") || "").trim().toLowerCase();
  const city = p.get("city"), cat = p.get("cat"), type = p.get("type"), max = num(p.get("max"), 0);
  let out = list.filter(c =>
    (!q || [c.n, c.city, c.bio, ...(c.t || [])].join(" ").toLowerCase().includes(q)) &&
    (!city || c.city === city) &&
    (!cat || (c.t || []).includes(cat)) &&
    (!type || c.type === type) &&
    (!max || num(c.p) <= max));
  const sort = p.get("sort") || "r";
  const by = { r: (a, b) => b.r - a.r || b.c - a.c, p_asc: (a, b) => a.p - b.p, p_desc: (a, b) => b.p - a.p, new: (a, b) => b.id - a.id }[sort];
  if (by) out = out.sort(by);
  return out;
}

function stats({ creators, brands, reviews }) {
  const byCity = {};
  for (const c of creators) if (c.city) byCity[c.city] = (byCity[c.city] || 0) + 1;
  const prices = creators.map(c => num(c.p)).filter(Boolean);
  return {
    creators: creators.length,
    brands: brands.length,
    reviews: reviews.length,
    cities: Object.keys(byCity).length,
    avg_price: prices.length ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0,
    avg_rating: reviews.length ? Math.round((reviews.reduce((a, r) => a + num(r.rating), 0) / reviews.length) * 10) / 10 : 0,
    by_city: byCity,
  };
}

async function readBody(req) {
  try { return await req.json(); } catch { throw new HttpError(400, "bad_json"); }
}

// POST /api/messages — бренд пишет креатору
async function postMessage(req) {
  const u = await getUser(req);
  const b = await readBody(req);
  const text = String(b.body || "").trim();
  const creatorId = num(b.creator_id);
  if (text.length < 5 || text.length > 2000) throw new HttpError(400, "body_length");
  const [cr] = await db(`creators?select=id,owner_id&id=eq.${creatorId}`);
  if (!cr) throw new HttpError(404, "creator_not_found");
  if (cr.owner_id === u.id) throw new HttpError(400, "self_message");
  const row = { id: Date.now(), creator_id: creatorId, from_id: u.id, from_name: u.name, from_email: u.email, body: text };
  await db("messages", { method: "POST", body: row, token: u.token, prefer: "return=minimal" });
  return json({ ok: true, message: row }, 201);
}

// POST /api/reviews — бренд оставляет отзыв креатору (1 раз)
async function postReview(req) {
  const u = await getUser(req);
  const b = await readBody(req);
  const text = String(b.body || "").trim();
  const rating = Math.round(num(b.rating));
  const creatorId = num(b.creator_id);
  if (rating < 1 || rating > 5) throw new HttpError(400, "rating_range");
  if (text.length < 5 || text.length > 1000) throw new HttpError(400, "body_length");
  if (u.role === "creator") throw new HttpError(403, "brands_only");
  const [cr] = await db(`creators?select=id,owner_id&id=eq.${creatorId}`);
  if (!cr) throw new HttpError(404, "creator_not_found");
  if (cr.owner_id === u.id) throw new HttpError(400, "self_review");
  const row = { id: Date.now(), creator_id: creatorId, author_id: u.id, author_name: u.name, rating, body: text };
  await db("reviews", { method: "POST", body: row, token: u.token, prefer: "return=minimal" });
  return json({ ok: true, review: row }, 201);
}

export default async (req) => {
  const url = new URL(req.url);
  const route = url.pathname.replace(/^\/(\.netlify\/functions\/api|api)\/?/, "").replace(/\/$/, "");
  const key = `${req.method} ${route}`;
  try {
    if (req.method === "OPTIONS")
      return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, content-type", "Access-Control-Allow-Methods": "GET, POST, OPTIONS" } });
    switch (key) {
      case "GET health":
        return json({ ok: true, service: "ugc-kz-api", time: new Date().toISOString() });
      case "GET data":
        return json(await loadAll(), 200, { "Cache-Control": "no-store" });
      case "GET creators": {
        const all = await loadAll();
        const list = filterCreators(all.creators, url.searchParams);
        return json({ count: list.length, items: list });
      }
      case "GET brands":
        return json(await db("brands?select=id,name,created_at&order=id.desc"));
      case "GET stats":
        return json(stats(await loadAll()), 200, { "Cache-Control": "public, max-age=30" });
      case "GET cities":
        return json(CITIES);
      case "POST messages":
        return await postMessage(req);
      case "POST reviews":
        return await postReview(req);
      default:
        return json({ error: "not_found", route: key }, 404);
    }
  } catch (e) {
    const status = e instanceof HttpError ? e.status : 500;
    if (status === 500) console.error(e);
    return json({ error: e.message || "server_error" }, status);
  }
};

export const config = { path: "/api/*" };
