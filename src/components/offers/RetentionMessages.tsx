import { Smartphone, Bell, Mail } from 'lucide-react';
import { customerById } from '@/data/customers';
import { recommendedHeadline } from '@/data/offers';

export function RetentionMessages({ customerId }: { customerId: string }) {
  const cust = customerById(customerId);
  const headline = recommendedHeadline[customerId] ?? '';

  const sms = `Hi ${cust.name.split(' ')[0]} — we noticed service in ${cust.location} hasn't been at our usual standard. We're already on it. As a thank-you for staying with us, your next 6 bills are £5 lower. Reply STOP to opt out. ${cust.brand} UK.`;
  const push = `${cust.brand} · Service update — Apologies for issues in ${cust.location}. Your account has a £5 monthly credit applied for 6 months. Tap to view your refreshed plan.`;
  const email = {
    subject: `${cust.name.split(' ')[0]}, an update on your ${cust.brand} service`,
    preview: `We've spotted slower-than-usual speeds in ${cust.location} and we're working on it. We've added a loyalty credit to your account...`,
  };

  return (
    <div className="vf-card p-4">
      <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold mb-3">Activation preview · what {cust.name.split(' ')[0]} would see</div>
      <div className="grid sm:grid-cols-3 gap-3">
        {/* SMS mockup */}
        <div className="rounded-2xl border border-mist-dark p-3 bg-mist">
          <div className="flex items-center gap-2 mb-2 text-ink-muted text-xs"><Smartphone className="w-3.5 h-3.5" /> SMS</div>
          <div className="bg-white rounded-xl p-3 text-xs leading-relaxed shadow-sm">
            <div className="font-bold text-ink mb-1">{cust.brand} UK</div>
            <div className="text-ink">{sms}</div>
          </div>
        </div>
        {/* Push mockup */}
        <div className="rounded-2xl border border-mist-dark p-3 bg-mist">
          <div className="flex items-center gap-2 mb-2 text-ink-muted text-xs"><Bell className="w-3.5 h-3.5" /> In-app push</div>
          <div className="bg-white rounded-xl p-3 text-xs leading-relaxed shadow-sm border border-mist-dark">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-5 h-5 rounded bg-vfRed text-white grid place-items-center text-[9px] font-bold">V3</div>
              <div className="text-[10px] text-ink-muted">My {cust.brand} · now</div>
            </div>
            <div className="text-ink">{push}</div>
          </div>
        </div>
        {/* Email mockup */}
        <div className="rounded-2xl border border-mist-dark p-3 bg-mist">
          <div className="flex items-center gap-2 mb-2 text-ink-muted text-xs"><Mail className="w-3.5 h-3.5" /> Email</div>
          <div className="bg-white rounded-xl p-3 text-xs leading-relaxed shadow-sm">
            <div className="text-[10px] text-ink-muted">From: customercare@{cust.brand.toLowerCase()}.co.uk</div>
            <div className="font-bold text-ink mt-1">{email.subject}</div>
            <div className="text-ink-muted mt-1">{email.preview}</div>
          </div>
        </div>
      </div>
      <div className="mt-3 text-[10px] text-ink-muted">Headline action: {headline}</div>
    </div>
  );
}
