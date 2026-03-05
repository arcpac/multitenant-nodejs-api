type Json = Record<string, any>;

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
    accessToken = token;
}

async function refreshAccessToken(): Promise<string | null> {
    const res = await fetch("/auth/refresh", {
        method: "POST",
        credentials: "include", // ✅ send refresh cookie
    });

    if (!res.ok) return null;

    const data = (await res.json()) as { accessToken?: string };
    if (!data.accessToken) return null;

    setAccessToken(data.accessToken);
    return data.accessToken;
}

export async function apiFetch<T = Json>(
    input: RequestInfo,
    init: RequestInit = {},
    retry = true
): Promise<T> {
    const headers = new Headers(init.headers);

    if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
    headers.set("Content-Type", "application/json");

    const res = await fetch(input, {
        ...init,
        headers,
        credentials: "include", // ✅ important if any cookies involved
    });

    // If access token expired, try refresh once then retry request
    if (res.status === 401 && retry) {
        const newToken = await refreshAccessToken();
        if (newToken) return apiFetch<T>(input, init, false);
    }

    if (!res.ok) {
        let errBody: any = null;
        try {
            errBody = await res.json();
        } catch { }
        throw new Error(errBody?.message || `Request failed: ${res.status}`);
    }

    return (await res.json()) as T;
}