import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';

const db=new PGlite();
const creator='11111111-1111-4111-8111-111111111111',brand='22222222-2222-4222-8222-222222222222',admin='33333333-3333-4333-8333-333333333333',other='44444444-4444-4444-8444-444444444444';
await db.exec(`create role anon; create role authenticated;
 create schema auth; create schema storage;
 create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb default '{}',created_at timestamptz default now(),last_sign_in_at timestamptz);
 create function auth.uid() returns uuid language sql stable as $$select (nullif(current_setting('request.jwt.claims',true),'')::jsonb->>'sub')::uuid$$;
`);
await db.exec(`create function auth.jwt() returns jsonb language sql stable as $$select coalesce(nullif(current_setting('request.jwt.claims',true),'')::jsonb,'{}')$$;
 grant usage on schema auth,storage to anon,authenticated;
 grant execute on function auth.uid(),auth.jwt() to anon,authenticated;
 create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
 create table storage.objects(id bigint generated always as identity primary key,bucket_id text,name text);
 alter table storage.objects enable row level security;
 create function storage.foldername(text) returns text[] language sql immutable as $$ select string_to_array($1,'/') $$;
 grant select,insert,delete on storage.objects to authenticated;
 grant usage on sequence storage.objects_id_seq to authenticated;
`);
await db.exec(await readFile(new URL('../supabase-setup.sql',import.meta.url),'utf8'));
const migration=await readFile(new URL('../supabase-upgrade.sql',import.meta.url),'utf8');
await db.exec(migration);
await db.exec(migration); // Repeatability is part of the deployment contract.
for(const [id,name,role] of [[creator,'Creator','creator'],[brand,'Brand','biz'],[admin,'Owner','biz'],[other,'Forged admin','admin']]){
 await db.query('insert into auth.users(id,email,raw_user_meta_data) values($1,$2,$3)',[id,id+'@example.test',{name,role,city:'Алматы',price:10000}]);
 // Assert the existing registration trigger remains functional.
 const count=await db.query(`select count(*)::int as n from ${role==='creator'?'creators':'brands'} where owner_id=$1`,[id]);
 assert.equal(count.rows[0].n,1);
}
await db.query('insert into ugc_private.admins values($1)',[admin]);
const cid=(await db.query('select id from creators where owner_id=$1',[creator])).rows[0].id;
const bid=(await db.query('select id from brands where owner_id=$1',[brand])).rows[0].id;
async function as(uid,fn){
 await db.exec('set role '+(uid?'authenticated':'anon'));
 await db.query("select set_config('request.jwt.claims',$1,false)",[JSON.stringify(uid?{sub:uid,email:uid+'@example.test'}:{})]);
 try{return await fn()}finally{await db.exec('reset role');await db.exec("select set_config('request.jwt.claims','',false)")}
}
await test('users edit their own profile; ownership and moderation fields are immutable',async()=>{
 await as(creator,async()=>{
  await db.query('update creators set n=$1,bio=$2 where id=$3',['Updated creator','Bio',cid]);
  await assert.rejects(db.query('update creators set owner_id=$1 where id=$2',[brand,cid]),/immutable_profile_identity/);
  await assert.rejects(db.query('update creators set is_hidden=true where id=$1',[cid]),/admin_required/);
 });
 const result=await as(brand,()=>db.query('update creators set n=$1 where id=$2 returning id',['Hacked',cid]));
 assert.equal(result.rows.length,0);
 await as(brand,()=>db.query('update brands set bio=$1,website=$2 where id=$3',['Brand bio','https://example.test',bid]));
});
await test('avatars reject another user folder, SVG and oversized storage MIME policies',async()=>{
 await as(creator,async()=>{
  await assert.rejects(db.query('update creators set avatar_path=$1 where id=$2',[brand+'/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.webp',cid]),/invalid_avatar/);
  await assert.rejects(db.query('update creators set avatar_path=$1 where id=$2',[creator+'/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.svg',cid]),/invalid_avatar/);
  await assert.rejects(db.query('insert into storage.objects(bucket_id,name) values($1,$2)',['avatars',brand+'/x.webp']),/row-level security/);
  await db.query('insert into storage.objects(bucket_id,name) values($1,$2)',['avatars',creator+'/x.webp']);
 });
 const bucket=(await db.query("select * from storage.buckets where id='avatars'")).rows[0];
 assert.equal(Number(bucket.file_size_limit),2097152);assert.ok(!bucket.allowed_mime_types.includes('image/svg+xml'));
});
let messageId;
await test('creator can write to a brand; database replaces spoofed sender and recipient identity',async()=>{
 const result=await as(creator,()=>db.query(`insert into messages(brand_id,from_id,from_name,from_email,recipient_id,body)
 values($1,$2,'FAKE','fake@example.test',$3,'Hello brand') returning *`,[bid,other,other]));
 const m=result.rows[0];messageId=m.id;
 assert.equal(m.from_id,creator);assert.equal(m.recipient_id,brand);assert.equal(m.from_name,'Updated creator');
 assert.equal(m.from_email,creator+'@example.test');
});
await test('only participants and real admins can read conversations; brand replies in site',async()=>{
 assert.equal((await as(other,()=>db.query('select * from messages'))).rows.length,0);
 assert.equal((await as(brand,()=>db.query('select * from messages'))).rows.length,1);
 assert.equal((await as(admin,()=>db.query('select * from messages'))).rows.length,1);
 await assert.rejects(as(null,()=>db.query('select * from messages')),/permission denied/);
 await as(brand,()=>db.query("insert into messages(recipient_id,body) values($1,'Brand reply')",[creator]));
 assert.equal((await as(creator,()=>db.query('select * from messages'))).rows.length,2);
 await as(brand,()=>db.query('update messages set read_at=now() where id=$1',[messageId]));
 assert.ok((await db.query('select read_at from messages where id=$1',[messageId])).rows[0].read_at);
 await assert.rejects(as(creator,()=>db.query("update messages set body='Rewritten' where id=$1",[messageId])),/permission denied/);
 await assert.rejects(as(creator,()=>db.query('delete from messages where id=$1',[messageId])),/permission denied/);
 await assert.rejects(as(creator,()=>db.query("insert into messages(recipient_id,body) values($1,'Self message')",[creator])),/recipient_unavailable/);
});
await test('views deduplicate by browser/day and private statistics require ownership',async()=>{
 for(let i=0;i<2;i++)await as(null,()=>db.query('select ugc_record_view($1,$2,$3)',['brand',bid,other]));
 await as(brand,()=>db.query('select ugc_record_view($1,$2,$3)',['brand',bid,creator]));
 const stats=(await as(brand,()=>db.query('select ugc_profile_stats($1,$2) as s',['brand',bid]))).rows[0].s;
 assert.equal(stats.views,1);assert.equal(stats.messages_received,1);assert.equal(stats.messages_sent,1);
 await assert.rejects(as(creator,()=>db.query('select ugc_profile_stats($1,$2)',['brand',bid])),/forbidden/);
});
await test('user metadata cannot grant admin access; moderation is audited and reversible',async()=>{
 assert.equal((await as(other,()=>db.query('select ugc_is_admin() as admin'))).rows[0].admin,false);
 await assert.rejects(as(other,()=>db.query('select ugc_admin_overview()')),/admin_required/);
 await assert.rejects(as(other,()=>db.query('select ugc_admin_moderate($1,$2,$3)',['brand',String(bid),true])),/admin_required/);
 await as(admin,()=>db.query('select ugc_admin_moderate($1,$2,$3)',['brand',String(bid),true]));
 assert.equal((await as(null,()=>db.query('select * from brands where id=$1',[bid]))).rows.length,0);
 await as(admin,()=>db.query('select ugc_admin_moderate($1,$2,$3)',['brand',String(bid),false]));
 assert.equal((await as(null,()=>db.query('select * from brands where id=$1',[bid]))).rows.length,1);
 await as(admin,()=>db.query('select ugc_admin_moderate($1,$2,$3)',['user',creator,true]));
 await assert.rejects(as(creator,()=>db.query("insert into messages(brand_id,body) values($1,'Blocked send')",[bid])),/login_or_active_account_required/);
 await assert.rejects(as(creator,()=>db.query('insert into storage.objects(bucket_id,name) values($1,$2)',['videos',creator+'/x.mp4'])),/row-level security/);
 assert.equal((await as(null,()=>db.query('select * from creators where id=$1',[cid]))).rows.length,0);
 await as(admin,()=>db.query('select ugc_admin_moderate($1,$2,$3)',['user',creator,false]));
 const overview=(await as(admin,()=>db.query('select ugc_admin_overview() as data'))).rows[0].data;
 assert.equal(overview.totals.users,4);assert.equal(overview.audit.length,4);
 await assert.rejects(as(admin,()=>db.query('select ugc_admin_moderate($1,$2,$3)',['user',admin,true])),/cannot_suspend_admin/);
});
await db.close();
