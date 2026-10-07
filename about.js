/* Страница «О нас» */
function about(){
  $("#app").innerHTML=`<div class="ph2"><div class="w"><h1>${t("about_t")}</h1><p>${t("about_lead")}</p></div></div>
  <div class="w sec"><div class="ins"><div><b>18</b>${t("st1")}</div><div><b>0 ₸</b>${t("st2")}</div><div><b>Real people</b>Real content. Real results.</div></div></div>
  <div class="w sec" style="padding-top:0"><div class="box"><h2 style="margin-bottom:8px">${t("idea_h")}</h2><p style="color:var(--mut)">${t("idea")}</p></div>
  <div class="box"><h2 style="margin-bottom:12px">${t("cities")}</h2><div class="chips" style="gap:8px">${CITIES.map(c=>`<button class="cat" style="padding:7px 14px" data-city="${c}">${cityL(c)}</button>`).join("")}</div></div>
  <div class="box"><h2 style="margin-bottom:8px">${t("contacts")}</h2><div class="pk"><span>${t("site")}</span><b>www.ugc.kz</b></div><div class="pk"><span>${t("mail")}</span><a class="link" href="mailto:hello@ugc.kz">hello@ugc.kz</a></div><div class="pk"><span>Instagram</span><b>@ugc.kz</b></div></div></div>`;
}
