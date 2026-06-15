import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft,
  ArrowRight,
  ChefHat,
  Heart,
  Leaf,
  Sparkles,
  FlaskConical,
  Search,
  Clock,
  Calendar,
  Tag as TagIcon,
  Mountain,
  X,
  Flame,
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SEO from '@/components/SEO';
import Newsletter from '@/components/Newsletter';

gsap.registerPlugin(ScrollTrigger);

type Category = 'Recipe' | 'Health' | 'Brewing' | 'Culture' | 'Guide';

interface Post {
  slug: string;
  title: string;
  excerpt: string;
  category: Category;
  readTime: string;
  icon: typeof ChefHat;
  date: string;
  author: string;
  tags: string[];
  featured?: boolean;
  image?: string;
  content: string;
}

const CATEGORY_META: Record<
  Category,
  { icon: typeof ChefHat; gradient: string; ring: string; chip: string }
> = {
  Recipe: {
    icon: ChefHat,
    gradient: 'from-amber/35 via-soft-peach/30 to-rust/15',
    ring: 'text-rust',
    chip: 'bg-amber/20 text-rust',
  },
  Health: {
    icon: Heart,
    gradient: 'from-accent-green/30 via-pale-amber/25 to-amber/15',
    ring: 'text-accent-green',
    chip: 'bg-accent-green/15 text-accent-green',
  },
  Brewing: {
    icon: FlaskConical,
    gradient: 'from-rust/30 via-amber/20 to-deep-brown/15',
    ring: 'text-rust',
    chip: 'bg-rust/15 text-rust',
  },
  Culture: {
    icon: Mountain,
    gradient: 'from-soft-peach/45 via-pale-amber/30 to-warm-gold/15',
    ring: 'text-warm-gold',
    chip: 'bg-warm-gold/15 text-warm-gold',
  },
  Guide: {
    icon: Leaf,
    gradient: 'from-pale-amber/45 via-amber/25 to-accent-green/15',
    ring: 'text-rust',
    chip: 'bg-pale-amber/40 text-rust',
  },
};

const POSTS: Post[] = [
  {
    slug: 'art-of-the-ginger-bug',
    title: 'The Art of the Ginger Bug: How We Brew Living Fizz',
    excerpt:
      'Step inside our Chiang Mai brewhouse for a look at the wild ferment that powers every bottle — from raw rhizome to bubbling, living soda.',
    category: 'Brewing',
    readTime: '7 min',
    icon: FlaskConical,
    date: '2026-06-02',
    author: 'Nong, Head Brewer',
    tags: ['fermentation', 'process', 'behind the scenes'],
    featured: true,
    image: '/images/story-brewing.webp',
    content: `Every bottle of GingerBros begins with something most people throw away: a knob of fresh ginger, a spoon of sugar, and a little patience. We call it the ginger bug, and it is the wild, living heart of our brew.

## What exactly is a ginger bug?

A ginger bug is a natural starter culture — a colony of wild yeasts and beneficial bacteria that live on the skin of fresh ginger. Feed them sugar and water, and within a week they wake up, multiply, and start producing carbon dioxide. That CO2 is what gives our fizz its natural sparkle. No injected carbonation, no shortcuts.

Think of it like a sourdough starter, but for soda.

## Day by day in the brewhouse

Our 7-day process is slow on purpose. Here is roughly how a batch moves through our Chiang Mai brewhouse:

• Day 1 — We grate fresh, organic Thai ginger and combine it with filtered water and a measured amount of cane sugar.
• Day 2 to 3 — The wild cultures bloom. Tiny bubbles cling to the side of the vessel. The smell turns bright and peppery.
• Day 4 to 5 — Fermentation hits full stride. The ginger bug eats most of the sugar, leaving behind complexity instead of sweetness.
• Day 6 — We taste, adjust, and balance each batch by hand.
• Day 7 — Bottling day. The fizz is alive, lightly tart, and unmistakably gingery.

## Why we never pasteurize

Heat kills. That is the whole point of pasteurization — it extends shelf life by destroying microorganisms. The problem is that those same microorganisms are the probiotic cultures people actually want.

> We would rather sell a living drink that needs refrigeration than a dead one that lasts forever on a warm shelf.

That choice shapes everything: how we ship, how we store, and why our fizz tastes nothing like a mass-market can.

## The takeaway

Great fizz is not manufactured — it is cultivated. When you crack open a bottle of GingerBros, you are tasting a week of patient, living chemistry. That is worth slowing down for.`,
  },
  {
    slug: 'moscow-mule',
    title: 'The Perfect Moscow Mule with GingerBros',
    excerpt:
      'Why our 7-day fermented ginger fizz makes the best Moscow Mule you have ever tasted — and the copper-mug ritual that goes with it.',
    category: 'Recipe',
    readTime: '3 min',
    icon: ChefHat,
    date: '2026-05-28',
    author: 'The GingerBros Kitchen',
    tags: ['cocktail', 'vodka', 'classic'],
    image: '/images/product-unpasteurized-2.jpg',
    content: `A great Moscow Mule starts with great ginger fizz. Our 7-day naturally fermented brew brings a depth of flavor that mass-market ginger sodas simply cannot match.

## Ingredients

• 60ml vodka
• 15ml fresh lime juice
• GingerBros Unpasteurized Ginger Fizz
• Lime wedge and mint for garnish

## Instructions

Fill a copper mug with ice. Add vodka and lime juice. Top with GingerBros. Stir gently and garnish.

The natural fermentation gives our unpasteurized ginger fizz a subtle funk and complexity that elevates this classic cocktail from good to unforgettable.

> Pro tip: a chilled copper mug is not just for looks — the metal keeps your mule colder, longer, and the cold accentuates the ginger snap.`,
  },
  {
    slug: 'dark-and-stormy',
    title: 'Dark ’n’ Stormy with a Thai Ginger Kick',
    excerpt: 'A rum-forward classic gets brighter with fresh, fiery Thai ginger and live-culture fizz.',
    category: 'Recipe',
    readTime: '3 min',
    icon: ChefHat,
    date: '2026-05-20',
    author: 'The GingerBros Kitchen',
    tags: ['cocktail', 'rum', 'classic'],
    content: `The Dark ’n’ Stormy is Bermuda’s national drink for a reason: dark rum and ginger fizz were made for each other. Our version swaps the usual soda for GingerBros, so you get real ginger heat and natural carbonation.

## Ingredients

• 60ml dark rum (Gosling’s Black Seal is traditional)
• 120ml GingerBros Unpasteurized Ginger Fizz
• 10ml fresh lime juice
• Lime wheel and candied ginger for garnish

## Instructions

Fill a tall glass with ice. Pour in the rum and lime juice. Top with GingerBros and stir once. Float the lime wheel on top.

Pro tip: The live cultures in our unpasteurized ginger fizz add a faint tartness that cuts through the rum’s sweetness beautifully.`,
  },
  {
    slug: 'ginger-margarita',
    title: 'Ginger Fizz Margarita',
    excerpt: 'Tequila, lime, and fiery ginger fizz come together in a refreshingly different margarita.',
    category: 'Recipe',
    readTime: '4 min',
    icon: ChefHat,
    date: '2026-05-12',
    author: 'The GingerBros Kitchen',
    tags: ['cocktail', 'tequila', 'spicy'],
    content: `Margarita night just got an upgrade. Replacing part of the orange liqueur with ginger fizz gives this cocktail a spicy backbone and lighter body.

## Ingredients

• 45ml blanco tequila
• 30ml fresh lime juice
• 15ml triple sec or orange liqueur
• 60ml GingerBros Unpasteurized Ginger Fizz
• Salt rim and jalapeño slice (optional)

## Instructions

Rim a rocks glass with salt and fill with ice. Shake tequila, lime juice, and triple sec with ice, then strain into the glass. Top with GingerBros and garnish.

The result is tart, spicy, and dangerously drinkable — perfect for tropical afternoons.`,
  },
  {
    slug: 'spicy-ginger-lemonade',
    title: 'Spicy Ginger Lemonade (Zero-Proof)',
    excerpt: 'A bright, alcohol-free refresher that still feels like a special occasion.',
    category: 'Recipe',
    readTime: '3 min',
    icon: ChefHat,
    date: '2026-05-05',
    author: 'The GingerBros Kitchen',
    tags: ['mocktail', 'zero-proof', 'citrus'],
    content: `Not every great drink needs alcohol. This zero-proof lemonade leans on real ginger heat and fresh citrus for a drink that wakes up your palate.

## Ingredients

• 30ml fresh lemon juice
• 15ml honey or simple syrup
• 120ml GingerBros Unpasteurized Ginger Fizz
• Lemon wheel and fresh mint

## Instructions

Shake lemon juice and honey with ice until chilled. Strain into an ice-filled glass. Top with GingerBros and garnish.

It is crisp, naturally effervescent, and low in sugar compared to most lemonades — especially if you let the ginger do most of the flavor work.`,
  },
  {
    slug: 'ginger-glazed-chicken',
    title: 'Ginger Fizz Glazed Chicken Wings',
    excerpt: 'Reduce GingerBros into a sticky, spicy glaze for oven or grill.',
    category: 'Recipe',
    readTime: '5 min',
    icon: ChefHat,
    date: '2026-04-26',
    author: 'The GingerBros Kitchen',
    tags: ['food', 'glaze', 'dinner'],
    content: `Ginger fizz is not just for drinking. Reduce it down and it becomes a tangy, caramelized glaze that works on wings, tofu, or roasted vegetables.

## Ingredients

• 500g chicken wings (or firm tofu cubes)
• 240ml GingerBros Unpasteurized Ginger Fizz
• 2 tbsp soy sauce
• 1 tbsp honey
• 1 tsp grated fresh ginger
• 2 cloves garlic, minced
• Sesame seeds and sliced scallions for garnish

## Instructions

Simmer GingerBros, soy sauce, honey, ginger, and garlic in a small saucepan until reduced by half and syrupy. Toss wings in half the glaze and bake at 200°C for 25–30 minutes, turning once. Brush with remaining glaze and broil for 2–3 minutes.

The live cultures cook off, but the real ginger flavor stays intense.`,
  },
  {
    slug: 'ginger-affogato-float',
    title: 'Ginger Fizz Affogato Float',
    excerpt: 'A grown-up dessert: cold ginger fizz poured over vanilla ice cream and a shot of espresso.',
    category: 'Recipe',
    readTime: '2 min',
    icon: ChefHat,
    date: '2026-04-18',
    author: 'The GingerBros Kitchen',
    tags: ['dessert', 'coffee', 'float'],
    content: `When you cannot decide between dessert, coffee, and a cold drink, make all three at once. This float is the GingerBros answer to a sweltering afternoon.

## Ingredients

• 2 scoops vanilla bean ice cream
• 1 shot hot espresso
• 120ml chilled GingerBros Unpasteurized Ginger Fizz
• Grated dark chocolate or candied ginger to finish

## Instructions

Drop the ice cream into a tall glass. Pour the hot espresso over the top so it starts to melt. Slowly top with cold ginger fizz — it will foam dramatically — and finish with grated chocolate.

The contrast of hot, cold, bitter, sweet, and spicy in a single spoonful is the whole point. Eat it fast before it melts.`,
  },
  {
    slug: 'gut-health',
    title: 'Ginger Fizz & Gut Health: What You Should Know',
    excerpt: 'The science behind ginger, fermentation, and why your gut loves unpasteurized ginger fizz.',
    category: 'Health',
    readTime: '5 min',
    icon: Heart,
    date: '2026-06-08',
    author: 'GingerBros Wellness',
    tags: ['gut health', 'probiotics', 'science'],
    featured: true,
    content: `Ginger has been used for digestive health for thousands of years. Modern research confirms what traditional medicine has long known.

## The compounds that do the work

Ginger contains compounds called gingerols and shogaols that have anti-inflammatory and antioxidant effects. These compounds can help:

• Reduce nausea and motion sickness
• Support healthy digestion
• Reduce bloating and gas
• Support a healthy inflammatory response

## Where the live cultures come in

Our unpasteurized ginger fizz goes a step further by delivering live probiotic cultures from our natural fermentation process. These beneficial bacteria can help support a healthy gut microbiome.

> Keep in mind: the probiotic benefits only apply to unpasteurized ginger fizz. Pasteurized versions have had the live cultures heated away.

If gut health is your goal, the label matters more than the marketing. Look for the word "unpasteurized" and keep it cold.`,
  },
  {
    slug: 'probiotics-prebiotics',
    title: 'Probiotics vs Prebiotics: A Simple Guide',
    excerpt: 'Learn the difference and how to pair unpasteurized ginger fizz with gut-friendly foods.',
    category: 'Guide',
    readTime: '4 min',
    icon: Leaf,
    date: '2026-05-30',
    author: 'GingerBros Wellness',
    tags: ['gut health', 'nutrition', 'guide'],
    content: `Probiotics are live microorganisms that add to the population of beneficial bacteria in your gut. Prebiotics are the fibers that feed them.

## Probiotics: the seed

Unpasteurized ginger fizz delivers probiotics thanks to natural fermentation. Every chilled bottle carries live cultures straight to your gut.

## Prebiotics: the water

To get the most from probiotics, pair them with prebiotic-rich foods like:

• Bananas
• Oats
• Garlic and onions
• Asparagus
• Chicory root

> Think of probiotics as the seed and prebiotics as the water. You need both for a thriving gut garden.

A glass of GingerBros alongside a fiber-rich meal is an easy way to support digestive wellness without overthinking it.`,
  },
  {
    slug: 'ginger-immunity',
    title: 'Ginger for Immunity: Fact or Fad?',
    excerpt: 'What research actually says about ginger, inflammation, and immune support.',
    category: 'Health',
    readTime: '4 min',
    icon: Sparkles,
    date: '2026-05-22',
    author: 'GingerBros Wellness',
    tags: ['immunity', 'science', 'inflammation'],
    content: `Ginger is one of the most studied spices on the planet, and the results are promising — though not magical.

## What the studies suggest

Clinical studies suggest ginger can:

• Support a healthy inflammatory response
• Reduce muscle soreness after exercise
• Help with nausea and digestive discomfort
• Provide antioxidant compounds that protect cells from oxidative stress

## A realistic take

None of this means ginger fizz replaces medicine or a balanced diet. But choosing a drink made with real ginger and no artificial junk is a small, enjoyable way to support overall wellness.

Our unpasteurized version also adds the probiotic angle, which ties into the growing understanding that gut health and immune health are closely linked.`,
  },
  {
    slug: 'low-sugar-drinking',
    title: 'Why We Keep the Sugar Lower',
    excerpt: 'Most of the sugar in our brew is eaten by the ginger bug during fermentation.',
    category: 'Health',
    readTime: '3 min',
    icon: Heart,
    date: '2026-05-14',
    author: 'GingerBros Wellness',
    tags: ['low sugar', 'fermentation', 'nutrition'],
    content: `Traditional ginger ales are loaded with sugar. We take a different approach.

## The ginger bug eats the sugar

During our 7-day natural fermentation, the ginger bug consumes much of the cane sugar we start with. What is left is a small amount of residual sugar that balances the ginger heat and supports carbonation.

The result is a ginger fizz that tastes bright and refreshing without being syrupy. For anyone watching their sugar intake, this makes GingerBros a better mixer and standalone drink than most commercial alternatives.

> Of course, moderation still matters. But it is nice when the better choice also tastes better.`,
  },
  {
    slug: 'hydration-electrolytes',
    title: 'Ginger Fizz, Hydration, and Hot Days',
    excerpt: 'Can a fermented ginger drink actually help on sweaty afternoons?',
    category: 'Health',
    readTime: '3 min',
    icon: Leaf,
    date: '2026-05-08',
    author: 'GingerBros Wellness',
    tags: ['hydration', 'summer', 'electrolytes'],
    content: `Thailand is hot. When you sweat, you lose water and electrolytes. While water should always be your first line of defense, a naturally fermented ginger fizz can be a flavorful option that encourages you to drink more.

## A little help from the rhizome

Ginger contains potassium and magnesium in small amounts. Combined with the carbonation and gentle spice, it can feel more satisfying than plain water on a humid afternoon.

> Our take: keep a few bottles chilled, enjoy them after light activity, and do not rely on any drink as a substitute for plain water.

Used wisely, GingerBros makes hydration a lot more interesting.`,
  },
  {
    slug: 'unpasteurized-vs-pasteurized',
    title: 'Unpasteurized vs Pasteurized: The Honest Difference',
    excerpt: 'A clear, no-spin comparison so you can choose the bottle that fits your life.',
    category: 'Guide',
    readTime: '5 min',
    icon: Leaf,
    date: '2026-04-30',
    author: 'GingerBros Wellness',
    tags: ['guide', 'probiotics', 'storage'],
    content: `People ask us this all the time, so here is the straight answer with no marketing spin.

## Unpasteurized

• Contains live probiotic cultures
• Must stay refrigerated
• Shorter shelf life
• Brighter, slightly tart, more complex flavor
• Best for gut-health seekers and flavor chasers

## Pasteurized

• Shelf-stable at room temperature
• Longer shelf life, easier to travel with
• No live cultures
• Cleaner, more consistent flavor
• Best for convenience, gifting, and warm-climate storage

## How to choose

If probiotics are your priority and you have fridge space, go unpasteurized. If you want something to stash in a cupboard, take on a trip, or give as a gift, pasteurized is the practical pick.

> There is no wrong answer — only the bottle that fits your week.`,
  },
  {
    slug: 'storing-living-fizz',
    title: 'How to Store Living Fizz (and Open It Safely)',
    excerpt: 'Live cultures keep working in the bottle. Here is how to keep yours happy and avoid a fountain.',
    category: 'Guide',
    readTime: '4 min',
    icon: Leaf,
    date: '2026-04-22',
    author: 'The GingerBros Kitchen',
    tags: ['storage', 'tips', 'fermentation'],
    content: `Because our unpasteurized fizz is alive, it behaves a little differently from a regular soda. A few simple habits keep every bottle perfect.

## Keep it cold

Cold slows fermentation. Store unpasteurized GingerBros in the fridge from the moment it arrives, and keep it there until you drink it. Warmth wakes the cultures back up and builds extra pressure.

## Open it slowly

Always open a chilled bottle, and crack the cap slowly to let pressure escape gradually. If you have left a bottle out, chill it for a few hours before opening.

## Drink it fresh

• Best within the date on the bottle
• Reseal and refrigerate if you do not finish it
• A little sediment at the bottom is normal — that is the living culture, not a flaw

> Treat it like fresh food, not a canned drink, and it will reward you with bright, lively flavor.`,
  },
  {
    slug: 'history-of-ginger-beer',
    title: 'A Short, Spicy History of Ginger Beer',
    excerpt: 'From 18th-century England to Thai street stalls, the global journey of fermented ginger.',
    category: 'Culture',
    readTime: '6 min',
    icon: Mountain,
    date: '2026-04-14',
    author: 'GingerBros Stories',
    tags: ['history', 'culture', 'ginger'],
    content: `Ginger has been crossing borders for as long as people have been trading. The fizzy version we love today is the product of centuries of wandering.

## Born in England

Fermented ginger beer first became popular in 18th-century England, brewed with ginger, sugar, water, and a starter culture much like our ginger bug. Pubs and households kept their own brews going for years.

## Spread across the world

As trade routes expanded, ginger beer traveled to the Caribbean, where it picked up local spices, and across Asia, where fresh ginger was already a staple of daily cooking and medicine.

## A natural fit for Thailand

Thailand has cooked with ginger and its cousins — galangal, turmeric, fingerroot — for centuries. A bright, spicy, fermented ginger drink feels right at home here.

> At GingerBros, we like to think of our fizz as the latest chapter in a very long, very delicious story.`,
  },
  {
    slug: 'thai-ginger-vs-the-world',
    title: 'Thai Ginger vs the World: Why Origin Matters',
    excerpt: 'Not all ginger is created equal. Here is what makes the Thai rhizome special.',
    category: 'Culture',
    readTime: '5 min',
    icon: Mountain,
    date: '2026-04-06',
    author: 'GingerBros Stories',
    tags: ['ingredients', 'thailand', 'sourcing'],
    content: `Taste two gingers side by side and you will notice they are not the same plant experience at all. Climate, soil, and harvest timing change everything.

## What makes Thai ginger sing

Grown in warm, humid highlands, Thai ginger tends to be aromatic, juicy, and assertively spicy without turning harsh. Young ginger is tender and floral; mature ginger brings deeper heat.

## We source close to home

We work with growers in northern Thailand so the rhizome reaches our brewhouse fresh, not dried or powdered. Freshness is the difference between a fizz that tastes alive and one that tastes flat.

## Heat with character

• Floral high notes from young ginger
• A clean, peppery middle
• A warming finish that lingers without burning

> Origin is not a marketing word for us. It is the reason our fizz tastes the way it does.`,
  },
  {
    slug: 'flavor-pairing-guide',
    title: 'The GingerBros Flavor Pairing Guide',
    excerpt: 'What to eat, mix, and serve alongside ginger fizz for maximum deliciousness.',
    category: 'Guide',
    readTime: '5 min',
    icon: Leaf,
    date: '2026-03-28',
    author: 'The GingerBros Kitchen',
    tags: ['pairing', 'food', 'tips'],
    content: `Ginger fizz is one of the most food-friendly drinks there is. Its spice cuts through richness, and its tartness lifts sweetness. Here is how to pair it.

## Best food matches

• Spicy Thai curries — the fizz cools and refreshes between bites
• Fatty grilled meats — ginger cuts through richness
• Sharp cheeses — the carbonation cleanses the palate
• Citrusy desserts — ginger and lime are old friends

## Best spirits to mix

• Dark rum for a Dark ’n’ Stormy
• Vodka for a Mule
• Blanco tequila for a spicy margarita
• Bourbon for a ginger highball

## Garnishes that earn their place

• Fresh lime, every time
• Candied ginger for sweetness
• Mint for brightness
• A pinch of chili salt for adventurous palates

> When in doubt: cold glass, lots of ice, a squeeze of lime. That is never wrong.`,
  },
  {
    slug: 'meet-the-brewers',
    title: 'Meet the Brewers Behind the Bottle',
    excerpt: 'The small Chiang Mai team that hand-balances every batch — and why they do it by taste, not by formula.',
    category: 'Culture',
    readTime: '5 min',
    icon: Mountain,
    date: '2026-03-20',
    author: 'GingerBros Stories',
    tags: ['team', 'behind the scenes', 'craft'],
    content: `Behind every bottle of GingerBros is a small team that treats brewing as a craft, not a production line.

## Brewing by taste

Our head brewer, Nong, learned fermentation from her grandmother before there was a single piece of stainless steel in the building. To this day, every batch is tasted and adjusted by hand before it is approved for bottling.

> Numbers tell us the batch is safe. Our tongues tell us the batch is good.

## A drink with a place

Working out of Chiang Mai means we are surrounded by some of the best fresh ginger in the world. Our team shops the same morning markets the home cooks do.

## Why small stays small

We could grow faster by pasteurizing and automating. We choose not to, because the moment the brew stops being hand-balanced, it stops being GingerBros. Some things are worth keeping small.`,
  },
  {
    slug: 'ginger-bug-at-home',
    title: 'Start Your Own Ginger Bug at Home',
    excerpt: 'A beginner-friendly walkthrough to culture your own wild ginger starter — the same idea behind our brew.',
    category: 'Brewing',
    readTime: '6 min',
    icon: FlaskConical,
    date: '2026-03-12',
    author: 'Nong, Head Brewer',
    tags: ['DIY', 'fermentation', 'tutorial'],
    content: `Curious how the magic works? You can culture a simple ginger bug in your own kitchen. It will not be GingerBros, but it will teach you to respect the process.

## What you need

• A clean glass jar
• Fresh, organic ginger (the wild yeast lives on the skin, so do not peel it)
• White cane sugar
• Filtered, non-chlorinated water (chlorine harms the cultures)

## The daily ritual

• Day 1 — Add 1 tbsp grated ginger, 1 tbsp sugar, and 1 cup water to the jar. Stir and cover loosely.
• Days 2 to 5 — Each day, feed it another tablespoon of grated ginger and sugar. Stir well.
• Around day 5 — You should see fizzing and smell a bright, yeasty aroma. That means it is alive.

## Safety first

> If your bug ever smells rotten, grows fuzzy mold, or turns slimy, throw it out and start again. A healthy bug smells sharp, sweet, and gingery — never foul.

Once your bug is active, you can use it to lightly carbonate juices and teas. Respect the pressure, keep things clean, and have fun. This is the oldest soda technology on earth.`,
  },
  {
    slug: 'sustainability-bottle-to-soil',
    title: 'From Bottle to Soil: Our Sustainability Promise',
    excerpt: 'Recyclable glass, ginger pulp that becomes compost, and the climate cost we are still working on.',
    category: 'Brewing',
    readTime: '4 min',
    icon: FlaskConical,
    date: '2026-03-04',
    author: 'GingerBros Stories',
    tags: ['sustainability', 'glass', 'compost'],
    content: `Making a living drink that is also kind to the planet is a moving target. Here is where we stand — including the parts we are still figuring out.

## What we are proud of

• Recyclable glass bottles instead of single-use plastic
• Ginger pulp from brewing goes to local farms as compost
• Short supply chains — we source ginger close to the brewhouse
• Small batches mean very little waste

## What is hard

Refrigerated shipping for unpasteurized fizz uses energy. Glass is heavier than plastic, which affects transport emissions. We are honest that these are real trade-offs.

## Where we are heading

> We would rather make slow, real progress than greenwash. Every quarter we look for one concrete improvement and ship it.

Sustainability is not a finish line for us. It is a brewing decision we make again with every batch.`,
  },
];

const ALL_CATEGORIES: ('All' | Category)[] = ['All', 'Recipe', 'Health', 'Brewing', 'Guide', 'Culture'];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** Lightweight markdown-ish renderer for post bodies. */
function renderContent(content: string) {
  const blocks = content.split('\n\n');
  return blocks.map((block, i) => {
    const trimmed = block.trim();

    if (trimmed.startsWith('## ')) {
      return (
        <h2 key={i} className="font-display font-bold text-deep-brown text-xl md:text-2xl mt-8 mb-3 first:mt-0">
          {trimmed.replace(/^##\s+/, '')}
        </h2>
      );
    }
    if (trimmed.startsWith('### ')) {
      return (
        <h3 key={i} className="font-display font-semibold text-deep-brown text-lg mt-6 mb-2">
          {trimmed.replace(/^###\s+/, '')}
        </h3>
      );
    }
    if (trimmed.startsWith('> ')) {
      return (
        <blockquote
          key={i}
          className="border-l-4 border-amber bg-amber/10 rounded-r-xl pl-5 pr-4 py-3 my-6 font-display italic text-deep-brown text-lg leading-relaxed"
        >
          {trimmed.replace(/^>\s+/, '')}
        </blockquote>
      );
    }

    const lines = trimmed.split('\n');
    const isList = lines.length > 0 && lines.every((line) => /^[•\-\d]/.test(line.trim()));
    if (isList) {
      return (
        <ul key={i} className="space-y-2 mb-5">
          {lines.map((line, j) => (
            <li key={j} className="flex items-start gap-3 font-body text-earth leading-relaxed">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-rust flex-shrink-0" />
              <span>{line.replace(/^[•\-\d]+\.?\s*/, '')}</span>
            </li>
          ))}
        </ul>
      );
    }

    return (
      <p key={i} className="font-body text-earth leading-relaxed mb-4 last:mb-0">
        {block}
      </p>
    );
  });
}

function PostCard({ post, onClick }: { post: Post; onClick: () => void }) {
  const meta = CATEGORY_META[post.category];
  const Icon = post.icon;
  return (
    <button
      onClick={onClick}
      data-testid={`blog-post-${post.slug}`}
      className="group blog-card flex flex-col text-left bg-warm-white rounded-3xl overflow-hidden border border-soft-peach/60 hover:border-amber/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      <div className={`relative h-44 overflow-hidden bg-gradient-to-br ${meta.gradient}`}>
        {post.image ? (
          <img
            src={post.image}
            alt={post.title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon className="w-14 h-14 text-deep-brown/30 group-hover:scale-110 transition-transform duration-500" />
          </div>
        )}
        <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 font-body font-semibold text-[11px] uppercase tracking-wider px-3 py-1 rounded-full bg-warm-white/90 backdrop-blur text-rust">
          <Icon className="w-3 h-3" />
          {post.category}
        </span>
      </div>
      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-center gap-3 mb-2 text-earth/50">
          <span className="inline-flex items-center gap-1 font-body text-[12px]">
            <Calendar className="w-3 h-3" /> {formatDate(post.date)}
          </span>
          <span className="inline-flex items-center gap-1 font-body text-[12px]">
            <Clock className="w-3 h-3" /> {post.readTime}
          </span>
        </div>
        <h3 className="font-display font-semibold text-deep-brown text-lg leading-snug mb-2 group-hover:text-rust transition-colors">
          {post.title}
        </h3>
        <p className="font-body text-earth text-[14px] leading-relaxed mb-4 line-clamp-3">{post.excerpt}</p>
        <span className="mt-auto inline-flex items-center gap-1.5 font-body font-medium text-sm text-rust">
          Read article
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </span>
      </div>
    </button>
  );
}

export default function BlogPage() {
  const navigate = useNavigate();
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [filter, setFilter] = useState<'All' | Category>('All');
  const [query, setQuery] = useState('');
  const heroRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const activePost = POSTS.find((p) => p.slug === activeSlug) ?? null;
  const featured = POSTS.find((p) => p.featured) ?? POSTS[0];

  const counts = useMemo(() => {
    const map: Record<string, number> = { All: POSTS.length };
    for (const c of ALL_CATEGORIES) {
      if (c === 'All') continue;
      map[c] = POSTS.filter((p) => p.category === c).length;
    }
    return map;
  }, []);

  const filteredPosts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return POSTS.filter((p) => {
      const matchesCat = filter === 'All' || p.category === filter;
      const matchesQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q));
      return matchesCat && matchesQuery;
    });
  }, [filter, query]);

  const relatedPosts = useMemo(() => {
    if (!activePost) return [];
    return POSTS.filter((p) => p.slug !== activePost.slug && p.category === activePost.category).slice(0, 3);
  }, [activePost]);

  // Scroll to top whenever a post opens or closes.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [activeSlug]);

  // Entrance animations for the list view.
  useEffect(() => {
    if (activePost) return;
    const ctx = gsap.context(() => {
      if (heroRef.current?.children) {
        gsap.from(Array.from(heroRef.current.children), {
          opacity: 0,
          y: 24,
          duration: 0.7,
          stagger: 0.08,
          ease: 'power3.out',
        });
      }
      const cards = gridRef.current?.querySelectorAll('.blog-card');
      if (cards && cards.length) {
        gsap.from(cards, {
          opacity: 0,
          y: 28,
          duration: 0.6,
          stagger: 0.06,
          ease: 'power3.out',
          scrollTrigger: { trigger: gridRef.current, start: 'top 85%' },
        });
      }
    });
    return () => ctx.revert();
  }, [activePost, filter, query]);

  const blogListSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'The GingerBros Brew Journal',
    url: 'https://gingerbrosshop.com/blog',
    description:
      'Ginger fizz recipes, gut health science, brewing stories, and wellness guides from GingerBros Thailand.',
    blogPost: POSTS.map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      description: p.excerpt,
      datePublished: p.date,
      author: { '@type': 'Organization', name: p.author },
      url: `https://gingerbrosshop.com/blog#${p.slug}`,
    })),
  };

  const activePostSchema = activePost
    ? {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: activePost.title,
        description: activePost.excerpt,
        articleBody: activePost.content,
        datePublished: activePost.date,
        keywords: activePost.tags.join(', '),
        url: `https://gingerbrosshop.com/blog#${activePost.slug}`,
        author: { '@type': 'Organization', name: activePost.author },
        publisher: {
          '@type': 'Organization',
          name: 'GingerBros',
          logo: {
            '@type': 'ImageObject',
            url: 'https://gingerbrosshop.com/images/product-unpasteurized-2.jpg',
          },
        },
      }
    : null;

  return (
    <div className="min-h-screen bg-warm-white">
      {activePost ? (
        <SEO
          title={`${activePost.title} — GingerBros Brew Journal`}
          description={activePost.excerpt}
          path="/blog"
          type="article"
          image={activePost.image ? `https://gingerbrosshop.com${activePost.image}` : undefined}
          jsonLd={activePostSchema ? [activePostSchema] : undefined}
        />
      ) : (
        <SEO
          title="The Brew Journal — Ginger Fizz Recipes, Gut Health & Brewing Stories | GingerBros"
          description="Explore the GingerBros Brew Journal: ginger fizz cocktail recipes, probiotic gut-health science, brewing deep-dives, and low-sugar wellness guides from Thailand."
          path="/blog"
          jsonLd={[blogListSchema]}
        />
      )}

      {/* Sticky top bar */}
      <div className="sticky top-0 z-50 bg-warm-white/95 backdrop-blur-xl border-b border-soft-peach/50">
        <div className="max-w-[1280px] mx-auto px-6 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 font-body font-medium text-sm text-earth hover:text-deep-brown transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Shop
          </button>
          <span className="font-display font-bold text-lg text-deep-brown">GingerBros</span>
          <div className="w-20" />
        </div>
      </div>

      {!activePost ? (
        <>
          {/* Hero header */}
          <div className="relative overflow-hidden border-b border-soft-peach/50">
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to bottom, rgba(240,212,168,0.45) 0%, #FDF8F0 100%)' }}
            />
            <div className="absolute -top-20 -right-16 w-72 h-72 rounded-full bg-amber/20 blur-3xl" />
            <div className="absolute -bottom-24 -left-16 w-72 h-72 rounded-full bg-accent-green/15 blur-3xl" />

            <div ref={heroRef} className="relative max-w-[1280px] mx-auto px-6 pt-16 pb-12 text-center">
              <span className="inline-flex items-center gap-2 font-body font-semibold text-[12px] uppercase tracking-[0.12em] text-rust bg-amber/20 px-4 py-1.5 rounded-full mb-5">
                <Flame className="w-3.5 h-3.5" /> Stories from the brewhouse
              </span>
              <h1 className="font-display font-bold text-deep-brown text-4xl md:text-5xl lg:text-6xl mb-4 leading-tight">
                The Brew Journal
              </h1>
              <p className="font-body text-earth text-base md:text-lg max-w-[620px] mx-auto mb-8">
                Living-culture recipes, gut-health science, brewing deep-dives, and the people and places behind
                every bottle of GingerBros.
              </p>

              {/* Search */}
              <div className="max-w-[480px] mx-auto relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-earth/50" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search recipes, gut health, brewing…"
                  className="w-full bg-warm-white border border-soft-peach rounded-full pl-11 pr-10 py-3 font-body text-deep-brown placeholder:text-earth/50 focus:outline-none focus:ring-2 focus:ring-rust/30 shadow-sm"
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-earth/50 hover:text-rust transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="max-w-[1280px] mx-auto px-6 py-12">
            {/* Featured post — only when not searching/filtering */}
            {filter === 'All' && !query && (
              <section className="mb-14">
                <h2 className="font-body font-semibold text-[12px] uppercase tracking-[0.12em] text-rust mb-4">
                  Featured
                </h2>
                <button
                  onClick={() => setActiveSlug(featured.slug)}
                  className="group grid grid-cols-1 lg:grid-cols-2 gap-0 w-full text-left bg-warm-white rounded-3xl overflow-hidden border border-soft-peach/60 hover:border-amber/60 hover:shadow-2xl transition-all duration-300"
                >
                  <div className={`relative min-h-[260px] lg:min-h-[380px] bg-gradient-to-br ${CATEGORY_META[featured.category].gradient}`}>
                    {featured.image ? (
                      <img
                        src={featured.image}
                        alt={featured.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <featured.icon className="w-20 h-20 text-deep-brown/25" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col justify-center p-8 lg:p-12">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="inline-flex items-center gap-1.5 font-body font-semibold text-[11px] uppercase tracking-wider px-3 py-1 rounded-full bg-amber/20 text-rust">
                        <featured.icon className="w-3 h-3" /> {featured.category}
                      </span>
                      <span className="inline-flex items-center gap-1 font-body text-[12px] text-earth/50">
                        <Clock className="w-3 h-3" /> {featured.readTime} read
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-deep-brown text-2xl md:text-3xl leading-tight mb-3 group-hover:text-rust transition-colors">
                      {featured.title}
                    </h3>
                    <p className="font-body text-earth leading-relaxed mb-6">{featured.excerpt}</p>
                    <span className="inline-flex items-center gap-2 font-body font-medium text-rust">
                      Read the full story
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </button>
              </section>
            )}

            {/* Category filters */}
            <div className="flex items-center justify-center gap-2 mb-10 flex-wrap">
              {ALL_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  data-testid={`blog-filter-${cat}`}
                  className={`font-body font-medium text-sm px-4 py-2 rounded-full border transition-all ${
                    filter === cat
                      ? 'bg-deep-brown text-cream border-deep-brown'
                      : 'bg-warm-white text-earth border-soft-peach hover:border-amber hover:text-deep-brown'
                  }`}
                >
                  {cat} <span className="opacity-60">({counts[cat]})</span>
                </button>
              ))}
            </div>

            {/* Results meta */}
            {(query || filter !== 'All') && (
              <p className="font-body text-sm text-earth/60 mb-6">
                {filteredPosts.length} {filteredPosts.length === 1 ? 'article' : 'articles'}
                {query && (
                  <>
                    {' '}
                    matching <span className="font-medium text-deep-brown">“{query}”</span>
                  </>
                )}
              </p>
            )}

            {/* Grid */}
            {filteredPosts.length > 0 ? (
              <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map((post) => (
                  <PostCard key={post.slug} post={post} onClick={() => setActiveSlug(post.slug)} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <Search className="w-10 h-10 text-earth/30 mx-auto mb-4" />
                <h3 className="font-display font-semibold text-deep-brown text-xl mb-2">No articles found</h3>
                <p className="font-body text-earth mb-6">Try a different search or browse all categories.</p>
                <button
                  onClick={() => {
                    setQuery('');
                    setFilter('All');
                  }}
                  className="inline-flex items-center gap-2 bg-deep-brown text-cream font-body font-medium px-6 py-3 rounded-full hover:bg-rust transition-colors"
                >
                  Reset filters
                </button>
              </div>
            )}
          </div>

          {/* Newsletter CTA */}
          <Newsletter />
        </>
      ) : (
        /* ---------- Article detail view ---------- */
        <article className="pb-20">
          {/* Article hero */}
          <div className={`relative overflow-hidden bg-gradient-to-br ${CATEGORY_META[activePost.category].gradient}`}>
            {activePost.image && (
              <>
                <img src={activePost.image} alt={activePost.title} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-deep-brown/80 via-deep-brown/30 to-transparent" />
              </>
            )}
            <div className="relative max-w-[760px] mx-auto px-6 pt-10 pb-12 md:pt-14 md:pb-16">
              <button
                onClick={() => setActiveSlug(null)}
                data-testid="blog-back"
                className={`inline-flex items-center gap-2 font-body font-medium text-sm mb-8 transition-colors ${
                  activePost.image ? 'text-cream/90 hover:text-cream' : 'text-earth hover:text-deep-brown'
                }`}
              >
                <ArrowLeft className="w-4 h-4" /> Back to Journal
              </button>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="inline-flex items-center gap-1.5 font-body font-semibold text-[11px] uppercase tracking-wider px-3 py-1 rounded-full bg-warm-white/90 backdrop-blur text-rust">
                  <activePost.icon className="w-3 h-3" /> {activePost.category}
                </span>
                <span
                  className={`inline-flex items-center gap-1 font-body text-[12px] ${
                    activePost.image ? 'text-cream/80' : 'text-earth/60'
                  }`}
                >
                  <Clock className="w-3 h-3" /> {activePost.readTime} read
                </span>
              </div>
              <h1
                className={`font-display font-bold text-3xl md:text-4xl leading-tight mb-4 ${
                  activePost.image ? 'text-cream' : 'text-deep-brown'
                }`}
              >
                {activePost.title}
              </h1>
              <div
                className={`flex flex-wrap items-center gap-x-4 gap-y-1 font-body text-sm ${
                  activePost.image ? 'text-cream/80' : 'text-earth/70'
                }`}
              >
                <span>By {activePost.author}</span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {formatDate(activePost.date)}
                </span>
              </div>
            </div>
          </div>

          {/* Article body */}
          <div data-testid="blog-article-content" className="max-w-[720px] mx-auto px-6 pt-10">
            <p className="font-body text-lg text-earth leading-relaxed mb-8 pb-8 border-b border-soft-peach">
              {activePost.excerpt}
            </p>
            <div className="prose-blog">{renderContent(activePost.content)}</div>

            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2 mt-10 pt-8 border-t border-soft-peach">
              <TagIcon className="w-4 h-4 text-earth/50" />
              {activePost.tags.map((tag) => (
                <span
                  key={tag}
                  className="font-body text-[13px] text-rust bg-amber/15 px-3 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Shop CTA */}
            <div className="mt-12 bg-gradient-to-br from-amber/20 to-soft-peach/30 rounded-3xl p-8 text-center border border-soft-peach/60">
              <h3 className="font-display font-bold text-deep-brown text-2xl mb-2">Taste the difference</h3>
              <p className="font-body text-earth mb-6 max-w-[420px] mx-auto">
                Real ginger, 7-day fermentation, live cultures. Get a bottle of GingerBros and try it for yourself.
              </p>
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-2 bg-deep-brown text-cream font-body font-medium px-7 py-3.5 rounded-full hover:bg-rust transition-colors"
              >
                Shop GingerBros <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Related posts */}
          {relatedPosts.length > 0 && (
            <div className="max-w-[1280px] mx-auto px-6 mt-20">
              <h2 className="font-display font-bold text-deep-brown text-2xl mb-6 text-center">
                More from {activePost.category}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedPosts.map((post) => (
                  <PostCard key={post.slug} post={post} onClick={() => setActiveSlug(post.slug)} />
                ))}
              </div>
            </div>
          )}
        </article>
      )}
    </div>
  );
}
