export function formatTime(isoDate: string) {
  const date = new Date(isoDate);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

export function formatDateTime(isoDate: string) {
  const day = String(new Date(isoDate).getDate()).padStart(2, "0");
  const month = String(new Date(isoDate).getMonth() + 1).padStart(2, "0");
  const year = new Date(isoDate).getFullYear();
  const time = formatTime(isoDate);

  return `${day}.${month}.${year}, ${time}`;
}
