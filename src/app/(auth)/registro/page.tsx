import { RegisterForm } from "@/components/auth/RegisterForm";

export const dynamic = "force-dynamic";

export default function RegistroPage() {
  return (
    <main className="min-h-screen bg-surface flex items-center justify-center p-6">
      <RegisterForm />
    </main>
  );
}
