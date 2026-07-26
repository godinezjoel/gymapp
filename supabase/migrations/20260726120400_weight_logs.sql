-- ============================================================================
-- weight_logs: Körpergewicht im Zeitverlauf
-- ============================================================================

create table weight_logs (
  id          uuid primary key default gen_random_uuid(),
  logged_date date not null default current_date,
  weight_kg   numeric(5,2) not null,
  notes       text,
  created_at  timestamptz not null default now(),

  constraint weight_logs_weight_range check (weight_kg > 0 and weight_kg < 400),
  -- genau ein Eintrag pro Tag; erzeugt zugleich den Index für Verlaufsabfragen
  constraint weight_logs_one_per_day unique (logged_date)
);

alter table weight_logs enable row level security;
