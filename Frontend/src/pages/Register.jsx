import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/useAuth";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await register(form);
      navigate("/dashboard", { replace: true });
    } catch (registerError) {
      setError(
        registerError.response?.data?.message ||
          "Unable to register. Please check your details."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white grid place-items-center px-5">
      <section className="grid w-full max-w-5xl gap-8 rounded-lg border border-white/10 bg-zinc-900 p-6 shadow-2xl md:grid-cols-[1.1fr_0.9fr] md:p-10">
        <div className="flex flex-col justify-between gap-10">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
              Manufacturing Sales Pipeline
            </p>
            <h1 className="max-w-xl text-5xl font-black leading-none md:text-7xl">
              BDA CRM
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-zinc-400">
              Track leads, client communication, sales pipeline movement, and
              team performance for a manufacturing business.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-sm text-zinc-300">
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              Pipeline
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              Activities
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              Metrics
            </div>
          </div>
        </div>

        <form className="grid content-center gap-5" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm text-zinc-300">
            Name
            <input
              autoComplete="name"
              className="h-12 rounded-lg border border-white/10 bg-white/5 px-4 text-white outline-none focus:border-emerald-300"
              name="name"
              onChange={handleChange}
              placeholder="John Doe"
              required
              type="text"
              value={form.name}
            />
          </label>

          <label className="grid gap-2 text-sm text-zinc-300">
            Email
            <input
              autoComplete="email"
              className="h-12 rounded-lg border border-white/10 bg-white/5 px-4 text-white outline-none focus:border-emerald-300"
              name="email"
              onChange={handleChange}
              placeholder="admin@company.com"
              required
              type="email"
              value={form.email}
            />
          </label>

          <label className="grid gap-2 text-sm text-zinc-300">
            Password
            <input
              autoComplete="new-password"
              className="h-12 rounded-lg border border-white/10 bg-white/5 px-4 text-white outline-none focus:border-emerald-300"
              name="password"
              onChange={handleChange}
              placeholder="Create a password"
              required
              type="password"
              value={form.password}
            />
          </label>

          {error ? (
            <p className="rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">
              {error}
            </p>
          ) : null}

          <button
            className="h-12 rounded-lg bg-emerald-300 font-bold text-zinc-950 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={submitting}
            type="submit"
          >
            {submitting ? "Registering..." : "Register"}
          </button>
          
          <p className="text-center text-sm text-zinc-400">
            Already have an account?{" "}
            <button
              type="button"
              className="text-emerald-300 hover:underline"
              onClick={() => navigate("/login")}
            >
              Sign in here
            </button>
          </p>
        </form>
      </section>
    </main>
  );
};

export default Register;
