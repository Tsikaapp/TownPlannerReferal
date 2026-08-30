export type ButtonVariant = 'primary' | 'gold' | 'outline' | 'onDark' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-forest-700 text-white shadow-sm hover:bg-forest-800 active:bg-forest-900 ' +
    'disabled:bg-forest-700/40',
  gold:
    'bg-gold-500 text-forest-950 shadow-sm hover:bg-gold-400 active:bg-gold-600 ' +
    'disabled:bg-gold-500/40',
  outline:
    'border border-stone-300 bg-white text-forest-800 hover:border-forest-400 ' +
    'hover:bg-forest-50 active:bg-forest-100 disabled:text-stone-400',
  onDark:
    'border border-forest-600 bg-transparent text-white hover:border-gold-500 hover:bg-forest-800 active:bg-forest-700',
  ghost:
    'text-forest-700 hover:bg-forest-50 active:bg-forest-100 disabled:text-stone-400',
  danger:
    'border border-red-200 bg-white text-red-600 hover:bg-red-50 active:bg-red-100',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-9 px-3.5 text-sm gap-1.5 rounded-lg',
  md: 'h-11 px-5 text-sm gap-2 rounded-lg',
  lg: 'h-13 px-7 text-base gap-2.5 rounded-xl',
};

/** Shared button appearance, so <Link> and <button> can look identical. */
export function buttonStyles(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  extra = ''
): string {
  return [
    'inline-flex items-center justify-center font-medium whitespace-nowrap',
    'transition-colors duration-150 disabled:cursor-not-allowed',
    VARIANTS[variant],
    SIZES[size],
    extra,
  ]
    .filter(Boolean)
    .join(' ');
}
