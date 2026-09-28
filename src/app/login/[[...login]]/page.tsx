import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-kalana-offwhite flex flex-col items-center justify-center p-4 pt-24">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-widest uppercase font-mono">WELCOME BACK</h1>
        <p className="text-sm text-kalana-black/60 mt-2 font-mono">Sign in to your KALANA account</p>
      </div>
      <SignIn routing="hash" forceRedirectUrl="/account" signUpUrl="/signup" />
    </div>
  );
}
