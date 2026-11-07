// Les prêteurs n'acceptent de bloquer (geler) un taux que dans une fenêtre
// de 120 jours (~4 mois) avant l'échéance — même règle que taux120jours
// (l'app de Michel Turgeon).
export const RATE_LOCK_WINDOW_DAYS = 120;

export function daysUntilRenewal(renewalDate: string): number {
  const target = new Date(`${renewalDate}T00:00:00`);
  return Math.round((target.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export function isWithinRateLockWindow(renewalDate: string): boolean {
  return daysUntilRenewal(renewalDate) <= RATE_LOCK_WINDOW_DAYS;
}
