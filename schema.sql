-- Phase 2 FacturePro / FactuurPro Schema

-- Drop existing tables and triggers if you are resetting the project
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop table if exists public.invoices cascade;
drop table if exists public.clients cascade;
drop table if exists public.products cascade;
drop table if exists public.profiles cascade;

-- 1. Profiles Table
-- Automatically extended from auth.users
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  company_name text,
  vat_number text,
  address text,
  email text,
  iban text,
  
  -- Monetization details
  subscription_status text default 'none' check (subscription_status in ('none', 'pro', 'business')),
  lemon_customer_id text,
  lemon_subscription_id text,
  
  -- Settings
  invoice_number_format text default '{YEAR}-{NUM}',
  logo_url text,
  brand_color text default '#3B82F6',
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Profiles
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Trigger to create profile on signup
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. Invoices Table (History)
create table public.invoices (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  
  invoice_number text not null,
  client_name text not null,
  total_amount numeric not null,
  issue_date date not null,
  
  -- Full snapshot of the generated invoice to prevent historical data changes if client/product changes
  data_snapshot jsonb not null, 
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Invoices
alter table public.invoices enable row level security;
create policy "Users can view own invoices" on public.invoices for select using (auth.uid() = profile_id);
create policy "Users can insert own invoices" on public.invoices for insert with check (auth.uid() = profile_id);
create policy "Users can update own invoices" on public.invoices for update using (auth.uid() = profile_id);
create policy "Users can delete own invoices" on public.invoices for delete using (auth.uid() = profile_id);


-- 3. Saved Clients Table
create table public.clients (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  
  company_name text not null,
  vat_number text,
  address text,
  email text,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Clients
alter table public.clients enable row level security;
create policy "Users can view own clients" on public.clients for select using (auth.uid() = profile_id);
create policy "Users can insert own clients" on public.clients for insert with check (auth.uid() = profile_id);
create policy "Users can update own clients" on public.clients for update using (auth.uid() = profile_id);
create policy "Users can delete own clients" on public.clients for delete using (auth.uid() = profile_id);


-- 4. Saved Products/Services Table
create table public.products (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  
  description text not null,
  default_price numeric not null default 0,
  vat_rate numeric not null default 21,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Products
alter table public.products enable row level security;
create policy "Users can view own products" on public.products for select using (auth.uid() = profile_id);
create policy "Users can insert own products" on public.products for insert with check (auth.uid() = profile_id);
create policy "Users can update own products" on public.products for update using (auth.uid() = profile_id);
create policy "Users can delete own products" on public.products for delete using (auth.uid() = profile_id);
