-- ════════════════════════════════════════════════════════════
-- Mivloc — Supabase Schema
-- Idempotent — safe to re-run. Self-hosted: ./supabase/apply-schema.sh
-- Hosted Supabase: paste in the SQL Editor, then enable "Confirm email".
-- ════════════════════════════════════════════════════════════
create extension if not exists "uuid-ossp";

-- ── PROFILES ─────────────────────────────────────────────────
create table if not exists profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text not null,
  email         text not null,
  phone         text,
  username      text unique,     -- chosen at signup; also the invite/referral handle
  referral_code text unique not null default substr(md5(random()::text), 1, 8),
  invited_by    uuid references auth.users(id),
  created_at    timestamptz default now()
);
-- Username migration for installs created before usernames existed (safe to re-run)
alter table profiles add column if not exists username text unique;
do $$ begin
  alter table profiles add constraint username_format
    check (username is null or username ~ '^[a-z0-9_]{3,20}$');
exception when duplicate_object then null; end $$;
-- Backfill legacy accounts so their old invite links still resolve as a handle
update profiles set username = referral_code where username is null;
-- One account per email address (case-insensitive). This is the hard guarantee:
-- even if Supabase auth ever creates a second auth.users row for an email, the
-- profile insert in handle_new_user() below will fail, so the signup can't complete.
create unique index if not exists profiles_email_lower_key on profiles (lower(email));
alter table profiles enable row level security;
drop policy if exists "profiles readable by authed" on profiles;
create policy "profiles readable by authed" on profiles for select using (auth.role() = 'authenticated');
drop policy if exists "own profile insert" on profiles;
create policy "own profile insert" on profiles for insert with check (auth.uid() = id);
drop policy if exists "own profile update" on profiles;
create policy "own profile update" on profiles for update using (auth.uid() = id);

-- Anon-safe username availability check for the signup form (leaks only yes/no)
create or replace function username_available(u text) returns boolean
language sql security definer set search_path = public stable as $$
  select not exists (select 1 from profiles where lower(username) = lower(u));
$$;
grant execute on function username_available(text) to anon, authenticated;

-- Anon-safe email availability check so the signup form can stop a duplicate
-- registration up-front with a clear message (returns yes/no only).
create or replace function email_available(e text) returns boolean
language sql security definer set search_path = public stable as $$
  select not exists (select 1 from profiles where lower(email) = lower(e));
$$;
grant execute on function email_available(text) to anon, authenticated;

-- Auto-create profile on signup; auto-friend the inviter if ref/handle present
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare inviter uuid; ref text;
begin
  -- Reject a second signup with an email that already has an account.
  if exists (select 1 from profiles where lower(email) = lower(new.email)) then
    raise exception 'email_already_registered'
      using errcode = 'unique_violation';
  end if;
  ref := coalesce(new.raw_user_meta_data->>'ref', '');
  select p.id into inviter from profiles p
    where lower(p.username) = lower(ref) or p.referral_code = ref
    limit 1;
  insert into profiles (id, display_name, email, phone, username, invited_by)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)),
    new.email,
    nullif(new.raw_user_meta_data->>'phone',''),
    nullif(lower(new.raw_user_meta_data->>'username'), ''),
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
drop policy if exists "own friendships select" on friendships;
create policy "own friendships select" on friendships for select using (auth.uid() in (user_a, user_b));
drop policy if exists "own friendships insert" on friendships;
create policy "own friendships insert" on friendships for insert with check (auth.uid() in (user_a, user_b));
drop policy if exists "own friendships delete" on friendships;
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
drop policy if exists "own chats all" on chats;
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
drop policy if exists "chat members read" on messages;
create policy "chat members read" on messages for select using (
  exists (select 1 from chats c where c.id = chat_id and auth.uid() in (c.user_a, c.user_b)));
drop policy if exists "chat members write" on messages;
create policy "chat members write" on messages for insert with check (
  sender_id = auth.uid() and
  exists (select 1 from chats c where c.id = chat_id and auth.uid() in (c.user_a, c.user_b)));

do $$ begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
  if not exists (select 1 from pg_publication_tables
                 where pubname = 'supabase_realtime' and tablename = 'messages') then
    alter publication supabase_realtime add table messages;
  end if;
end $$;

-- ── ONE-TIME ROOMS — custom slug; messages NEVER stored ─────
create table if not exists onetime_rooms (
  slug       text primary key check (slug ~ '^[a-z0-9][a-z0-9-]{2,31}$'),
  creator    text not null default 'anonymous',
  created_at timestamptz default now()
);
alter table onetime_rooms enable row level security;
drop policy if exists "rooms public select" on onetime_rooms;
create policy "rooms public select" on onetime_rooms for select using (true);
drop policy if exists "rooms public insert" on onetime_rooms;
create policy "rooms public insert" on onetime_rooms for insert with check (true);
drop policy if exists "rooms public delete" on onetime_rooms;
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
