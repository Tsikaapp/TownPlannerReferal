import { ArrowRight, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import Avatar from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import type { Profile } from '@/lib/types';

export default function ProfessionalCard({ pro }: { pro: Profile }) {
  const place = [pro.city, pro.province].filter(Boolean).join(', ');

  return (
    <li className="group relative flex flex-col rounded-2xl border border-stone-200 bg-white p-6 shadow-card transition-all hover:border-forest-300 hover:shadow-lift">
      <div className="flex items-start gap-4">
        <Avatar name={pro.fullName} seed={pro.id} size="md" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-forest-900">
            {/* Stretched link so the whole card is one target. */}
            <Link to={`/directory/${pro.id}`} className="after:absolute after:inset-0 after:content-['']">
              {pro.fullName}
            </Link>
          </h3>
          {pro.company && <p className="truncate text-sm text-stone-500">{pro.company}</p>}
        </div>
      </div>

      {pro.profession && (
        <div className="mt-4">
          <Badge className="bg-forest-50 text-forest-700 ring-forest-200">{pro.profession}</Badge>
        </div>
      )}

      {pro.bio && (
        <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-stone-600">{pro.bio}</p>
      )}

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-stone-100 pt-4 text-sm">
        <span className="flex min-w-0 items-center gap-1.5 text-stone-500">
          <MapPin className="h-4 w-4 shrink-0 text-stone-400" aria-hidden="true" />
          <span className="truncate">{place || 'Location not given'}</span>
        </span>
        <span className="flex shrink-0 items-center gap-1 font-medium text-forest-700 transition-transform group-hover:translate-x-0.5">
          View
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
    </li>
  );
}
