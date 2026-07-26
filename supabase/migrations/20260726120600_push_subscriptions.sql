-- ============================================================================
-- push_subscriptions: Web-Push-Endpunkte installierter Geräte
-- (z. B. Rest-Timer-Benachrichtigung; auf iOS erst ab 16.4+ im installierten
-- PWA-Modus verfügbar, siehe Architekturkonzept Abschnitt 1)
-- ============================================================================

create table push_subscriptions (
  id           uuid primary key default gen_random_uuid(),
  endpoint     text not null,
  p256dh       text not null,
  auth         text not null,
  user_agent   text,
  created_at   timestamptz not null default now(),
  last_used_at timestamptz,

  constraint push_subscriptions_endpoint_unique unique (endpoint)
);

alter table push_subscriptions enable row level security;
