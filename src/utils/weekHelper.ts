/**
 * Retorna o início (segunda) e fim (domingo) da semana atual.
 * Semana começa na segunda-feira.
 */
export const getWeekDates = (date: Date = new Date()) => {
  const d = new Date(date);

  // getDay(): 0=dom, 1=seg ... 6=sab
  // Queremos: seg=0, ter=1 ... dom=6
  const jsDay = d.getDay();
  const dayIndex = jsDay === 0 ? 6 : jsDay - 1;

  const weekStart = new Date(d);
  weekStart.setDate(d.getDate() - dayIndex);
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  return { weekStart, weekEnd };
};
