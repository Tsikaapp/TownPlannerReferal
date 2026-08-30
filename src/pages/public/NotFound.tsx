import { Link } from 'react-router-dom';
import LogoMark from '@/components/brand/LogoMark';
import { buttonStyles } from '@/components/ui/styles';

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-28 text-center">
      <LogoMark size={72} />
      <p className="mt-8 font-display text-sm font-semibold uppercase tracking-[0.2em] text-gold-600">
        Error 404
      </p>
      <h1 className="mt-3 text-3xl font-bold text-forest-900">We could not find that page</h1>
      <p className="mt-3 text-stone-600">
        The link may be out of date, or the profile may no longer be listed.
      </p>
      <div className="mt-9 flex flex-wrap justify-center gap-3">
        <Link to="/" className={buttonStyles('primary', 'md')}>Back to home</Link>
        <Link to="/directory" className={buttonStyles('outline', 'md')}>Browse the directory</Link>
      </div>
    </div>
  );
}
