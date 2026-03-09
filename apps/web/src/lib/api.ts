type Json = Record<string, any>;

let accessToken: string | null = null;
let refreshInFlight: Promise<string | null> | null = null;

export function setAccessToken(token: string | null) {
    accessToken = token;
}

export async function refreshAccessToken(): Promise<string | null> {
    if (refreshInFlight) return refreshInFlight;

    refreshInFlight = (async () => {
        const res = await fetch("/auth/refresh", {
            method: "POST",
            credentials: "include",
        });

        if (!res.ok) return null;

        const data = (await res.json()) as { accessToken?: string };
        console.log('data.accessToken: ', data.accessToken)
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

export async function apiFetch<T = Json>(
    input: RequestInfo,
    init: RequestInit = {},
    retry = true
): Promise<T> {
    console.log('run apiFetch: ')
    const headers = new Headers(init.headers);
    if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
    headers.set("Content-Type", "application/json");

    const res = await fetch(input, {
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
        throw new Error(errBody?.message || `Request failed: ${res.status}`);
    }

    return (await res.json()) as T;
}
