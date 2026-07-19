-- =====================================================================
-- DATABASE SCHEMA FOR SENDPLUMA
-- Platform for asynchronous gamified letter dispatch
-- =====================================================================

-- Enable UUID extension if not already present
create extension if not exists "uuid-ossp";

-- Create Custom Enum for Letter Status
create type letter_status as enum ('draft', 'in_transit', 'delivered', 'read');

-- 1. PROFILES TABLE
-- Extends Supabase auth.users for public profile data
create table public.profiles (
    id uuid references auth.users on delete cascade primary key,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    username text unique,
    full_name text,
    is_premium boolean default false not null,
    phone_number text,
    default_address text,
    default_lat decimal(9,6),
    default_lng decimal(9,6),

    constraint username_length check (char_length(username) >= 3)
);

-- 2. BIRDS TABLE
-- Catalog of messenger birds with speed and subscription status
create table public.birds (
    id uuid default uuid_generate_v4() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    name text not null unique,
    speed_kmh integer not null,
    is_premium boolean default false not null,
    payload_limit text not null,
    supports_photo boolean default false not null,
    supports_audio boolean default false not null,
    image_url text
);

-- 3. LETTERS TABLE
-- Central entity for dispatched letters and routing logistics
create table public.letters (
    id uuid default uuid_generate_v4() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    sender_id uuid references public.profiles(id) on delete cascade not null,
    bird_id uuid references public.birds(id) on delete restrict not null,
    
    recipient_name text not null,
    recipient_contact text not null,
    notification_method text check (notification_method in ('email', 'whatsapp')) not null,
    
    content text not null,
    
    -- Geographic coordinates
    origin_name text not null,
    origin_lat decimal(9,6) not null,
    origin_lng decimal(9,6) not null,
    
    destination_name text not null,
    dest_lat decimal(9,6) not null,
    dest_lng decimal(9,6) not null,
    
    -- Logistics & flight metadata
    status letter_status default 'draft'::letter_status not null,
    dispatched_at timestamp with time zone,
    eta_timestamp timestamp with time zone,
    distance_km decimal(10,2)
);

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

alter table public.profiles enable row level security;
alter table public.birds enable row level security;
alter table public.letters enable row level security;

-- Profiles Policies
create policy "Allow public read access to profiles" 
    on public.profiles for select 
    using (true);

create policy "Allow users to update their own profile" 
    on public.profiles for update 
    using (auth.uid() = id) 
    with check (auth.uid() = id);

-- Birds Policies
create policy "Allow public read access to birds catalog" 
    on public.birds for select 
    using (true);

-- Letters Policies
create policy "Allow users to view their own sent letters" 
    on public.letters for select 
    using (auth.uid() = sender_id);

create policy "Allow users to insert their own letters" 
    on public.letters for insert 
    with check (auth.uid() = sender_id);

create policy "Allow users to update their own letters" 
    on public.letters for update 
    using (auth.uid() = sender_id)
    with check (auth.uid() = sender_id);

-- =====================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER
-- =====================================================================
-- Automatically insert a profile when a new user signs up in auth.users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, username, is_premium)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    false
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =====================================================================
-- REALTIME REPLICATION CONFIGURATION
-- =====================================================================
-- Safely add the letters table to the supabase_realtime publication if not already present
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' 
    and schemaname = 'public' 
    and tablename = 'letters'
  ) then
    alter publication supabase_realtime add table public.letters;
  end if;
end;
$$;

-- =====================================================================
-- SEED DATA (INITIAL VALUES)
-- =====================================================================
insert into public.birds (name, speed_kmh, is_premium, payload_limit, supports_photo, supports_audio, image_url)
values
  ('Pombo Correio', 80, false, 'Suporta Texto', false, false, '/pigeon.png'),
  ('Coruja Noturna', 60, true, 'Texto + Áudio', false, true, '/owl.png'),
  ('Águia Imperial', 240, true, 'Texto + Áudio + Fotos', true, true, '/eagle.png'),
  ('Falcão Peregrino', 320, true, 'Texto + 1 Foto', true, false, '/falcon.png')
on conflict (name) do update set
  speed_kmh = excluded.speed_kmh,
  is_premium = excluded.is_premium,
  payload_limit = excluded.payload_limit,
  supports_photo = excluded.supports_photo,
  supports_audio = excluded.supports_audio,
  image_url = excluded.image_url;

-- =====================================================================
-- MIGRATION: ADD LOCATION AND CONTACT DETAILS TO PROFILES
-- =====================================================================
alter table public.profiles add column if not exists phone_number text;
alter table public.profiles add column if not exists default_address text;
alter table public.profiles add column if not exists default_lat decimal(9,6);
alter table public.profiles add column if not exists default_lng decimal(9,6);
