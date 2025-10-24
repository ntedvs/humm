import { adminClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"

export const { signUp, signIn } = createAuthClient({ plugins: [adminClient()] })
