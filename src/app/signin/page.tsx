import SignInForm from "./sign-in-form"

export default function SignIn() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-semibold text-gray-900">
            Welcome to Humm
          </h1>
          <p className="text-gray-600">Sign in to manage your pitch decks</p>
        </div>
        <div className="card">
          <SignInForm />
        </div>
      </div>
    </div>
  )
}
