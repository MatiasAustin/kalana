import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-kalana-offwhite flex flex-col items-center justify-center p-4 pt-32 sm:pt-36 pb-16">
      <div className="mb-8 text-center">
        <h1 className="text-xl sm:text-2xl font-bold tracking-widest uppercase font-mono">WELCOME BACK</h1>
        <p className="text-xs sm:text-sm text-kalana-black/60 mt-2 font-mono">Sign in to your KALANA account</p>
      </div>
      <div className="w-full max-w-md flex justify-center overflow-x-auto">
        <SignIn routing="hash" fallbackRedirectUrl="/admin" signUpUrl="/signup" />
      </div>
    </div>
  );
}
