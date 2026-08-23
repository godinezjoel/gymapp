// Intl-Formatter sind teuer im Aufbau (Locale-Auflösung + ICU-Pattern-Kompilierung),
// aber billig in der Anwendung. Einmal auf Modulebene erzeugen statt pro Aufruf:
// Diese Funktionen laufen in Listen pro Zeile und in den Charts pro Achsen-Tick
// und pro Tooltip-Bewegung – dort wäre ein Konstruktor-Aufruf je Pointer-Event.
const workoutDateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "2-digit",
  month: "2-digit",
});

// Auf den Plankarten steht das Startdatum neben Name und Tagesanzahl – dort
// wäre der ausgeschriebene Wochentag Lärm, das Jahr aber nötig, weil ein
// Zyklus über den Jahreswechsel läuft.
const compactDateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

// kg, % und cm teilen dieselbe Zahlendarstellung (eine Nachkommastelle) – die
// Einheit hängt am Aufrufer, nicht am Formatter.
const oneDecimalFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function formatWorkoutDate(isoDate: string): string {
  return workoutDateFormatter.format(new Date(`${isoDate}T00:00:00`));
}

export function formatShortDate(isoDate: string): string {
  return shortDateFormatter.format(new Date(`${isoDate}T00:00:00`));
}

export function formatCompactDate(isoDate: string): string {
  return compactDateFormatter.format(new Date(`${isoDate}T00:00:00`));
}

export function formatKg(value: number): string {
  return oneDecimalFormatter.format(value);
}

// Taille-zu-Größe liegt um 0,5 – bei nur einer Nachkommastelle wären sinnvolle
// Veränderungen darin nicht mehr sichtbar.
const twoDecimalFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatRatio(value: number): string {
  return twoDecimalFormatter.format(value);
}

export function formatBmi(value: number): string {
  return oneDecimalFormatter.format(value);
}

/**
 * Differenz mit Vorzeichen, z. B. "+1,2" / "−0,9" / "±0,0".
 *
 * Das Minus ist ein typografisches (U+2212), kein Bindestrich: Intl liefert für
 * negative Zahlen den Bindestrich, und neben einem gesetzten "+" fällt der
 * Höhen- und Breitenunterschied in einer Kachelreihe sofort auf.
 *
 * Werte unterhalb der Anzeigegenauigkeit werden zu "±0,0" statt zu einem
 * "−0,0", das nach einer Abnahme aussähe, die keine ist.
 */
export function formatSigned(value: number, formatValue: (absolute: number) => string): string {
  if (Math.abs(value) < 0.05) return `±${formatValue(0)}`;
  return `${value > 0 ? "+" : "−"}${formatValue(Math.abs(value))}`;
}

export function formatPercent(value: number): string {
  return oneDecimalFormatter.format(value);
}

export function formatCm(value: number): string {
  return oneDecimalFormatter.format(value);
}
