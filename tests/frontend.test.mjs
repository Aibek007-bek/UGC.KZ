import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {JSDOM,VirtualConsole} from 'jsdom';
const root=new URL('../',import.meta.url),html=await readFile(new URL('index.html',root),'utf8');
const script=await readFile(new URL('profile-features.js',root),'utf8');
const testHTML=html.replace('<script src="profile-features.js"></script>',()=>'<script>'+script+'</script>');
const uid='11111111-1111-4111-8111-111111111111',bid='22222222-2222-4222-8222-222222222222';
const cr={id:1,owner_id:uid,n:'Test Creator',city:'Алматы',t:['Другое'],p:10000,ph:5000,type:'Видео',bio:'Creator bio',vids:[]};
const br={id:2,owner_id:bid,name:'Test Brand',city:'Астана',bio:'Brand description',website:'https://example.test',avatar_path:bid+'/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.webp'};
async function until(fn){for(let i=0;i<100;i++){const value=fn();if(value)return value;await new Promise(r=>setTimeout(r,10))}throw new Error('UI did not reach expected state')}
async function page(path,{admin=false,loggedIn=true,brandOwner=false}={}){
 const requests=[],errors=[];let creator={...cr},brand={...br};
 const virtualConsole=new VirtualConsole();virtualConsole.on('jsdomError',e=>errors.push(e));
 const dom=new JSDOM(testHTML,{url:'http://localhost/'+path,runScripts:'dangerously',pretendToBeVisual:true,virtualConsole,beforeParse(w){
  w.scrollTo=()=>{};w.localStorage.setItem('ugc_l','kk');w.localStorage.setItem('ugc_viewer',uid);
  if(loggedIn){const accountId=brandOwner?bid:uid;w.localStorage.setItem('ugc_s',JSON.stringify({at:'test-token',uid:accountId,exp:Date.now()+3600000}));w.localStorage.setItem('ugc_u',JSON.stringify({id:accountId,name:brandOwner?br.name:cr.n,role:brandOwner?'biz':'creator'}))}
  w.fetch=async(url,opts={})=>{
   const path=new URL(url,'http://localhost').pathname.replace('/api/','');requests.push({path,opts});let value={};let status=200;
   if(path==='data')value={creators:[creator],brands:[brand],reviews:[]};
   else if(path==='stats')value={creators:1,brands:1,reviews:0,cities:2};
   else if(path==='profile/me')value={creators:brandOwner?[]:[creator],brands:brandOwner?[brand]:[],admin,suspended:false};
   else if(path==='profile/stats')value={views:12,views_7d:3,messages_received:2,messages_sent:1,unread:1,reviews:0};
   else if(path==='profile'&&opts.method==='PATCH'){const body=JSON.parse(opts.body);if(body.kind==='brand'){brand={...brand,name:body.name,bio:body.bio,city:body.city,website:body.website,avatar_path:body.avatar_path};value={profile:brand}}else{creator={...creator,n:body.name,bio:body.bio,city:body.city,avatar_path:body.avatar_path};value={profile:creator}}}
   else if(path==='messages'&&opts.method==='POST')value={message:{id:5,from_id:uid,recipient_id:bid,from_name:creator.n,body:JSON.parse(opts.body).body,created_at:new Date().toISOString()}};
   else if(path==='messages')value={items:[{id:4,from_id:bid,recipient_id:uid,from_name:br.name,body:'Incoming brand message',read_at:null,created_at:new Date().toISOString()}],next_before:null};
   else if(path==='admin'&&!admin){status=403;value={error:'admin_required'}}
   else if(path==='admin')value={users:[{id:uid,name:'Admin',email:'admin@example.test',admin:true},{id:bid,name:br.name,email:'brand@example.test',suspended:false}],creators:[creator],brands:[br],messages:[],audit:[],totals:{users:2,creators:1,brands:1,messages:0,views:12,reviews:0}};
   return new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json'}});
  };
 }});
 await until(()=>dom.window.document.querySelector('#app h1')||dom.window.document.querySelector('#app h2'));
 return {dom,w:dom.window,d:dom.window.document,requests,errors};
}
await test('brand cards open profiles, render avatars and start a private message',async()=>{
 const {dom,w,d,requests,errors}=await page('#/brands');
 (await until(()=>d.querySelector('[data-go="/brand/2"]'))).click();
 await until(()=>d.querySelector('[data-message-brand]'));
 assert.equal(d.querySelector('#app h1').textContent,'Test Brand');
 assert.ok(d.querySelector('.av img').src.endsWith('.webp'));
 assert.ok(d.querySelector('.profile-bio').textContent.includes('Brand description'));
 d.querySelector('[data-message-brand]').click();
 const form=await until(()=>d.querySelector('#new-message'));form.elements.body.value='Hello from creator';form.dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
 await until(()=>requests.some(r=>r.path==='messages'&&r.opts.method==='POST'));
 const sent=JSON.parse(requests.find(r=>r.path==='messages'&&r.opts.method==='POST').opts.body);
 assert.equal(sent.brand_id,2);assert.equal(sent.body,'Hello from creator');assert.deepEqual(errors,[]);dom.window.close();
});
await test('owner dashboard shows real stats and saves an edited profile',async()=>{
 const {dom,w,d,requests,errors}=await page('#/account');
 await until(()=>d.querySelector('.stat-box'));
 assert.equal(d.querySelector('.stat-box strong').textContent,'12');
 d.querySelector('[data-edit-profile]').click();
 const form=await until(()=>d.querySelector('#profile-form'));
 form.elements.name.value='Changed name';form.elements.bio.value='Changed biography';
 form.dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
 await until(()=>requests.some(r=>r.path==='profile'&&r.opts.method==='PATCH'));
 const saved=JSON.parse(requests.find(r=>r.path==='profile'&&r.opts.method==='PATCH').opts.body);
 assert.equal(saved.name,'Changed name');assert.equal(saved.bio,'Changed biography');assert.equal(saved.kind,'creator');
 assert.deepEqual(errors,[]);dom.window.close();
});
await test('inbox renders a conversation and sends a reply without email navigation',async()=>{
 const {dom,w,d,requests,errors}=await page('#/inbox');
 await until(()=>d.querySelector('#chat-reply'));assert.ok(d.querySelector('.chat-scroll').textContent.includes('Incoming brand message'));
 assert.equal(d.querySelector('a[href^="mailto:"]'),null);
 const form=d.querySelector('#chat-reply');form.elements.body.value='Here is my reply';form.dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
 await until(()=>requests.some(r=>r.path==='messages'&&r.opts.method==='POST'));
 const sent=JSON.parse(requests.find(r=>r.path==='messages'&&r.opts.method==='POST').opts.body);assert.equal(sent.recipient_id,bid);
 assert.deepEqual(errors,[]);dom.window.close();
});
await test('brand owner can edit their own name, biography, website and remove an avatar',async()=>{
 const {dom,w,d,requests,errors}=await page('#/account',{brandOwner:true});
 (await until(()=>d.querySelector('[data-edit-profile="brand:2"]'))).click();
 const form=await until(()=>d.querySelector('#profile-form'));
 form.elements.name.value='Updated Brand';form.elements.bio.value='New brand bio';form.elements.website.value='https://brand.example.test';
 d.querySelector('#remove-avatar').click();form.dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
 await until(()=>requests.some(r=>r.path==='profile'&&r.opts.method==='PATCH'));
 const saved=JSON.parse(requests.find(r=>r.path==='profile'&&r.opts.method==='PATCH').opts.body);
 assert.equal(saved.kind,'brand');assert.equal(saved.name,'Updated Brand');assert.equal(saved.avatar_path,'');assert.equal(saved.website,'https://brand.example.test');
 assert.deepEqual(errors,[]);dom.window.close();
});
await test('non-admin gets no admin data; a verified admin gets reversible controls',async()=>{
 let p=await page('#/admin');await until(()=>p.d.querySelector('.err'));assert.ok(p.d.querySelector('.err').textContent.includes('әкімшіге'));assert.equal(p.d.querySelector('[data-moderate]'),null);p.dom.window.close();
 p=await page('#/admin',{admin:true});const button=await until(()=>p.d.querySelector('[data-moderate="user"]'));button.click();await until(()=>p.requests.some(r=>r.path==='admin/moderate'));
 const body=JSON.parse(p.requests.find(r=>r.path==='admin/moderate').opts.body);assert.deepEqual(body,{kind:'user',target:bid,enabled:true});assert.deepEqual(p.errors,[]);p.dom.window.close();
});
