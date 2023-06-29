export function getFirstSundayOfMonth(year: number, month: number): Date {
  const firstDayOfMonth = new Date(year, month, 1);
  const dayOfWeek = firstDayOfMonth.getDay();
  const daysUntilSunday = (7 - dayOfWeek) % 7;
  const firstSundayOfMonth = new Date(year, month, 1 + daysUntilSunday);
  return firstSundayOfMonth;
}