# Umbauplan Gymapp

## Ziel
Die App soll auf den Kern reduziert werden: Login, Trainingsplan, Session starten, letzte Sätze direkt sehen, mit Plus/Minus anpassen, speichern und eine einfache Übungshistorie.

## Was ich bereits gemacht habe
- Login bleibt Email/Passwort (Single-User-App, Sign-ups in Supabase deaktiviert, nur meine eigene registrierte Adresse kann sich anmelden).
- Middleware auf Supabase-Session-Prüfung umgebaut.
- Bug behoben: `loginAction` benutzte einen rohen `supabase-js`-Client mit `persistSession: false`, der nie Session-Cookies auf die Response schrieb. Dadurch schlug `signInWithPassword` zwar durch, aber jede Folge-Anfrage hatte keine Session und die Middleware warf sofort zurück auf `/login`. Jetzt verwendet `loginAction` den Cookie-fähigen `createSupabaseActionClient()`.
- Die Hauptnavigation auf die Kernseiten reduziert.
- Die Startseite auf Training statt Analytics fokussiert.
- Für Übungen eine kleine Historie und Vorbefüllung aus der letzten Einheit eingebaut.
- Einen 3x-gleich-Hinweis für dasselbe Gewicht vorbereitet.

## Nächste Schritte
- Workout-Flow weiter vereinfachen, damit das Loggen im Training schneller geht.
- Gewicht und Messungen als klar getrennten Bereich behalten (unangetastet in diesem Umbau).
- V2-Features wie Kalender und Charts nur als spätere Ausbaustufe behandeln.
