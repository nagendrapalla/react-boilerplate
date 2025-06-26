export function getCookie(name: string): string | null {
  const cookies = document.cookie.split(";");
  const accessToken = cookies.find((cookie) =>
    cookie.trim().startsWith(`${name}=`)
  );
  return accessToken ? accessToken.split("=")[1] : null;
}
export function getAccessToken(): string | null {
  return getCookie("access_token");
}
