/*
 * Calcula cuantos días tiene el mes que se va a renderizar
 */
export function daysInMonth(iYear: number, iMonth: number): number {
  return 32 - new Date(iYear, iMonth, 32).getDate();
}
// Calcula el número de días que hay que añadir como offset al inicio del calendario
// para que coincida la columna del dia con el dia representado
export function getMonthDaysOffset(year: number, iMonth: number, ifirstWeekDay: number): number {
  const firstDay = ifirstWeekDay % 7;
  const aux = firstDay - new Date(year, iMonth).getDay();
  return aux <= 0 ? Math.abs(aux) : 7 - aux;
}

function localeDayStrTreatment(weekDays: string, locale: string): string {
  const localeTreatment = {
    'pt-PT': (str: string) => str.slice(0, 3),
  };
  return (localeTreatment[locale]?.(weekDays) ?? weekDays).toUpperCase();
}
/*
 * Como calcular los meses que aparecen en la parte superior de las columnas
 */
function getNarrowWeekDays(locale: string): string[] {
  // Take as reference a sunday date
  const date = new Date(2023, 0, 1);
  const weekDays: string[] = [];
  for (let i = 0; i < 7; i++) {
    const dayStr = date.toLocaleDateString(locale, { weekday: locale.includes('es') ? 'narrow' : 'short' });
    weekDays.push(localeDayStrTreatment(dayStr, locale));
    date.setDate(date.getDate() + 1);
  }
  return weekDays;
}
export function daysReordered(ifirstWeekDay: number, locale: string): string[] {
  const days = getNarrowWeekDays(locale);
  const offset = ifirstWeekDay % 7;
  return [...days.slice(offset), ...days.slice(0, offset)];
}

/**
 * @description this function parse a date string to a Date object only is compatible with dates and formts that has day, month and year
 * @example parseDateStr('2021-01-01', 'YYYY-MM-DD') => Date(2021-01-01)
 * @example parseDateStr('01-01-2021', 'DD-MM-YYYY') => Date(2021-01-01)
 * @example parseDateStr('01/01/2021', 'DD/MM/YYYY') => Date(2021-01-01)
 * @example parseDateStr('01/01/21', 'DD/MM/zYY') => Date(2021-01-01)
 * @param date
 * @param format
 * @returns
 */
export function parseDateStr(date: string, format: string = 'DD/MM/YYYY'): Date {
  const map = new Map<string, string>();
  const formatParts = format
    .toUpperCase()
    .replace(/[^A-Za-z0-9]/, '/')
    .split('/');
  const dateParts = date.replace(/[^A-Za-z0-9]/, '/').split('/');
  for (let i = 0; i < formatParts.length; i++) {
    map.set(formatParts[i], dateParts[i]);
  }
  const year = Number(map.get('YYYY') ?? map.get('YY') ?? '');
  const month: number = Number(map.get('MM') ?? '1') - 1;
  const day = Number(map.get('DD'));
  return new Date(year, month, day);
}

export function toFormatedDateString(date: Date, format: string = 'DD/MM/YYYY'): string {
  const separator = format.match(/[^A-Za-z0-9]/)?.[0];
  const dateFormat = format
    .toUpperCase()
    .replace(/[^A-Za-z0-9]/, '/')
    .split('/');
  const formats = {
    YY: date.getFullYear().toString().slice(-2),
    YYYY: date.getFullYear().toString(),
    MM: (date.getMonth() + 1).toString().padStart(2, '0'),
    DD: date.getDate().toString().padStart(2, '0'),
  };
  return dateFormat.map(f => formats[f]).join(separator);
}

export function capitalizeString(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
