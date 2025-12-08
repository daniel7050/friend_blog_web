import "./globals.css";
import Navbar from "./components/Navbar";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./components/ToastProvider";

export const metadata = {
  title: "Friend Blog Platform",
  description: "Share what matters with friends",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ToastProvider>
            <Navbar />
            <main className="max-w-3xl mx-auto p-4">{children}</main>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
