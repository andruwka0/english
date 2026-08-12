import { cookies } from "next/headers";
import { getIronSession, type SessionOptions } from "iron-session";
import { redirect } from "next/navigation";

export type Role = "teacher" | "student";

export interface SessionData {
  role?: Role;
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET as string,
  cookieName: "pyacademy_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export function roleForPassword(password: string): Role | null {
  if (password === process.env.TEACHER_PASSWORD) return "teacher";
  if (password === process.env.STUDENT_PASSWORD) return "student";
  return null;
}

/** Redirects to /login if there is no active session. Returns the role. */
export async function requireRole(): Promise<Role> {
  const session = await getSession();
  if (!session.role) {
    redirect("/login");
  }
  return session.role;
}

/** Redirects to /homework if the current session isn't a teacher. */
export async function requireTeacher(): Promise<void> {
  const role = await requireRole();
  if (role !== "teacher") {
    redirect("/homework");
  }
}
