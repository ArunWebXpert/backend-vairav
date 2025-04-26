import * as dayjs from 'dayjs';
import * as customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

export function convertToTimestamp(dateStr: string) {
  const format = 'DD/MMM/YYYY:HH:mm:ss Z';
  const parsed = dayjs(dateStr, format);

  if (!parsed.isValid()) {
    throw new Error('Invalid date format');
  }

  return parsed;
}
