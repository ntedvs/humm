"use client"

import { submit } from "./sign-in-actions"

export default function SignInForm() {
  return (
    <form action={submit} className="space-y-5">
      <div>
        <label htmlFor="email" className="label">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="input"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="label">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="input"
          placeholder="••••••••"
        />
      </div>

      <button className="btn btn-primary w-full">Sign In</button>
    </form>
  )
}
