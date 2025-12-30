-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (linked to auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text,
  country_code text,
  country_name text,
  flag text,
  access_level text default 'seeker',
  is_premium boolean default false,
  phronesis integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies for profiles
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using ( true );

create policy "Users can insert their own profile"
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile"
  on profiles for update
  using ( auth.uid() = id );

-- User Books table
create table public.user_books (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  book_title text not null,
  authors text,
  page_count integer default 0,
  current_page integer default 0,
  thumbnail text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.user_books enable row level security;

-- Policies for user_books
create policy "Users can view own books"
  on user_books for select
  using ( auth.uid() = user_id );

create policy "Users can insert own books"
  on user_books for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own books"
  on user_books for update
  using ( auth.uid() = user_id );

create policy "Users can delete own books"
  on user_books for delete
  using ( auth.uid() = user_id );

-- Page Discussions table
create table public.page_discussions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  book_id text not null,
  book_title text not null,
  page_number integer not null,
  chapter_id text,
  content text not null,
  country_flag text,
  is_verified boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.page_discussions enable row level security;

-- Policies for page_discussions
create policy "Anyone can view discussions"
  on page_discussions for select
  using ( true );

create policy "Authenticated users can insert discussions"
  on page_discussions for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own discussions"
  on page_discussions for update
  using ( auth.uid() = user_id );

create policy "Users can delete own discussions"
  on page_discussions for delete
  using ( auth.uid() = user_id );

-- Books Catalog table (shared across all users)
create table public.books_catalog (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  authors text[],
  isbn text,
  language text default 'eng',
  category text,
  page_count integer,
  thumbnail text,
  description text,
  publisher text,
  published_date text,
  source text default 'openlibrary',
  external_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS (everyone can read, only admins can write)
alter table public.books_catalog enable row level security;

create policy "Anyone can view books catalog"
  on books_catalog for select
  using ( true );

-- Indexes for fast searches
create index idx_books_title on books_catalog using gin(to_tsvector('english', title));
create index idx_books_language on books_catalog(language);
create index idx_books_category on books_catalog(category);
create index idx_books_isbn on books_catalog(isbn);

-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, country_code, country_name, flag)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'country_code', 'US'),
    coalesce(new.raw_user_meta_data->>'country_name', 'United States'),
    coalesce(new.raw_user_meta_data->>'flag', '🇺🇸')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to auto-create profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
