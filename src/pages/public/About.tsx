import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { buttonStyles } from '@/components/ui/styles';

const FAQS = [
  {
    q: 'Do I need an account to refer someone?',
    a: 'No. The referral form is open to anyone. Fill it in, send it, and the professional gets the detail straight away. If you later create an account with the same email address, every referral you sent from that address appears in your history automatically.',
  },
  {
    q: 'Why do I have to sign in to see referral detail?',
    a: 'Referrals carry someone else\'s personal information — their name, contact details and what they need help with. That is only ever visible to the person who sent the referral, the professional it was addressed to, and an administrator. Signing in is how we know which of those you are.',
  },
  {
    q: 'What does it cost?',
    a: 'PlanLink is a directory and a referral record. It does not process payments, hold funds, or take a cut of any work that results from a referral. Any fee arrangement is a private matter between the professionals involved.',
  },
  {
    q: 'Who can see my profile?',
    a: 'Your name, practice, discipline, location, biography and services are public so clients can find you. Your email address and phone number are only shown to signed-in members. You can unlist your profile entirely at any time from your profile settings.',
  },
  {
    q: 'I am not a planner. Can I still join?',
    a: 'Yes. Architects, land surveyors, civil and traffic engineers, environmental and heritage consultants, quantity surveyors, conveyancers and developers all work on the same projects, and referrals move in every direction.',
  },
  {
    q: 'What happens to an open referral?',
    a: 'If you do not choose a specific professional, the referral goes to an administrator who routes it to someone suitable for the discipline and province. You will see it in your history either way.',
  },
];

export default function About() {
  return (
    <>
      <section className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:py-20">
          <h1 className="text-3xl font-bold text-forest-900 sm:text-4xl">How PlanLink works</h1>
          <p className="mt-4 text-lg leading-relaxed text-stone-600">
            PlanLink connects town planners with the architects, surveyors,
            engineers and consultants they work alongside — and with the clients
            looking for them. Refer work out, take work in, and keep a record of
            both.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:py-20">
        <h2 className="text-2xl font-bold text-forest-900">Common questions</h2>
        <dl className="mt-10 divide-y divide-stone-200">
          {FAQS.map(({ q, a }) => (
            <div key={q} className="py-7 first:pt-0">
              <dt className="font-display text-lg font-semibold text-forest-900">{q}</dt>
              <dd className="mt-3 leading-relaxed text-stone-600">{a}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link to="/join" className={buttonStyles('primary', 'lg')}>
            Create an account
            <ArrowRight className="h-4.5 w-4.5" aria-hidden="true" />
          </Link>
          <Link to="/directory" className={buttonStyles('outline', 'lg')}>
            Browse the directory
          </Link>
        </div>
      </section>
    </>
  );
}
