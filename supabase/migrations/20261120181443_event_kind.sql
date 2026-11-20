-- P2-M8 (D33) : type d'échéance (course ou test) et résultat d'une échéance passée.
alter table public.event
  add column kind text not null default 'race' check (kind in ('race', 'test')),
  add column activity_id uuid references public.activity (id) on delete set null;
