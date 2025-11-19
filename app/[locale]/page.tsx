import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';

export default async function HomePage() {
  const t = await getTranslations('home');
  const tnav = await getTranslations('nav');

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-6xl">
            {t('hero.title')}
          </h1>
          <p className="mt-6 text-lg text-gray-600">
            {t('hero.subtitle')}
          </p>

          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/discover"
              className="rounded-lg bg-brand-primary px-8 py-3 font-semibold text-white shadow-lg transition-all hover:bg-brand-primary/90 hover:shadow-xl"
            >
              {t('hero.browseEvents')}
            </Link>
            <Link
              href="/login"
              className="rounded-lg border-2 border-brand-primary px-8 py-3 font-semibold text-brand-primary transition-all hover:bg-brand-primary hover:text-white"
            >
              {tnav('login')}
            </Link>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            <div className="rounded-xl bg-white p-6 shadow-md">
              <div className="text-4xl">🎭</div>
              <h3 className="mt-4 font-semibold">{tnav('discover')}</h3>
              <p className="mt-2 text-sm text-gray-600">
                Find amazing events happening near you
              </p>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-md">
              <div className="text-4xl">❤️</div>
              <h3 className="mt-4 font-semibold">Save</h3>
              <p className="mt-2 text-sm text-gray-600">
                Bookmark your favorite events for later
              </p>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-md">
              <div className="text-4xl">🎫</div>
              <h3 className="mt-4 font-semibold">Book</h3>
              <p className="mt-2 text-sm text-gray-600">
                Get your tickets quickly and securely
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
