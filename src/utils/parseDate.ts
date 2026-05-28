/**
 * Converte "DD/MM/AAAA" → Date
 */
export const parseBrazilianDate = (dateStr: string): Date => {
  const clean = dateStr.trim();
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(clean);

  if (!match) {
    throw new Error(`Formato inválido: "${dateStr}" — esperado DD/MM/AAAA`);
  }

  const [, day, month, year] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  date.setHours(12, 0, 0, 0);
  return date;
};

/**
 * Converte array de strings variadas → Date[]
 * Aceita: "20/03/2026", "20/3 (sexta)", "20/3", "20/03/2026 (sexta)"
 * Quando o ano está ausente, usa o ano atual.
 */
export const parseMultipleDates = (
  dates: string[],
  fallbackYear: number = new Date().getFullYear()
): Date[] => {
  return dates
    .map((raw) => {
      try {
        const clean = raw.trim();

        // Tenta DD/MM/AAAA primeiro
        const fullMatch = /^(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(clean);
        if (fullMatch) {
          const [, d, m, y] = fullMatch;
          const date = new Date(Number(y), Number(m) - 1, Number(d));
          date.setHours(12, 0, 0, 0);
          return date;
        }

        // Tenta DD/MM sem ano
        const shortMatch = /^(\d{1,2})\/(\d{1,2})/.exec(clean);
        if (shortMatch) {
          const [, d, m] = shortMatch;
          const date = new Date(fallbackYear, Number(m) - 1, Number(d));
          date.setHours(12, 0, 0, 0);
          return date;
        }

        return null;
      } catch {
        return null;
      }
    })
    .filter((d): d is Date => d !== null);
};
