-- Supabase SQL Editor da ishga tushiring
-- Contact form xabarlarini saqlash

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  subject text,
  message text not null
);

alter table public.contact_messages enable row level security;

-- Faqat anon insert (sayt tashrifchisi yuborishi uchun)
create policy "Allow public insert contact messages"
  on public.contact_messages
  for insert
  to anon
  with check (true);

-- O'qish faqat authenticated admin uchun (ixtiyoriy): anon read yo'q
-- Dashboard orqali o'qishingiz mumkin
