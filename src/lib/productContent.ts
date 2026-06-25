/**
 * Editorial content keyed by Stripe product metadata.app_id.
 * Commerce data (name, price, images) lives in Stripe — this is enrichment only.
 * A product works fine without an entry here; it just won't show extra detail sections.
 */

export interface ProductContent {
  headline?: string;
  longDescription?: string;
  video?: string;
  ingredients?: string[];
  specs?: { label: string; value: string }[];
  nutrition?: { label: string; value: string }[];
  features?: string[];
  compatibility?: string[];
  relatedProducts?: string[];
}

export const PRODUCT_CONTENT: Record<string, ProductContent> = {

  // ─── Duotight Ball Lock Disconnects ──────────────────────────────────────

  kl24235: {
    headline: 'Precision push-fit liquid disconnect for 6.35mm beer lines.',
    longDescription:
      'The KL24235 is KegLand\'s most compact liquid ball lock disconnect — engineered for zero-compromise performance. The integrated Duotight push-fit eliminates threaded fittings and hose clamps entirely. Hand-disassemble in seconds for cleaning, reconnect in one motion. Built from engineering polyketone resin with stainless springs and EPDM seals that resist phosphoric acid, caustic soda, and peroxide.',
    features: [
      'Integrated Duotight 6.35mm push-fit — no clamps or fittings required',
      'Tool-free hand disassembly for fast cleaning and sanitizing',
      'Overmoulded poppet rated to 150 psi — zero o-ring blowout risk',
      'Stainless steel springs and ball bearings throughout',
      'Engineering polyketone body — lighter and tougher than ABS',
      'Low-profile form factor — kegs stack while connected',
    ],
    specs: [
      { label: 'SKU', value: 'KL24235' },
      { label: 'Brand', value: 'KegLand / Duotight' },
      { label: 'Line Size', value: '6.35mm (1/4″)' },
      { label: 'Connection', value: 'Ball Lock — Liquid' },
      { label: 'Max Pressure', value: '150 psi' },
      { label: 'Body Material', value: 'Engineering Polyketone Resin' },
      { label: 'Seals', value: 'EPDM and PP/EPDM overmoulded poppet' },
      { label: 'Springs & Bearings', value: 'Stainless Steel' },
      { label: 'Weight', value: '200g' },
    ],
    compatibility: [
      'Compatible with all standard Cornelius ball lock kegs',
      'Designed for EVABarrier 3mm ID × 6.35mm OD tubing',
      'Works with all Duotight push-fit fittings and manifolds',
      'Compatible with CO₂ and mixed gas systems at liquid-out port',
    ],
    relatedProducts: ['kl20763', 'kl24242', 'kl21418', 'kl20756'],
  },

  kl20763: {
    headline: 'High-flow liquid disconnect engineered for 9.5mm draft lines.',
    longDescription:
      'The KL20763 brings Duotight\'s push-fit engineering to 9.5mm liquid lines. The result is a high-flow disconnect that installs without tools and cleans in seconds. The same stainless-and-polyketone construction found in professional draught systems — at a price that makes sense for the homebrewer. Chemical-resistant to every sanitizer you\'ll throw at it.',
    features: [
      'Integrated Duotight 9.5mm (3/8″) push-fit — direct line connection',
      'High-flow internal design for faster, smoother pours',
      'Tool-free hand disassembly — clean and reassemble in under a minute',
      'Overmoulded poppet handles 150 psi without o-ring failure',
      'Chemical resistant to phosphoric acid, caustics, and peroxides',
      'Low-profile stackable design — connect and still stack kegs',
    ],
    specs: [
      { label: 'SKU', value: 'KL20763' },
      { label: 'Brand', value: 'KegLand / Duotight' },
      { label: 'Line Size', value: '9.5mm (3/8″)' },
      { label: 'Connection', value: 'Ball Lock — Liquid' },
      { label: 'Max Pressure', value: '150 psi' },
      { label: 'Body Material', value: 'Engineering Polyketone Resin' },
      { label: 'Seals', value: 'EPDM and PP/EPDM overmoulded poppet' },
      { label: 'Springs & Bearings', value: 'Stainless Steel' },
      { label: 'Weight', value: '200g' },
    ],
    compatibility: [
      'Compatible with all standard Cornelius ball lock kegs',
      'Designed for EVABarrier 6mm ID × 9mm OD tubing',
      'Works with all Duotight push-fit fittings and manifolds',
      'Pairs with KL20770 gas disconnect for a complete keg line set',
    ],
    relatedProducts: ['kl24235', 'kl20770', 'kl21418', 'kl20756'],
  },

  kl24242: {
    headline: 'Compact gas disconnect for 6.35mm CO₂ lines. Engineered for leak-free connections.',
    longDescription:
      'The KL24242 handles the gas side of your keg connection with the same Duotight precision as the rest of the lineup. Push-fit installation, hand-tighten cap, tool-free removal. The overmoulded poppet design means you can connect and disconnect under pressure without risking seal failure — important for high-pressure CO₂ and mixed gas applications.',
    features: [
      'Integrated Duotight 6.35mm push-fit for gas line connection',
      'Rated to 150 psi — handles CO₂ and mixed gas safely',
      'Overmoulded poppet prevents o-ring blowout under pressure',
      'Tool-free hand disassembly for easy maintenance',
      'Stainless steel springs and ball bearings throughout',
      'Low-profile — no added height when kegs are stacked',
    ],
    specs: [
      { label: 'SKU', value: 'KL24242' },
      { label: 'Brand', value: 'KegLand / Duotight' },
      { label: 'Line Size', value: '6.35mm (1/4″)' },
      { label: 'Connection', value: 'Ball Lock — Gas' },
      { label: 'Max Pressure', value: '150 psi' },
      { label: 'Body Material', value: 'Engineering Polyketone Resin' },
      { label: 'Seals', value: 'EPDM and PP/EPDM overmoulded poppet' },
      { label: 'Springs & Bearings', value: 'Stainless Steel' },
      { label: 'Weight', value: '200g' },
    ],
    compatibility: [
      'Compatible with all standard Cornelius ball lock kegs',
      'Designed for EVABarrier 3mm ID × 6.35mm OD gas tubing',
      'Works with CO₂ regulators and gas manifolds using Duotight fittings',
      'Pairs with KL24235 liquid disconnect for a complete 6.35mm keg set',
    ],
    relatedProducts: ['kl24235', 'kl20770', 'kl21418', 'kl20756'],
  },

  kl20770: {
    headline: 'Reliable gas-side disconnect built for 9.5mm CO₂ and mixed gas lines.',
    longDescription:
      'The KL20770 is the gas-side counterpart to the KL20763 liquid disconnect. Push-fit Duotight connection, 150 psi pressure rating, and the same chemical-resistant polyketone construction that makes these disconnects last. Whether you\'re running CO₂, nitrogen, or a mixed gas blend, this disconnect handles it without complaint.',
    features: [
      'Integrated Duotight 9.5mm (3/8″) push-fit gas connection',
      'Pressure-rated to 150 psi for CO₂ and mixed gas applications',
      'Overmoulded poppet — connect and disconnect at pressure safely',
      'Tool-free disassembly in seconds for cleaning',
      'Chemical resistant body: phosphoric acid, caustics, peroxides',
      'Compact — pairs seamlessly with KL20763 for complete keg connections',
    ],
    specs: [
      { label: 'SKU', value: 'KL20770' },
      { label: 'Brand', value: 'KegLand / Duotight' },
      { label: 'Line Size', value: '9.5mm (3/8″)' },
      { label: 'Connection', value: 'Ball Lock — Gas' },
      { label: 'Max Pressure', value: '150 psi' },
      { label: 'Body Material', value: 'Engineering Polyketone Resin' },
      { label: 'Seals', value: 'EPDM and PP/EPDM overmoulded poppet' },
      { label: 'Springs & Bearings', value: 'Stainless Steel' },
      { label: 'Weight', value: '200g' },
    ],
    compatibility: [
      'Compatible with all standard Cornelius ball lock kegs',
      'Designed for EVABarrier 6mm ID × 9mm OD gas tubing',
      'Works with CO₂ regulators and Duotight gas manifolds',
      'Pairs with KL20763 liquid disconnect for a complete 9.5mm keg line set',
    ],
    relatedProducts: ['kl20763', 'kl24242', 'kl21418', 'kl20756'],
  },

  kl20756: {
    headline: 'Professional 8mm gas disconnect — zero-tool clean, leak-free every time.',
    longDescription:
      'The KL20756 is KegLand\'s 8mm gas-side Duotight disconnect — engineered for brewers who run 8mm (5/16″) gas lines. Same construction philosophy as the rest of the Duotight range: polyketone body, stainless internals, EPDM overmoulded poppet. Rated to 150 psi, disassembled by hand, and sized to keep your keg setup as low-profile as possible.',
    features: [
      'Integrated Duotight 8mm (5/16″) push-fit for gas lines',
      '150 psi pressure rating — CO₂ and mixed gas compatible',
      'Hand-disassembly with no tools required for cleaning',
      'Overmoulded poppet prevents seal failure under high pressure',
      'Engineering polyketone resin body — zero ABS plastic',
      'Stainless steel springs and ball bearings for longevity',
    ],
    specs: [
      { label: 'SKU', value: 'KL20756' },
      { label: 'Brand', value: 'KegLand / Duotight' },
      { label: 'Line Size', value: '8mm (5/16″)' },
      { label: 'Connection', value: 'Ball Lock — Gas' },
      { label: 'Max Pressure', value: '150 psi' },
      { label: 'Body Material', value: 'Engineering Polyketone Resin' },
      { label: 'Seals', value: 'EPDM and PP/EPDM overmoulded poppet' },
      { label: 'Springs & Bearings', value: 'Stainless Steel' },
      { label: 'Weight', value: '200g' },
    ],
    compatibility: [
      'Compatible with all standard Cornelius ball lock kegs',
      'Designed for EVABarrier 5mm ID × 8mm OD gas tubing',
      'Works with CO₂ regulators and Duotight gas manifolds',
      'Pairs with 8mm liquid disconnects for a matched keg line set',
    ],
    relatedProducts: ['kl20763', 'kl21418', 'kl24235', 'kl20770'],
  },

  kl21418: {
    headline: 'Dial in perfect pour pressure, keg-side.',
    longDescription:
      'The KL21418 Flow Control Disconnect replaces your standard liquid disconnect with an adjustable flow restrictor built directly into the body. Instead of dialling in line length or tap resistance, you turn a single knob at the keg to control how fast your beverage flows — eliminating foam from over-carbonated or high-gravity pours. The integrated Duotight push-fit means no extra fittings required, and the entire unit hand-disassembles for cleaning.',
    features: [
      'Adjustable flow restrictor built into the ball lock disconnect',
      'Eliminates foam from high-carbonation or gravity pours',
      'Integrated Duotight 8mm push-fit — no extra fittings',
      'Tool-free hand disassembly for full cleaning access',
      'Overmoulded poppet rated to 150 psi',
      'POK injection-moulded body with stainless internals',
      'Low-profile — kegs stay stackable while connected',
    ],
    specs: [
      { label: 'SKU', value: 'KL21418' },
      { label: 'Brand', value: 'KegLand / Duotight' },
      { label: 'Line Size', value: '8mm (5/16″)' },
      { label: 'Connection', value: 'Ball Lock — Liquid (Flow Control)' },
      { label: 'Max Pressure', value: '150 psi' },
      { label: 'Body Material', value: 'POK (Polyketone) injection moulded' },
      { label: 'Seals', value: 'EPDM and PP/EPDM overmoulded poppet' },
      { label: 'Springs & Bearings', value: 'Stainless Steel' },
      { label: 'Weight', value: '200g' },
    ],
    compatibility: [
      'Compatible with all standard Cornelius ball lock kegs',
      'Designed for EVABarrier 5mm ID × 8mm OD liquid tubing',
      'Works with all Duotight push-fit fittings and manifolds',
      'Pairs with any Duotight gas disconnect for a complete keg line set',
    ],
    relatedProducts: ['kl24235', 'kl20763', 'kl20770', 'kl20756'],
  },

  // ─── Cornelius Kegs ───────────────────────────────────────────────────────

  'kl02899': {
    headline: 'Passivated 19L stainless keg with LOW2 oxygen barrier technology. Built to last.',
    longDescription:
      'KegLand\'s 19L ball lock keg is precision-manufactured for homebrewers who won\'t compromise. Robotic orbital welding delivers super-smooth internal seams — easier to clean, harder to contaminate. The matte passivated finish resists rust without the fragility of polished kegs. LOW2 Technology synthetic O-rings provide a higher oxygen barrier than silicone, protecting your carbonation and your beer\'s shelf life from the first fill.',
    features: [
      'Robotic orbital welding — smooth seams, no contamination traps',
      'Passivated matte finish — superior rust protection over economy kegs',
      'LOW2 Technology O-rings — high oxygen barrier for longer freshness',
      'PRV lid with yellow LOW2 O-ring for safe pressure relief',
      'Internal tab compatible with hop bombs and dry additions',
      'Black rubber handles and base — reduces transport damage',
      'Gas and liquid dip tubes, washers, and seals included',
      '130 psi working pressure rating',
    ],
    specs: [
      { label: 'SKU', value: 'KL02899' },
      { label: 'Brand', value: 'KegLand' },
      { label: 'Capacity', value: '19L (5 US Gallons)' },
      { label: 'Material', value: 'Stainless Steel (passivated)' },
      { label: 'Connection', value: 'Ball Lock (gas and liquid posts)' },
      { label: 'Working Pressure', value: '130 psi' },
      { label: 'Diameter', value: '214mm' },
      { label: 'Height', value: '629mm' },
      { label: 'Weight (empty)', value: '5,500g' },
      { label: 'O-Ring Technology', value: 'LOW2 synthetic — high oxygen barrier' },
    ],
    compatibility: [
      'Works with all standard Duotight and John Guest ball lock disconnects',
      'Compatible with Duotight gas and liquid post disconnects',
      'Fits standard kegerator drawers and keg towers',
      'Hop bomb and dry addition tab on internal dip tube',
    ],
    relatedProducts: ['corny-keg-2-5gal', 'pet-keg-4l', 'kl21418', 'kl24235'],
  },

  'corny-keg-2-5gal': {
    headline: 'Compact 9.5L stainless Cornelius keg for small batch brewing and dispensing.',
    longDescription:
      'When a 19L keg is too much, the 2.5 gallon Cornelius keg delivers the same professional ball lock system in a more manageable form. At 9.5L, it fits fridges that full-size kegs won\'t, and the reduced volume makes it ideal for trial batches, sparkling water, cold brew, kombucha, and ginger fizz. 304 stainless construction, 130 psi rated, standard ball lock posts.',
    features: [
      'Compact 9.5L capacity — fits where larger kegs won\'t',
      '304 stainless steel construction throughout',
      'Standard ball lock gas and liquid posts',
      '130 psi working pressure — handles high-carbonation beverages',
      'Ideal for small batch brewing, trials, and specialty drinks',
      'Compatible with all standard ball lock disconnects and line systems',
    ],
    specs: [
      { label: 'Brand', value: 'KegLand / Cornelius' },
      { label: 'Capacity', value: '9.5L (2.5 US Gallons)' },
      { label: 'Material', value: 'Stainless Steel 304' },
      { label: 'Connection', value: 'Ball Lock' },
      { label: 'Working Pressure', value: '130 psi' },
      { label: 'Diameter', value: '8.5 inches (216mm)' },
      { label: 'Height', value: '14.5 inches (368mm)' },
      { label: 'Weight (empty)', value: '3,000g' },
    ],
    compatibility: [
      'Works with all standard ball lock Duotight disconnects',
      'Compatible with standard CO₂ regulators and gas line systems',
      'Fits most compact and undercounter kegerators',
      'Use with KL21418 flow control disconnect for dialled-in pours',
    ],
    relatedProducts: ['kl02899', 'pet-keg-4l', 'kl21418', 'kl24235'],
  },

  'pet-keg-4l': {
    headline: 'Portable pressure-ready keg system for on-the-go dispensing.',
    longDescription:
      'The 4L PCO38 PET keg kit brings professional-grade pressurised dispensing to a format that weighs under 1kg. Built from Oxebar Mono — a high-barrier PET polymer with 3× better oxygen and CO₂ transmission properties than standard PET — it keeps carbonation sharp and shelf life long. The included tapping head kit adds ball lock posts, a dip tube, and a pressure relief valve. Serve directly at events, markets, or wherever a steel keg won\'t go.',
    features: [
      'Oxebar Mono high-barrier PET — 3× better O₂ and CO₂ performance vs standard PET',
      'Rated to 4 bar (65 psi) — suitable for high-carbonation beverages',
      'Up to 6-month shelf life under pressure with proper carbonation',
      'Complete tapping head kit included — ball lock posts, dip tube, PRV',
      'Under 1kg empty — genuinely portable keg dispensing',
      'PCO38 cap standard — food-safe and widely supported',
    ],
    specs: [
      { label: 'SKU', value: 'KB16225-WS01' },
      { label: 'Brand', value: 'KegLand' },
      { label: 'Capacity', value: '4L' },
      { label: 'Material', value: 'Oxebar Mono PET polymer' },
      { label: 'Cap Type', value: 'PCO38' },
      { label: 'Max Pressure', value: '4 bar (65 psi)' },
      { label: 'Diameter', value: '155mm' },
      { label: 'Height', value: '325mm' },
      { label: 'Weight (kit)', value: '~1,000g' },
      { label: 'Shelf Life', value: 'Up to 6 months under CO₂' },
    ],
    compatibility: [
      'Tapping head uses standard ball lock gas and liquid posts',
      'Works with all Duotight ball lock disconnects and line systems',
      'PCO38 cap compatible with KegLand PCO38 caps and carbonation accessories',
      'Suitable for ginger beer, kombucha, cold brew, soda, and craft beverages',
    ],
    relatedProducts: ['kl02899', 'corny-keg-2-5gal', 'kl24235', 'kl20763'],
  },

  // ─── Sanitizer ────────────────────────────────────────────────────────────

  'star-san': {
    headline: 'No-rinse acid sanitizer trusted by brewers worldwide. Sanitize in 30 seconds.',
    longDescription:
      'Star San from Five Star Chemicals is the industry-standard no-rinse sanitizer for homebrewing and professional craft production. Its unique blend of phosphoric acid and dodecylbenzenesulfonic acid creates a low-pH surface coating that eliminates bacteria and wild yeast on contact — without requiring a rinse. Don\'t fear the foam: the fine white foam Star San produces is harmless to your beer and actually helps sanitize hard-to-reach surfaces. A 30-second contact time is all you need. Make up a solution, soak your equipment, and go straight to filling.',
    features: [
      'No-rinse formula — sanitize and fill immediately, no waiting',
      'Works in 30 seconds — minimum contact time at recommended concentration',
      'Don\'t fear the foam — residual foam is harmless to your beer',
      'Highly concentrated — 2oz makes 20 litres of sanitizing solution (1oz per 5 gallons)',
      'pH below 3 destroys bacteria and wild yeast on contact',
      'Unaffected by organic soils — works even on imperfectly clean surfaces',
      'NSF certified, ANSI accredited, SCC accredited',
      'Fully biodegradable — breaks down to phosphate, water, and CO₂',
    ],
    specs: [
      { label: 'Brand', value: 'Five Star Chemicals' },
      { label: 'SKU', value: 'STAR-SAN' },
      { label: 'Type', value: 'Acid-based no-rinse sanitizer' },
      { label: 'Active Ingredients', value: 'Phosphoric acid + dodecylbenzenesulfonic acid' },
      { label: 'Use Concentration', value: '1oz per 5 US gallons (approx. 0.8ml/L)' },
      { label: 'Contact Time', value: '30 seconds minimum' },
      { label: 'Rinse Required', value: 'No' },
      { label: 'Available Sizes', value: '2oz, 8oz, 1 Gallon' },
      { label: 'Certifications', value: 'NSF, ANSI, SCC' },
    ],
    compatibility: [
      'Safe for stainless steel, glass, plastic, rubber, and silicone',
      'Compatible with all fermenter types: conical, bucket, carboy',
      'Safe for kegs, disconnects, taps, tubing, and fittings',
      'Do not use on soft metals (aluminium, galvanised steel)',
    ],
    relatedProducts: ['kl02899', 'corny-keg-2-5gal', 'nukatap-fc', 'kl21418'],
  },

  // ─── Taps ─────────────────────────────────────────────────────────────────

  'nukatap-fc': {
    headline: 'The most sanitary forward-sealing tap available. Flow control built in.',
    longDescription:
      'The NukaTap FC Gen 2 is KegLand\'s most advanced beer faucet. The forward-sealing design keeps the beer line sealed when the tap is closed — meaning no oxygen ingress, no beer drying inside the body, and no bacterial growth between pours. The Gen 2 NukaShuttle is the world\'s first seamless single-piece shuttle: TPV rubber matrix formed directly over a PP skeleton, eliminating every fissure where bacteria traditionally harbour in older tap designs. The adjustable flow control lever on the right side lets you dial in exactly how fast your beer flows — essential for high-carbonation pours, keezer direct-mount setups, and short line lengths where foaming is otherwise unavoidable. The lower thermal mass of the Gen 2 body reduces first-pour foam further still.',
    features: [
      'Forward-sealing design — tap stays sealed when closed, zero oxygen ingress',
      'NukaShuttle Gen 2: seamless single-piece TPV/PP shuttle, no bacterial fissures',
      'Adjustable flow control lever — dial in pour speed at the tap',
      'Laminar flow spout design — smooth, foam-free pours even at high carbonation',
      'Reduced thermal mass vs Gen 1 — less first-pour foam effect',
      'TPV rubber matrix seals tolerate sour beers, kombucha, and acidic beverages',
      'Optional self-closing spring compatible (sold separately)',
      'NSF certified, ANSI accredited, SCC accredited',
      '2.5-degree reverse angle — compatible with a wider range of tap handles',
    ],
    specs: [
      { label: 'SKU', value: 'KL15523' },
      { label: 'Brand', value: 'KegLand / NukaTap' },
      { label: 'Type', value: 'Forward-sealing flow control tap' },
      { label: 'Generation', value: 'Gen 2' },
      { label: 'Body Material', value: 'Stainless Steel 304' },
      { label: 'Shuttle Material', value: 'Seamless TPV/PP overmoulded' },
      { label: 'Thread', value: 'Standard shank thread (Intertap compatible)' },
      { label: 'Handle Angle', value: '2.5° reverse angle' },
      { label: 'Certifications', value: 'NSF, ANSI, SCC' },
      { label: 'Weight', value: '~300g' },
    ],
    compatibility: [
      'Fits all standard shanks with Intertap-compatible threading',
      'Compatible with NukaTap stout spout, ball lock post spout, and growler spouts',
      'Accepts NukaTap FC auto-close spring for hands-free closing',
      'Works with NukaTap FC Gen 2 retrofit shuttle kit for existing Gen 1 owners',
      'Suitable for beer, hard seltzer, kombucha, cold brew, and other beverages',
    ],
    relatedProducts: ['kl02899', 'corny-keg-2-5gal', 'kl21418', 'star-san'],
  },

  // ─── Drink products ───────────────────────────────────────────────────────

  unpasteurized: {
    headline: 'Raw, living ginger fizz with active cultures. Maximum probiotics, maximum flavour.',
    longDescription:
      'Our unpasteurized ginger fizz is ginger fizz in its purest form. After 7 days of natural fermentation, we strain and bottle immediately — no heat treatment, no filtering, no intervention. This means every bottle contains billions of live, active probiotic cultures that continue to develop the flavour over time. The taste is bold, complex, and naturally effervescent. Because it is a living product, it must be kept refrigerated and consumed within 30 days of bottling. The natural sediment you may see is normal — it is the live cultures and ginger particles that make this brew so special.',
    video: '/images/product-unpasteurized.mp4',
    ingredients: ['Fresh Ginger', 'Filtered Water', 'Erythritol', 'Raw Cane Sugar (ferment starter)', 'Live Cultures (Ginger Bug)'],
    specs: [
      { label: 'Volume', value: '330ml per bottle' },
      { label: 'Shelf Life', value: '30 days (refrigerated)' },
      { label: 'Storage', value: 'Keep refrigerated at 2–6°C at all times' },
      { label: 'Serving Temp', value: 'Ice cold (2–4°C)' },
      { label: 'Fermentation', value: '7 days natural ferment' },
      { label: 'Pasteurized', value: 'No — raw and living' },
      { label: 'Origin', value: 'Brewed and bottled in Thailand' },
      { label: 'Dietary', value: 'Vegan, Gluten-Free, Raw, No Artificial Additives' },
    ],
    nutrition: [
      { label: 'Serving Size', value: '330ml' },
      { label: 'Energy', value: '30 kcal' },
      { label: 'Total Carbohydrates', value: '8g' },
      { label: '— Sugars', value: '4g' },
      { label: 'Sweetened with', value: 'Erythritol' },
      { label: 'Sodium', value: '5mg' },
      { label: 'Vitamin B6', value: '0.4mg (24% DV)' },
      { label: 'Vitamin B12', value: '0.6mcg (25% DV)' },
      { label: 'Active Probiotic CFU', value: '1+ billion per bottle' },
    ],
    features: [
      'Low sugar — sweetened with erythritol, not loaded with cane sugar',
      'Raw and unpasteurized — maximum probiotic content',
      'Living cultures continue to develop flavour in the bottle',
      'Bold, complex, naturally effervescent flavour',
      'Billions of active CFUs per serving',
      'Best consumed within 30 days for peak freshness',
    ],
  },

  pasteurized: {
    headline: 'Bold ginger bite, naturally fermented, ready for anywhere.',
    longDescription:
      'Ginger Pop is real fermented ginger fizz — slow-brewed over 7 days the same way as our unpasteurized brew, then sealed to lock in the flavour and let it ship nationwide without a cold chain. The result is a crisp, punchy ginger soda that goes wherever you go: the pantry, the office bag, a road trip, a gift. No fridge. No fuss. Just a clean, bright ginger kick that actually comes from fermentation — not from flavouring.',
    ingredients: ['Fresh Ginger', 'Filtered Water', 'Erythritol', 'Raw Cane Sugar (ferment starter)', 'Live Cultures (Ginger Bug)'],
    specs: [
      { label: 'Volume', value: '330ml per bottle' },
      { label: 'Shelf Life', value: '6 months (unopened, room temperature)' },
      { label: 'Storage', value: 'Store in a cool, dry place. Refrigerate after opening.' },
      { label: 'Serving Temp', value: 'Best served chilled' },
      { label: 'Fermentation', value: '7 days natural ferment, then pasteurized' },
      { label: 'Pasteurized', value: 'Yes — shelf-stable' },
      { label: 'Origin', value: 'Brewed and bottled in Thailand' },
      { label: 'Dietary', value: 'Vegan, Gluten-Free, No Artificial Additives' },
    ],
    nutrition: [
      { label: 'Serving Size', value: '330ml' },
      { label: 'Energy', value: '25 kcal' },
      { label: 'Total Carbohydrates', value: '7g' },
      { label: '— Sugars', value: '3g' },
      { label: 'Sweetened with', value: 'Erythritol' },
      { label: 'Sodium', value: '5mg' },
      { label: 'Vitamin B6', value: '0.3mg (18% DV)' },
    ],
    features: [
      'Bold, crisp ginger flavour from a real 7-day ferment',
      'Low sugar — sweetened with erythritol',
      'No fridge needed — store at room temperature',
      'Ships nationwide, no cold chain required',
      'Perfect for the pantry, the office, or gifting',
      'Clean label, no artificial additives',
    ],
  },
};

export function getProductContent(appId: string | undefined): ProductContent {
  return (appId && PRODUCT_CONTENT[appId]) || {};
}
