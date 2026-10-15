import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-kalana-offwhite flex flex-col items-center justify-center p-4 pt-32 sm:pt-36 pb-16">
      <div className="mb-8 text-center">
        <h1 className="text-xl sm:text-2xl font-bold tracking-widest uppercase font-mono">CREATE ACCOUNT</h1>
        <p className="text-xs sm:text-sm text-kalana-black/60 mt-2 font-mono">Join KALANA to track your orders</p>
      </div>
      <div className="w-full max-w-md flex justify-center overflow-x-auto">
        <SignUp routing="hash" forceRedirectUrl="/account" signInUrl="/login" />
      </div>
    </div>
  );
}
