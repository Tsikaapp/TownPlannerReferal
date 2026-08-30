import { Loader2 } from 'lucide-react';

export default function Spinner({ label = 'Loading…', className = '' }: { label?: string; className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 text-center ${className}`} role="status">
      <Loader2 className="h-7 w-7 animate-spin text-forest-600" aria-hidden="true" />
      <p className="mt-3 text-sm text-stone-500">{label}</p>
    </div>
  );
}
