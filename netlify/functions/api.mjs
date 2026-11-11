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
    headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*", "Cache-Control": "no-store", ...extra },
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
  return { token, id: u.id, email: String(u.email || "").toLowerCase(), name: String(m.name || String(u.email || "").split("@")[0]).slice(0, 80), role: m.role || "biz" };
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
    db("brands?select=*&order=id.desc"),
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
  if (text.length < 5 || text.length > 2000) throw new HttpError(400, "body_length");
  if ([b.creator_id,b.brand_id,b.recipient_id].filter(v=>v!==undefined && v!==null).length !== 1)
    throw new HttpError(400, "one_recipient_required");
  const row = { from_id:u.id, from_name:u.name, from_email:u.email, body:text };
  if (b.recipient_id) {
    if (!isUuid(b.recipient_id)) throw new HttpError(400,"invalid_recipient");
    row.recipient_id = b.recipient_id;
    if (row.recipient_id===u.id) throw new HttpError(400,"self_message");
  } else {
    const kind=b.brand_id!==undefined?"brand":"creator", id=positiveId(b[kind+"_id"]);
    const [profile]=await db(`${kind==="brand"?"brands":"creators"}?select=id,owner_id&id=eq.${id}`);
    if (!profile || !profile.owner_id) throw new HttpError(404,"recipient_not_found");
    if (profile.owner_id===u.id) throw new HttpError(400,"self_message");
    row[kind+"_id"]=id;
  }
  // The database resolves the recipient and overwrites sender identity itself.
  const [saved]=await db("messages", {method:"POST",body:row,token:u.token,prefer:"return=representation"});
  return json({ok:true,message:saved},201);
}

const isUuid = value => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(value));
function positiveId(value) {
  const id=Number(value);
  if (!Number.isSafeInteger(id) || id<=0) throw new HttpError(400,"invalid_id");
  return id;
}
const rpc=(name,body,token)=>db("rpc/"+name,{method:"POST",body,token});
async function requireActive(u) {
  if(await rpc("ugc_is_suspended",{},u.token)) throw new HttpError(403,"account_suspended");
}
async function requireAdmin(req) {
  const u=await getUser(req);
  if (!await rpc("ugc_is_admin",{},u.token)) throw new HttpError(403,"admin_required");
  return u;
}
async function myProfiles(req) {
  const u=await getUser(req);
  const [creators,brands,admin,suspended]=await Promise.all([
    db(`creators?select=*&owner_id=eq.${u.id}`,{token:u.token}),
    db(`brands?select=*&owner_id=eq.${u.id}`,{token:u.token}),
    rpc("ugc_is_admin",{},u.token),rpc("ugc_is_suspended",{},u.token)
  ]);
  return json({creators,brands,admin,suspended});
}
async function patchProfile(req) {
  const u=await getUser(req); await requireActive(u);
  const b=await readBody(req), kind=b.kind;
  if(!["creator","brand"].includes(kind)) throw new HttpError(400,"invalid_profile_type");
  const id=positiveId(b.id), table=kind==="creator"?"creators":"brands", fields={};
  const name=String(b.name||"").trim(), bio=String(b.bio||"").trim(), city=String(b.city||"").trim();
  if(!name || name.length>80 || bio.length>1000 || city.length>80) throw new HttpError(400,"invalid_profile");
  Object.assign(fields,{[kind==="creator"?"n":"name"]:name,bio,city});
  if (b.avatar_path!==undefined) {
    const avatar=String(b.avatar_path);
    if(avatar && (!/^[0-9a-f-]{36}\/[0-9a-f-]{36}\.(jpg|png|webp)$/.test(avatar) || !avatar.startsWith(u.id+"/")))
      throw new HttpError(400,"invalid_avatar");
    fields.avatar_path=avatar;
  }
  if(kind==="creator") {
    for(const [key,min] of [["p",1000],["ph",500]]) {
      const n=Number(b[key]); if(!Number.isSafeInteger(n)||n<min||n>100000000) throw new HttpError(400,"invalid_price"); fields[key]=n;
    }
    if(!Array.isArray(b.t)||!b.t.length||b.t.length>8||b.t.some(x=>typeof x!=="string"||x.length>80)) throw new HttpError(400,"invalid_category");
    if(!["Видео","Фото"].includes(b.type)) throw new HttpError(400,"invalid_content_type");
    fields.t=b.t; fields.type=b.type;
  } else {
    const website=String(b.website||"").trim();
    if(website && (website.length>300 || !/^https:\/\/[^\s]+$/i.test(website))) throw new HttpError(400,"invalid_website");
    if(website) { try { const parsed=new URL(website); if(parsed.username||parsed.password||!parsed.hostname) throw 0; } catch {throw new HttpError(400,"invalid_website");} }
    fields.website=website?new URL(website).href:'';
  }
  const rows=await db(`${table}?id=eq.${id}&owner_id=eq.${u.id}`,{method:"PATCH",body:fields,token:u.token,prefer:"return=representation"});
  if(!rows.length) throw new HttpError(404,"profile_not_found");
  return json({profile:rows[0]});
}
async function getMessages(req,url) {
  const u=await getUser(req);
  const before=url.searchParams.get("before");
  const rows=await db(`messages?select=*&or=(from_id.eq.${u.id},recipient_id.eq.${u.id})&order=id.desc&limit=100${before?"&id=lt."+positiveId(before):""}`,{token:u.token});
  return json({items:rows,next_before:rows.length===100?rows.at(-1).id:null});
}
async function markRead(req) {
  const u=await getUser(req), b=await readBody(req);
  if(!isUuid(b.sender_id)) throw new HttpError(400,"invalid_sender");
  await db(`messages?recipient_id=eq.${u.id}&from_id=eq.${b.sender_id}&read_at=is.null`,{method:"PATCH",body:{read_at:new Date().toISOString()},token:u.token});
  return json({ok:true});
}
async function profileStats(req,url) {
  const u=await getUser(req),kind=url.searchParams.get("kind");
  if(!["creator","brand"].includes(kind)) throw new HttpError(400,"invalid_profile_type");
  return json(await rpc("ugc_profile_stats",{kind,profile:positiveId(url.searchParams.get("id"))},u.token));
}
async function recordView(req) {
  const b=await readBody(req);
  if(!["creator","brand"].includes(b.kind)||!isUuid(b.visitor_key)) throw new HttpError(400,"invalid_view");
  // Anonymous view records are intentionally estimates, deduplicated per browser/day.
  const token=(req.headers.get("authorization")||"").replace(/^Bearer\s+/i,"");
  await rpc("ugc_record_view",{kind:b.kind,profile:positiveId(b.id),visitor_key:b.visitor_key},token||undefined);
  return json({ok:true});
}
async function moderate(req) {
  const u=await requireAdmin(req), b=await readBody(req);
  if(!["creator","brand","user"].includes(b.kind)||typeof b.enabled!=="boolean") throw new HttpError(400,"invalid_moderation");
  const target=b.kind==="user"?b.target:String(positiveId(b.target));
  if(b.kind==="user"&&!isUuid(target)) throw new HttpError(400,"invalid_target");
  await rpc("ugc_admin_moderate",{kind:b.kind,target,enabled:b.enabled},u.token);
  return json({ok:true});
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
      return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, content-type", "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS" } });
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
        return json(await db("brands?select=*&order=id.desc"));
      case "GET profile/me": return await myProfiles(req);
      case "PATCH profile": return await patchProfile(req);
      case "GET profile/stats": return await profileStats(req,url);
      case "POST profile/view": return await recordView(req);
      case "GET messages": return await getMessages(req,url);
      case "PATCH messages/read": return await markRead(req);
      case "GET admin": {
        const u=await requireAdmin(req);
        return json(await rpc("ugc_admin_overview",{},u.token));
      }
      case "POST admin/moderate": return await moderate(req);
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
