// app/page.tsx
import React from "react";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Navbar is rendered in the global layout */}

      {/* Hero Section */}
      <section className="bg-blue-50 py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold text-blue-800 mb-4">
            Welcome to Friend Blog
          </h2>
          <p className="text-lg text-blue-700 mb-6">
            Share your thoughts privately with friends. Follow, like, comment,
            and stay connected.
          </p>
          <a
            href="/register"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition"
          >
            Get Started
          </a>
        </div>
      </section>

      {/* Recent Posts (Placeholder) */}
      <section className="flex-1 bg-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-2xl font-semibold mb-6">
            Recent Posts from Friends
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Example Post Card */}
            {[1, 2, 3].map((post) => (
              <div
                key={post}
                className="bg-gray-100 p-4 rounded-lg shadow hover:shadow-md transition"
              >
                <h4 className="text-lg font-bold mb-2">Blog Title #{post}</h4>
                <p className="text-sm text-gray-700">
                  This is a preview of the blog content. Only visible to
                  friends.
                </p>
                <div className="mt-4 flex justify-between text-sm text-gray-500">
                  <span>by user{post}</span>
                  <span>2h ago</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-6 mt-12 text-center text-gray-600">
        © {new Date().getFullYear()} Friend Blog. Built with ❤️ using Next.js &
        Tailwind CSS.
      </footer>
    </main>
  );
}
