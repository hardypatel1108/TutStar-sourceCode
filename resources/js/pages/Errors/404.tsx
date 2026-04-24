import { Head, Link } from "@inertiajs/react";

export default function Error404() {
  return (
    <>
      <Head title="404 - Page Not Found" />

      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-center px-4">
        <h1 className="text-7xl font-bold text-gray-800">404</h1>
        <p className="mt-4 text-xl text-gray-600">
          Sorry, the page you are looking for does not exist.
        </p>

        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700 transition"
        >
          Go Home
        </Link>
      </div>
    </>
  );
}