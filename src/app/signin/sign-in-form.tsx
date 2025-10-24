"use client"

import { submit } from "./sign-in-actions"

export default function SignInForm() {
  return (
    <>
      <h1>Home</h1>

      <form action={submit}>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required />

        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required />

        <button>Sign In</button>
      </form>
    </>
  )
}
