import { addHours, startOfDay, subDays } from "date-fns";

export function dateRange(days: number, offset: number) {
  // Always start at 11AM
  const endDate = subDays(addHours(startOfDay(new Date()), 11), days * offset);
  const startDate = subDays(endDate, days);

  return [startDate, endDate] as const;
}
