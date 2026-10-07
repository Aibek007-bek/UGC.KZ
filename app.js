/* Роутер и обработчики кликов (подключается последним) */
function route(){
  const [path,qs]=(location.hash.slice(1)||"/").split("?"),p=new URLSearchParams(qs||""),s=path.split("/").filter(Boolean);
  applyStatic();head();scrollTo(0,0);
  document.querySelectorAll("nav a").forEach(a=>{const g=a.dataset.go.split("?")[0];a.classList.toggle("on",g=="/"+(s[0]=="creator"?"catalog":s[0]||""))});
  if(!s.length)home();else if(s[0]=="catalog")catalog();else if(s[0]=="creator")creator(s[1]);else if(s[0]=="auth")auth(p);else if(s[0]=="brands")brands();else if(s[0]=="about")about();else go("/");
}
function toggleFav(id){favs=favs.includes(id)?favs.filter(f=>f!==id):[...favs,id];sv("ugc_f",favs);head()}
document.addEventListener("click",e=>{
  const t=e.target,f=t.closest("[data-fav]");
  if(f){e.stopPropagation();toggleFav(+f.dataset.fav);const y=scrollY;route();scrollTo(0,y);return}
  const c=t.closest("[data-contact]");if(c)return contact(c.dataset.contact);
  const k=t.closest("[data-cat]");if(k){F={...F,cat:k.dataset.cat,q:"",city:"",price:"",type:"",fav:false};return go("/catalog")}
  const ci=t.closest("[data-city]");if(ci){F={q:"",city:ci.dataset.city,cat:"",price:"",type:"",sort:"r",fav:false};return go("/catalog")}
  const a=t.closest("[data-act]");
  if(a){e.preventDefault();const v=a.dataset.act;
    if(v=="addvid")addVid(a.dataset.id);
    if(v=="delvid"){const x=CR.find(c=>c.id==a.dataset.id);if(x){const vi=(x.vids||[]).find(q=>q.id==a.dataset.v);x.vids=(x.vids||[]).filter(q=>q.id!=a.dataset.v);if(vi&&vi.f)vdel(vi.id).catch(()=>{});sv("ugc_cr",CR.filter(c=>c.own));creator(x.id);toast(t("video_deleted"))}}
    if(v=="out"){user=null;sv("ugc_u",null);toast(t("logged_out"));go("/");head()}
    if(v=="close")close();
    if(v=="delcr"){const i=CR.findIndex(c=>c.id==a.dataset.id);if(i>-1){(CR[i].vids||[]).forEach(q=>q.f&&vdel(q.id).catch(()=>{}));CR.splice(i,1)}sv("ugc_cr",CR.filter(c=>c.own));toast(t("profile_deleted"));go("/catalog")}
    if(v=="allcat"){F={...F,cat:""};go("/catalog")}
    return}
  const g=t.closest("[data-go]");if(g)go(g.dataset.go);
  if(t.id=="modal")close();
});
$("#favb").onclick=()=>{F={q:"",city:"",cat:"",price:"",type:"",sort:"r",fav:true};location.hash=="#/catalog"?catalog():go("/catalog")};
$("#lang").onchange=e=>{setLang(e.target.value);close();route()};
addEventListener("hashchange",route);route();
