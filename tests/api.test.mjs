import {test} from 'node:test';
import assert from 'node:assert/strict';
import handler from '../netlify/functions/api.mjs';
const uid='11111111-1111-4111-8111-111111111111';
const recipient='22222222-2222-4222-8222-222222222222';
let calls=[],admin=false,foreign=false,suspended=false;
const json=(body,status=200)=>new Response(JSON.stringify(body),{status});
globalThis.fetch=async(url,opts={})=>{
 calls.push({url,opts});
 if(url.includes('/auth/v1/user'))return json({id:uid,email:'owner@example.test',user_metadata:{role:'admin',name:'Owner'}});
 if(url.endsWith('rpc/ugc_is_admin'))return json(admin);
 if(url.endsWith('rpc/ugc_is_suspended'))return json(suspended);
 if(url.endsWith('rpc/ugc_admin_overview'))return json({totals:{users:3}});
 if(url.includes('creators?select=id,owner_id'))return json([{id:7,owner_id:recipient}]);
 if(url.includes('brands?select=id,owner_id'))return json([{id:8,owner_id:recipient}]);
 if(url.endsWith('/messages')&&opts.method==='POST')return json([{...JSON.parse(opts.body),id:20,recipient_id:recipient}]);
 if(url.includes('/creators?id=')&&opts.method==='PATCH')return json(foreign?[]:[{id:7,...JSON.parse(opts.body)}]);
 return json([]);
};
async function request(path,method='GET',body,loggedIn=true){calls=[];return handler(new Request('https://example.test/api/'+path,{method,headers:{...(loggedIn?{Authorization:'Bearer test-token'}:{}),'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)}))}
await test('private endpoints reject requests without a token',async()=>{
 for(const route of ['profile/me','messages','profile/stats?kind=brand&id=8','admin'])assert.equal((await request(route,'GET',undefined,false)).status,401);
});
await test('admin metadata alone does not grant administrator privileges',async()=>{
 admin=false;assert.equal((await request('admin')).status,403);
 assert.ok(!calls.some(c=>c.url.endsWith('rpc/ugc_admin_overview')));
 admin=true;assert.equal((await request('admin')).status,200);admin=false;
});
await test('messages support both profile types and reject ambiguous recipients',async()=>{
 for(const target of [{creator_id:7},{brand_id:8},{recipient_id:recipient}]){
  assert.equal((await request('messages','POST',{...target,body:'Hello there'})).status,201);
  const sent=calls.find(c=>c.url.endsWith('/messages'));assert.equal(sent.opts.headers.Authorization,'Bearer test-token');
 }
 assert.equal((await request('messages','POST',{creator_id:7,brand_id:8,body:'Hello'})).status,400);
 assert.equal((await request('messages','POST',{recipient_id:uid,body:'Hello'})).status,400);
 assert.equal((await request('messages','POST',{brand_id:'8&or=(id.gt.0)',body:'Hello'})).status,400);
 assert.equal((await request('messages','POST',{brand_id:8,body:'x'.repeat(2001)})).status,400);
});
await test('profile patch only updates owned rows and never accepts role or owner changes',async()=>{
 const body={kind:'creator',id:7,name:'New name',city:'Алматы',bio:'Bio',p:10000,ph:5000,t:['Другое'],type:'Видео',owner_id:recipient,admin:true};
 let response=await request('profile','PATCH',body);assert.equal(response.status,200);
 const update=calls.find(c=>c.opts.method==='PATCH');assert.ok(update.url.includes('owner_id=eq.'+uid));
 const saved=JSON.parse(update.opts.body);assert.equal(saved.owner_id,undefined);assert.equal(saved.admin,undefined);
 foreign=true;assert.equal((await request('profile','PATCH',body)).status,404);foreign=false;
 suspended=true;assert.equal((await request('profile','PATCH',body)).status,403);suspended=false;
 assert.equal((await request('profile','PATCH',{...body,avatar_path:recipient+'/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.webp'})).status,400);
});
await test('messages are explicitly scoped to the caller and support cursor pagination',async()=>{
 const result=await request('messages?before=123');assert.equal(result.status,200);
 const query=calls.find(c=>c.url.includes('messages?'));assert.ok(query.url.includes(`or=(from_id.eq.${uid},recipient_id.eq.${uid})`));assert.ok(query.url.endsWith('&id=lt.123'));
 assert.equal((await request('messages?before=bad')).status,400);
 assert.equal(result.headers.get('cache-control'),'no-store');
});
