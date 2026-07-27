-- ============================================================================
-- Security-Härtung nach Supabase Security Advisor
-- ============================================================================

-- personal_records lief bisher mit den Rechten des View-Erstellers statt des
-- abfragenden Rechts (Postgres-Default für Views vor security_invoker). Für
-- uns praktisch folgenlos (nur service_role fragt ab, umgeht RLS ohnehin),
-- aber best practice und schließt die Lücke für den Fall einer künftigen
-- anon/authenticated-Freigabe.
alter view personal_records set (security_invoker = true);

-- Trigger-Funktion ohne fixierten search_path ist anfällig für
-- Search-Path-Hijacking, falls je eine Rolle mit CREATE-Rechten in einem
-- früher im Suchpfad stehenden Schema Objekte anlegen könnte.
alter function set_updated_at() set search_path = '';

-- rls_auto_enable() ist eine von Supabase verwaltete Event-Trigger-Funktion
-- (automatisches RLS bei neuen Tabellen), nicht Teil unseres Schemas. Sie soll
-- nur vom Event-Trigger selbst ausgeführt werden, nicht direkt per RPC durch
-- anon/authenticated aufrufbar sein.
revoke execute on function public.rls_auto_enable() from anon, authenticated;
