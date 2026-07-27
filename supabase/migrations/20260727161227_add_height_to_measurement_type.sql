-- ============================================================================
-- measurement_type: 'height' ergänzen
--
-- Für den Körperfett-Rechner (US-Navy-Formel) benötigt, der Größe als
-- Eingabewert braucht und mitspeichert. Eigene Migration, da ALTER TYPE ...
-- ADD VALUE nicht in derselben Transaktion verwendet werden kann, in der der
-- Wert hinzugefügt wurde.
-- ============================================================================

alter type measurement_type add value if not exists 'height';
