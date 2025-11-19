import Link from 'next/link';

export default function GlobalNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="mb-8">
        <span className="text-9xl">🔍</span>
      </div>
      <h1 className="mb-4 text-4xl font-bold text-gray-900">Page Not Found</h1>
      <p className="mb-8 max-w-md text-lg text-gray-600">
        Sorry, we couldn&apos;t find the page you&apos;re looking for.
      </p>
      <Link
        href="/en"
        className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
      >
        Go to Homepage
      </Link>
    </div>
  );
}
