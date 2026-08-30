export interface WordmarkProps {
  tone?: 'color' | 'onDark';
  /** Show the CONNECT · REFER · BUILD strap under the name. */
  tagline?: boolean;
  className?: string;
}

/**
 * PLANLINK set in two weights of the brand colours, with the optional strapline.
 * Kept as text rather than an image so it stays selectable and legible at any
 * size, and so the tagline can be dropped in tight spaces.
 */
export default function Wordmark({ tone = 'color', tagline = false, className = '' }: WordmarkProps) {
  const plan = tone === 'onDark' ? 'text-white' : 'text-forest-700';
  const strap = tone === 'onDark' ? 'text-white/70' : 'text-forest-700/70';

  return (
    <span className={`inline-flex flex-col justify-center leading-none ${className}`}>
      <span className="font-display font-bold tracking-[0.14em] text-[1.05em] leading-none">
        <span className={plan}>PLAN</span>
        <span className="text-gold-500">LINK</span>
      </span>
      {tagline && (
        <span className={`mt-1 font-display text-[0.34em] font-semibold uppercase tracking-[0.3em] ${strap}`}>
          Connect <span className="text-gold-500">·</span> Refer <span className="text-gold-500">·</span> Build
        </span>
      )}
    </span>
  );
}
