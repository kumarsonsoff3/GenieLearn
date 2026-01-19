import "../src/index.css";
import StoreProvider from "../src/components/StoreProvider";
import { ToastProvider } from "../src/components/ToastProvider";

export const metadata = {
  title: "GenieLearn - Your Learning Platform",
  description:
    "A real-time learning platform that enables students to form study groups, participate in discussions, and collaborate on learning materials.",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-64x64.png", sizes: "64x64", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans" suppressHydrationWarning>
        <StoreProvider>
          <ToastProvider>{children}</ToastProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
