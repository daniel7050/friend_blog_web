// app/page.tsx
"use client";
import React from "react";

export default function HomePage() {
  const [user, setUser] = React.useState<{ id?: string } | null>(null);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      try {
        const userData = userStr ? JSON.parse(userStr) : null;
        setUser(userData);
      } catch {
        setUser(null);
      }
    }
  }, []);

  const getStartedLink = user ? "/feed" : "/register";

  return (
    <main className="min-h-screen flex flex-col">
      {/* Navbar is rendered in the global layout */}

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-50 to-blue-100 py-16 sm:py-20 md:py-24">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-blue-800 mb-4 leading-tight">
            Welcome to Friend Blog
          </h2>
          <p className="text-base sm:text-lg text-blue-700 mb-6 max-w-2xl mx-auto">
            Share your thoughts privately with friends. Follow, like, comment,
            and stay connected.
          </p>
          <a
            href={getStartedLink}
            className="inline-block bg-blue-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-md hover:bg-blue-700 transition font-semibold"
          >
            {user ? "Go to Feed" : "Get Started"}
          </a>
        </div>
      </section>

      {/* Recent Posts (Placeholder) */}
      <section className="flex-1 bg-white py-12 sm:py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl sm:text-3xl font-semibold mb-6 sm:mb-8">
            Features
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Share Posts",
                desc: "Create and share your thoughts with friends.",
              },
              {
                title: "Like & Comment",
                desc: "Engage with posts from your friends.",
              },
              {
                title: "Follow Friends",
                desc: "Stay connected with people you care about.",
              },
              {
                title: "Notifications",
                desc: "Get updates on likes and comments.",
              },
              {
                title: "Privacy Focused",
                desc: "Control who sees your content.",
              },
              {
                title: "User Profiles",
                desc: "Customize your profile and view others.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-gray-50 p-4 sm:p-6 rounded-lg shadow hover:shadow-lg transition border border-gray-200"
              >
                <h4 className="text-lg font-bold mb-2 text-blue-600">
                  {feature.title}
                </h4>
                <p className="text-sm sm:text-base text-gray-700">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-6 sm:py-8 mt-12 text-center text-gray-600 text-sm sm:text-base">
        © {new Date().getFullYear()} Friend Blog. Built with ❤️ using Next.js &
        Tailwind CSS.
      </footer>
    </main>
  );
}
