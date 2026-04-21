"use server"

import { cookies } from "next/headers"

export const updateLocale = async (locale: string) => {
  const cookieStore = await cookies()
  cookieStore.set("NEXT_LOCALE", locale, {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })
}

export const getLocale = async () => {
  const cookieStore = await cookies()
  return cookieStore.get("NEXT_LOCALE")?.value ?? "en"
}
