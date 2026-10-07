/* Данные, города, категории и общие функции */
const CITIES=["Актау", "Актобе", "Алматы", "Астана", "Атырау", "Жезказган", "Караганда", "Кокшетау", "Костанай", "Кызылорда", "Павлодар", "Петропавловск", "Семей", "Талдыкорган", "Тараз", "Уральск", "Усть-Каменогорск", "Шымкент"];
const CATS=["Красота и уход","Мода и стиль","Еда и напитки","Техника и гаджеты","Путешествия","Спорт и фитнес","Дом и уют","Другое"];
const CR=[];
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const idb=()=>new Promise((res,rej)=>{try{const r=indexedDB.open("ugc",1);r.onupgradeneeded=()=>r.result.createObjectStore("v");r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}catch(e){rej(e)}});
const vop=async(m,f)=>{const d=await idb();return new Promise((res,rej)=>{const t=d.transaction("v",m),r=f(t.objectStore("v"));t.oncomplete=()=>res(r.result);t.onerror=()=>rej(t.error);t.onabort=()=>rej(t.error)})};
const vput=(k,b)=>vop("readwrite",o=>o.put(b,k)),vget=k=>vop("readonly",o=>o.get(k)),vdel=k=>vop("readwrite",o=>o.delete(k));
const ld=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}};
const sv=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
CR.push(...ld("ugc_cr",[]));
let favs=ld("ugc_f",[]),user=ld("ugc_u",null),F={q:"",city:"",cat:"",price:"",type:"",sort:"r",fav:false};
const money=n=>n.toLocaleString(LOCALE[L])+" ₸";
const bg=x=>`linear-gradient(${x.h}deg,hsl(${x.h},75%,38%),hsl(${x.h+30},80%,62%))`;
function toast(m){const t=$("#toast");t.textContent=m;t.classList.add("on");clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove("on"),2400)}
function modal(h){$("#mb").innerHTML=h;$("#modal").classList.add("on")}
function close(){$("#modal").classList.remove("on")}
function go(p){location.hash="#"+p}
function head(){
  $("#fc").textContent=favs.length;
  $("#auth").innerHTML=user?`<span style="margin-right:10px;font-size:14px">${user.name}</span><button class="btn o sm" data-act="out">${t("logout")}</button>`
   :`<button class="btn o sm" data-go="/auth?m=in">${t("login")}</button> <button class="btn sm" data-go="/auth?m=reg">${t("register")}</button>`;
}
function card(x){return `<article class="card" data-go="/creator/${x.id}"><div class="ph" style="background:${bg(x)}">${x.n[0]}
<button class="heart ${favs.includes(x.id)?"on":""}" data-fav="${x.id}" aria-label="${t("fav_aria")}">${favs.includes(x.id)?"♥":"♡"}</button></div>
<div class="cb"><div class="top">${x.n}<small>${x.v}</small></div><div class="meta">${x.c?`★ ${x.r} (${x.c}) · `:t("new")+" · "}${cityL(x.city)}</div>
<div class="chips">${x.t.map(c=>`<span>${catL(c)}</span>`).join("")}</div><div class="pr">${t("from",{p:money(x.p)})}<small>${t("per_video")}</small></div></div></article>`}
const opt=(arr,v,fn)=>arr.map(a=>`<option value="${a}" ${a===v?"selected":""}>${fn?fn(a):a}</option>`).join("");
