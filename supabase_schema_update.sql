-- Reading Logs table (for Heatmap)
create table public.reading_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  book_id uuid references public.user_books(id) on delete cascade not null,
  pages_read integer default 0,
  date date default CURRENT_DATE,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, book_id, date)
);

-- Enable RLS
alter table public.reading_logs enable row level security;

-- Policies for reading_logs
create policy "Users can view own reading logs"
  on reading_logs for select
  using ( auth.uid() = user_id );

create policy "Users can insert own reading logs"
  on reading_logs for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own reading logs"
  on reading_logs for update
  using ( auth.uid() = user_id );

-- RPC function to log reading activity easily
create or replace function public.log_reading_activity(
  p_book_id uuid,
  p_pages_read integer
)
returns void as $$
declare
  v_user_id uuid;
begin
  v_user_id := auth.uid();
  
  -- Only log if pages_read is positive
  if p_pages_read > 0 then
      insert into public.reading_logs (user_id, book_id, pages_read, date)
      values (v_user_id, p_book_id, p_pages_read, CURRENT_DATE)
      on conflict (user_id, book_id, date)
      do update set pages_read = reading_logs.pages_read + p_pages_read;
  end if;
end;
$$ language plpgsql security definer;
