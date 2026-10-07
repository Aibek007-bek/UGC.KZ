/* Главная страница */
const ICO=(d)=>`<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#0D5BD7" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
function home(){
  const fs=[ICO('<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.5 3-5.5 6-5.5s6 2 6 5.5M16 5a3 3 0 0 1 0 6M18 14.5c2 .6 3 2.2 3 4.5"/>'),ICO('<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>'),ICO('<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>'),ICO('<path d="M4 20V13M10 20V8M16 20V11M22 20V4"/>')];
  $("#app").innerHTML=`<div class="hero"><div class="w"><div>
  <h1>${t("hero_a")} <em>${t("hero_b")}</em></h1>
  <p class="lead">${t("lead")}</p>
  <div class="sbox"><div class="r"><input id="hq" placeholder="${t("search_ph")}" aria-label="${t("search_aria")}"><button class="btn" id="hgo">${t("start")}</button></div>
  <div class="sel"><select id="hc"><option value="">${t("city")}</option>${opt(CITIES,"",cityL)}</select>
  <select id="hk"><option value="">${t("category")}</option>${opt(CATS,"",catL)}</select>
  <select id="hp"><option value="">${t("price")}</option>${[12000,15000,20000].map(p=>`<option value="${p}">${t("upto",{p:money(p)})}</option>`).join("")}</select>
  <select id="ht"><option value="">${t("ctype")}</option>${opt(["Видео","Фото"],"",typeL)}</select></div></div></div>
  <div class="vis" aria-hidden="true"><div class="ph0"><i>▶</i></div></div></div></div>
  <div class="w sec" style="padding-bottom:0"><div class="fs">${fs.map((s,i)=>`<div>${s}${t("f"+(i+1))}</div>`).join("")}</div></div>
  <div class="w sec"><div class="row"><h2>${t("pop_cats")}</h2><button class="link" data-act="allcat">${t("all_cats")}</button></div>
  <div class="cats">${CATS.map(c=>`<button class="cat" data-cat="${c}">${catL(c)}</button>`).join("")}</div></div>
  <div class="w sec" style="padding-top:0"><div class="row"><h2>${t("cities")}</h2></div><div class="cats">${CITIES.map(c=>`<button class="cat" data-city="${c}">${cityL(c)}</button>`).join("")}</div></div>
  <div class="w sec" style="padding-top:0"><div class="row"><h2>${t("pop_cr")}</h2><button class="link" data-go="/catalog">${t("see_all")}</button></div>
  <div class="grid">${CR.length?CR.slice(0,4).map(card).join(""):`<div class="empty">${t("no_cr_first")}<br><button class="btn o sm" style="margin-top:12px" data-go="/auth?m=reg&role=creator">${t("create_profile")}</button></div>`}</div></div>
  <div class="w sec" style="padding-top:0"><div class="row"><h2>${t("why")}</h2></div><div class="why">
  ${[1,2,3,4].map(i=>`<div><b>${t("w"+i+"t")}</b><p>${t("w"+i+"d")}</p></div>`).join("")}</div></div>
  <div class="w sec" style="padding-top:0"><div class="cta"><h2>${t("cta_cr")}</h2><button class="btn" data-go="/auth?m=reg&role=creator">${t("create_profile")}</button></div></div>`;
  $("#hgo").onclick=()=>{F={...F,q:$("#hq").value,city:$("#hc").value,cat:$("#hk").value,price:$("#hp").value,type:$("#ht").value,fav:false};go("/catalog")};
}
