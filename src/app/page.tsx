import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";

export default function HomePage() {
  return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-20 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            Welcome to CloudDrive
          </h1>
          <p className="text-2xl text-blue-400">
            developed by LiwenWu
          </p>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Your secure cloud storage solution for all your files.
          </p>

          <div className="mt-8 flex justify-center gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-6 py-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600 font-medium">
                  Get Started
                </button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <Link
                  href="/dashboard"
                  className="px-6 py-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600 font-medium"
              >
                Go to Dashboard
              </Link>
            </SignedIn>
          </div>
        </div>
      </div>
  );
}