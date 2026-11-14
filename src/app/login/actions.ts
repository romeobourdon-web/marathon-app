"use server";

import { redirect } from "next/navigation";
import { signIn } from "@/db/repository";

/** Connexion email + mot de passe ; en cas de refus, retour sur /login avec un message. */
export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const ok = email !== "" && password !== "" && (await signIn(email, password));
  redirect(ok ? "/" : "/login?erreur=1");
}
