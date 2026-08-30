import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import type { ReactNode } from 'react';

const TONES = {
  error: { box: 'bg-red-50 text-red-800 ring-red-200', Icon: AlertCircle, icon: 'text-red-500' },
  success: { box: 'bg-forest-50 text-forest-800 ring-forest-200', Icon: CheckCircle2, icon: 'text-forest-600' },
  info: { box: 'bg-gold-50 text-gold-900 ring-gold-200', Icon: Info, icon: 'text-gold-600' },
};

export default function Alert({
  tone = 'info', title, children, className = '',
}: {
  tone?: keyof typeof TONES;
  title?: string;
  children?: ReactNode;
  className?: string;
}) {
  const { box, Icon, icon } = TONES[tone];
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`flex gap-3 rounded-xl px-4 py-3 text-sm ring-1 ring-inset ${box} ${className}`}
    >
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${icon}`} aria-hidden="true" />
      <div className="min-w-0">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={title ? 'mt-0.5' : ''}>{children}</div>}
      </div>
    </div>
  );
}
