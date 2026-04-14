"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      setError("بيانات الدخول غير صحيحة");
      return;
    }

    const data = await response.json();
    localStorage.setItem("admin_token", data.token);
    window.location.href = "/admin";
  }

  return (
    <section className="section">
      <div className="container max-w-480">
        <form className="card grid" onSubmit={handleSubmit}>
          <h1>تسجيل الدخول</h1>
          <label htmlFor="email">البريد الإلكتروني</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <label htmlFor="password">كلمة المرور</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button className="btn btn-primary" type="submit">
            دخول
          </button>
          {error ? <small className="text-danger">{error}</small> : null}
        </form>
      </div>
    </section>
  );
}
