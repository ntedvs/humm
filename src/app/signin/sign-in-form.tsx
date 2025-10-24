"use client"

import { submit } from "./sign-in-actions"

export default function SignInForm() {
  return (
    <form action={submit} className="card space-y-4">
      <div>
        <label htmlFor="email" className="label">
          Email
        </label>
        <input id="email" name="email" type="email" required className="input" />
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
        />
      </div>

      <button className="btn btn-primary w-full">Sign In</button>
    </form>
  )
}
