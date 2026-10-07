/* Профиль креатора, видео, окно «Связаться» */
function creator(id){
  const x=CR.find(c=>c.id==id);if(!x)return go("/catalog");const own=x.own&&user&&user.email===x.email;
  const delBtn=v=>own?`<button class="link" data-act="delvid" data-id="${x.id}" data-v="${v.id}" aria-label="${t("del_video")}">✕</button>`:"";
  $("#app").innerHTML=`<div class="w"><div class="pf"><div>
  <button class="link" data-go="/catalog" style="margin-bottom:14px">${t("back")}</button>
  <div class="box"><div class="hd"><div class="av" style="background:${bg(x)}">${x.n[0]}</div><div><h1>${x.n}</h1>
  <div style="color:var(--mut)">${x.c?t("reviews_n",{r:x.r,c:x.c})+" · ":t("new_cr")+" · "}${cityL(x.city)}</div></div></div>
  <p style="margin:16px 0 10px">${x.bio||t("def_bio")}</p><div class="chips">${x.t.map(c=>`<span>${catL(c)}</span>`).join("")}</div></div>
  <div class="box"><div class="row"><h2>${t("portfolio")}</h2>${own?`<button class="btn sm" data-act="addvid" data-id="${x.id}">${t("add_video")}</button>`:""}</div>${(x.vids||[]).length?`<div class="port">${x.vids.map(v=>v.u?`<a class="vt" href="${esc(v.u)}" target="_blank" rel="noopener noreferrer"><b style="margin:auto;font-size:30px">▶</b><span>${esc(v.t)}${delBtn(v)}</span></a>`:`<div class="vt"><video controls playsinline preload="metadata" data-vid="${v.id}"></video><span>${esc(v.t)}${delBtn(v)}</span></div>`).join("")}</div>`:`<p style="color:var(--mut)">${t("no_videos")}</p>`}</div>
  <div class="box"><h2 style="margin-bottom:8px">${t("reviews")}</h2>
  <p style="color:var(--mut)">${t("no_reviews")}</p></div></div>
  <aside class="box" style="position:sticky;top:84px"><h2 style="margin-bottom:10px">${t("cost")}</h2>
  <div class="pk"><span>${t("video_ugc")}</span><b>${money(x.p)}</b></div><div class="pk"><span>${t("photo_set")}</span><b>${money(x.ph)}</b></div>
  <div style="display:grid;gap:10px;margin-top:18px"><button class="btn" data-contact="${x.id}">${t("contact")}</button>
  ${own?`<button class="btn g" data-act="delcr" data-id="${x.id}">${t("del_profile")}</button>`:""}<button class="btn o" data-fav="${x.id}">${favs.includes(x.id)?t("in_fav"):t("add_fav")}</button></div></aside></div></div>`;
  document.querySelectorAll("video[data-vid]").forEach(async el=>{try{const b=await vget(+el.dataset.vid);if(b)el.src=URL.createObjectURL(b);else el.replaceWith(t("video_unavail"))}catch{el.replaceWith(t("video_unavail"))}});
}
function addVid(id){
  const x=CR.find(c=>c.id==id);if(!x)return;
  modal(`<h2>${t("add_video")}</h2><label style="font-size:13px;color:var(--mut)">${t("title_l")}<input class="i" id="vt" maxlength="60" placeholder="${t("title_ph")}"></label>
  <label style="font-size:13px;color:var(--mut)">${t("file_l")}<input class="i" id="vf" type="file" accept="video/*"></label>
  <label style="font-size:13px;color:var(--mut)">${t("or_link")}<input class="i" id="vu" type="url" placeholder="https://..."></label>
  <div class="err" id="ve"></div><div style="display:flex;gap:10px;justify-content:flex-end"><button class="btn g" data-act="close">${t("cancel")}</button><button class="btn" id="vs">${t("add")}</button></div>`);
  $("#vs").onclick=async()=>{
    const f=$("#vf").files[0],u=$("#vu").value.trim(),tt=$("#vt").value.trim()||t("def_vtitle"),e=$("#ve");
    if(!f&&!u)return e.textContent=t("e_pick");
    if(!f&&!/^https?:\/\/\S+$/.test(u))return e.textContent=t("e_link");
    if(f&&f.size>100*1048576)return e.textContent=t("e_big");
    const v={id:Date.now(),t:tt};
    try{if(f){await vput(v.id,f);v.f=1}else v.u=u}catch{return e.textContent=t("e_save")}
    x.vids=[...(x.vids||[]),v];sv("ugc_cr",CR.filter(c=>c.own));close();creator(x.id);toast(t("video_added"));
  };
}
function contact(id){
  if(!user){toast(t("login_first"));return go("/auth?m=in")}
  const x=CR.find(c=>c.id==id);
  modal(`<h2>${t("write_to",{n:x.n})}</h2><label style="font-size:13px;color:var(--mut)">${t("describe")}<textarea class="i" id="msg" rows="4" placeholder="${t("desc_ph")}"></textarea></label>
  <div class="err" id="me"></div><div style="display:flex;gap:10px;justify-content:flex-end"><button class="btn g" data-act="close">${t("cancel")}</button><button class="btn" id="send">${t("send")}</button></div>`);
  $("#send").onclick=()=>{if($("#msg").value.trim().length<5)return $("#me").textContent=t("e_desc");close();toast(t("sent",{n:x.n}))};
}
