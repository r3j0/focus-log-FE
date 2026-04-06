export const DEMO_NICKNAME = "focus-demo";
export const DEMO_PASSWORD = "FocusDemo!123";

const ACCESS_TOKEN_KEY = "access_token";
const NICKNAME_KEY = "nickname";

export function getAccessToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getNickname() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(NICKNAME_KEY);
}

export function isAuthenticated() {
  return Boolean(getNickname());
}

export function setAuthSession(params: { nickname: string; accessToken?: string | null }) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(NICKNAME_KEY, params.nickname);

  if (params.accessToken) {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, params.accessToken);
  } else {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
}

export function setAccessToken(token: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAuthSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(NICKNAME_KEY);
}

export function clearAccessToken() {
  clearAuthSession();
}
