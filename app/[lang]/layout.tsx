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
import { getSession } from "@/lib/session";
import MaintenanceView from "@/components/MaintenanceView";

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
  const [settings, session] = await Promise.all([
    getSystemSettings(),
    getSession()
  ]);

  const gaId = settings.google_analytics_id;
  const isMaintenance = settings.maintenance_mode === "true" && session?.role !== 'admin';

  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        {/* Basic scripts that need early execution */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || !('theme' in localStorage)) {
                  document.documentElement.classList.add('dark')
                } else {
                  document.documentElement.classList.remove('dark')
                }
              } catch (_) {}
            `,
          }}
        />

        {/* Google Analytics */}
        {gaId && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaId}');
                `,
              }}
            />
          </>
        )}
      </head>

      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground transition-colors duration-300`}>
        {/* Inject Extra Meta Tags (Hidden) at the very beginning of the body if they contain non-script HTML */}
        {settings.meta_tags_extra && (
          <div
            dangerouslySetInnerHTML={{ __html: settings.meta_tags_extra }}
            className="hidden pointer-events-none appearance-none h-0 w-0 overflow-hidden"
            aria-hidden="true"
          />
        )}

        {isMaintenance ? (
          <MaintenanceView lang={lang} />
        ) : (
          <SystemSettingsProvider settings={settings}>
            {children}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(await getGlobalSchema()) }}
            />
          </SystemSettingsProvider>
        )}

        {/* Dynamic Footer Script */}
        {settings.custom_footer_script && (
          <div
            dangerouslySetInnerHTML={{ __html: settings.custom_footer_script }}
            className="hidden"
            aria-hidden="true"
          />
        )}
      </body>
    </html>
  );
}
