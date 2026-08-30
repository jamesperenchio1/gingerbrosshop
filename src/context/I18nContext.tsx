import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type Locale = 'en' | 'th';

const translations: Record<Locale, Record<string, string>> = {
  en: {
    // Nav
    shop: 'Shop',
    story: 'Story',
    process: 'Process',
    benefits: 'Benefits',
    blog: 'Blog',
    faq: 'FAQ',
    wholesale: 'Wholesale',
    myOrders: 'My Orders',
    trackOrder: 'Track Order',
    shipping: 'Shipping',
    returns: 'Returns',
    privacy: 'Privacy',
    terms: 'Terms',
    contact: 'Contact Us',
    company: 'Company',
    support: 'Support',
    language: 'Language',
    english: 'English',
    thai: 'ไทย',

    // Cart
    cart: 'Cart',
    addToCart: 'Add to Cart',
    subscribeSave: 'Subscribe & Save',
    checkout: 'Checkout',
    subtotal: 'Subtotal',
    shippingAtCheckout: 'Shipping calculated at checkout',
    continueShopping: 'Continue Shopping',
    yourCart: 'Your Cart',
    cartEmpty: 'Your cart is empty',
    startShopping: 'Start shopping',
    freeShippingOver: 'Free shipping on orders over ฿500',
    freeShippingUnlocked: 'You unlocked free shipping',

    // Product status
    inStock: 'In Stock',
    lowStock: 'Low Stock',
    outOfStock: 'Out of Stock',

    // Shop section
    chooseYourBrew: 'Choose Your Brew',
    ourProducts: 'Our Products',
    naturallyBrewed: 'Naturally Brewed in Thailand',
    shopNow: 'Shop Now',
    shopLabel: 'OUR BREWS',
    shopTitle: 'Find Your Brew',

    // Order
    orderSuccess: 'Thank You!',
    orderConfirmed: 'Your order has been confirmed.',
    whatsNext: "What's Next?",
    preparingOrder: "We're preparing your order. You'll receive tracking details once it ships.",
    orderShipped: 'Your Order Has Shipped',

    // Hero
    heroBadge: 'GingerBros · Naturally Brewed in Thailand',
    heroHeadline1: 'Fermented Ginger,',
    heroHeadline2: 'Your Way',
    heroSub: 'A bold ginger kick with fresh lime and 3.5g of prebiotics. Naturally fermented, low in sugar, and made with real ingredients.',
    heroCtaShop: 'Shop the Brews',
    heroCtaStory: 'Our Story',
    heroTrust1: 'Naturally fermented',
    heroTrust2: '<2g sugar',
    heroTrust3: 'Prebiotic fibre',

    // Process
    processLabel: 'THE PROCESS',
    processSectionTitle: 'Naturally Fermented to Perfection',
    step01Days: 'Day 1-2',
    step01Title: 'Ginger & Sugar',
    step01Desc: 'Fresh ginger is grated and combined with raw sugar and filtered water. The ginger bug (our live culture starter) is added to begin the fermentation.',
    step02Days: 'Day 3-4',
    step02Title: 'Natural Ferment',
    step02Desc: 'Wild yeast and beneficial bacteria transform the sugars. Bubbles begin to form as CO₂ develops naturally. The brew develops its signature bite.',
    step03Days: 'Day 5',
    step03Title: 'Condition & Bottle',
    step03Desc: 'The ginger fizz is strained and conditioned for flavor development, then carbonated and bottled.',
    step04Days: 'Ready',
    step04Title: 'Enjoy Cold',
    step04Desc: 'Chill thoroughly before opening. Expect a bright, refreshing pop. Real ginger fizz, naturally fermented and ready to drink.',

    // Benefits
    benefitsLabel: 'WHY GINGER FIZZ',
    benefitsSectionTitle: 'More Than a Drink',
    benefitsSectionSub: 'Thailand grows and exports a huge amount of ginger, ranking among the top producers in the world, but the country barely shows up on the list of places that actually consume it. Thailand\'s ginger industry is built mainly around exporting, not local use. It has been part of Thai food and medicine for centuries, but most of what is grown now leaves the country and gets turned into products elsewhere, often without much of that value returning to the farmers who grew it.\n\nThat is the deeper issue here. The people producing a resource are often not the ones who profit most from it. This is a pattern seen across many raw materials worldwide, not just ginger. Growing something and actually benefiting from it are frequently two very different things. Just something to think about while you drink the fizz....',
    benefit1Title: 'Prebiotic Power',
    benefit1Desc: 'We add acacia tree fibre, one of the most well-researched prebiotic sources available, to actively (and gently) feed your gut bacteria and keep your microbiome thriving.',
    benefit2Title: 'Clean Ingredients',
    benefit2Desc: 'Fresh ginger, water, sugar, acacia fibre. That is it. No numbers on the label you need to Google. Nothing added to extend shelf life or make the colour pop.',
    benefit3Title: 'Steady Energy',
    benefit3Desc: 'No caffeine, no sugar spike, no 3pm crash. The prebiotic fibre feeds your gut bacteria, and a healthy gut regulates energy better than any energy drink.',
    benefit4Title: 'Soothes & Settles',
    benefit4Desc: 'Ginger has been used for gut complaints for thousands of years across Asia. Ours is fresh, fermented, and actually strong enough to feel it working.',
    factStat1: '<2g',
    factLabel1: 'sugar per serve',
    factStat2: 'Naturally',
    factLabel2: 'fermented ginger bug',
    factStat3: 'Prebiotic',
    factLabel3: 'acacia fibre',
    factStat4: '330ml',
    factLabel4: 'real ginger fizz',
    prebioticsLabel: 'WHY PREBIOTICS',
    prebioticsTitle: 'Feed the bacteria. Everything else follows.',
    prebioticsDesc: 'Probiotics add new bacteria. Prebiotics feed the ones already doing the work right now. No new ones. We use acacia tree fibre for its slow and gentle fermentation, a process in which it converts sugars into energy your body can use.',
    prebioticDigestion: 'Digestion',
    prebioticDigestionDetail: 'Acacia fibre slows glucose absorption and smooths digestion, cutting bloating and irregular bowel patterns.',
    prebioticImmunity: 'Immunity',
    prebioticImmunityDetail: 'Over 70% of your immune cells live in the gut. A well-fed microbiome means a better-armed immune system.',
    prebioticEnergy: 'Energy',
    prebioticEnergyDetail: 'Short-chain fatty acids produced by prebiotic fermentation fuel your gut lining and support steady, caffeine-free energy.',
    prebioticMood: 'Mood',
    prebioticMoodDetail: 'The gut-brain axis is real. Your microbiome produces neurotransmitters, and keeping it healthy directly affects how you feel.',

    // Why Acacia Fibre
    whyAcaciaTitle: 'Why Acacia Fibre?',
    acaciaFermentTitle: 'Slow Fermentation',
    acaciaFermentDesc: 'Unlike aggressive prebiotics that cause gas and bloating, acacia ferments slowly throughout the entire colon.',
    acaciaStudiedTitle: 'Clinically Studied',
    acaciaStudiedDesc: 'Randomised trials show acacia fibre increases Bifidobacteria and Lactobacilli — the good guys — within 4 weeks.',
    acaciaGentleTitle: 'Gentle on Everyone',
    acaciaGentleDesc: 'Low FODMAP certified. Works for sensitive stomachs, IBS sufferers, and people new to fibre supplements.',

    // Why Ginger deep-dive
    whyGingerLabel: 'WHY GINGER',
    whyGingerTitle: 'The root that does the work.',
    whyGingerDesc: 'Ginger is not a trend. It is a root that has been used medicinally for over 2,500 years, backed by modern research for digestion, inflammation, and immune support. We use fresh Thai ginger fermented slowly so the active compounds stay intact.',
    gingerDigestiveTitle: 'Digestive Relief',
    gingerDigestiveDesc: 'Gingerol and shogaol — the active compounds in ginger — stimulate gastric emptying and reduce bloating. Studies show ginger can speed stomach emptying by up to 50%',
    gingerInflammationTitle: 'Anti-Inflammatory',
    gingerInflammationDesc: 'Ginger inhibits COX-2 and reduces pro-inflammatory cytokines. Clinical trials show it is as effective as ibuprofen for menstrual pain and osteoarthritis discomfort',
    gingerImmuneTitle: 'Immune Support',
    gingerImmuneDesc: 'Fresh ginger has antiviral and antibacterial properties. Research found ginger extract inhibits respiratory pathogens and stimulates macrophage activity',
    gingerNauseaTitle: 'Nausea & Motion Sickness',
    gingerNauseaDesc: 'Ginger is one of the most studied natural anti-nausea remedies. Multiple RCTs confirm it reduces post-operative and chemotherapy-induced nausea without the drowsiness of conventional drugs',

    // Story
    ourStory: 'Our Story',
    storyLabel: 'OUR STORY',
    storyTitle: 'Brewed with Patience, Served with Pride',
    storyPara1: "GingerBros started with a simple question: why does everything sold as \"healthy\" taste like sh*t? We wanted something that was genuinely good for you, not because it had vitamins added just for the sake of having it, but because the process itself created something nourishing. That search led us to fizz that we know today.",
    storyPara2: "We source our acacia fibre specifically because it's one of the most well-studied prebiotic fibres in existence. Prebiotics and probiotics are NOT the same. Probiotics add new bacteria into your gut. Prebiotics on the other hand, feed the good bacteria already living in your gut, making them more resilient and function much better. When that ecosystem is well-fed, the effects ripple outward:",
    storyBullet1: 'Better digestion and less bloating',
    storyBullet2: 'Stronger immunity — over 70% of immune cells live in the gut',
    storyBullet3: 'Steadier energy without caffeine spikes or crashes',
    storyBullet4: 'Better mineral absorption',
    storyBullet5: 'Helps regulate blood sugar levels and promotes a feeling of fullness for weight management',
    storyBullet6: 'Increases helpful gut bacteria strains like Bifidobacteria and Lactobacilli.',
    storyPara3: "We're based in Thailand, where ginger has been part of everyday cooking and traditional medicine for centuries. Our relationships with local growers mean we get fresh rhizomes harvested at peak potency. That provenance matters. You can 100% taste the difference.",
    storyCtaProcess: 'Learn Our Process',

    // Newsletter
    newsletterTitle: 'First Access',
    newsletterSub: 'New drops, restocks, and exclusive offers — before anyone else.',
    newsletterVerifyHint: 'Verify your email. Get 10% off your first order.',
    newsletterEmailPlaceholder: 'Enter your email',
    newsletterSubscribeBtn: 'Subscribe',
    newsletterSubscribingBtn: 'Sending…',
    newsletterNoSpam: 'No spam. Unsubscribe any time.',
    newsletterCheckInbox: 'Check your inbox',
    newsletterCodeSentTo: 'We sent a 6-digit code to',
    newsletterClaimBtn: 'Claim my 10% off →',
    newsletterVerifyingBtn: 'Verifying…',
    newsletterResendIn: 'Resend in',
    newsletterResend: 'Resend code',
    newsletterDoneTitle: 'Your discount is on its way.',
    newsletterDoneSub: 'Check your inbox for your 10% off code. It\'s valid for 24 hours.',

    // Footer
    footerBrandBlurb: 'Naturally brewed craft ginger fizz from Thailand. Natural fermentation, real ginger, zero shortcuts.',
    footerCopyright: 'All rights reserved.',
  },

  th: {
    // Nav
    shop: 'ร้านค้า',
    story: 'เรื่องราว',
    process: 'กระบวนการ',
    benefits: 'ประโยชน์',
    blog: 'บล็อก',
    faq: 'คำถามที่พบบ่อย',
    wholesale: 'ขายส่ง',
    myOrders: 'คำสั่งซื้อของฉัน',
    trackOrder: 'ติดตามคำสั่งซื้อ',
    shipping: 'การจัดส่ง',
    returns: 'การคืนสินค้า',
    privacy: 'ความเป็นส่วนตัว',
    terms: 'ข้อกำหนด',
    contact: 'ติดต่อเรา',
    company: 'บริษัท',
    support: 'ช่วยเหลือ',
    language: 'ภาษา',
    english: 'English',
    thai: 'ไทย',

    // Cart
    cart: 'ตะกร้า',
    addToCart: 'ใส่ตะกร้า',
    subscribeSave: 'สมัครสมาชิกและประหยัด',
    checkout: 'ชำระเงิน',
    subtotal: 'ยอดรวม',
    shippingAtCheckout: 'ค่าจัดส่งคำนวณที่หน้าชำระเงิน',
    continueShopping: 'เลือกซื้อสินค้าต่อ',
    yourCart: 'ตะกร้าสินค้า',
    cartEmpty: 'ตะกร้าของคุณว่างเปล่า',
    startShopping: 'เริ่มช้อปปิ้ง',
    freeShippingOver: 'จัดส่งฟรีสำหรับคำสั่งซื้อเกิน ฿500',
    freeShippingUnlocked: 'คุณได้รับสิทธิ์จัดส่งฟรี',

    // Product status
    inStock: 'มีสินค้า',
    lowStock: 'สินค้าใกล้หมด',
    outOfStock: 'สินค้าหมด',

    // Shop section
    chooseYourBrew: 'เลือกขิงสปาร์กลิ้งของคุณ',
    ourProducts: 'สินค้าของเรา',
    naturallyBrewed: 'หมักตามธรรมชาติในประเทศไทย',
    shopNow: 'ช้อปเลย',
    shopLabel: 'เครื่องดื่มของเรา',
    shopTitle: 'เลือกเครื่องดื่มของคุณ',

    // Order
    orderSuccess: 'ขอบคุณ!',
    orderConfirmed: 'คำสั่งซื้อของคุณได้รับการยืนยันแล้ว',
    whatsNext: 'ขั้นตอนต่อไป',
    preparingOrder: 'เรากำลังเตรียมคำสั่งซื้อของคุณ คุณจะได้รับรายละเอียดการติดตามเมื่อจัดส่ง',
    orderShipped: 'คำสั่งซื้อของคุณจัดส่งแล้ว',

    // Hero
    heroBadge: 'GingerBros · หมักธรรมชาติในไทย',
    heroHeadline1: 'ขิงหมักธรรมชาติ,',
    heroHeadline2: 'ในแบบฉบับของคุณ',
    heroSub: 'ขิงสดรสเข้มกับมะนาวสดและพรีไบโอติก 3.5 กรัม หมักธรรมชาติ น้ำตาลน้อย ทำจากวัตถุดิบจริง',
    heroCtaShop: 'เลือกซื้อเครื่องดื่ม',
    heroCtaStory: 'เรื่องราวของเรา',
    heroTrust1: 'หมักธรรมชาติ',
    heroTrust2: 'น้ำตาล <2 กรัม',
    heroTrust3: 'ใยอาหารพรีไบโอติก',

    // Process
    processLabel: 'กระบวนการ',
    processSectionTitle: 'หมักธรรมชาติสู่ความสมบูรณ์แบบ',
    step01Days: 'วันที่ 1-2',
    step01Title: 'ขิงและน้ำตาล',
    step01Desc: 'ขูดขิงสดผสมกับน้ำตาลดิบและน้ำกรอง เติม Ginger Bug (หัวเชื้อจุลินทรีย์มีชีวิต) เพื่อเริ่มกระบวนการหมัก',
    step02Days: 'วันที่ 3-4',
    step02Title: 'หมักตามธรรมชาติ',
    step02Desc: 'ยีสต์ธรรมชาติและแบคทีเรียที่มีประโยชน์เปลี่ยนน้ำตาลให้เป็นพลังงาน ฟองก๊าซ CO₂ เริ่มก่อตัวตามธรรมชาติ ขิงสปาร์กลิ้งพัฒนารสชาติที่โดดเด่น',
    step03Days: 'วันที่ 5',
    step03Title: 'บ่มและบรรจุขวด',
    step03Desc: 'กรองและบ่มเพื่อพัฒนารสชาติ จากนั้นอัดก๊าซและบรรจุขวด',
    step04Days: 'พร้อมดื่ม',
    step04Title: 'เสิร์ฟแบบเย็นจัด',
    step04Desc: 'แช่เย็นให้ทั่วก่อนเปิด สัมผัสความสดชื่นและรสชาติที่เต็มอิ่ม ขิงสปาร์กลิ้งแท้ หมักธรรมชาติ พร้อมดื่ม',

    // Benefits
    benefitsLabel: 'ทำไมต้องขิงสปาร์กลิ้ง',
    benefitsSectionTitle: 'มากกว่าแค่เครื่องดื่ม',
    benefitsSectionSub: 'ประเทศไทยผลิตและส่งออกขิงเป็นจำนวนมาก ติดอันดับหนึ่งในผู้ผลิตชั้นนำของโลก แต่กลับแทบไม่ปรากฏในรายชื่อประเทศที่บริโภคขิงมากที่สุด อุตสาหกรรมขิงของไทยส่วนใหญ่มุ่งเน้นการส่งออก ไม่ใช่การบริโภคในประเทศ ขิงเป็นส่วนหนึ่งของอาหารและยาพื้นบ้านไทยมาหลายศตวรรษ แต่ขิงส่วนใหญ่ที่ปลูกได้ถูกส่งออกและแปรรูปในต่างประเทศ โดยที่มูลค่าเพิ่มนั้นไม่ค่อยตกถึงมือเกษตรกรผู้ปลูก\n\nนี่คือประเด็นที่ลึกกว่านั้น คนที่ผลิตทรัพยากรมักไม่ใช่คนที่ได้กำไรสูงสุดจากมัน รูปแบบนี้พบเห็นได้ทั่วโลก ไม่ใช่แค่เรื่องขิง การปลูกสิ่งหนึ่งกับการได้รับประโยชน์จากมันนั้นมักเป็นสองเรื่องที่แตกต่างกัน แค่ฝากไว้ให้คิดตอนดื่มขิงสปาร์กลิ้ง...',
    benefit1Title: 'พลังพรีไบโอติก',
    benefit1Desc: 'เราเติมใยอาหารจากต้นอะคาเซีย แหล่งพรีไบโอติกที่ได้รับการวิจัยดีที่สุดชนิดหนึ่ง เพื่อบำรุงแบคทีเรียในลำไส้อย่างแข็งขัน (และอ่อนโยน) ให้ไมโครไบโอมของคุณแข็งแรง',
    benefit2Title: 'ส่วนผสมที่สะอาด',
    benefit2Desc: 'ขิงสด น้ำ น้ำตาล ใยอาหารอะคาเซีย แค่นั้น ไม่มีตัวเลขบนฉลากที่ต้องเสิร์ชหาความหมาย ไม่มีสารเติมแต่งเพื่อยืดอายุหรือแต่งสี',
    benefit3Title: 'พลังงานสม่ำเสมอ',
    benefit3Desc: 'ไม่มีคาเฟอีน ไม่มีน้ำตาลพุ่ง ไม่มีอาการอ่อนล้าช่วงบ่าย พรีไบโอติกบำรุงแบคทีเรียในลำไส้ และลำไส้ที่แข็งแรงควบคุมพลังงานได้ดีกว่าเครื่องดื่มชูกำลังใดๆ',
    benefit4Title: 'บรรเทาและดูแลระบบย่อยอาหาร',
    benefit4Desc: 'ขิงถูกใช้รักษาอาการทางลำไส้มาหลายพันปีทั่วเอเชีย ของเราสด หมัก และแรงพอที่คุณจะรู้สึกได้จริงๆ',
    factStat1: '<2g',
    factLabel1: 'น้ำตาลต่อขวด',
    factStat2: 'ธรรมชาติ',
    factLabel2: 'หมักด้วยขิงบั๊ก',
    factStat3: 'พรีไบโอติก',
    factLabel3: 'ใยอาหารอะคาเซีย',
    factStat4: '330ml',
    factLabel4: 'ขิงสปาร์กลิ้งแท้',
    prebioticsLabel: 'ทำไมต้องพรีไบโอติก',
    prebioticsTitle: 'บำรุงแบคทีเรีย แล้วทุกอย่างจะตามมา',
    prebioticsDesc: 'โปรไบโอติกเพิ่มแบคทีเรียใหม่ พรีไบโอติกบำรุงแบคทีเรียที่มีอยู่แล้ว เราใช้ใยอาหารอะคาเซียเพราะการหมักที่ช้าและอ่อนโยน ซึ่งแปลงน้ำตาลให้เป็นพลังงานที่ร่างกายใช้ได้',
    prebioticDigestion: 'การย่อยอาหาร',
    prebioticDigestionDetail: 'ใยอาหารอะคาเซียชะลอการดูดซึมน้ำตาลและช่วยให้การย่อยอาหารราบรื่น ลดอาการท้องอืดและลำไส้แปรปรวน',
    prebioticImmunity: 'ภูมิคุ้มกัน',
    prebioticImmunityDetail: 'เซลล์ภูมิคุ้มกันกว่า 70% อยู่ในลำไส้ ไมโครไบโอมที่ได้รับการบำรุงดีหมายถึงระบบภูมิคุ้มกันที่แข็งแกร่งกว่า',
    prebioticEnergy: 'พลังงาน',
    prebioticEnergyDetail: 'กรดไขมันสายสั้นจากการหมักพรีไบโอติกเลี้ยงเยื่อบุลำไส้และให้พลังงานสม่ำเสมอโดยไม่ต้องพึ่งคาเฟอีน',
    prebioticMood: 'อารมณ์',
    prebioticMoodDetail: 'แกนลำไส้-สมองมีอยู่จริง ไมโครไบโอมของคุณผลิตสารสื่อประสาท และการดูแลให้แข็งแรงส่งผลโดยตรงต่อความรู้สึกของคุณ',

    // Why Acacia Fibre
    whyAcaciaTitle: 'ทำไมต้องใยอาหารอะคาเซีย?',
    acaciaFermentTitle: 'หมักอย่างช้าๆ',
    acaciaFermentDesc: 'ต่างจากพรีไบโอติกชนิดเข้มข้นที่มักทำให้ท้องอืดหรือมีแก๊สในกระเพาะ ใยอาหารอะคาเซียหมักอย่างช้าๆ ตลอดทั้งลำไส้ใหญ่',
    acaciaStudiedTitle: 'ผ่านการวิจัยทางคลินิก',
    acaciaStudiedDesc: 'งานวิจัยแบบสุ่มพบว่าใยอาหารอะคาเซียช่วยเพิ่มปริมาณ Bifidobacteria และ Lactobacilli ซึ่งเป็นแบคทีเรียชนิดดีในลำไส้ ได้ภายใน 4 สัปดาห์',
    acaciaGentleTitle: 'อ่อนโยนสำหรับทุกคน',
    acaciaGentleDesc: 'ได้รับการรับรอง Low FODMAP เหมาะสำหรับคนท้องไวต่อสิ่งเร้า ผู้ที่มีภาวะลำไส้แปรปรวน (IBS) และผู้ที่เพิ่งเริ่มทานใยอาหารเสริม',

    // Why Ginger deep-dive
    whyGingerLabel: 'ทำไมต้องขิง',
    whyGingerTitle: 'รากที่ทำงานหนักเพื่อคุณ',
    whyGingerDesc: 'ขิงไม่ใช่แค่กระแส แต่เป็นรากที่ถูกใช้เป็นยามานานกว่า 2,500 ปี และมีงานวิจัยสมัยใหม่รองรับทั้งด้านการย่อยอาหาร การอักเสบ และภูมิคุ้มกัน เราใช้ขิงไทยสดหมักอย่างช้าๆ เพื่อคงสารสำคัญไว้ให้ครบถ้วน',
    gingerDigestiveTitle: 'ช่วยระบบย่อยอาหาร',
    gingerDigestiveDesc: 'สาร Gingerol และ Shogaol ซึ่งเป็นสารออกฤทธิ์ในขิง ช่วยกระตุ้นการบีบตัวของกระเพาะอาหารและลดอาการท้องอืด งานวิจัยพบว่าขิงช่วยให้กระเพาะอาหารย่อยเร็วขึ้นได้ถึง 50%',
    gingerInflammationTitle: 'ต้านการอักเสบ',
    gingerInflammationDesc: 'ขิงยับยั้งเอนไซม์ COX-2 และลดสารที่กระตุ้นการอักเสบในร่างกาย งานวิจัยทางคลินิกพบว่ามีประสิทธิภาพเทียบเท่ายาไอบูโพรเฟนในการบรรเทาอาการปวดประจำเดือนและข้อเข่าเสื่อม',
    gingerImmuneTitle: 'เสริมภูมิคุ้มกัน',
    gingerImmuneDesc: 'ขิงสดมีคุณสมบัติต้านไวรัสและต้านแบคทีเรีย งานวิจัยพบว่าสารสกัดจากขิงช่วยยับยั้งเชื้อโรคทางเดินหายใจและกระตุ้นการทำงานของเม็ดเลือดขาวชนิด Macrophage',
    gingerNauseaTitle: 'บรรเทาอาการคลื่นไส้และเมารถ',
    gingerNauseaDesc: 'ขิงเป็นหนึ่งในสมุนไพรธรรมชาติที่มีงานวิจัยรองรับมากที่สุดในการบรรเทาอาการคลื่นไส้ งานวิจัยแบบ RCT หลายชิ้นยืนยันว่าขิงช่วยลดอาการคลื่นไส้หลังผ่าตัดและจากเคมีบำบัด โดยไม่ทำให้ง่วงซึมเหมือนยาแผนปัจจุบัน',

    // Story
    ourStory: 'เรื่องราวของเรา',
    storyLabel: 'เรื่องราวของเรา',
    storyTitle: 'หมักด้วยความอดทน เสิร์ฟด้วยความภาคภูมิใจ',
    storyPara1: 'GingerBros เริ่มต้นจากคำถามง่ายๆ: ทำไมทุกอย่างที่ขายว่า "เพื่อสุขภาพ" ถึงไม่อร่อย? เราต้องการบางอย่างที่ดีต่อสุขภาพอย่างแท้จริง ไม่ใช่เพราะเติมวิตามินไว้โฆษณา แต่เพราะกระบวนการผลิตสร้างสิ่งที่มีคุณค่าจริงๆ การค้นหานั้นนำเราไปสู่ขิงสปาร์กลิ้งที่เรารู้จักในวันนี้',
    storyPara2: 'เราเลือกใยอาหารอะคาเซียโดยเฉพาะเพราะเป็นหนึ่งในแหล่งพรีไบโอติกที่ได้รับการศึกษาวิจัยมากที่สุด พรีไบโอติกและโปรไบโอติกต่างกัน โปรไบโอติกเพิ่มแบคทีเรียใหม่เข้าสู่ลำไส้ แต่พรีไบโอติกบำรุงแบคทีเรียที่ดีที่มีอยู่แล้วในลำไส้ ทำให้ทนทานและทำงานดีขึ้น เมื่อระบบนิเวศนั้นได้รับการบำรุง ผลดีจะแพร่กระจายออกไป:',
    storyBullet1: 'ระบบย่อยอาหารดีขึ้นและท้องอืดน้อยลง',
    storyBullet2: 'ภูมิคุ้มกันแข็งแกร่งขึ้น — เซลล์ภูมิคุ้มกันกว่า 70% อยู่ในลำไส้',
    storyBullet3: 'พลังงานสม่ำเสมอโดยไม่ต้องพึ่งคาเฟอีน',
    storyBullet4: 'การดูดซึมแร่ธาตุดีขึ้น',
    storyBullet5: 'ช่วยควบคุมระดับน้ำตาลในเลือดและส่งเสริมความอิ่มเพื่อการจัดการน้ำหนัก',
    storyBullet6: 'เพิ่มปริมาณแบคทีเรียที่มีประโยชน์ เช่น Bifidobacteria และ Lactobacilli',
    storyPara3: 'เราอยู่ในประเทศไทย ที่ซึ่งขิงเป็นส่วนหนึ่งของการทำอาหารและยาแผนโบราณมาหลายศตวรรษ ความสัมพันธ์กับเกษตรกรในพื้นที่ทำให้เราได้ขิงสดที่เก็บเกี่ยวในช่วงที่มีคุณค่าสูงสุด แหล่งที่มานั้นสำคัญ คุณสามารถรับรู้ความแตกต่างได้ 100%',
    storyCtaProcess: 'เรียนรู้กระบวนการของเรา',

    // Newsletter
    newsletterTitle: 'สิทธิ์ก่อนใคร',
    newsletterSub: 'เครื่องดื่มใหม่ การเติมสต็อก และโปรโมชั่นพิเศษ — รู้ก่อนคนอื่น',
    newsletterVerifyHint: 'ยืนยันอีเมล รับส่วนลด 10% สำหรับการสั่งซื้อครั้งแรก',
    newsletterEmailPlaceholder: 'กรอกอีเมลของคุณ',
    newsletterSubscribeBtn: 'สมัครรับข้อมูล',
    newsletterSubscribingBtn: 'กำลังส่ง…',
    newsletterNoSpam: 'ไม่มีสแปม ยกเลิกได้ทุกเมื่อ',
    newsletterCheckInbox: 'ตรวจสอบกล่องขาเข้า',
    newsletterCodeSentTo: 'เราส่งรหัส 6 หลักไปที่',
    newsletterClaimBtn: 'รับส่วนลด 10% ของฉัน →',
    newsletterVerifyingBtn: 'กำลังตรวจสอบ…',
    newsletterResendIn: 'ส่งใหม่ใน',
    newsletterResend: 'ส่งรหัสใหม่',
    newsletterDoneTitle: 'ส่วนลดของคุณกำลังมา',
    newsletterDoneSub: 'ตรวจสอบกล่องขาเข้าของคุณสำหรับรหัสส่วนลด 10% ใช้ได้ภายใน 24 ชั่วโมง',

    // Footer
    footerBrandBlurb: 'ขิงสปาร์กลิ้งหมักธรรมชาติจากประเทศไทย ขิงแท้ ไม่มีทางลัด',
    footerCopyright: 'สงวนลิขสิทธิ์',
  },
};

interface I18nContextType {
  locale: Locale;
  t: (key: string) => string;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    try {
      return (localStorage.getItem('gingerbros-locale') as Locale) || 'en';
    } catch {
      return 'en';
    }
  });

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try { localStorage.setItem('gingerbros-locale', l); } catch { /* ignore */ }
    document.documentElement.lang = l;
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === 'en' ? 'th' : 'en');
  }, [locale, setLocale]);

  const t = useCallback(
    (key: string) => translations[locale]?.[key] ?? translations.en[key] ?? key,
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, t, setLocale, toggleLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
