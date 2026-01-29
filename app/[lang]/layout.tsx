import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";

// Load Inter font
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

import { constructMetadata, getGlobalSchema } from "@/lib/seo";
import { SystemSettingsProvider } from "@/components/providers/SystemSettingsProvider";
import { getSystemSettings } from "@/lib/settings";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://promptda.com';

  const path = '/'; // Base path for the layout
  return constructMetadata({
    alternates: {
      canonical: lang === 'en' ? `${baseUrl}` : `${baseUrl}/${lang}`,
      languages: {
        'en': `${baseUrl}`,
        'de': `${baseUrl}/de`,
        'es': `${baseUrl}/es`,
        'tr': `${baseUrl}/tr`,
        'x-default': `${baseUrl}`,
      },
    },
  });
}

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'de' }, { lang: 'es' }, { lang: 'tr' }]
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  const settings = await getSystemSettings();

  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark')
                } else {
                  document.documentElement.classList.remove('dark')
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground transition-colors duration-300`}>
        <SystemSettingsProvider settings={settings}>
          {children}
        </SystemSettingsProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(await getGlobalSchema()) }}
        />
      </body>
    </html>
  );
}
