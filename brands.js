/* Страница «Бренды» */
function brands(){
  const S=[1,2,3,4].map(i=>[t("s"+i+"t"),t("s"+i+"d")]);
  $("#app").innerHTML=`<div class="ph2"><div class="w"><h1>${t("brands_t")}</h1><p>${t("brands_lead")}</p></div></div>
  <div class="w sec"><div class="row"><h2>${t("get_h")}</h2></div><div class="why">
  ${[1,2,3,4].map(i=>`<div><b>${t("g"+i+"t")}</b><p>${t("g"+i+"d")}</p></div>`).join("")}</div></div>
  <div class="w sec" style="padding-top:0"><div class="row"><h2>${t("how_h")}</h2></div><div class="ins">${S.map(([a,b],i)=>`<div><b>${i+1}</b>${a}<p style="color:var(--mut);font-size:13px;margin-top:4px">${b}</p></div>`).join("")}</div></div>
  <div class="w sec" style="padding-top:0"><div class="cta"><h2>${t("cta_b")}</h2><div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn" data-go="/catalog">${t("open_cat")}</button><button class="btn" data-go="/auth?m=reg&role=biz">${t("reg_brand")}</button></div></div></div>`;
}
