import { differenceInCalendarDays, format, isToday, parseISO, startOfDay, subDays } from 'date-fns';

export const formatDate = (date) => format(new Date(date), 'MMM d, yyyy');

export const daysUntil = (examDate) => {
  const diff = differenceInCalendarDays(startOfDay(new Date(examDate)), startOfDay(new Date()));
  return diff;
};

export const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
};

export const dateISO = (date = new Date()) => format(date, 'yyyy-MM-dd');

export const isWithinLastDays = (isoDate, days) => {
  if (!isoDate) return false;
  const parsed = parseISO(isoDate);
  return parsed >= subDays(new Date(), days);
};

export const isTodayISO = (isoDate) => {
  if (!isoDate) return false;
  return isToday(parseISO(isoDate));
};

export const getWeekRange = (startDate, offset) => {
  const start = new Date(startDate);
  const weekStart = new Date(start);
  weekStart.setDate(start.getDate() + offset * 7);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  return {
    label: `Week ${offset + 1} - ${format(weekStart, 'MMM d')} to ${format(weekEnd, 'MMM d')}`,
    start: dateISO(weekStart),
    end: dateISO(weekEnd),
  };
};
