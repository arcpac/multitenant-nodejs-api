import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { apiFetch, setAccessToken } from "../lib/api";
import { useAuthStore } from "../stores/authStore";

type RegisterResponse = {
    accessToken: string;
};

const RegisterPage = () => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [orgName, setOrgName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const status = useAuthStore((state) => state.status);
    const refreshMe = useAuthStore((state) => state.refreshMe);
    const navigate = useNavigate();
    const location = useLocation();
    const from = (location.state as { from?: string } | undefined)?.from ?? "/me";

    useEffect(() => {
        if (status === "authed") {
            navigate(from, { replace: true });
        }
    }, [status, from, navigate]);

    const handleRegister = async () => {
        setError("");

        if (!orgName.trim()) {
            setError("Organization name is required");
            return;
        }
        if (!email.trim()) {
            setError("Email is required");
            return;
        }
        if (password.length < 3) {
            setError("Password must be at least 3 characters");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setIsSubmitting(true);

        try {
            const data = await apiFetch<RegisterResponse>("/auth/register", {
                method: "POST",
                body: JSON.stringify({
                    email,
                    password,
                    orgName: orgName.trim(),
                    firstName: firstName.trim() || undefined,
                    lastName: lastName.trim() || undefined,
                }),
            });
            console.log('data from auth/register: ', data)
            setAccessToken(data.accessToken);
            await refreshMe();
        } catch (e) {
            console.error(e);
            setError("Registration failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen w-full grid place-items-center bg-zinc-950 text-zinc-100">
            <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 shadow">
                <h1 className="text-xl font-semibold">TeamBoard UI</h1>
                <p className="mt-1 text-sm text-zinc-400">Create your account</p>

                <div className="mt-6 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-xs text-zinc-400">First Name</label>
                            <input
                                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-700"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-xs text-zinc-400">Last Name</label>
                            <input
                                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-700"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs text-zinc-400">Organization</label>
                        <input
                            className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-700"
                            value={orgName}
                            onChange={(e) => setOrgName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="text-xs text-zinc-400">Email</label>
                        <input
                            className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-700"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="text-xs text-zinc-400">Password</label>
                        <input
                            className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-700"
                            value={password}
                            type="password"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="text-xs text-zinc-400">Confirm Password</label>
                        <input
                            className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-700"
                            value={confirmPassword}
                            type="password"
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    <div className="text-sm text-red-200">
                        <p>{error}</p>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button
                            onClick={handleRegister}
                            disabled={isSubmitting}
                            className="flex-1 rounded-lg bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {isSubmitting ? "Creating..." : "Create account"}
                        </button>
                    </div>

                    <p className="text-center text-xs text-zinc-400">
                        Already have an account?{" "}
                        <Link to="/login" className="text-zinc-200 hover:text-white">
                            Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
