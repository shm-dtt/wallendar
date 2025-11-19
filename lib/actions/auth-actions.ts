"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const signInSocial = async (
  provider: "github" | "google", pathname: string
) => {
  const { url } = await auth.api.signInSocial({
    body: {
      provider,
      callbackURL: pathname,
    },
  });

  if (url) {
    redirect(url);
  }
};

export const signOut = async () => {
  const result = await auth.api.signOut({ headers: await headers() });
  return result;
};