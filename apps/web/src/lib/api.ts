type Json = Record<string, any>;

let accessToken: string | null = null;
let refreshInFlight: Promise<string | null> | null = null;

const rawAuthBaseUrl =
    (import.meta.env as Record<string, string | undefined>).VITE_AUTH_BASE_URL ?? "";
const authBaseUrl = rawAuthBaseUrl.replace(/\/+$/, "");
const rawTaskBaseUrl =
    (import.meta.env as Record<string, string | undefined>).VITE_TASK_BASE_URL ?? "";
const taskBaseUrl = rawTaskBaseUrl.replace(/\/+$/, "");

function toServiceUrl(input: string): string {
    if (/^https?:\/\//i.test(input)) return input;

    if (authBaseUrl) {
        if (input.startsWith("/auth/") || input === "/auth") return `${authBaseUrl}${input}`;
        if (input.startsWith("/api/")) return `${authBaseUrl}${input.replace(/^\/api/, "")}`;
        if (input === "/api") return authBaseUrl;
    }

    if (taskBaseUrl) {
        if (input.startsWith("/tasks/") || input === "/tasks") return `${taskBaseUrl}${input}`;
        if (input.startsWith("/graphql")) return `${taskBaseUrl}${input}`;
        if (input.startsWith("/ai/") || input === "/ai") return `${taskBaseUrl}${input}`;
    }

    return input;
}

export function setAccessToken(token: string | null) {
    accessToken = token;
}

export async function refreshAccessToken(): Promise<string | null> {
    if (refreshInFlight) return refreshInFlight;

    refreshInFlight = (async () => {
        const res = await fetch(toServiceUrl("/auth/refresh"), {
            method: "POST",
            credentials: "include",
        });

        if (!res.ok) return null;

        const data = (await res.json()) as { accessToken?: string };
        if (!data.accessToken) return null;

        setAccessToken(data.accessToken);
        return data.accessToken;
    })();

    try {
        return await refreshInFlight;
    } finally {
        refreshInFlight = null;
    }
}

export async function logoutSession(): Promise<void> {
    const requestInput = toServiceUrl("/auth/logout");
    await fetch(requestInput, {
        method: "POST",
        credentials: "include",
    });
}

export async function apiFetch<T = Json>(
    input: RequestInfo,
    init: RequestInit = {},
    retry = true
): Promise<T> {
    const headers = new Headers(init.headers);
    if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
    headers.set("Content-Type", "application/json");

    const requestInput = typeof input === "string" ? toServiceUrl(input) : input;
    const res = await fetch(requestInput, {
        ...init,
        headers,
        credentials: "include",
    });

    // access token fails, try to refresh token once then retry request
    if (res.status === 401 && retry) {
        const newToken = await refreshAccessToken();
        if (newToken) return apiFetch<T>(input, init, false);
    }

    if (!res.ok) {
        let errBody: any = null;
        try {
            errBody = await res.json();
        } catch { }
        throw new Error(errBody?.message || errBody?.error || `Request failed: ${res.status}`);
    }

    return (await res.json()) as T;
}
