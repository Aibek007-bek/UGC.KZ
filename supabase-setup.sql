-- UGC.KZ: Supabase → SQL Editor ішінде бір рет іске қосыңыз (қайта іске қосуға болады)

-- 1) Кестелер
create table if not exists public.creators (
  id bigint primary key,
  owner_id uuid references auth.users(id) on delete cascade,
  n text not null, r numeric default 0, c int default 0, city text, v text default '—',
  t jsonb default '[]'::jsonb, p int default 0, ph int default 0, type text, h int default 0,
  bio text default '', vids jsonb default '[]'::jsonb, created_at timestamptz default now()
);
alter table public.creators add column if not exists owner_id uuid references auth.users(id) on delete cascade;

create table if not exists public.brands (
  id bigint primary key,
  owner_id uuid references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz default now()
);

create table if not exists public.messages (
  id bigint primary key,
  creator_id bigint not null references public.creators(id) on delete cascade,
  from_id uuid not null references auth.users(id) on delete cascade,
  from_name text not null, from_email text not null,
  body text not null check (char_length(body) between 5 and 2000),
  created_at timestamptz default now()
);

create table if not exists public.reviews (
  id bigint primary key,
  creator_id bigint not null references public.creators(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null,
  rating int not null check (rating between 1 and 5),
  body text not null check (char_length(body) between 5 and 1000),
  created_at timestamptz default now(),
  unique (creator_id, author_id)
);

-- 2) Ескі ашық ережелерді өшіру
do $$ declare r record; begin
  for r in select policyname, tablename from pg_policies
           where schemaname='public' and tablename in ('creators','brands','messages','reviews') loop
    execute format('drop policy %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

-- 3) Қауіпсіздік (RLS): оқу — бәріне, жазу/өзгерту/өшіру — тек иесіне
alter table public.creators enable row level security;
alter table public.brands   enable row level security;
alter table public.messages enable row level security;
alter table public.reviews  enable row level security;

create policy "creators_read"   on public.creators for select using (true);
create policy "creators_insert" on public.creators for insert to authenticated with check (owner_id = auth.uid());
create policy "creators_update" on public.creators for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "creators_delete" on public.creators for delete to authenticated using (owner_id = auth.uid());

create policy "brands_read"   on public.brands for select using (true);
create policy "brands_insert" on public.brands for insert to authenticated with check (owner_id = auth.uid());
create policy "brands_update" on public.brands for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "brands_delete" on public.brands for delete to authenticated using (owner_id = auth.uid());

-- Хабарламалар: жіберуші өзі жазғанын, креатор өзіне келгенін ғана көреді
create policy "messages_read" on public.messages for select to authenticated
  using (from_id = auth.uid() or exists (select 1 from public.creators c where c.id = creator_id and c.owner_id = auth.uid()));
create policy "messages_insert" on public.messages for insert to authenticated
  with check (from_id = auth.uid()
    and lower(from_email) = lower(auth.jwt() ->> 'email')
    and exists (select 1 from public.creators c where c.id = creator_id and c.owner_id is distinct from auth.uid()));
create policy "messages_delete" on public.messages for delete to authenticated
  using (from_id = auth.uid() or exists (select 1 from public.creators c where c.id = creator_id and c.owner_id = auth.uid()));

-- Пікірлер: бәріне көрінеді; өз профиліне пікір жазуға болмайды; әр адам бір рет
create policy "reviews_read" on public.reviews for select using (true);
create policy "reviews_insert" on public.reviews for insert to authenticated
  with check (author_id = auth.uid()
    and exists (select 1 from public.creators c where c.id = creator_id and c.owner_id is distinct from auth.uid()));
create policy "reviews_delete" on public.reviews for delete to authenticated using (author_id = auth.uid());

grant select on public.creators, public.brands, public.reviews to anon, authenticated;
grant select, insert, delete on public.messages to authenticated;
grant insert, delete on public.reviews to authenticated;
grant insert, update, delete on public.creators, public.brands to authenticated;

-- 4) Видео сақтау орны (Storage): бәріне көрінеді, жүктеу/өшіру — тек өз папкасына
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('videos', 'videos', true, 52428800, array['video/*'])
on conflict (id) do update set public = true, file_size_limit = 52428800, allowed_mime_types = array['video/*'];

drop policy if exists "ugc_videos_insert" on storage.objects;
drop policy if exists "ugc_videos_delete" on storage.objects;
create policy "ugc_videos_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'videos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "ugc_videos_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'videos' and (storage.foldername(name))[1] = auth.uid()::text);
-- Ескерту: Supabase Free жоспарында бір файлдың шегі 50 МБ.

-- 5) Тіркелген бойда профильді АВТОМАТТЫ жасау (триггер)
--    Бұрын профиль браузерден жазылатын: email растау қосулы болса немесе адам
--    басқа құрылғыдан кірсе — профиль жасалмай қалатын, сондықтан тіркелгендер көрінбейтін.
create or replace function public.ugc_handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  m jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  nm text := nullif(trim(m->>'name'), '');
  pr int  := coalesce(nullif(m->>'price','')::int, 0);
  nid bigint := (extract(epoch from clock_timestamp()) * 1000)::bigint;
begin
  if nm is null then nm := split_part(new.email, '@', 1); end if;
  if m->>'role' = 'creator' then
    if not exists (select 1 from public.creators where owner_id = new.id) then
      insert into public.creators (id, owner_id, n, city, t, p, ph, type, h)
      values (nid, new.id, nm, coalesce(m->>'city',''),
              jsonb_build_array(coalesce(m->>'cat','Другое')),
              pr, round(pr/2.0)::int, coalesce(m->>'type','Видео'),
              coalesce(nullif(m->>'h','')::int, (random()*330)::int));
    end if;
  else
    if not exists (select 1 from public.brands where owner_id = new.id) then
      insert into public.brands (id, owner_id, name) values (nid, new.id, nm);
    end if;
  end if;
  return new;
exception when others then
  raise warning 'ugc_handle_new_user: %', sqlerrm;  -- тіркелуді бұзбау үшін
  return new;
end $$;

drop trigger if exists ugc_on_auth_user_created on auth.users;
create trigger ugc_on_auth_user_created
  after insert on auth.users
  for each row execute function public.ugc_handle_new_user();

-- 6) Бұрын тіркеліп, профилі сақталмай қалғандарды қалпына келтіру (бір рет)
insert into public.creators (id, owner_id, n, city, t, p, ph, type, h)
select (extract(epoch from u.created_at) * 1000)::bigint + row_number() over (),
       u.id, coalesce(nullif(trim(u.raw_user_meta_data->>'name'),''), split_part(u.email,'@',1)),
       coalesce(u.raw_user_meta_data->>'city',''),
       jsonb_build_array(coalesce(u.raw_user_meta_data->>'cat','Другое')),
       coalesce(nullif(u.raw_user_meta_data->>'price','')::int, 0),
       round(coalesce(nullif(u.raw_user_meta_data->>'price','')::int, 0)/2.0)::int,
       coalesce(u.raw_user_meta_data->>'type','Видео'), (random()*330)::int
from auth.users u
where u.raw_user_meta_data->>'role' = 'creator'
  and not exists (select 1 from public.creators c where c.owner_id = u.id)
on conflict (id) do nothing;

insert into public.brands (id, owner_id, name)
select (extract(epoch from u.created_at) * 1000)::bigint + row_number() over (),
       u.id, coalesce(nullif(trim(u.raw_user_meta_data->>'name'),''), split_part(u.email,'@',1))
from auth.users u
where coalesce(u.raw_user_meta_data->>'role','biz') <> 'creator'
  and not exists (select 1 from public.brands b where b.owner_id = u.id)
on conflict (id) do nothing;
