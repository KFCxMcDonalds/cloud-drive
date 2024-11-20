// src/app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'
import { Inter } from 'next/font/google'
import Navigation from '@/components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
    title: 'Cloud Drive',
    description: 'A simple cloud storage solution',
}

export default function RootLayout({ children }: {
    children: React.ReactNode
}) {
    return (
        <ClerkProvider>
            <html lang="en">
            <body className={inter.className}>
            <Navigation />
            <main className="min-h-[calc(100vh-64px)] bg-gray-50">
                {children}
            </main>
            </body>
            </html>
        </ClerkProvider>
    )
}