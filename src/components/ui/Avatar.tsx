import { avatarTone, initials } from '@/lib/format';

const TONES = [
  'bg-forest-100 text-forest-700',
  'bg-gold-100 text-gold-800',
  'bg-forest-700 text-white',
  'bg-stone-200 text-stone-700',
  'bg-gold-500 text-forest-950',
];

const SIZES = { sm: 'h-9 w-9 text-xs', md: 'h-12 w-12 text-sm', lg: 'h-20 w-20 text-xl' };

export default function Avatar({
  name, seed, size = 'md', className = '',
}: {
  name: string;
  /** Keeps the colour stable across renders; defaults to the name. */
  seed?: string;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const tone = TONES[avatarTone(seed || name || '?')];
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-display font-semibold tracking-wide ${tone} ${SIZES[size]} ${className}`}
    >
      {initials(name)}
    </span>
  );
}
