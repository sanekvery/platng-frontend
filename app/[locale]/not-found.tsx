import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  const t = useTranslations('errors.404');

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-8">
        <span className="text-9xl">🔍</span>
      </div>
      <h1 className="mb-4 text-4xl font-bold text-gray-900">{t('title')}</h1>
      <p className="mb-8 max-w-md text-lg text-gray-600">{t('description')}</p>
      <Link href="/">
        <Button variant="primary" size="lg">
          {t('action')}
        </Button>
      </Link>
    </div>
  );
}
