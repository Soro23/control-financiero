import { NextResponse } from "next/server";

// Firebase maneja el OAuth con signInWithPopup en el cliente.
// Esta ruta ya no es necesaria pero se mantiene para evitar 404
// en caso de que algún enlace externo la referencie.
export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  return NextResponse.redirect(`${origin}/dashboard`);
}
