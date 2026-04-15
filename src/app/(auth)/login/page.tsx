import { LoginForm } from "@/components/auth/LoginForm";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-surface flex items-center justify-center p-6">
      <LoginForm />
    </main>
  );
}
