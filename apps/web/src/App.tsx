import { useState } from "react";
import { apiFetch, setAccessToken } from "./lib/api";

export default function App() {
  const [email, setEmail] = useState("anton@email.com");
  const [password, setPassword] = useState("password123");
  const [out, setOut] = useState<any>(null);

  async function login() {
    const data = await apiFetch<{ accessToken: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setAccessToken(data.accessToken);
    setOut({ loggedIn: true });
  }

  async function me() {
    const data = await apiFetch("/me", { method: "GET" });
    console.log('data => ', data)
    setOut(data);
  }

  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>TeamBoard UI</h1>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input value={email} onChange={(e) => setEmail(e.target.value)} />
        <input
          value={password}
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={login}>Login</button>
        <button onClick={me}>Call /me</button>
      </div>

      <pre>{JSON.stringify(out, null, 2)}</pre>
    </div>
  );
}