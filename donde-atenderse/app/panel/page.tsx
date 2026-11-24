import { redirect } from "next/navigation";
import { destinoPanelTrasLogin, usuarioActual } from "@/lib/auth";

export default async function Panel() {
  const usuario = await usuarioActual();
  if (!usuario) redirect("/entrar");
  redirect(destinoPanelTrasLogin(usuario));
}