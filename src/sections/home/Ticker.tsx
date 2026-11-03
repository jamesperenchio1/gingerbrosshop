import { useI18n } from '@/context/I18nContext';

/** Scrolling strip of the facts we stand behind. Static for reduced motion. */
export default function Ticker() {
  const { t } = useI18n();
  const items = ['heroTrust1', 'heroTrust2', 'heroTrust3', 'tickerExtra1', 'tickerExtra2', 'tickerExtra3'].map(t);
  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {items.map((label) => (
        <li key={label} className="flex items-center gap-6 px-6 font-poster text-[1.6rem] text-charcoal md:text-[2rem]">
          {label}
          <span aria-hidden="true" className="text-[1.2rem]">✦</span>
        </li>
      ))}
    </ul>
  );
  return (
    <div className="overflow-hidden border-y-2 border-charcoal bg-ginger py-3.5">
      <div className="flex w-max animate-marquee motion-reduce:animate-none">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
