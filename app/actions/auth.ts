"use server"

import { signIn } from "@/auth"
import { signOut } from "@/auth"

export async function googleSignIn() {
  await signIn("google", { redirectTo: "/" })
}

export async function githubSignIn() {
  await signIn("github", { redirectTo: "/" })
}

export async function signOutGlobal() {
  await signOut({ redirectTo: "/signin" })
}