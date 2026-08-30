import { Link } from 'react-router-dom';
import LogoMark from './LogoMark';
import Wordmark from './Wordmark';

export interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  tone?: 'color' | 'onDark';
  /** Background behind the mark, so the hairline between the hands matches. */
  halo?: string;
  tagline?: boolean;
  /** Render as a link to the given path. Omit for a plain, non-interactive mark. */
  to?: string;
  className?: string;
}

const SIZES = {
  sm: { mark: 34, text: 'text-base', gap: 'gap-2.5', rule: 'h-7' },
  md: { mark: 44, text: 'text-xl', gap: 'gap-3', rule: 'h-9' },
  lg: { mark: 64, text: 'text-3xl', gap: 'gap-4', rule: 'h-14' },
} as const;

/** The full PlanLink lockup: mark, gold rule, wordmark. */
export default function Logo({
  size = 'md',
  tone = 'color',
  halo = '#ffffff',
  tagline = false,
  to,
  className = '',
}: LogoProps) {
  const s = SIZES[size];
  const inner = (
    <>
      <LogoMark size={s.mark} tone={tone} halo={halo} title="PlanLink" />
      <span className={`${s.rule} w-px shrink-0 bg-gold-500/60`} aria-hidden="true" />
      <Wordmark tone={tone} tagline={tagline} className={s.text} />
    </>
  );

  const classes = `inline-flex items-center ${s.gap} ${className}`;

  if (to) {
    return (
      <Link to={to} className={`${classes} rounded-lg transition-opacity hover:opacity-85`} aria-label="PlanLink home">
        {inner}
      </Link>
    );
  }
  return <span className={classes}>{inner}</span>;
}
