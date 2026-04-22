"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

export const resetOnboardingState = async () => {
  const cookieStore = await cookies()
  cookieStore.delete("_medusa_onboarding")
  revalidatePath("/")
}
