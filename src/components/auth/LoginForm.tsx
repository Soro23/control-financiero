"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { initUserData } from "@/lib/firebase/initUserData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

type LoginData = z.infer<typeof loginSchema>;

async function createSession(user: import("firebase/auth").User) {
  const idToken = await user.getIdToken();
  await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
}

export function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginData) {
    setServerError(null);
    try {
      const { user } = await signInWithEmailAndPassword(auth, data.email, data.password);
      await createSession(user);
      router.push("/dashboard");
    } catch {
      setServerError("Email o contraseña incorrectos");
    }
  }

  async function handleGoogleLogin() {
    setServerError(null);
    try {
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider);
      await initUserData(user.uid, user.displayName);
      await createSession(user);
      router.push("/dashboard");
    } catch {
      setServerError("Error al iniciar sesión con Google");
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-surface-container-lowest rounded-xl p-8 shadow-[0_12px_32px_rgba(25,28,30,0.06)]">
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-2xl font-black font-headline text-primary tracking-tight">
            Control Financiero
          </h1>
          <p className="text-xs uppercase tracking-widest text-on-primary-container font-semibold mt-1">
            Wealth Management
          </p>
        </div>

        <h2 className="text-xl font-bold font-headline text-primary mb-6">
          Iniciar sesión
        </h2>

        {serverError && (
          <div className="mb-4 p-3 rounded-xl bg-error-container text-on-error-container text-sm font-medium">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <Label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2 block">
              Email
            </Label>
            <Input
              type="email"
              placeholder="tu@email.com"
              className="bg-surface-container-low border-none rounded-xl focus-visible:ring-primary/20"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-error mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2 block">
              Contraseña
            </Label>
            <Input
              type="password"
              placeholder="••••••••"
              className="bg-surface-container-low border-none rounded-xl focus-visible:ring-primary/20"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-error mt-1">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full gradient-primary text-on-primary rounded-xl py-4 font-bold text-sm hover:opacity-90 active:scale-95 transition-all"
          >
            {isSubmitting ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-outline-variant/30" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-surface-container-lowest px-3 text-on-surface-variant font-medium">
              o continúa con
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleLogin}
          className="w-full rounded-xl border-outline-variant/40 bg-surface-container-low hover:bg-surface-container text-on-surface font-semibold flex items-center gap-3"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Entrar con Google
        </Button>

        <p className="mt-6 text-center text-sm text-on-surface-variant">
          ¿No tienes cuenta?{" "}
          <a
            href="/registro"
            className="font-bold text-primary hover:underline"
          >
            Regístrate
          </a>
        </p>
      </div>
    </div>
  );
}
