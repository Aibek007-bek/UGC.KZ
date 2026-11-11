/* Profiles, private two-way messages, owner analytics and database-verified admin. */
const UX={
 kk:{account:'Жеке кабинет',admin:'Әкімші панелі',stats:'Статистика',edit:'Профильді өңдеу',brand:'Бренд',creator:'UGC авторы',bio:'Өзіңіз туралы',website:'Сайт (https://)',avatar:'Аватар',avatarHelp:'JPG, PNG немесе WebP · 2 МБ дейін',removeAvatar:'Аватарды өшіру',save:'Сақтау',saved:'Профиль сақталды',write:'Хабарлама жазу',views:'Қаралымдар',week:'Соңғы 7 күн',received:'Келген хабарламалар',sent:'Жіберілген хабарламалар',unread:'Оқылмаған',reviews:'Пікірлер',viewNote:'Қаралымдар бір браузерден тәулігіне бір рет есептеледі. Бұл — шамаланған көрсеткіш; өз қаралымыңыз есептелмейді.',empty:'Әзірге дерек жоқ',noProfile:'Аккаунт профилі табылмады. Тіркелу аяқталғанын тексеріңіз.',error:'Жүктеу немесе сақтау сәтсіз болды. Қайта көріңіз.',migration:'Жаңа функциялар қолжетімсіз. Сайт әкімшісі дерекқор жаңартуын тексеруі керек.',invalid:'Өрістерді тексеріңіз. Баға мен атау дұрыс толтырылуы керек.',badImage:'JPG, PNG немесе WebP таңдаңыз (2 МБ дейін).',badWebsite:'Сілтеме https:// арқылы басталуы керек.',suspended:'Бұл аккаунт уақытша шектелген. Сайт әкімшісіне хабарласыңыз.',messages:'Хабарламалар',refresh:'Жаңарту',older:'Бұрынғы хабарламалар',chooseChat:'Сөйлесуді таңдаңыз',send:'Жіберу',messageHint:'Хабарлама (5–2000 таңба)',you:'Сіз',read:'Оқылды',delivered:'Жіберілді',profile:'Профильді ашу',users:'Пайдаланушылар',creators:'Креаторлар',brands:'Брендтер',allMessages:'Хабарламаларды бақылау',audit:'Әкімші әрекеттері',hide:'Жасыру',restore:'Қалпына келтіру',suspend:'Шектеу',active:'Белсенді',hidden:'Жасырылған',limited:'Шектелген',noAccess:'Бұл бөлім тек әкімшіге қолжетімді.',adminNote:'Әкімші пайдаланушыларды уақытша шектей алады, профильдерді жасырады және хабарламаларды тексереді. Әр өзгеріс журналға жазылады.',moderationNote:'Есептегі жалпы сандар толық. Тізімдер: соңғы 500 пайдаланушы/профиль, 200 хабарлама және 100 әкімші әрекеті.',search:'Аты немесе email бойынша іздеу',back:'Брендтерге оралу',loading:'Жүктелуде…',noBio:'Сипаттама әлі қосылмаған',from:'Кімнен',to:'Кімге',date:'Уақыты',status:'Күйі'},
 ru:{account:'Личный кабинет',admin:'Админ-панель',stats:'Статистика',edit:'Редактировать профиль',brand:'Бренд',creator:'UGC-креатор',bio:'О себе',website:'Сайт (https://)',avatar:'Аватар',avatarHelp:'JPG, PNG или WebP · до 2 МБ',removeAvatar:'Удалить аватар',save:'Сохранить',saved:'Профиль сохранён',write:'Написать сообщение',views:'Просмотры',week:'Последние 7 дней',received:'Входящие сообщения',sent:'Отправленные сообщения',unread:'Непрочитанные',reviews:'Отзывы',viewNote:'Просмотр учитывается один раз в сутки с одного браузера. Это приблизительный показатель; собственные просмотры не учитываются.',empty:'Пока нет данных',noProfile:'Профиль не найден. Проверьте завершение регистрации.',error:'Не удалось загрузить или сохранить данные. Попробуйте ещё раз.',migration:'Новые функции недоступны. Администратору нужно проверить обновление базы данных.',invalid:'Проверьте поля, имя и цены.',badImage:'Выберите JPG, PNG или WebP до 2 МБ.',badWebsite:'Ссылка должна начинаться с https://.',suspended:'Аккаунт временно ограничен. Свяжитесь с администратором сайта.',messages:'Сообщения',refresh:'Обновить',older:'Предыдущие сообщения',chooseChat:'Выберите переписку',send:'Отправить',messageHint:'Сообщение (5–2000 символов)',you:'Вы',read:'Прочитано',delivered:'Отправлено',profile:'Открыть профиль',users:'Пользователи',creators:'Креаторы',brands:'Бренды',allMessages:'Контроль сообщений',audit:'Действия администратора',hide:'Скрыть',restore:'Восстановить',suspend:'Ограничить',active:'Активен',hidden:'Скрыт',limited:'Ограничен',noAccess:'Раздел доступен только администратору.',adminNote:'Администратор может временно ограничивать пользователей, скрывать профили и просматривать сообщения. Изменения записываются в журнал.',moderationNote:'Общие числа полные. Списки: последние 500 пользователей/профилей, 200 сообщений и 100 действий.',search:'Поиск по имени или email',back:'Назад к брендам',loading:'Загрузка…',noBio:'Описание пока не добавлено',from:'От кого',to:'Кому',date:'Время',status:'Статус'},
 en:{account:'My account',admin:'Admin dashboard',stats:'Statistics',edit:'Edit profile',brand:'Brand',creator:'UGC creator',bio:'About',website:'Website (https://)',avatar:'Avatar',avatarHelp:'JPG, PNG or WebP · up to 2 MB',removeAvatar:'Remove avatar',save:'Save',saved:'Profile saved',write:'Send a message',views:'Views',week:'Last 7 days',received:'Messages received',sent:'Messages sent',unread:'Unread',reviews:'Reviews',viewNote:'Views are counted once per browser per day. This is an estimate; your own views are excluded.',empty:'No data yet',noProfile:'Profile not found. Check that registration is complete.',error:'Unable to load or save. Please try again.',migration:'New features are unavailable. The site administrator needs to check the database upgrade.',invalid:'Check the fields, name and prices.',badImage:'Choose a JPG, PNG or WebP up to 2 MB.',badWebsite:'The link must start with https://.',suspended:'This account is temporarily restricted. Contact the site administrator.',messages:'Messages',refresh:'Refresh',older:'Older messages',chooseChat:'Choose a conversation',send:'Send',messageHint:'Message (5–2000 characters)',you:'You',read:'Read',delivered:'Sent',profile:'Open profile',users:'Users',creators:'Creators',brands:'Brands',allMessages:'Message moderation',audit:'Admin activity',hide:'Hide',restore:'Restore',suspend:'Restrict',active:'Active',hidden:'Hidden',limited:'Restricted',noAccess:'This section is only available to administrators.',adminNote:'Administrators can restrict users, hide profiles and inspect messages. Changes are recorded in the activity log.',moderationNote:'Totals cover all records. Lists show the latest 500 users/profiles, 200 messages and 100 actions.',search:'Search name or email',back:'Back to brands',loading:'Loading…',noBio:'No description yet',from:'From',to:'To',date:'Time',status:'Status'}
};
const ux=k=>k==='adminRole'?({kk:'Әкімші',ru:'Администратор',en:'Administrator'}[L]||'Administrator'):UX[L]?.[k]||UX.ru[k]||k;
const safeAvatar=p=>/^[0-9a-f-]{36}\/[0-9a-f-]{36}\.(jpg|png|webp)$/.test(p||'')?baseU()+'/storage/v1/object/public/avatars/'+p:'';
function avatarHTML(profile,name){const url=safeAvatar(profile.avatar_path);return url?`<img class="avatar-img" src="${esc(url)}" alt="${esc(name)}" loading="lazy">`:`<span>${esc((name||'?')[0])}</span>`}
let accountData=null, accountUid=null, accountLoading=false;
const originalHead=head;
head=function(){
 originalHead();
 if(accountUid!==(S?.uid||null)){accountData=null;accountUid=S?.uid||null}
 if(!user||!S)return;
 const nav=document.createElement('div');nav.className='account-nav';
 nav.innerHTML=`<button class="btn o sm" data-go="/account">${ux('account')}</button>${accountData?.admin?`<button class="btn sm" data-go="/admin">${ux('admin')}</button>`:''}`;
 $('#auth').prepend(nav);
 if(!accountData&&!accountLoading)refreshAccount().then(()=>{if(accountData)head()});
};
async function refreshAccount(){
 if(!S)return null; accountLoading=true;const uid=S.uid;
 try{const result=await api('profile/me');if(S?.uid!==uid)return null;accountData=result;accountUid=uid;return result}
 catch(err){console.warn('profile/me',err);return null}finally{accountLoading=false}
}
function featureError(err){return ux(err?.message==='account_suspended'?'suspended':err?.status===502?'migration':'error')}
function featurePage(title,body){$('#app').innerHTML=`<div class="ph2"><div class="w"><h1>${esc(title)}</h1></div></div><div class="w sec">${body}</div>`}
function statsHTML(values){return `<div class="stats-grid">${['views','week','received','sent','unread','reviews'].map((label,i)=>`<div class="stat-box"><strong>${num(values[['views','views_7d','messages_received','messages_sent','unread','reviews'][i]]).toLocaleString(LOCALE[L])}</strong><span>${ux(label)}</span></div>`).join('')}</div><p class="hint">${ux('viewNote')}</p>`}
async function myAccount(){
 if(!user||!S)return go('/auth?m=in');
 featurePage(ux('account'),`<p role="status">${ux('loading')}</p>`);
 const data=await refreshAccount();if(!location.hash.startsWith('#/account'))return;
 if(!data)return featurePage(ux('account'),`<p class="err">${ux('migration')}</p>`);
 head();
 if(data.suspended)return featurePage(ux('account'),`<p class="err">${ux('suspended')}</p>`);
 const profiles=[...data.creators.map(p=>({...p,kind:'creator',name:p.n})),...data.brands.map(p=>({...p,kind:'brand'}))];
 featurePage(ux('account'),profiles.length?profiles.map(p=>`<section class="box"><div class="row"><div class="hd"><div class="av small-avatar">${avatarHTML(p,p.name)}</div><div><h2>${esc(p.name)}</h2><p class="hint">${ux(p.kind)}${p.is_hidden?' · '+ux('hidden'):''}</p></div></div><div class="account-actions"><button class="btn o sm" data-go="/${p.kind}/${p.id}">${ux('profile')}</button><button class="btn sm" data-edit-profile="${p.kind}:${p.id}">${ux('edit')}</button></div></div><h3 class="section-label">${ux('stats')}</h3><div id="stats-${p.kind}-${p.id}" role="status">${ux('loading')}</div></section>`).join(''):`<p>${ux('noProfile')}</p>`);
 for(const p of profiles){
  const list=p.kind==='creator'?CR:BR;
  if(!list.some(x=>x.id===p.id)){const raw=data[p.kind==='creator'?'creators':'brands'].find(x=>x.id===p.id);list.push(p.kind==='creator'?cleanCr(raw):cleanBrand(raw))}
  try{const v=await api(`profile/stats?kind=${p.kind}&id=${p.id}`);const el=$(`#stats-${p.kind}-${p.id}`);if(el)el.innerHTML=statsHTML(v)}
  catch(err){const el=$(`#stats-${p.kind}-${p.id}`);if(el)el.textContent=featureError(err)}
 }
}
function cleanBrand(b){return {...b,id:num(b.id),name:String(b.name||''),bio:String(b.bio||''),city:String(b.city||''),website:String(b.website||''),avatar_path:String(b.avatar_path||''),own:S&&b.owner_id===S.uid?1:0}}
function brands(){
 featurePage(t('brands_t'),`<p class="hint">${t('brands_lead')}</p><div class="grid" id="bl"></div><div class="account-actions section-label"><button class="btn" data-go="/catalog">${t('open_cat')}</button><button class="btn o" data-go="/auth?m=reg&role=biz">${t('reg_brand')}</button></div>`);
 const fill=()=>{const el=$('#bl');if(!el)return;el.innerHTML=BR.length?BR.map(b=>`<article class="card" role="link" tabindex="0" data-go="/brand/${b.id}" aria-label="${esc(b.name)}"><div class="ph" style="background:${bg({h:b.id%330})}">${avatarHTML(b,b.name)}</div><div class="cb"><div class="top">${esc(b.name)}</div><p class="meta">${esc(cityL(b.city||''))}</p><p class="brand-description">${esc(b.bio||ux('noBio'))}</p><span class="link">${ux('profile')} →</span></div></article>`).join(''):`<p class="empty">${loadErr?t(loadErr):t('no_brands')}</p>`};
 fill();loadCR().then(fill);
}
async function brandProfile(id){
 let b=BR.find(p=>p.id==id);
 if(!b&&S){const d=await refreshAccount();b=d?.brands.find(p=>p.id==id);if(b)b=cleanBrand(b)}
 if(!b){featurePage(ux('brand'),`<p>${ux('noProfile')}</p><button class="btn" data-go="/brands">${ux('back')}</button>`);return}
 if(!location.hash.startsWith('#/brand/'))return;
 const website=/^https:\/\/[^\s]+$/i.test(b.website||'')?b.website:'';
 featurePage(b.name,`<button class="link" data-go="/brands">← ${ux('back')}</button><div class="profile-grid section-label"><section class="box"><div class="hd"><div class="av">${avatarHTML(b,b.name)}</div><div><h2>${esc(b.name)}</h2><p class="hint">${ux('brand')}${b.city?' · '+esc(cityL(b.city)):''}</p></div></div><p class="profile-bio">${esc(b.bio||ux('noBio'))}</p>${website?`<a class="link" href="${esc(website)}" target="_blank" rel="noopener noreferrer">${esc(website)}</a>`:''}</section><aside class="box"><button class="btn full-width" ${b.own?`data-edit-profile="brand:${b.id}"`:`data-message-brand="${b.id}"`}>${ux(b.own?'edit':'write')}</button>${b.own?`<button class="btn o full-width section-label" data-go="/account">${ux('stats')}</button>`:''}</aside></div>`);
 if(!b.own)trackView('brand',b.id);
}
function trackView(kind,id){
 let visitor;
 try{visitor=localStorage.getItem('ugc_viewer');if(!/^[0-9a-f-]{36}$/.test(visitor||'')){visitor=crypto.randomUUID();localStorage.setItem('ugc_viewer',visitor)}}catch{visitor=crypto.randomUUID()}
 api('profile/view',{method:'POST',body:JSON.stringify({kind,id,visitor_key:visitor})}).catch(err=>console.warn('profile/view',err));
}
const originalCreator=creator;
creator=function(id){originalCreator(id);const p=CR.find(x=>x.id==id);if(p&&!p.own)trackView('creator',p.id)};
editCr=function(id){editProfile('creator',id)};
async function uploadAvatar(file){
 if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>2097152)throw new Error('image');
 // Decode and re-encode: limits dimensions and strips image metadata.
 const bitmap=await createImageBitmap(file);
 if(!bitmap.width||!bitmap.height)throw new Error('image');
 const canvas=document.createElement('canvas');canvas.width=canvas.height=512;
 const side=Math.min(bitmap.width,bitmap.height);
 canvas.getContext('2d').drawImage(bitmap,(bitmap.width-side)/2,(bitmap.height-side)/2,side,side,0,0,512,512);bitmap.close();
 const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',0.85));
 if(!blob||blob.type!=='image/webp')throw new Error('image');
 await refreshS();if(!S)throw new Error('auth');
 const path=S.uid+'/'+crypto.randomUUID()+'.webp';
 const r=await fetch(baseU()+'/storage/v1/object/avatars/'+path,{method:'POST',headers:{apikey:SUPABASE_KEY,Authorization:'Bearer '+S.at,'Content-Type':'image/webp'},body:blob});
 if(!r.ok)throw new Error('upload');return path;
}
async function editProfile(kind,id){
 const data=await refreshAccount();const p=data?.[kind==='creator'?'creators':'brands'].find(x=>x.id==id);
 if(!p||data.suspended)return toast(ux(data?.suspended?'suspended':'noAccess'));
 const name=kind==='creator'?p.n:p.name;
 let avatar=p.avatar_path||'',previewURL=null;
 modal(`<h2>${ux('edit')}</h2><form id="profile-form" class="account-form"><label>${t('name')}<input class="i" name="name" value="${esc(name)}" maxlength="80" required></label><label>${t('city')}<select class="i" name="city"><option value="">—</option>${opt(CITIES,p.city,cityL)}</select></label><label>${ux('bio')}<textarea class="i" name="bio" rows="4" maxlength="1000">${esc(p.bio||'')}</textarea></label>${kind==='brand'?`<label>${ux('website')}<input class="i" name="website" type="url" maxlength="300" value="${esc(p.website||'')}" placeholder="https://..."></label>`:`<label>${t('category')}<select class="i" name="cat">${opt(CATS,p.t?.[0],catL)}</select></label><label>${t('ctype')}<select class="i" name="type">${opt(['Видео','Фото'],p.type,typeL)}</select></label><label>${t('price_video')}<input class="i" name="p" type="number" min="1000" max="100000000" step="1" value="${num(p.p)}" required></label><label>${t('m_photo_price')}<input class="i" name="ph" type="number" min="500" max="100000000" step="1" value="${num(p.ph)}" required></label>`}<label>${ux('avatar')}<input class="i" name="avatar" type="file" accept="image/jpeg,image/png,image/webp"><span class="hint">${ux('avatarHelp')}</span></label><div class="account-actions"><div id="avatar-preview" class="av small-avatar">${avatarHTML(p,name)}</div><button type="button" class="btn g sm" id="remove-avatar">${ux('removeAvatar')}</button></div><p class="err" role="alert" id="profile-error"></p><div class="account-actions"><button class="btn g" type="button" data-act="close">${t('cancel')}</button><button class="btn" type="submit">${ux('save')}</button></div></form>`);
 const form=$('#profile-form'),error=$('#profile-error'),input=form.elements.avatar;
 input.onchange=()=>{if(previewURL)URL.revokeObjectURL(previewURL);const file=input.files[0];error.textContent='';if(!file)return;
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>2097152){input.value='';error.textContent=ux('badImage');return}
  previewURL=URL.createObjectURL(file);const img=document.createElement('img');img.className='avatar-img';img.alt=ux('avatar');img.src=previewURL;$('#avatar-preview').replaceChildren(img);
 };
 $('#remove-avatar').onclick=()=>{avatar='';input.value='';$('#avatar-preview').textContent=name[0]||'?';if(previewURL){URL.revokeObjectURL(previewURL);previewURL=null}};
 form.onsubmit=async e=>{e.preventDefault();error.textContent='';if(!form.reportValidity())return;
  const fields=new FormData(form),name=String(fields.get('name')).trim(),website=String(fields.get('website')||'').trim();
  if(!name)return error.textContent=ux('invalid');if(website&&!/^https:\/\/[^\s]+$/i.test(website))return error.textContent=ux('badWebsite');
  const button=form.querySelector('[type=submit]');button.disabled=true;
  try{
   if(input.files[0])avatar=await uploadAvatar(input.files[0]);
   const body={kind,id:p.id,name,bio:String(fields.get('bio')).trim(),city:fields.get('city'),avatar_path:avatar};
   if(kind==='brand')body.website=website;else Object.assign(body,{p:Number(fields.get('p')),ph:Number(fields.get('ph')),type:fields.get('type'),t:[fields.get('cat'),...(p.t||[]).slice(1)]});
   const result=await api('profile',{method:'PATCH',body:JSON.stringify(body)});
   const list=kind==='creator'?CR:BR, cleaned=kind==='creator'?cleanCr(result.profile):cleanBrand(result.profile),index=list.findIndex(x=>x.id===p.id);
   if(index>=0)list[index]=cleaned;else list.push(cleaned);
   if(user){user.name=name;sv('ugc_u',user)}
   if(previewURL)URL.revokeObjectURL(previewURL);close();accountData=null;head();route();toast(ux('saved'));
   const usedElsewhere=[...data.creators.map(x=>({...x,kind:'creator'})),...data.brands.map(x=>({...x,kind:'brand'}))].some(x=>!(x.id===p.id&&x.kind===kind)&&x.avatar_path===p.avatar_path);
   if(p.avatar_path&&p.avatar_path!==avatar&&!usedElsewhere)fetch(baseU()+'/storage/v1/object/avatars/'+p.avatar_path,{method:'DELETE',headers:sbH(S?.at)}).catch(()=>{});
  }catch(err){error.textContent=err.message==='image'?ux('badImage'):featureError(err);button.disabled=false}
 };
}

function sendTo(target,name){
 if(!user||!S)return go('/auth?m=in');
 modal(`<h2>${ux('write')}: ${esc(name)}</h2><form id="new-message" class="account-form"><label>${ux('messageHint')}<textarea class="i" name="body" rows="5" minlength="5" maxlength="2000" required></textarea></label><p class="err" role="alert"></p><div class="account-actions"><button type="button" class="btn g" data-act="close">${t('cancel')}</button><button class="btn" type="submit">${ux('send')}</button></div></form>`);
 $('#new-message').onsubmit=async e=>{e.preventDefault();const form=e.currentTarget,body=form.elements.body.value.trim(),button=form.querySelector('[type=submit]');if(body.length<5||body.length>2000)return;button.disabled=true;
  try{const result=await api('messages',{method:'POST',body:JSON.stringify({...target,body})});close();toast(t('sent',{n:name}));go('/inbox?peer='+result.message.recipient_id)}
  catch(err){form.querySelector('.err').textContent=featureError(err);button.disabled=false}
 };
}
contact=function(id){const p=CR.find(x=>x.id==id);if(p)sendTo({creator_id:p.id},p.n)};
const peerProfile=id=>CR.find(x=>x.owner_id===id)||BR.find(x=>x.owner_id===id);
async function inbox(){
 if(!user||!S)return go('/auth?m=in');
 const hash=location.hash;
 featurePage(ux('messages'),`<p role="status">${ux('loading')}</p>`);
 let response;try{response=await api('messages')}catch(err){if(location.hash===hash)featurePage(ux('messages'),`<p class="err">${featureError(err)}</p>`);return}
 if(location.hash!==hash)return;
 let rows=response.items, next=response.next_before;
 let peer=new URLSearchParams(hash.split('?')[1]||'').get('peer');
 const conversations=()=>{const map=new Map();for(const r of rows){const id=r.from_id===S.uid?r.recipient_id:r.from_id;if(!id)continue;const p=peerProfile(id);const current=map.get(id)||{id,name:p?.n||p?.name||(r.from_id===id?r.from_name:ux('profile')),unread:0};if(r.recipient_id===S.uid&&!r.read_at)current.unread++;map.set(id,current)}return [...map.values()]};
 const draw=()=>{
  const chats=conversations();if(!peer&&chats.length)peer=chats[0].id;
  const current=chats.find(x=>x.id===peer),profile=peerProfile(peer);
  featurePage(ux('messages'),`<div class="row section-label"><p class="hint">${ux('messages')}</p><button class="btn o sm" data-go="/inbox?peer=${esc(peer||'')}">${ux('refresh')}</button></div><div class="messages-layout"><aside class="box chat-list">${chats.length?chats.map(c=>`<button class="chat-peer ${peer===c.id?'selected':''}" data-peer="${esc(c.id)}"><b>${esc(c.name)}</b>${c.unread?`<span class="unread-count">${c.unread}</span>`:''}</button>`).join(''):`<p>${ux('empty')}</p>`}${next?`<button class="btn o sm" id="older-messages">${ux('older')}</button>`:''}</aside><section class="box"><div class="row"><h2>${esc(current?.name||ux('chooseChat'))}</h2>${profile?`<button class="link" data-go="/${profile.n?'creator':'brand'}/${profile.id}">${ux('profile')}</button>`:''}</div><div class="chat-scroll" role="log" aria-live="polite">${rows.filter(r=>r.from_id===peer||r.recipient_id===peer).sort((a,b)=>a.id-b.id).map(r=>`<div class="bubble ${r.from_id===S.uid?'mine':''}"><p>${esc(r.body)}</p><small>${esc(new Date(r.created_at).toLocaleString(LOCALE[L]))} · ${r.from_id===S.uid?ux(r.read_at?'read':'delivered'):esc(r.from_name)}</small></div>`).join('')||`<p class="hint">${ux('empty')}</p>`}</div>${peer?`<form id="chat-reply" class="account-form"><label>${ux('messageHint')}<textarea class="i" name="body" rows="3" minlength="5" maxlength="2000" required></textarea></label><p class="err" role="alert"></p><button class="btn" type="submit">${ux('send')}</button></form>`:''}</section></div>`);
  document.querySelectorAll('[data-peer]').forEach(el=>el.onclick=()=>{peer=el.dataset.peer;draw()});
  if(peer){const readingPeer=peer;api('messages/read',{method:'PATCH',body:JSON.stringify({sender_id:readingPeer})}).then(()=>{rows.forEach(r=>{if(r.from_id===readingPeer&&r.recipient_id===S?.uid)r.read_at=r.read_at||new Date().toISOString()});if(location.hash===hash&&peer===readingPeer)document.querySelector('.chat-peer.selected .unread-count')?.remove()}).catch(console.warn)}
  const older=$('#older-messages');if(older)older.onclick=async()=>{older.disabled=true;try{const more=await api('messages?before='+next);if(location.hash!==hash)return;rows.push(...more.items);next=more.next_before;draw()}catch(err){older.disabled=false;toast(featureError(err))}};
  const reply=$('#chat-reply');if(reply)reply.onsubmit=async e=>{e.preventDefault();const body=reply.elements.body.value.trim();if(body.length<5||body.length>2000)return;const button=reply.querySelector('[type=submit]');button.disabled=true;
   try{const result=await api('messages',{method:'POST',body:JSON.stringify({recipient_id:peer,body})});if(location.hash!==hash)return;rows.unshift(result.message);draw()}
   catch(err){reply.querySelector('.err').textContent=featureError(err);button.disabled=false}
  };
  const scroll=$('.chat-scroll');if(scroll)scroll.scrollTop=scroll.scrollHeight;
 };draw();
}

async function adminDashboard(){
 if(!user||!S)return go('/auth?m=in');
 featurePage(ux('admin'),`<p role="status">${ux('loading')}</p>`);
 let data;try{data=await api('admin')}catch(err){if(location.hash==='#/admin')featurePage(ux('admin'),`<p class="err">${err.status===403?ux('noAccess'):featureError(err)}</p>`);return}
 if(location.hash!=='#/admin')return;
 const users=new Map(data.users.map(u=>[u.id,u]));
 const person=id=>users.get(id)?.name||users.get(id)?.email||id||'—';
 const action=(kind,target,enabled,label)=>`<button class="btn o sm" data-moderate="${kind}" data-target="${esc(String(target))}" data-enabled="${!enabled}">${ux(enabled?'restore':label)}</button>`;
 featurePage(ux('admin'),`<p class="hint">${ux('adminNote')}</p><div class="stats-grid section-label">${['users','creators','brands','messages','views','reviews'].map(k=>`<div class="stat-box"><strong>${num(data.totals[k]).toLocaleString(LOCALE[L])}</strong><span>${ux(k)}</span></div>`).join('')}</div><p class="hint">${ux('moderationNote')}</p><section class="box"><h2>${ux('users')}</h2><input class="i section-label" id="admin-search" aria-label="${ux('search')}" placeholder="${ux('search')}"><div class="table-wrap"><table><thead><tr><th>${t('name')}</th><th>Email</th><th>${ux('status')}</th><th></th></tr></thead><tbody>${data.users.map(u=>`<tr data-user-search="${esc((u.name+' '+u.email).toLowerCase())}"><td>${esc(u.name)}</td><td>${esc(u.email)}</td><td>${ux(u.admin?'adminRole':u.suspended?'limited':'active')}</td><td>${u.admin?'':action('user',u.id,u.suspended,'suspend')}</td></tr>`).join('')}</tbody></table></div></section>${['creator','brand'].map(kind=>`<section class="box"><h2>${ux(kind==='creator'?'creators':'brands')}</h2><div class="table-wrap"><table><thead><tr><th>${t('name')}</th><th>${t('city')}</th><th>${ux('status')}</th><th></th></tr></thead><tbody>${data[kind==='creator'?'creators':'brands'].map(p=>`<tr><td>${esc(p.n||p.name)}</td><td>${esc(cityL(p.city||''))}</td><td>${ux(p.is_hidden?'hidden':'active')}</td><td>${action(kind,p.id,p.is_hidden,'hide')}</td></tr>`).join('')}</tbody></table></div></section>`).join('')}<section class="box"><h2>${ux('allMessages')}</h2><div class="table-wrap"><table><thead><tr><th>${ux('from')}</th><th>${ux('to')}</th><th>${ux('messages')}</th><th>${ux('date')}</th></tr></thead><tbody>${data.messages.map(m=>`<tr><td>${esc(person(m.from_id))}</td><td>${esc(person(m.recipient_id))}</td><td class="message-cell">${esc(m.body)}</td><td>${esc(new Date(m.created_at).toLocaleString(LOCALE[L]))}</td></tr>`).join('')||`<tr><td colspan="4">${ux('empty')}</td></tr>`}</tbody></table></div></section><section class="box"><h2>${ux('audit')}</h2>${data.audit.map(a=>`<p class="audit-row">${esc(new Date(a.created_at).toLocaleString(LOCALE[L]))} · ${esc(person(a.actor))} · ${esc(a.action)} · ${esc(a.target)}</p>`).join('')||`<p>${ux('empty')}</p>`}</section>`);
 $('#admin-search').oninput=e=>{const q=e.target.value.trim().toLowerCase();document.querySelectorAll('[data-user-search]').forEach(row=>row.hidden=!row.dataset.userSearch.includes(q))};
 document.querySelectorAll('[data-moderate]').forEach(button=>button.onclick=async()=>{button.disabled=true;try{await api('admin/moderate',{method:'POST',body:JSON.stringify({kind:button.dataset.moderate,target:button.dataset.target,enabled:button.dataset.enabled==='true'})});await adminDashboard()}catch(err){toast(featureError(err));button.disabled=false}});
}
document.addEventListener('click',e=>{
 const edit=e.target.closest('[data-edit-profile]');if(edit){const [kind,id]=edit.dataset.editProfile.split(':');editProfile(kind,id)}
 const brand=e.target.closest('[data-message-brand]');if(brand){const p=BR.find(x=>x.id==brand.dataset.messageBrand);if(p)sendTo({brand_id:p.id},p.name)}
});
document.addEventListener('keydown',e=>{const el=e.target.closest('article[data-go]');if(el&&(e.key==='Enter'||e.key===' ')){e.preventDefault();go(el.dataset.go)}});
