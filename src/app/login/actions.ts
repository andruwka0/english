"use server";

import { redirect } from "next/navigation";
import { getSession, roleForPassword } from "@/lib/auth";

export async function login(_prevState: { error?: string } | undefined, formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const role = roleForPassword(password);

  if (!role) {
    return { error: "Неверный пароль" };
  }

  const session = await getSession();
  session.role = role;
  await session.save();
  redirect("/homework");
}
