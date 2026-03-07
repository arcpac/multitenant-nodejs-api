import { create } from "zustand";
import { apiFetch, refreshAccessToken, setAccessToken } from "../lib/api";

type MeResponse = {
  user: { id: string; email: string; first_name: string; last_name: string };
  activeOrg: { id: string } | {};
  role: string;
};

type AuthStatus = "loading" | "guest" | "authed";

type AuthState = {
  status: AuthStatus;
  me: MeResponse | null;
  bootstrap: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
};

let bootstrapInFlight: Promise<void> | null = null;

export const useAuthStore = create<AuthState>((set) => ({
  status: "loading",
  me: null,

  bootstrap: async () => {
    console.log('bootstrapInFlight: ', bootstrapInFlight)
    if (bootstrapInFlight) return bootstrapInFlight;

    bootstrapInFlight = (async () => {
      set({ status: "loading", me: null });

      try {
        const accessToken = await refreshAccessToken();

        if (!accessToken) {
          setAccessToken(null);
          set({ status: "guest", me: null });
          return;
        }

        const me = await apiFetch<MeResponse>("/api/me", { method: "GET" });
        set({ status: "authed", me });
      } catch (e) {
        console.error(e);
        setAccessToken(null);
        set({ status: "guest", me: null });
      }
    })();

    try {
      await bootstrapInFlight;
    } finally {
      bootstrapInFlight = null;
    }
  },

  login: async (email, password) => {
    const data = await apiFetch<{ accessToken: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setAccessToken(data.accessToken);

    const me = await apiFetch<MeResponse>("/api/me", { method: "GET" });
    set({ status: "authed", me });
  },

  logout: () => {
    // clears only access token (server-side logout endpoint can come later)
    setAccessToken(null);
    set({ status: "guest", me: null });
  },

  refreshMe: async () => {
    const me = await apiFetch<MeResponse>("/api/me", { method: "GET" });
    set({ status: "authed", me });
  },
}));
