-- ============================================================================
-- measurements: Körpermaße im Zeitverlauf
--
-- EAV-artige Struktur (eine Zeile je Messwert-Typ und Tag) statt einer
-- Spalte je Körperstelle: neue Messwert-Typen lassen sich per ALTER TYPE
-- ergänzen, ohne die Tabelle zu migrieren, und Charts pro Metrik bleiben
-- eine einfache WHERE-Abfrage.
-- ============================================================================

create table measurements (
  id          uuid primary key default gen_random_uuid(),
  logged_date date not null default current_date,
  metric_type measurement_type not null,
  value       numeric(6,2) not null,
  unit        text not null default 'cm',
  notes       text,
  created_at  timestamptz not null default now(),

  constraint measurements_value_positive check (value > 0),
  -- höchstens ein Wert je Messwert-Typ und Tag
  constraint measurements_one_per_type_per_day unique (logged_date, metric_type)
);

-- Verlauf eines einzelnen Messwerts über die Zeit (Chart je Metrik)
create index idx_measurements_type_date on measurements (metric_type, logged_date desc);

alter table measurements enable row level security;
