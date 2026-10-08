import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AuthInitializer } from '@/components/providers/AuthInitializer';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { GlobalPhonePrompt } from '@/components/auth/GlobalPhonePrompt';
import { ToastContainer } from '@/components/ui/Toast';
import { BackToTop } from '@/components/ui/BackToTop';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'Cravery | Delicious Food Delivered Fast',
    template: '%s | Cravery',
  },
  description:
    'Order from top restaurants and enjoy lightning fast food delivery with live GPS driver tracking in Phnom Penh.',
  keywords: ['food delivery', 'restaurant', 'order food online', 'Phnom Penh', 'Cravery'],
  openGraph: {
    siteName: 'Cravery',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`h-full antialiased ${inter.variable}`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
        <ThemeProvider>
          <AuthInitializer />
          <GlobalPhonePrompt />
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
          <ToastContainer />
          <BackToTop />
        </ThemeProvider>
      </body>
    </html>
  );
}
