"use client";

import { useActionState, useState } from "react";
import { login } from "./actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, undefined);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <form
        action={formAction}
        className="w-full max-w-sm space-y-5 rounded-[2rem] border-4 border-primary-soft bg-white p-8 shadow-xl shadow-primary/10"
      >
        <div className="space-y-2 text-center">
          <div className="text-5xl">🐍✨</div>
          <h1 className="font-heading text-2xl font-bold text-primary">Python с нуля</h1>
          <p className="text-sm text-ink-soft">Введи пароль, чтобы продолжить</p>
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-bold text-ink">
            Пароль
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoFocus
              required
              className="w-full rounded-2xl border-2 border-primary-soft px-4 py-3 pr-12 text-sm outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
              className="absolute inset-y-0 right-1 flex items-center px-3 text-lg text-ink-soft hover:text-primary"
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        {state?.error && (
          <p className="rounded-xl bg-danger-soft px-3 py-2 text-sm font-medium text-danger" role="alert">
            😅 {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-primary px-4 py-3 text-sm font-bold text-white shadow-lg shadow-primary/30 transition hover:scale-[1.02] hover:bg-primary-dark disabled:opacity-50 disabled:hover:scale-100"
        >
          {pending ? "Проверяю..." : "Войти →"}
        </button>
      </form>
    </main>
  );
}
