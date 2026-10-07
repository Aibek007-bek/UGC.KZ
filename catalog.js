/* Каталог креаторов (фильтры) */
function catalog(){
  $("#app").innerHTML=`<div class="w"><div class="cat-l"><aside class="side"><h2 style="font-size:17px">${t("filters")}</h2>
  <label>${t("search")}<input type="text" id="fq" value="${F.q}" placeholder="${t("name_topic")}"></label>
  <label>${t("city")}<select id="fc1"><option value="">${t("all")}</option>${opt(CITIES,F.city,cityL)}</select></label>
  <label>${t("category")}<select id="fk"><option value="">${t("all")}</option>${opt(CATS,F.cat,catL)}</select></label>
  <label>${t("price")}<select id="fp"><option value="">${t("any")}</option>${[12000,15000,20000].map(p=>`<option value="${p}" ${F.price==p?"selected":""}>${t("upto",{p:money(p)})}</option>`).join("")}</select></label>
  <label>${t("ctype")}<select id="ft"><option value="">${t("all")}</option>${opt(["Видео","Фото"],F.type,typeL)}</select></label>
  <label>${t("sort")}<select id="fs"><option value="r">${t("by_rating")}</option><option value="p" ${F.sort=="p"?"selected":""}>${t("cheaper")}</option></select></label>
  <label class="ck"><input type="checkbox" id="ff" ${F.fav?"checked":""}> ${t("only_fav")}</label>
  <button class="btn g sm" id="fr">${t("reset")}</button></aside>
  <div><div class="row"><h2>${t("creators_h")}</h2><span id="cnt" style="color:var(--mut);font-size:14px"></span></div><div class="grid" id="lst"></div></div></div></div>`;
  const rd=()=>{
    F={q:$("#fq").value,city:$("#fc1").value,cat:$("#fk").value,price:$("#fp").value,type:$("#ft").value,sort:$("#fs").value,fav:$("#ff").checked};
    const l=CR.filter(x=>(!F.q||(x.n+" "+x.city+" "+cityL(x.city)+" "+x.t.join(" ")+" "+x.t.map(catL).join(" ")).toLowerCase().includes(F.q.toLowerCase()))&&(!F.city||x.city===F.city)&&(!F.cat||x.t.includes(F.cat))&&(!F.price||x.p<=+F.price)&&(!F.type||x.type===F.type)&&(!F.fav||favs.includes(x.id))).sort((a,b)=>F.sort=="p"?a.p-b.p:b.r-a.r);
    $("#cnt").textContent=t("found",{n:l.length});
    $("#lst").innerHTML=l.length?l.map(card).join(""):`<div class="empty">${CR.length?t("nobody"):t("none_yet")}<br>${CR.length?`<button class="btn o sm" style="margin-top:12px" id="fr2">${t("reset_f")}</button>`:""}</div>`;
    const r2=$("#fr2");if(r2)r2.onclick=rs;
  };
  const rs=()=>{F={q:"",city:"",cat:"",price:"",type:"",sort:"r",fav:false};catalog()};
  document.querySelectorAll(".side select,.side input").forEach(e=>e.oninput=rd);
  $("#fr").onclick=rs;rd();
}
