/* Вход и регистрация */
function auth(p){
  let m=p.get("m")||"in",role=p.get("role")||"biz";
  const draw=()=>{
    $("#app").innerHTML=`<div class="w"><div class="fm box"><div class="tabs"><button data-m="in" class="${m=="in"?"on":""}">${t("tab_in")}</button><button data-m="reg" class="${m=="reg"?"on":""}">${t("tab_reg")}</button></div>
    <form id="af" novalidate>${m=="reg"?`<div class="tabs"><button type="button" data-r="biz" class="${role=="biz"?"on":""}">${t("i_biz")}</button><button type="button" data-r="creator" class="${role=="creator"?"on":""}">${t("i_cr")}</button></div>
    <label>${t("name")}<input class="i" id="an" placeholder="${role=="biz"?t("brand_name"):t("your_name")}"></label>${role=="creator"?`<label>${t("city")}<select class="i" id="ac">${opt(CITIES,"",cityL)}</select></label><label>${t("category")}<select class="i" id="ak">${opt(CATS,"",catL)}</select></label><label>${t("ctype")}<select class="i" id="at">${opt(["Видео","Фото"],"",typeL)}</select></label><label>${t("price_video")}<input class="i" id="apr" type="number" min="1000" placeholder="10000"></label>`:""}`:""}
    <label>${t("email")}<input class="i" id="ae" type="email" placeholder="you@mail.kz"></label>
    <label>${t("password")}<input class="i" id="ap" type="password" placeholder="${t("pass_ph")}"></label>
    <div class="err" id="ar"></div><button class="btn" type="submit">${m=="in"?t("login"):t("create_acc")}</button></form></div></div>`;
    document.querySelectorAll("[data-m]").forEach(b=>b.onclick=()=>{m=b.dataset.m;draw()});
    document.querySelectorAll("[data-r]").forEach(b=>b.onclick=()=>{role=b.dataset.r;draw()});
    $("#af").onsubmit=e=>{e.preventDefault();const em=$("#ae").value.trim(),pw=$("#ap").value,nm=m=="reg"?$("#an").value.trim():"";
      const er=(!/^\S+@\S+\.\S+$/.test(em))?t("e_email"):pw.length<6?t("e_pass"):(m=="reg"&&!nm)?t("e_name"):(m=="reg"&&role=="creator"&&!(+$("#apr").value>=1000))?t("e_price"):"";
      if(er)return $("#ar").textContent=er;
      user={name:nm||em.split("@")[0],email:em,role};sv("ugc_u",user);head();toast(m=="in"?t("logged_in"):t("acc_created"));
      if(m=="reg"&&role=="creator"){const pr=+$("#apr").value,id=Date.now();CR.push({id,n:nm,r:0,c:0,city:$("#ac").value,v:"—",t:[$("#ak").value],p:pr,ph:Math.round(pr/2),type:$("#at").value,h:Math.floor(Math.random()*330),bio:"",own:1,email:em});sv("ugc_cr",CR.filter(x=>x.own));return go("/creator/"+id)}
      go("/");};
  };draw();
}
