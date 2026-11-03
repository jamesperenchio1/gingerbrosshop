/**
 * Plain-language copy for the home page "Fizz or Tea?" and FAQ sections.
 * Facts only (see CLAUDE.md brand rules): no fermentation or health claims.
 * Delivery, returns and subscription details mirror /shipping, /returns and
 * the Stripe customer portal settings.
 */
import type { Locale } from '@/context/I18nContext';

export interface HomeFaqItem { q: string; a: string }

export const HOME_FAQ: Record<Locale, HomeFaqItem[]> = {
  en: [
    {
      q: 'What does Ginger Fizz taste like?',
      a: 'Sparkling, bright and lime-forward, with a proper ginger kick from fresh Thai ginger. Think a crisp ginger soda that actually tastes of ginger, low in sugar and best served ice-cold.',
    },
    {
      q: 'What is the difference between Ginger Fizz and Ginger Tea?',
      a: 'Ginger Fizz is sparkling and lime-forward. Ginger Tea · Thai Spice is still, rounded and warmly spiced with lemongrass, lime and spices. Both are made with real ginger. Not sure? The Fizz & Tea Duo lets you try both.',
    },
    {
      q: 'How does delivery work, and can I get it cold?',
      a: 'We ship across Thailand by courier, dispatching Monday to Thursday, usually arriving in 2–4 business days. Shipping is ฿100 and free on orders over ฿500. For hot days or longer routes, add cold-chain delivery at checkout (+฿100): your bottles travel in an insulated box with ice packs.',
    },
    {
      q: 'Do I need to keep it in the fridge?',
      a: 'Yes. Keep your bottles refrigerated, serve them ice-cold, and drink before the best-before date printed on the label.',
    },
    {
      q: 'How do subscriptions work?',
      a: 'Ginger Fizz can be delivered weekly, every 2 weeks or monthly, with a lower price locked in. You are charged each time a delivery goes out. Pause for a month, change plan or cancel any time from Manage Subscription in the site footer (you get a login code by email). No cancellation fees.',
    },
    {
      q: 'What if my order arrives damaged?',
      a: 'Tell us within 24 hours of delivery with photos and your order number. We will replace it or refund you.',
    },
  ],
  th: [
    {
      q: 'Ginger Fizz รสชาติเป็นอย่างไร?',
      a: 'ซ่าสดชื่น เปรี้ยวมะนาวนำ และมีความเผ็ดร้อนของขิงไทยสดอย่างชัดเจน เหมือนโซดาขิงที่รสขิงจริง ๆ หวานน้อย อร่อยที่สุดเมื่อแช่เย็นจัด',
    },
    {
      q: 'Ginger Fizz กับ Ginger Tea ต่างกันอย่างไร?',
      a: 'Ginger Fizz เป็นน้ำอัดลมซ่า เปรี้ยวมะนาวนำ ส่วน Ginger Tea · Thai Spice ไม่มีฟอง กลมกล่อม หอมเครื่องเทศ ตะไคร้ และมะนาว ทั้งสองทำจากขิงแท้ ลังเลอยู่ ลองชุด Fizz & Tea Duo ได้ทั้งสองรส',
    },
    {
      q: 'จัดส่งอย่างไร และสั่งแบบแช่เย็นได้ไหม?',
      a: 'เราจัดส่งทั่วประเทศไทยด้วยบริษัทขนส่ง ส่งออกวันจันทร์ถึงพฤหัสบดี โดยปกติถึงใน 2–4 วันทำการ ค่าส่ง ฿100 ฟรีเมื่อสั่งเกิน ฿500 ถ้าอากาศร้อนหรือเส้นทางไกล เลือกส่งแบบ Cold-chain ตอนชำระเงินได้ (+฿100) ขวดจะมาในกล่องกันความร้อนพร้อมน้ำแข็ง',
    },
    {
      q: 'ต้องเก็บในตู้เย็นไหม?',
      a: 'ใช่ เก็บขวดในตู้เย็น เสิร์ฟแบบเย็นจัด และดื่มให้หมดก่อนวันที่ระบุบนฉลาก',
    },
    {
      q: 'สมัครสมาชิกรับสินค้าทำงานอย่างไร?',
      a: 'Ginger Fizz ส่งได้ทุกสัปดาห์ ทุก 2 สัปดาห์ หรือรายเดือน พร้อมราคาที่ถูกกว่าและล็อกราคาไว้ ระบบเรียกเก็บเงินทุกครั้งที่ส่งสินค้า พักได้ 1 เดือน เปลี่ยนแพ็กเกจ หรือยกเลิกได้ทุกเมื่อที่ "จัดการการสมัครสมาชิก" ท้ายเว็บไซต์ (จะได้รับรหัสเข้าสู่ระบบทางอีเมล) ไม่มีค่ายกเลิก',
    },
    {
      q: 'ถ้าสินค้าถึงมือแล้วเสียหายต้องทำอย่างไร?',
      a: 'แจ้งเราภายใน 24 ชั่วโมงหลังได้รับสินค้า พร้อมรูปถ่ายและหมายเลขคำสั่งซื้อ เราจะส่งของใหม่หรือคืนเงินให้',
    },
  ],
};

export const COMPARE_COPY = {
  en: {
    label: 'Fizz or Tea?',
    title: 'Pick your pour.',
    sub: 'Both are made with real ginger and low on sugar, but they drink very differently.',
    fizz: {
      name: 'Ginger Fizz',
      tag: 'Sparkling · Lime-forward · Big ginger kick',
      body: 'Fresh Thai ginger and real lime with a crisp sparkle. The one to pour over lots of ice, pair with spicy food, or use as a mixer.',
      cta: 'Shop Ginger Fizz',
    },
    tea: {
      name: 'Ginger Tea · Thai Spice',
      tag: 'Still · Rounded · Warmly spiced',
      body: 'Real ginger slowly simmered with lemongrass, lime and spices. Smooth rather than fizzy: over ice on a hot afternoon, or gently warmed.',
      cta: 'Shop Ginger Tea',
    },
    forWho: 'Made for anyone who wants a grown-up drink with real flavour: with dinner, after work, or as the base of a mocktail.',
    both: 'Can’t decide? Try both in the Fizz & Tea Duo →',
  },
  th: {
    label: 'Fizz หรือ Tea?',
    title: 'เลือกแก้วที่ใช่',
    sub: 'ทั้งสองรสทำจากขิงแท้และหวานน้อย แต่ดื่มแล้วให้ความรู้สึกต่างกัน',
    fizz: {
      name: 'Ginger Fizz',
      tag: 'ซ่า · เปรี้ยวมะนาวนำ · ขิงจัดจ้าน',
      body: 'ขิงไทยสดกับมะนาวแท้ ซ่ากำลังดี เหมาะกับการเทใส่น้ำแข็งเยอะ ๆ กินคู่อาหารรสจัด หรือใช้เป็นเครื่องดื่มผสม',
      cta: 'ซื้อ Ginger Fizz',
    },
    tea: {
      name: 'Ginger Tea · Thai Spice',
      tag: 'ไม่ซ่า · กลมกล่อม · หอมเครื่องเทศ',
      body: 'ขิงแท้เคี่ยวช้า ๆ กับตะไคร้ มะนาว และเครื่องเทศ นุ่มลื่น ไม่มีฟอง ดื่มกับน้ำแข็งตอนบ่ายร้อน ๆ หรืออุ่นเบา ๆ ก็อร่อย',
      cta: 'ซื้อ Ginger Tea',
    },
    forWho: 'สำหรับคนที่อยากได้เครื่องดื่มที่มีรสชาติจริงจัง กินกับมื้อเย็น หลังเลิกงาน หรือใช้เป็นฐานม็อกเทล',
    both: 'ลังเล? ลองทั้งสองรสในชุด Fizz & Tea Duo →',
  },
} as const;
