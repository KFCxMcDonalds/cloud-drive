import { SignInButton, SignedIn, SignedOut, SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Cloud } from "lucide-react";

export default function Navigation() {
    return (
        <header className="border-b bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo and site name */}
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center space-x-2">
                            <Cloud className="h-6 w-6 text-blue-500" />
                            <span className="text-xl font-semibold">CloudDrive</span>
                        </Link>
                    </div>

                    {/* Auth buttons */}
                    <div className="flex items-center gap-4">
                        <SignedOut>
                            <SignInButton mode="modal">
                                <button className="px-4 py-2 rounded-lg hover:bg-gray-100 font-medium">
                                    Sign In
                                </button>
                            </SignInButton>
                            <SignUpButton mode="modal">
                                <button className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 font-medium">
                                    Sign Up
                                </button>
                            </SignUpButton>
                        </SignedOut>

                        <SignedIn>
                            <Link
                                href="/dashboard"
                                className="px-4 py-2 rounded-lg hover:bg-gray-100 font-medium"
                            >
                                Dashboard
                            </Link>
                            <UserButton
                                afterSignOutUrl="/"
                                appearance={{
                                    elements: {
                                        avatarBox: "w-10 h-10"
                                    }
                                }}
                            />
                        </SignedIn>
                    </div>
                </div>
            </div>
        </header>
    );
}