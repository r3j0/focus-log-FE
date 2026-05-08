export type AuthMode = "login" | "signup";
export type RankRange = "today" | "week" | "month";

export type AuthSessionPayload = {
  nickname: string;
  accessToken: string;
  refreshToken?: string | null;
};

export type DailyStudyRecord = {
  id: string;
  date: string;
  startedAt: string | null;
  endedAt: string | null;
  durationSeconds: number;
  isActive: boolean;
};

export type UserRecordSummary = {
  date: string;
  totalDurationSeconds: number;
  records: DailyStudyRecord[];
};

export type RankEntry = {
  rank: number;
  userId: number | null;
  nickname: string;
  totalDurationSeconds: number;
  isStudying: boolean;
};

export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://port-0-focus-log-be-mn8s03mk460f70c5.sel3.cloudtype.app";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function toStringValue(value: unknown) {
  return typeof value === "string" ? value : null;
}

function toNumberValue(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function toBooleanValue(value: unknown) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return value.toLowerCase() === "true";
  }

  return false;
}

function readField(source: unknown, keys: string[]) {
  if (!isRecord(source)) {
    return undefined;
  }

  for (const key of keys) {
    if (source[key] !== undefined) {
      return source[key];
    }
  }

  return undefined;
}

function toReadableMessage(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(toReadableMessage).filter(Boolean).join(", ");
  }

  if (isRecord(value)) {
    const detail = toReadableMessage(value.detail);
    if (detail) {
      return detail;
    }

    const message = toReadableMessage(value.message);
    if (message) {
      return message;
    }

    try {
      return JSON.stringify(value);
    } catch {
      return "";
    }
  }

  return "";
}

async function readApiError(response: Response, fallback: string) {
  try {
    const data = (await response.json()) as unknown;
    return toReadableMessage(data) || fallback;
  } catch {
    return fallback;
  }
}

async function apiRequest<T>(
  path: string,
  options: {
    method?: "GET" | "POST";
    body?: unknown;
    accessToken?: string;
    fallbackError: string;
  },
) {
  const headers = new Headers();

  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (options.accessToken) {
    headers.set("Authorization", `Bearer ${options.accessToken}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new ApiError(await readApiError(response, options.fallbackError), response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  try {
    return (await response.json()) as T;
  } catch {
    return undefined as T;
  }
}

function extractAuthSession(data: unknown, nickname: string): AuthSessionPayload {
  const nestedData = readField(data, ["data", "result", "user"]);
  const accessToken =
    toStringValue(readField(data, ["access_token", "accessToken", "token"])) ??
    toStringValue(readField(nestedData, ["access_token", "accessToken", "token"]));

  if (!accessToken) {
    throw new ApiError("서버 응답에 access token이 없습니다. 다시 로그인해 주세요.");
  }

  const refreshToken =
    toStringValue(readField(data, ["refresh_token", "refreshToken"])) ??
    toStringValue(readField(nestedData, ["refresh_token", "refreshToken"]));

  const responseNickname =
    toStringValue(readField(data, ["nickname"])) ??
    toStringValue(readField(readField(data, ["user", "data", "result"]), ["nickname"]));

  return {
    nickname: responseNickname ?? nickname,
    accessToken,
    refreshToken,
  };
}

export async function requestAuth(mode: AuthMode, nickname: string, password: string) {
  if (mode === "signup") {
    const signupData = await apiRequest<unknown>("/auth/signup", {
      method: "POST",
      body: { nickname, password },
      fallbackError: "회원가입에 실패했습니다.",
    });

    try {
      return extractAuthSession(signupData, nickname);
    } catch {
      return requestAuth("login", nickname, password);
    }
  }

  const loginData = await apiRequest<unknown>("/auth/login", {
    method: "POST",
    body: { nickname, password },
    fallbackError: "로그인에 실패했습니다. 닉네임 또는 비밀번호를 확인해 주세요.",
  });

  return extractAuthSession(loginData, nickname);
}

export async function requestLogout(refreshToken: string) {
  await apiRequest<unknown>("/auth/logout", {
    method: "POST",
    body: { refresh_token: refreshToken },
    fallbackError: "로그아웃 요청에 실패했습니다.",
  });
}

export async function startStudy(accessToken: string) {
  await apiRequest<unknown>("/study/start", {
    method: "POST",
    accessToken,
    fallbackError: "공부 시작 요청에 실패했습니다.",
  });
}

export async function stopStudy(accessToken: string) {
  await apiRequest<unknown>("/study/stop", {
    method: "POST",
    accessToken,
    fallbackError: "공부 종료 요청에 실패했습니다.",
  });
}

function normalizeRecord(item: unknown, fallbackDate: string, index: number): DailyStudyRecord {
  const startedAt = toStringValue(readField(item, ["started_at", "startedAt", "start_time", "startTime"]));
  const endedAt = toStringValue(readField(item, ["ended_at", "endedAt", "end_time", "endTime"]));
  const date =
    toStringValue(readField(item, ["date", "study_date", "studyDate"])) ??
    (startedAt ? startedAt.slice(0, 10) : fallbackDate);

  let durationSeconds =
    toNumberValue(
      readField(item, [
        "duration_seconds",
        "durationSeconds",
        "total_duration_seconds",
        "totalDurationSeconds",
      ]),
    ) ?? 0;

  if (durationSeconds === 0 && startedAt && endedAt) {
    const startedTime = new Date(startedAt).getTime();
    const endedTime = new Date(endedAt).getTime();

    if (!Number.isNaN(startedTime) && !Number.isNaN(endedTime)) {
      durationSeconds = Math.max(0, Math.floor((endedTime - startedTime) / 1000));
    }
  }

  const id =
    toStringValue(readField(item, ["id", "session_id", "sessionId"])) ??
    `${date}-${startedAt ?? index}`;

  return {
    id,
    date,
    startedAt,
    endedAt,
    durationSeconds,
    isActive: !endedAt,
  };
}

export async function fetchUserDailyRecord(accessToken: string, date: string) {
  const data = await apiRequest<unknown>("/user/record", {
    method: "POST",
    accessToken,
    body: { date },
    fallbackError: "개인 기록을 불러오지 못했습니다.",
  });

  const listSource =
    (Array.isArray(data) && data) ||
    (Array.isArray(readField(data, ["records"])) && (readField(data, ["records"]) as unknown[])) ||
    (Array.isArray(readField(data, ["sessions"])) && (readField(data, ["sessions"]) as unknown[])) ||
    (Array.isArray(readField(data, ["items"])) && (readField(data, ["items"]) as unknown[])) ||
    [];

  const records = listSource.map((item, index) => normalizeRecord(item, date, index));
  const responseTotal =
    toNumberValue(
      readField(data, [
        "total_duration_seconds",
        "totalDurationSeconds",
        "total_seconds",
        "totalSeconds",
      ]),
    ) ?? records.reduce((sum, record) => sum + record.durationSeconds, 0);

  return {
    date,
    totalDurationSeconds: responseTotal,
    records,
  } satisfies UserRecordSummary;
}

export async function fetchRank(accessToken: string, range: RankRange) {
  const data = await apiRequest<unknown>(`/rank?range=${range}`, {
    accessToken,
    fallbackError: "랭킹을 불러오지 못했습니다.",
  });

  const listSource =
    (Array.isArray(data) && data) ||
    (Array.isArray(readField(data, ["ranks"])) && (readField(data, ["ranks"]) as unknown[])) ||
    [];

  return listSource.map((item, index) => ({
    rank: toNumberValue(readField(item, ["rank"])) ?? index + 1,
    userId: toNumberValue(readField(item, ["user_id", "userId"])),
    nickname: toStringValue(readField(item, ["nickname"])) ?? "알 수 없음",
    totalDurationSeconds:
      toNumberValue(readField(item, ["total_duration_seconds", "totalDurationSeconds"])) ?? 0,
    isStudying: toBooleanValue(readField(item, ["is_studying", "isStudying"])),
  })) satisfies RankEntry[];
}
