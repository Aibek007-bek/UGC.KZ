-- Run AFTER supabase-setup.sql, once for an existing site (safe to repeat).
-- Existing accounts, portfolios, reviews and messages are preserved.
begin;
create schema if not exists ugc_private;
revoke all on schema ugc_private from public, anon, authenticated;
create table if not exists ugc_private.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
create table if not exists ugc_private.suspended_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table if not exists ugc_private.audit (
  id bigint generated always as identity primary key,
  actor uuid references auth.users(id), action text not null, target text not null,
  created_at timestamptz not null default now()
);
create table if not exists ugc_private.profile_views (
  profile_type text not null check (profile_type in ('creator','brand')),
  profile_id bigint not null, visitor uuid not null,
  viewed_on date not null default current_date,
  primary key (profile_type, profile_id, visitor, viewed_on)
);

create or replace function public.ugc_is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
 select exists(select 1 from ugc_private.admins where user_id = auth.uid());
$$;
create or replace function public.ugc_is_suspended()
returns boolean language sql stable security definer set search_path = '' as $$
 select exists(select 1 from ugc_private.suspended_users where user_id = auth.uid());
$$;
create or replace function public.ugc_profile_visible(owner uuid)
returns boolean language sql stable security definer set search_path = '' as $$
 select not exists(select 1 from ugc_private.suspended_users where user_id = owner);
$$;
revoke all on function public.ugc_is_admin(), public.ugc_is_suspended(), public.ugc_profile_visible(uuid) from public;
grant execute on function public.ugc_is_admin(), public.ugc_profile_visible(uuid) to anon, authenticated;
grant execute on function public.ugc_is_suspended() to authenticated;

alter table public.creators add column if not exists avatar_path text not null default '';
alter table public.creators add column if not exists is_hidden boolean not null default false;
alter table public.brands add column if not exists avatar_path text not null default '';
alter table public.brands add column if not exists bio text not null default '';
alter table public.brands add column if not exists city text not null default '';
alter table public.brands add column if not exists website text not null default '';
alter table public.brands add column if not exists is_hidden boolean not null default false;

-- A signed-in user cannot move ownership or hide/unhide their profile by REST.
create or replace function public.ugc_guard_profile()
returns trigger language plpgsql set search_path = '' as $$
begin
 if auth.uid() is not null then
  if public.ugc_is_suspended() then raise exception 'account_suspended' using errcode='42501'; end if;
  if tg_op='UPDATE' and (new.owner_id is distinct from old.owner_id or new.id <> old.id
     or new.created_at is distinct from old.created_at) then
   raise exception 'immutable_profile_identity' using errcode='42501';
  end if;
  if not public.ugc_is_admin() and
     ((tg_op='INSERT' and new.is_hidden) or (tg_op='UPDATE' and new.is_hidden is distinct from old.is_hidden)) then
   raise exception 'admin_required' using errcode='42501';
  end if;
 end if;
 if char_length(new.bio)>1000 or char_length(new.city)>80 then raise exception 'profile_length'; end if;
 if new.avatar_path <> '' and (new.avatar_path !~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.(jpg|png|webp)$'
    or split_part(new.avatar_path,'/',1) <> new.owner_id::text) then raise exception 'invalid_avatar'; end if;
 if tg_table_name='creators' then
  if char_length(trim(new.n)) not between 1 and 80 or new.p < 0 or new.ph < 0 then raise exception 'invalid_profile'; end if;
 else
  if char_length(trim(new.name)) not between 1 and 80 or char_length(new.website)>300
     or (new.website<>'' and new.website !~ '^https://[^[:space:]]+$') then raise exception 'invalid_profile'; end if;
 end if;
 return new;
end $$;
drop trigger if exists ugc_guard_profile on public.creators;
create trigger ugc_guard_profile before insert or update on public.creators for each row execute function public.ugc_guard_profile();
drop trigger if exists ugc_guard_profile on public.brands;
create trigger ugc_guard_profile before insert or update on public.brands for each row execute function public.ugc_guard_profile();

drop policy if exists creators_read on public.creators;
create policy creators_read on public.creators for select using
 ((not is_hidden and public.ugc_profile_visible(owner_id)) or owner_id=auth.uid() or public.ugc_is_admin());
drop policy if exists brands_read on public.brands;
create policy brands_read on public.brands for select using
 ((not is_hidden and public.ugc_profile_visible(owner_id)) or owner_id=auth.uid() or public.ugc_is_admin());

-- Legacy creator messages become normal two-way messages.
alter table public.messages alter column creator_id drop not null;
alter table public.messages add column if not exists brand_id bigint references public.brands(id) on delete set null;
alter table public.messages add column if not exists recipient_id uuid references auth.users(id) on delete cascade;
alter table public.messages add column if not exists read_at timestamptz;
create sequence if not exists public.ugc_message_id_seq;
select setval('public.ugc_message_id_seq',greatest(coalesce((select max(id) from public.messages),0)+1,
 (select last_value from public.ugc_message_id_seq)),false);
alter table public.messages alter column id set default nextval('public.ugc_message_id_seq');
grant usage on sequence public.ugc_message_id_seq to authenticated;
update public.messages m set recipient_id=c.owner_id from public.creators c
 where m.creator_id=c.id and m.recipient_id is null;
create index if not exists ugc_messages_recipient on public.messages(recipient_id,created_at desc);
create index if not exists ugc_messages_sender on public.messages(from_id,created_at desc);

create or replace function public.ugc_guard_message()
returns trigger language plpgsql security definer set search_path = '' as $$
declare target_owner uuid; sender_name text;
begin
 if auth.uid() is null or public.ugc_is_suspended() then raise exception 'login_or_active_account_required' using errcode='42501'; end if;
 if new.creator_id is not null and new.brand_id is not null then raise exception 'one_recipient_required'; end if;
 if new.creator_id is not null then
  select owner_id into target_owner from public.creators where id=new.creator_id and not is_hidden;
 elsif new.brand_id is not null then
  select owner_id into target_owner from public.brands where id=new.brand_id and not is_hidden;
 else
  select owner_id into target_owner from (
   select owner_id from public.creators where owner_id=new.recipient_id and not is_hidden
   union all select owner_id from public.brands where owner_id=new.recipient_id and not is_hidden
  ) p limit 1;
 end if;
 if target_owner is null or target_owner=auth.uid() or not public.ugc_profile_visible(target_owner) then
  raise exception 'recipient_unavailable' using errcode='42501';
 end if;
 select coalesce((select n from public.creators where owner_id=auth.uid() order by id limit 1),
                 (select name from public.brands where owner_id=auth.uid() order by id limit 1)) into sender_name;
 if sender_name is null then raise exception 'sender_profile_required' using errcode='42501'; end if;
 new.from_id:=auth.uid(); new.recipient_id:=target_owner;
 new.from_name:=sender_name;
 new.from_email:=coalesce(auth.jwt()->>'email','');
 new.body:=trim(new.body); new.created_at:=now(); new.read_at:=null;
 return new;
end $$;
drop trigger if exists ugc_guard_message on public.messages;
create trigger ugc_guard_message before insert on public.messages for each row execute function public.ugc_guard_message();
drop policy if exists messages_read on public.messages;
drop policy if exists messages_insert on public.messages;
drop policy if exists messages_delete on public.messages;
drop policy if exists messages_mark_read on public.messages;
create policy messages_read on public.messages for select to authenticated
 using(from_id=auth.uid() or recipient_id=auth.uid() or public.ugc_is_admin());
create policy messages_insert on public.messages for insert to authenticated
 with check(from_id=auth.uid() and recipient_id<>auth.uid() and not public.ugc_is_suspended());
create policy messages_mark_read on public.messages for update to authenticated
 using(recipient_id=auth.uid()) with check(recipient_id=auth.uid());
-- Only read_at may be updated; conversations cannot be rewritten or erased.
revoke insert,update,delete on public.messages from anon;
revoke update,delete on public.messages from authenticated;
grant update(read_at) on public.messages to authenticated;
grant select,insert on public.messages to authenticated;

-- Avatars: public images, upload/remove only in the owner's folder; no SVG.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('avatars','avatars',true,2097152,array['image/jpeg','image/png','image/webp'])
on conflict(id) do update set public=true,file_size_limit=2097152,allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists ugc_avatars_insert on storage.objects;
drop policy if exists ugc_avatars_delete on storage.objects;
create policy ugc_avatars_insert on storage.objects for insert to authenticated
 with check(bucket_id='avatars' and (storage.foldername(name))[1]=auth.uid()::text and not public.ugc_is_suspended());
create policy ugc_avatars_delete on storage.objects for delete to authenticated
 using(bucket_id='avatars' and (storage.foldername(name))[1]=auth.uid()::text);

create or replace function public.ugc_record_view(kind text, profile bigint, visitor_key uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare owner uuid;
begin
 if kind='creator' then select owner_id into owner from public.creators where id=profile and not is_hidden;
 elsif kind='brand' then select owner_id into owner from public.brands where id=profile and not is_hidden;
 else raise exception 'invalid_profile_type'; end if;
 if owner is null or owner=auth.uid() or not public.ugc_profile_visible(owner) then return; end if;
 insert into ugc_private.profile_views(profile_type,profile_id,visitor)
 values(kind,profile,visitor_key) on conflict do nothing;
end $$;

create or replace function public.ugc_profile_stats(kind text, profile bigint)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare owner uuid; result jsonb;
begin
 if kind='creator' then select owner_id into owner from public.creators where id=profile;
 elsif kind='brand' then select owner_id into owner from public.brands where id=profile;
 else raise exception 'invalid_profile_type'; end if;
 if auth.uid() is null or owner is null or (owner<>auth.uid() and not public.ugc_is_admin()) then
  raise exception 'forbidden' using errcode='42501';
 end if;
 select jsonb_build_object(
  'views',count(*),'views_7d',count(*) filter(where viewed_on>=current_date-6),
  'messages_received',(select count(*) from public.messages where recipient_id=owner),
  'messages_sent',(select count(*) from public.messages where from_id=owner),
  'unread',(select count(*) from public.messages where recipient_id=owner and read_at is null),
  'reviews',(select count(*) from public.reviews where creator_id=profile and kind='creator')
 ) into result from ugc_private.profile_views where profile_type=kind and profile_id=profile;
 return result;
end $$;

create or replace function public.ugc_admin_overview()
returns jsonb language plpgsql security definer set search_path = '' as $$
begin
 if not public.ugc_is_admin() then raise exception 'admin_required' using errcode='42501'; end if;
 return jsonb_build_object(
  'users',(select coalesce(jsonb_agg(to_jsonb(u)),'[]') from (
   select a.id,a.email,a.created_at,a.last_sign_in_at,
    coalesce((select n from public.creators where owner_id=a.id order by id limit 1),
             (select name from public.brands where owner_id=a.id order by id limit 1),'') as name,
    exists(select 1 from ugc_private.suspended_users s where s.user_id=a.id) as suspended,
    exists(select 1 from ugc_private.admins adm where adm.user_id=a.id) as admin
   from auth.users a order by a.created_at desc limit 500) u),
  'creators',(select coalesce(jsonb_agg(to_jsonb(c)),'[]') from (select * from public.creators order by id desc limit 500)c),
  'brands',(select coalesce(jsonb_agg(to_jsonb(b)),'[]') from (select * from public.brands order by id desc limit 500)b),
  'messages',(select coalesce(jsonb_agg(to_jsonb(m)),'[]') from (select * from public.messages order by created_at desc,id desc limit 200)m),
  'audit',(select coalesce(jsonb_agg(to_jsonb(a)),'[]') from (select * from ugc_private.audit order by id desc limit 100)a),
  'totals',jsonb_build_object('users',(select count(*) from auth.users),
   'creators',(select count(*) from public.creators),'brands',(select count(*) from public.brands),
   'messages',(select count(*) from public.messages),'reviews',(select count(*) from public.reviews),
   'views',(select count(*) from ugc_private.profile_views))
 );
end $$;

create or replace function public.ugc_admin_moderate(kind text, target text, enabled boolean)
returns void language plpgsql security definer set search_path = '' as $$
begin
 if not public.ugc_is_admin() then raise exception 'admin_required' using errcode='42501'; end if;
 if kind='user' then
  if target::uuid=auth.uid() or exists(select 1 from ugc_private.admins where user_id=target::uuid) then
   raise exception 'cannot_suspend_admin'; end if;
  if not exists(select 1 from auth.users where id=target::uuid) then raise exception 'user_not_found'; end if;
  if enabled then insert into ugc_private.suspended_users(user_id) values(target::uuid) on conflict do nothing;
  else delete from ugc_private.suspended_users where user_id=target::uuid; end if;
 elsif kind='creator' then
  update public.creators set is_hidden=enabled where id=target::bigint;
  if not found then raise exception 'profile_not_found'; end if;
 elsif kind='brand' then
  update public.brands set is_hidden=enabled where id=target::bigint;
  if not found then raise exception 'profile_not_found'; end if;
 else raise exception 'invalid_target'; end if;
 insert into ugc_private.audit(actor,action,target) values(auth.uid(),kind||case when enabled then ':disable' else ':restore' end,target);
end $$;

revoke all on function public.ugc_record_view(text,bigint,uuid), public.ugc_profile_stats(text,bigint),
 public.ugc_admin_overview(), public.ugc_admin_moderate(text,text,boolean) from public;
grant execute on function public.ugc_record_view(text,bigint,uuid) to anon,authenticated;
grant execute on function public.ugc_profile_stats(text,bigint), public.ugc_admin_overview(),
 public.ugc_admin_moderate(text,text,boolean) to authenticated;

-- Block suspended users on every existing write path, including direct REST.
drop policy if exists ugc_creators_active on public.creators;
create policy ugc_creators_active on public.creators as restrictive for all to authenticated
 using(not public.ugc_is_suspended()) with check(not public.ugc_is_suspended());
drop policy if exists ugc_brands_active on public.brands;
create policy ugc_brands_active on public.brands as restrictive for all to authenticated
 using(not public.ugc_is_suspended()) with check(not public.ugc_is_suspended());
drop policy if exists ugc_reviews_active on public.reviews;
create policy ugc_reviews_active on public.reviews as restrictive for all to authenticated
 using(not public.ugc_is_suspended()) with check(not public.ugc_is_suspended());
drop policy if exists ugc_videos_active on storage.objects;
create policy ugc_videos_active on storage.objects as restrictive for insert to authenticated
 with check(not public.ugc_is_suspended());
notify pgrst, 'reload schema';
commit;

-- Assign an admin ONLY from Supabase SQL Editor (not from browser metadata).
-- Replace OWNER_EMAIL with the existing site owner's sign-in email, then run:
-- insert into ugc_private.admins(user_id)
-- select id from auth.users where lower(email)=lower('OWNER_EMAIL')
-- on conflict do nothing;
