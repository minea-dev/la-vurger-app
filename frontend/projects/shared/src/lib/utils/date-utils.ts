export function calculateRemainingMinutes(createdAtStr: string, estimatedMinutes: number | null | undefined): number {
  if (!createdAtStr || estimatedMinutes == null) return 0;

  const formattedDate = createdAtStr.replace(' ', 'T');

  const createdAtMs = new Date(formattedDate).getTime();
  const targetTimeMs = createdAtMs + (estimatedMinutes * 60 * 1000);
  const differenceMs = targetTimeMs - Date.now();

  return differenceMs > 0 ? Math.ceil(differenceMs / 60000) : 0;
}
