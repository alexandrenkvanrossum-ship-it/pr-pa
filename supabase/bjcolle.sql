-- BJcolle : tables du robot + vérification automatique toutes les heures.
-- À coller une seule fois dans Supabase → SQL Editor → Run. Le script peut être relancé sans risque.

create table if not exists public.bj_colles (
  owner uuid not null references auth.users(id) on delete cascade,
  id text not null,
  scope text, annee text, discipline text, date date, debut text, fin text, duree int, tirage text, type text,
  colleur text, salle text, eleve text, moi boolean default false, note text, note_num numeric, ordre jsonb, href text,
  sujet text, commentaire text, champs jsonb, absent boolean, detail_at timestamptz,
  first_seen timestamptz default now(), updated_at timestamptz default now(),
  primary key (owner, id)
);
create index if not exists bj_colles_date on public.bj_colles (owner, date desc);

create table if not exists public.bj_events (
  id bigserial primary key,
  owner uuid not null references auth.users(id) on delete cascade,
  at timestamptz default now(), kind text, titre text, detail text, colle_id text, lu boolean default false
);
create table if not exists public.bj_state (
  owner uuid primary key references auth.users(id) on delete cascade,
  data jsonb, last_run timestamptz, last_ok timestamptz, error text
);

alter table public.bj_colles enable row level security;
alter table public.bj_events enable row level security;
alter table public.bj_state enable row level security;
drop policy if exists "bj_colles lecture" on public.bj_colles;
create policy "bj_colles lecture" on public.bj_colles for select using (owner = auth.uid());
drop policy if exists "bj_events lecture" on public.bj_events;
create policy "bj_events lecture" on public.bj_events for select using (owner = auth.uid());
drop policy if exists "bj_events marquer lu" on public.bj_events;
create policy "bj_events marquer lu" on public.bj_events for update using (owner = auth.uid()) with check (owner = auth.uid());
drop policy if exists "bj_state lecture" on public.bj_state;
create policy "bj_state lecture" on public.bj_state for select using (owner = auth.uid());

-- mises à jour en direct dans l'app
do $$ begin
  begin alter publication supabase_realtime add table public.bj_state; exception when others then null; end;
  begin alter publication supabase_realtime add table public.bj_events; exception when others then null; end;
end $$;

-- vérification automatique : toutes les heures, de 6 h à 23 h (heure de Paris en été = UTC+2)
create extension if not exists pg_cron;
create extension if not exists pg_net;
select cron.unschedule('bjcolle-horaire') where exists (select 1 from cron.job where jobname = 'bjcolle-horaire');
select cron.schedule('bjcolle-horaire', '7 4-21 * * *', $$
  select net.http_post(
    url := 'https://fdiswyamvqvqwrsvzwgf.supabase.co/functions/v1/bjcolle',
    headers := '{"Content-Type":"application/json","x-bj-key":"XIRDtG4xo7PMD04y52bdc7JudhI4CUEA"}'::jsonb,
    body := '{}'::jsonb,
    timeout_milliseconds := 10000
  );
$$);

select 'BJcolle prêt' as resultat;
