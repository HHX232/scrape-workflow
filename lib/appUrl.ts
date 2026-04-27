export function getAppUrl(path: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://test.exporteru.com'
  return `${appUrl}/${path}`
}
