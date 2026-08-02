-- ============================================================================
-- training_split / training_split_days: rotierender Trainingssplit
--
-- Ein Split ist eine geordnete, beliebig lange Liste von Zyklustagen
-- (z. B. Push / Pull / Legs / Rest), die ab einem Startdatum endlos wiederholt
-- wird. Der heutige Tag ergibt sich rein rechnerisch aus
-- (heute - start_date) mod Zykluslänge – es wird nichts pro Kalendertag
-- gespeichert. Damit ist der Zyklus unbegrenzt lang und beliebig weit in
-- Vergangenheit und Zukunft auswertbar, ohne Datenwachstum.
--
-- Bewusst getrennt von training_plan: dort ist eine Zeile ein Übungs-Slot
-- innerhalb eines benannten Plans (Zielsätze/-wiederholungen), hier ist eine
-- Zeile ein Tag im Rotationszyklus. Zwei verschiedene Konzepte in derselben
-- Domäne. Eine spätere Verknüpfung (Split-Tag -> training_plan.plan_name) ist
-- über das Label möglich, wird hier aber noch nicht hergestellt.
-- ============================================================================

create table training_split (
  id         uuid primary key default gen_random_uuid(),
  name       text not null default 'Mein Split',
  start_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint training_split_name_not_blank check (btrim(name) <> '')
);

-- Die App kennt genau einen aktiven Split. Partial-Unique-Index auf einem
-- konstanten Ausdruck (gleiche Technik wie idx_workouts_single_active) erzwingt
-- das auf DB-Ebene, statt sich auf die UI zu verlassen.
create unique index idx_training_split_singleton on training_split ((true));

create trigger trg_training_split_updated_at
  before update on training_split
  for each row execute function set_updated_at();

alter table training_split enable row level security;
-- Bewusst keine Policies: Zugriff ausschließlich serverseitig über den
-- service_role Key (ADR-03), analog zu allen übrigen Tabellen.

create table training_split_days (
  id          uuid primary key default gen_random_uuid(),
  split_id    uuid not null references training_split (id) on delete cascade,
  -- 0-basiert und lückenlos: cycle_index ist zugleich das Ergebnis der
  -- Modulo-Rechnung, mit der der heutige Tag bestimmt wird. Eine Lücke wäre
  -- daher ein Datenfehler, kein Sonderfall.
  -- Spaltenname bewusst nicht "position": das ist in SQL ein Funktionsname.
  cycle_index int not null,
  label       text not null,
  -- Ruhetage sind vollwertige Zyklusplätze (siehe "Rest" im Beispiel-Split),
  -- brauchen aber eine andere Darstellung als ein Trainingstag.
  is_rest     boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  constraint training_split_days_cycle_index_non_negative check (cycle_index >= 0),
  constraint training_split_days_label_not_blank check (btrim(label) <> '')
);

create unique index idx_training_split_days_split_cycle_index
  on training_split_days (split_id, cycle_index);

-- Postgres indiziert FK-Spalten nicht automatisch
create index idx_training_split_days_split_id on training_split_days (split_id);

create trigger trg_training_split_days_updated_at
  before update on training_split_days
  for each row execute function set_updated_at();

alter table training_split_days enable row level security;

-- ============================================================================
-- set_training_split: Split komplett ersetzen (eine Transaktion)
--
-- Das Neuordnen von Tagen kollidiert mit dem Unique-Index auf
-- (split_id, cycle_index), solange man Zeile für Zeile aktualisiert. Statt das
-- über einen deferrable Constraint zu lösen, ersetzt diese Funktion die
-- Tagesliste komplett – delete + insert in EINER Transaktion. Zwei getrennte
-- PostgREST-Requests wären zwei Transaktionen: schlägt der Insert fehl, wäre
-- der Split gelöscht. Zusätzlich spart es einen Roundtrip.
-- ============================================================================
create or replace function set_training_split(
  p_name       text,
  p_start_date date,
  p_days       jsonb
)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  v_split_id uuid;
begin
  if jsonb_typeof(p_days) <> 'array' or jsonb_array_length(p_days) = 0 then
    raise exception 'Ein Split braucht mindestens einen Tag';
  end if;

  select id into v_split_id from public.training_split limit 1;

  if v_split_id is null then
    insert into public.training_split (name, start_date)
    values (p_name, p_start_date)
    returning id into v_split_id;
  else
    update public.training_split
       set name = p_name,
           start_date = p_start_date
     where id = v_split_id;

    delete from public.training_split_days where split_id = v_split_id;
  end if;

  insert into public.training_split_days (split_id, cycle_index, label, is_rest)
  select v_split_id,
         (t.ordinality - 1)::int,
         t.day ->> 'label',
         coalesce((t.day ->> 'is_rest')::boolean, false)
    from jsonb_array_elements(p_days) with ordinality as t(day, ordinality);

  return v_split_id;
end;
$$;

-- anon/authenticated erben EXECUTE über die implizite PUBLIC-Pseudorolle
-- (siehe 20260727164633) – die Funktion soll ausschließlich serverseitig
-- aufrufbar sein.
revoke execute on function public.set_training_split(text, date, jsonb) from public;
grant execute on function public.set_training_split(text, date, jsonb) to service_role;
