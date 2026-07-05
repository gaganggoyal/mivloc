-- ════════════════════════════════════════════════════════════
-- SafeChat — Supabase Schema
-- Run once in Supabase SQL Editor.
-- Then: Authentication → Providers → Email → enable "Confirm email"
-- ════════════════════════════════════════════════════════════
create extension if not exists "uuid-ossp";

-- ── PROFILES ─────────────────────────────────────────────────
create table if not exists profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text not null,
  email         text not null,
  phone         text,
  referral_code text unique not null default substr(md5(random()::text), 1, 8),
  invited_by    uuid references auth.users(id),
  created_at    timestamptz default now()
);
alter table profiles enable row level security;
create policy "profiles readable by authed" on profiles for select using (auth.role() = 'authenticated');
create policy "own profile insert" on profiles for insert with check (auth.uid() = id);
create policy "own profile update" on profiles for update using (auth.uid() = id);

-- Auto-create profile on signup; auto-friend the inviter if ref code present
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare inviter uuid;
begin
  select p.id into inviter from profiles p
    where p.referral_code = coalesce(new.raw_user_meta_data->>'ref', '');
  insert into profiles (id, display_name, email, phone, invited_by)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)),
    new.email,
    nullif(new.raw_user_meta_data->>'phone',''),
    inviter
  );
  if inviter is not null then
    insert into friendships (user_a, user_b)
    values (least(inviter, new.id), greatest(inviter, new.id))
    on conflict do nothing;
  end if;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

-- ── FRIENDSHIPS ──────────────────────────────────────────────
create table if not exists friendships (
  user_a     uuid not null references auth.users(id) on delete cascade,
  user_b     uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_a, user_b),
  check (user_a < user_b)
);
alter table friendships enable row level security;
create policy "own friendships select" on friendships for select using (auth.uid() in (user_a, user_b));
create policy "own friendships insert" on friendships for insert with check (auth.uid() in (user_a, user_b));
create policy "own friendships delete" on friendships for delete using (auth.uid() in (user_a, user_b));

-- ── CHATS (per friend pair) ──────────────────────────────────
-- chat_key: random AES key for the conversation (base64).
-- Each user sets their OWN unlock code: salt + verification blob per side.
create table if not exists chats (
  id           uuid primary key default uuid_generate_v4(),
  user_a       uuid not null references auth.users(id) on delete cascade,
  user_b       uuid not null references auth.users(id) on delete cascade,
  chat_key     text,
  code_salt_a  text,
  code_check_a text,
  code_salt_b  text,
  code_check_b text,
  created_at   timestamptz default now(),
  unique (user_a, user_b),
  check (user_a < user_b)
);
-- Migration for installs created before per-user codes (safe to re-run)
alter table chats add column if not exists chat_key     text;
alter table chats add column if not exists code_salt_a  text;
alter table chats add column if not exists code_check_a text;
alter table chats add column if not exists code_salt_b  text;
alter table chats add column if not exists code_check_b text;
alter table chats enable row level security;
create policy "own chats all" on chats for all
  using (auth.uid() in (user_a, user_b)) with check (auth.uid() in (user_a, user_b));

-- ── MESSAGES — ciphertext only, server never sees plaintext ─
create table if not exists messages (
  id         uuid primary key default uuid_generate_v4(),
  chat_id    uuid not null references chats(id) on delete cascade,
  sender_id  uuid not null references auth.users(id) on delete cascade,
  ciphertext text not null,
  created_at timestamptz default now()
);
create index if not exists idx_messages_chat on messages(chat_id, created_at);
alter table messages enable row level security;
create policy "chat members read" on messages for select using (
  exists (select 1 from chats c where c.id = chat_id and auth.uid() in (c.user_a, c.user_b)));
create policy "chat members write" on messages for insert with check (
  sender_id = auth.uid() and
  exists (select 1 from chats c where c.id = chat_id and auth.uid() in (c.user_a, c.user_b)));

alter publication supabase_realtime add table messages;

-- ── ONE-TIME ROOMS — custom slug; messages NEVER stored ─────
create table if not exists onetime_rooms (
  slug       text primary key check (slug ~ '^[a-z0-9][a-z0-9-]{2,31}$'),
  creator    text not null default 'anonymous',
  created_at timestamptz default now()
);
alter table onetime_rooms enable row level security;
create policy "rooms public select" on onetime_rooms for select using (true);
create policy "rooms public insert" on onetime_rooms for insert with check (true);
create policy "rooms public delete" on onetime_rooms for delete using (true);

-- Safety net: purge rooms older than 24h (normal path deletes instantly on leave)
create or replace function purge_stale_rooms() returns void language sql as
  $$ delete from onetime_rooms where created_at < now() - interval '24 hours' $$;

-- ── GRANTS ───────────────────────────────────────────────────
-- Supabase usually adds these automatically, but not always. RLS above still
-- controls which rows each user can touch — these only open the tables.
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to anon, authenticated;
alter default privileges in schema public
  grant select, insert, update, delete on tables to anon, authenticated;
