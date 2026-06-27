-- Support tickets table for customer complaints
create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  category text not null default 'অন্যান্য',
  subject text not null,
  body text not null,
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved', 'closed')),
  admin_reply text,
  admin_replied_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.support_tickets enable row level security;

-- Users can submit tickets
create policy "Users can create tickets"
  on public.support_tickets for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Users can view their own tickets
create policy "Users can view own tickets"
  on public.support_tickets for select
  to authenticated
  using (auth.uid() = user_id);

-- Admins can view all tickets
create policy "Admins can view all tickets"
  on public.support_tickets for select
  to authenticated
  using (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- Admins can reply / update status
create policy "Admins can update tickets"
  on public.support_tickets for update
  to authenticated
  using (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- Auto-update updated_at trigger
create or replace function public.handle_support_ticket_updated()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger on_support_ticket_updated
  before update on public.support_tickets
  for each row execute procedure public.handle_support_ticket_updated();
