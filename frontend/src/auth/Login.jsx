import React, { useState } from "react";
import { loginUser } from "./authApi";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    const res = await loginUser(form);
    login(res.data);
    navigate("/"); // Redirect to home after login
  };

  const inputBase =
    "w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-800 placeholder-slate-400 transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200";

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">
            Sign in
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Access your quotations dashboard.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className={inputBase}
                value={form.email}
                onChange={e =>
                  setForm({ ...form, email: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className={inputBase}
                value={form.password}
                onChange={e =>
                  setForm({ ...form, password: e.target.value })
                }
                required
              />
            </div>

            <button
              type="submit"
              className="mt-2 w-full rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
            >
              Login
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-slate-700 hover:text-slate-900"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;