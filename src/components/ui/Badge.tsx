import {
  ENQUIRY_STATUS_LABELS, ENQUIRY_STATUS_STYLES,
  REFERRAL_STATUS_LABELS, REFERRAL_STATUS_STYLES,
} from '@/lib/constants';
import type { EnquiryStatus, ReferralStatus } from '@/lib/types';

export function Badge({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${className}`}>
      {children}
    </span>
  );
}

export function ReferralStatusBadge({ status }: { status: ReferralStatus }) {
  return <Badge className={REFERRAL_STATUS_STYLES[status]}>{REFERRAL_STATUS_LABELS[status]}</Badge>;
}

export function EnquiryStatusBadge({ status }: { status: EnquiryStatus }) {
  return <Badge className={ENQUIRY_STATUS_STYLES[status]}>{ENQUIRY_STATUS_LABELS[status]}</Badge>;
}
