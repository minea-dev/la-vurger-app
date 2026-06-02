export function calculateRemainingMinutes(createdAtStr: string, estimatedMinutes: number | null | undefined): number {
  if (!createdAtStr || estimatedMinutes == null) return 0;

  let formattedDate = createdAtStr.replace(' ', 'T');

  const isLocal = typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  if (formattedDate.includes('.')) {
    const parts = formattedDate.split('.');
    const baseTime = parts[0];
    const fraction = parts[1].replace(/[^0-9]/g, '');
    const milliseconds = fraction.substring(0, 3).padEnd(3, '0');

    formattedDate = isLocal ? `${baseTime}.${milliseconds}` : `${baseTime}.${milliseconds}Z`;
  } else {
    if (!isLocal && !formattedDate.includes('Z') && !formattedDate.includes('+')) {
      formattedDate += 'Z';
    }
  }

  const createdAtMs = new Date(formattedDate).getTime();
  if (isNaN(createdAtMs)) return 0;

  const targetTimeMs = createdAtMs + (estimatedMinutes * 60 * 1000);
  const differenceMs = targetTimeMs - Date.now();

  return differenceMs > 0 ? Math.ceil(differenceMs / 60000) : 0;
}

export function parseServerDate(createdAtStr: string): Date | string {
  if (!createdAtStr) return '';
  let formattedDate = createdAtStr.replace(' ', 'T');

  const isLocal = typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  if (formattedDate.includes('.')) {
    const parts = formattedDate.split('.');
    const baseTime = parts[0];
    const fraction = parts[1].replace(/[^0-9]/g, '');
    const milliseconds = fraction.substring(0, 3).padEnd(3, '0');

    formattedDate = isLocal ? `${baseTime}.${milliseconds}` : `${baseTime}.${milliseconds}Z`;
  } else {
    if (!isLocal && !formattedDate.includes('Z') && !formattedDate.includes('+')) {
      formattedDate += 'Z';
    }
  }

  const date = new Date(formattedDate);
  return isNaN(date.getTime()) ? createdAtStr : date;
}
