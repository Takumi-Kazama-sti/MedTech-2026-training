import { env } from "@/env";
import { LoginEmployee } from "../schemas/loginSchema";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

type ResponseOptions = RequestInit & {
  query?: Record<string, string | undefined>;
}

export async function request<T>(path: string, { query, ...init }: ResponseOptions): Promise<T> {
  const url = new URL(`${env.NEXT_PUBLIC_API_URL}${path}`);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value) url.searchParams.set(key, value);
  }
  const response = await fetch(url,
    {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init.headers,
      },
      credentials: "include",
    }
  );

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiError(
      response.status,
      body.code ?? "unknown",
      body.message ?? "通信に失敗しました",
    );
  }
  // ログアウト用, JSONボディがないため
  if (response.status === 204) {
    return null as T;
  }
  return response.json();
}

// ログイン
export function login(loginId: string, loginPassword: string) {
  return request<LoginEmployee>(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ loginId, loginPassword }),
    }
  );
}

// 従業員情報取得(画面情報に関わる)
export function getEmployee(signal?: AbortSignal) {
  return request<LoginEmployee>(
    "/auth/employee", { signal }
  );
}

// ログアウト
export function logout() {
  return request(
    "/auth/logout",
    {
      method: "POST",
    }
  );
}