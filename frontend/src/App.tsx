// src/app/layout.tsx
import { Suspense } from 'react';
import { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import AuthProvider from '@/providers/AuthProvider';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { ToastContainer } from '@/components/common/Toast';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Application',
  description: 'Secure application with user management',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
            <Navigation />
            <main className="flex-1 container mx-auto px-4 py-8">
              <Suspense fallback={<LoadingSpinner />}>
                {children}
              </Suspense>
            </main>
            <ToastContainer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}

// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAuth } from '@/lib/auth';

const publicPaths = ['/login', '/register', '/'];

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const path = request.nextUrl.pathname;

  // Allow public paths
  if (publicPaths.includes(path)) {
    return NextResponse.next();
  }

  // Check authentication for protected routes
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    await verifyAuth(token);
    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    '/users/:path*',
    '/dashboard/:path*',
    '/profile/:path*',
  ],
};

// File structure for pages (Next.js 13+ App Router):
/*
src/app/
├── page.tsx                    // Home/landing page
├── login/
│   └── page.tsx               // Login page
├── register/
│   └── page.tsx               // Register page
├── users/
│   ├── page.tsx               // Users list
│   ├── create/
│   │   └── page.tsx          // Create user
│   └── [id]/
│       ├── page.tsx          // User details
│       └── edit/
│           └── page.tsx      // Edit user
└── not-found.tsx             // 404 page
*/

// src/types/user.ts
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
  password?: string; // Only used for creation/updates
}

// src/types/auth.ts
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}