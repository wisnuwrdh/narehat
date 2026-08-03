export function thumbUrlFor(url: string): string {
  if (!url.startsWith("/api/photos/serve?key=")) return url;
  return `${url}&thumb=1`;
}
