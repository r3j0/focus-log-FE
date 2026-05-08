const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const NICKNAME_KEY = "nickname";
const STUDY_STARTED_AT_KEY = "study_started_at";
const AUTH_CHANGE_EVENT = "focus-log-auth-change";
const CHECKING_AUTH_SNAPSHOT = "__checking__";

export type AuthSnapshotState =
  | { status: "checking" }
  | { status: "anonymous" }
  | { status: "authenticated"; nickname: string; accessToken: string };

function emitAuthChange() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

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

export function getRefreshToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function isAuthenticated() {
  return Boolean(getNickname() && getAccessToken());
}

export function getAuthSessionSnapshot() {
  const nickname = getNickname() ?? "";
  const accessToken = getAccessToken() ?? "";

  return `client\n${nickname}\n${accessToken}`;
}

export function getAuthSessionServerSnapshot() {
  return CHECKING_AUTH_SNAPSHOT;
}

export function readAuthSessionSnapshot(snapshot: string): AuthSnapshotState {
  if (snapshot === CHECKING_AUTH_SNAPSHOT) {
    return { status: "checking" };
  }

  const [, nickname, accessToken] = snapshot.split("\n");

  if (!nickname || !accessToken) {
    return { status: "anonymous" };
  }

  return { status: "authenticated", nickname, accessToken };
}

export function subscribeAuthSession(listener: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  window.addEventListener(AUTH_CHANGE_EVENT, listener);
  window.addEventListener("storage", listener);

  return () => {
    window.removeEventListener(AUTH_CHANGE_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}

export function setAuthSession(params: {
  nickname: string;
  accessToken: string;
  refreshToken?: string | null;
}) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(NICKNAME_KEY, params.nickname);
  window.localStorage.setItem(ACCESS_TOKEN_KEY, params.accessToken);
  window.localStorage.removeItem(STUDY_STARTED_AT_KEY);

  if (params.refreshToken !== undefined) {
    if (params.refreshToken) {
      window.localStorage.setItem(REFRESH_TOKEN_KEY, params.refreshToken);
    } else {
      window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  }

  emitAuthChange();
}

export function setAccessToken(token: string, refreshToken?: string | null) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);

  if (refreshToken !== undefined) {
    if (refreshToken) {
      window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    } else {
      window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  }

  emitAuthChange();
}

export function clearAuthSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.localStorage.removeItem(NICKNAME_KEY);
  window.localStorage.removeItem(STUDY_STARTED_AT_KEY);
  emitAuthChange();
}

export function clearAccessToken() {
  clearAuthSession();
}
