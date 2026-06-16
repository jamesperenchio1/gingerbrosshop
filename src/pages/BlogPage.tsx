import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
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
  BookOpen,
  ExternalLink,
} from 'lucide-react';
import SEO from '@/components/SEO';
import Newsletter from '@/components/Newsletter';

type Category = 'Recipe' | 'Health' | 'Brewing' | 'Culture' | 'Guide';

interface Reference {
  label: string;
  source: string;
  url: string;
}

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
  references?: Reference[];
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
    readTime: '9 min',
    icon: FlaskConical,
    date: '2026-06-02',
    author: 'Nong, Head Brewer',
    tags: ['fermentation', 'process', 'behind the scenes'],
    featured: true,
    image: '/images/story-brewing.webp',
    content: `Every bottle of GingerBros begins with something most people throw away: a knob of fresh ginger, a spoon of sugar, and a little patience. We call it the ginger bug, and it is the wild, living heart of our brew. There is no laboratory yeast, no factory carbonation tank, and no flavour concentrate. There is only time, temperature, and the invisible community of microbes that has lived on ginger skin for as long as ginger has grown.

In this piece I want to pull back the curtain on what actually happens in our brewhouse — the science, the rhythm, and the judgement calls that no machine can make for us.

## What exactly is a ginger bug?

A ginger bug is a natural starter culture — a spontaneous colony of wild yeasts and lactic-acid bacteria that live on the skin of fresh ginger. Feed them sugar and water, and within a week they wake up, multiply, and start producing carbon dioxide. That CO2 is what gives our fizz its natural sparkle. No injected carbonation, no shortcuts.

The two organisms that matter most are wild *Saccharomyces* yeasts, which convert sugar into a trace of alcohol and a lot of carbon dioxide, and *Lactobacillus* bacteria, which produce the gentle lactic-acid tang that keeps the brew bright instead of cloying. Together they form a tiny, self-regulating ecosystem.

Think of it like a sourdough starter, but for soda.

![Fresh ginger being grated in the GingerBros brewhouse](/images/story-brewing.webp)

## Day by day in the brewhouse

Our 7-day process is slow on purpose. Here is roughly how a batch moves through our Chiang Mai brewhouse:

• Day 1 — We grate fresh, organic Thai ginger and combine it with filtered, non-chlorinated water and a measured amount of cane sugar. Chlorine would kill the very microbes we are trying to encourage, so water quality is non-negotiable.
• Day 2 to 3 — The wild cultures bloom. Tiny bubbles cling to the side of the vessel. The smell turns bright and peppery as the yeast population climbs into the millions.
• Day 4 to 5 — Fermentation hits full stride. The ginger bug eats most of the sugar, leaving behind complexity instead of sweetness, while the pH drops into a safe, naturally acidic range.
• Day 6 — We taste, adjust, and balance each batch by hand, checking aroma, acidity and carbonation.
• Day 7 — Bottling day. The fizz is alive, lightly tart, and unmistakably gingery.

## The chemistry of the fizz

Carbonation in a living soda is not pumped in — it is grown. As yeast metabolises sugar through fermentation, it releases carbon dioxide. In a sealed bottle that gas has nowhere to go, so it dissolves back into the liquid under pressure. The result is a fine, persistent bead that feels softer on the tongue than the aggressive sparkle of force-carbonated soda. It is the same principle that puts bubbles in traditional sparkling wine.

## Why we never pasteurize

Heat kills. That is the whole point of pasteurization — it extends shelf life by destroying microorganisms. The problem is that those same microorganisms are the probiotic cultures people actually want.

> We would rather sell a living drink that needs refrigeration than a dead one that lasts forever on a warm shelf.

That choice shapes everything: how we ship, how we store, and why our fizz tastes nothing like a mass-market can.

## The takeaway

Great fizz is not manufactured — it is cultivated. When you crack open a bottle of GingerBros, you are tasting a week of patient, living chemistry. That is worth slowing down for.`,
    references: [
      {
        label: 'Spontaneous fermentation and wild starter cultures',
        source: 'Food Microbiology, ScienceDirect',
        url: 'https://www.sciencedirect.com/topics/food-science/spontaneous-fermentation',
      },
      {
        label: 'The role of yeasts and lactic acid bacteria in fermented beverages',
        source: 'Frontiers in Microbiology',
        url: 'https://www.frontiersin.org/articles/10.3389/fmicb.2016.00377/full',
      },
    ],
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
    content: `A great Moscow Mule starts with great ginger fizz. Our 7-day naturally fermented brew brings a depth of flavor that mass-market ginger sodas simply cannot match. Most commercial mules lean on sweet, one-note ginger beer; ours leans on a living, lightly tart fizz that lets the lime and vodka breathe.

## A little history

The Moscow Mule was invented in the early 1940s in Los Angeles, reportedly a collaboration between a struggling vodka distributor and a bar owner sitting on a surplus of ginger beer. The signature copper mug was added partly as a clever marketing flourish — and it stuck, because it genuinely keeps the drink colder.

## Ingredients

• 60ml vodka
• 15ml fresh lime juice (always fresh — bottled lime tastes flat)
• 120ml GingerBros Unpasteurized Ginger Fizz, well chilled
• Lime wedge and a sprig of mint for garnish

## Instructions

1. Fill a copper mug (or a highball glass) to the brim with ice.
2. Add the vodka and fresh lime juice.
3. Top slowly with GingerBros so the natural carbonation holds.
4. Stir once, gently, and garnish with a lime wedge and a clapped sprig of mint.

## Why it works

The natural fermentation gives our unpasteurized ginger fizz a subtle funk and complexity that elevates this classic cocktail from good to unforgettable. Because our brew is less sweet than standard ginger beer, you taste the ginger heat and the citrus rather than syrup.

## Make it your own

• Swap vodka for mezcal for a smoky "Mexican Mule".
• Add 10ml of fresh ginger syrup if you want extra fire.
• For a zero-proof version, skip the vodka and add a splash of soda and a dash of bitters.

> Pro tip: a chilled copper mug is not just for looks — the metal conducts cold quickly and keeps your mule colder, longer, and the cold accentuates the ginger snap.`,
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

## The most protected cocktail in the world

Here is a fun bit of trivia: "Dark 'n Stormy" is a registered trademark held by Gosling's, the Bermudian rum house, and the name is legally tied to their Black Seal rum. Bartenders take liberties with the rum all the time, but if you see it spelled exactly that way on a menu, tradition says it should be poured dark and layered, not stirred.

## Ingredients

• 60ml dark rum (Gosling’s Black Seal is traditional)
• 120ml GingerBros Unpasteurized Ginger Fizz
• 10ml fresh lime juice
• Lime wheel and candied ginger for garnish

## Instructions

1. Fill a tall glass with ice.
2. Add the fresh lime juice and top with chilled GingerBros.
3. Float the dark rum slowly over the back of a bar spoon so it sits on top in a dramatic, stormy layer.
4. Garnish with a lime wheel and a piece of candied ginger — and stir just before drinking.

## Why the layering matters

Pouring the rum last lets it cascade down through the fizz as you sip, so the first taste is bright and gingery and the finish turns rich and molasses-dark. It is theatre, but it is also genuinely better.

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
    content: `Margarita night just got an upgrade. Replacing part of the orange liqueur with ginger fizz gives this cocktail a spicy backbone and a lighter, more refreshing body — perfect for a hot Chiang Mai afternoon.

## Ingredients

• 45ml blanco tequila (100% agave is worth it)
• 30ml fresh lime juice
• 15ml triple sec or orange liqueur
• 60ml GingerBros Unpasteurized Ginger Fizz
• Salt or chili-salt rim and a jalapeño slice (optional)

## Instructions

1. Rub a lime wedge around the rim of a rocks glass and dip it in salt (or a chili-lime salt for extra kick).
2. Fill the glass with ice.
3. Shake the tequila, lime juice, and triple sec hard with ice for 10–12 seconds, then strain into the glass.
4. Top with chilled GingerBros and garnish with a jalapeño slice.

## Why ginger and tequila get along

Blanco tequila has bright, peppery, vegetal notes that echo the natural heat of fresh ginger. The fizz extends the drink, drops the overall sugar, and adds a gentle effervescence that keeps each sip lively instead of heavy.

## Spice control

Want more heat? Muddle the jalapeño in the shaker before adding ice. Want less? Use it purely as a garnish. The beauty of building the drink in stages is that you stay in charge of the burn.

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
    content: `Not every great drink needs alcohol. This zero-proof lemonade leans on real ginger heat and fresh citrus for a drink that wakes up your palate — no hangover, no compromise.

## Ingredients

• 30ml fresh lemon juice
• 15ml honey or simple syrup (warm the honey slightly so it dissolves)
• 120ml GingerBros Unpasteurized Ginger Fizz
• Lemon wheel and a sprig of fresh mint
• Optional: a pinch of sea salt to round out the flavour

## Instructions

1. If using honey, stir it into the lemon juice first with a splash of warm water so it dissolves completely.
2. Shake the lemon juice and sweetener with ice until well chilled.
3. Strain into an ice-filled glass.
4. Top with chilled GingerBros and garnish with a lemon wheel and clapped mint.

## Why it beats regular lemonade

Most lemonade is essentially sugar water with a squeeze of citrus. By letting the fermented ginger fizz carry the carbonation and a good portion of the flavour, you can use far less added sweetener and still get something that tastes festive. A pinch of salt sharpens the lemon and makes the whole glass taste more "alive".

## Kid- and crowd-friendly

Batch it: multiply the lemon and honey, keep it in a jug, and top each glass with fizz to order so it never goes flat.

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
    content: `Ginger fizz is not just for drinking. Reduce it down and it becomes a tangy, caramelized glaze that works on wings, tofu, or roasted vegetables. It is one of our favourite ways to use up a bottle that has lost a little of its sparkle.

## Ingredients

• 500g chicken wings (or firm tofu cubes for a vegan version)
• 240ml GingerBros Unpasteurized Ginger Fizz
• 2 tbsp soy sauce
• 1 tbsp honey
• 1 tsp grated fresh ginger
• 2 cloves garlic, minced
• Optional: 1 tsp chili flakes or a spoon of gochujang
• Sesame seeds and sliced scallions for garnish

## Instructions

1. Pat the wings completely dry and season with salt — dry skin is the secret to crispiness.
2. Simmer the GingerBros, soy sauce, honey, ginger, garlic and any chili in a small saucepan over medium heat until reduced by half and syrupy, about 8–10 minutes. Stir often near the end so it does not scorch.
3. Toss the wings in half the glaze and bake at 200°C (400°F) for 25–30 minutes, turning once.
4. Brush with the remaining glaze and broil for 2–3 minutes until sticky and lacquered.
5. Finish with sesame seeds and scallions.

## The science of the glaze

As the fizz reduces, the residual sugars caramelize and the ginger compounds concentrate, while the soy adds savoury depth (and a hit of umami from its own fermentation). What you are really doing is layering two fermented ingredients — ginger fizz and soy sauce — into one glossy sauce.

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
    content: `When you cannot decide between dessert, coffee, and a cold drink, make all three at once. This float is the GingerBros answer to a sweltering afternoon — an affogato (Italian for "drowned") with a spicy, fizzy twist.

## Ingredients

• 2 scoops vanilla bean ice cream (the better the vanilla, the better the float)
• 1 shot hot espresso
• 120ml chilled GingerBros Unpasteurized Ginger Fizz
• Grated dark chocolate or candied ginger to finish

## Instructions

1. Chill your glass in the freezer for a few minutes first — it keeps the ice cream from melting too fast.
2. Drop the ice cream into the tall glass.
3. Pour the hot espresso over the top so it starts to melt the edges.
4. Slowly top with cold ginger fizz — it will foam dramatically as the carbonation hits the fat in the ice cream.
5. Finish with grated dark chocolate or a few shards of candied ginger.

## Why the foam happens

That impressive eruption of foam is real chemistry: the proteins and fats in ice cream trap the carbon dioxide escaping from the fizz, the same way root-beer floats foam over. The colder everything is, the more controlled (and dramatic) the result.

The contrast of hot, cold, bitter, sweet, and spicy in a single spoonful is the whole point. Eat it fast before it melts.`,
  },
  {
    slug: 'gut-health',
    title: 'Ginger Fizz & Gut Health: What You Should Know',
    excerpt: 'The science behind ginger, fermentation, and why your gut loves unpasteurized ginger fizz.',
    category: 'Health',
    readTime: '7 min',
    icon: Heart,
    date: '2026-06-08',
    author: 'GingerBros Wellness',
    tags: ['gut health', 'probiotics', 'science'],
    featured: true,
    content: `Ginger has been used for digestive health for thousands of years, from Ayurvedic medicine in India to traditional Chinese formulas. Modern research is now catching up to what traditional medicine has long known — and in some areas, confirming it outright.

A quick, honest note before we start: food is not medicine, and no drink cures anything. What follows is a summary of what the published research actually suggests, with sources you can read yourself.

## The compounds that do the work

Ginger's biological activity comes largely from a family of pungent compounds called gingerols, and the shogaols they convert into when ginger is heated or dried. These compounds have well-documented anti-inflammatory and antioxidant effects in laboratory and clinical studies. In the context of digestion, the research suggests ginger can help:

• Reduce nausea — ginger is one of the best-evidenced natural remedies for nausea, including motion sickness, morning sickness and post-operative nausea.
• Speed up gastric emptying, which may ease that heavy, over-full feeling after meals.
• Support healthy digestion and reduce bloating and gas for some people.
• Support a healthy inflammatory response.

## Where the live cultures come in

Our unpasteurized ginger fizz goes a step further by delivering live cultures from our natural fermentation process. A growing body of research links fermented foods and a diverse gut microbiome to better digestive and even immune health. A notable Stanford study found that a diet high in fermented foods increased microbiome diversity and decreased markers of inflammation.

> Keep in mind: the live-culture benefits only apply to unpasteurized ginger fizz. Pasteurized versions have had the cultures heated away for shelf stability.

## A realistic bottom line

Ginger fizz is not a supplement and we will never pretend otherwise. But if you enjoy a drink made with real ginger and live cultures instead of artificial flavour and a heavy sugar load, you are making a small, pleasant choice that the science treats kindly.

If gut health is your goal, the label matters more than the marketing. Look for the word "unpasteurized" and keep it cold.`,
    references: [
      {
        label: 'Ginger in gastrointestinal disorders: a systematic review',
        source: 'Food Science & Nutrition (2019), PMC',
        url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6341159/',
      },
      {
        label: 'Fermented-food diet increases microbiome diversity, decreases inflammation',
        source: 'Cell (2021) / Stanford Medicine',
        url: 'https://med.stanford.edu/news/all-news/2021/07/fermented-food-diet-increases-microbiome-diversity-lowers-inflammation.html',
      },
      {
        label: 'Ginger (Zingiber officinale) and its bioactive components',
        source: 'Foods, MDPI (2019)',
        url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6573252/',
      },
    ],
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
    content: `The words sound almost identical, and the marketing on most supermarket shelves does nothing to clear up the confusion. So here is the simple version: probiotics are live microorganisms that add to the population of beneficial bacteria in your gut, and prebiotics are the fibres that feed them. You need both.

## Probiotics: the seed

Probiotics are the live, beneficial bacteria themselves. The World Health Organization defines them as "live microorganisms which, when administered in adequate amounts, confer a health benefit on the host." They turn up in fermented foods like yoghurt, kefir, kimchi, sauerkraut — and unpasteurized fermented drinks.

Unpasteurized ginger fizz delivers live cultures thanks to natural fermentation. Every chilled bottle carries them straight to your gut.

## Prebiotics: the water

Prebiotics are not alive at all — they are specialised plant fibres that your own digestive enzymes cannot break down, so they travel to the large intestine where your good bacteria ferment them for fuel. To get the most from probiotics, pair them with prebiotic-rich foods like:

• Bananas (especially slightly green ones)
• Oats and barley
• Garlic, onions, and leeks
• Asparagus
• Chicory root and Jerusalem artichoke

## Putting them together

> Think of probiotics as the seed and prebiotics as the water. You need both for a thriving gut garden.

When you eat probiotics and prebiotics together, the combination is sometimes called a "synbiotic" — the food and the bacteria arrive as a package. A glass of GingerBros alongside a fibre-rich meal is an easy, low-effort way to do exactly that, without overthinking it or buying a single capsule.`,
    references: [
      {
        label: 'Probiotics and prebiotics: what you should know',
        source: 'Harvard Health Publishing',
        url: 'https://www.health.harvard.edu/staying-healthy/health-benefits-of-taking-probiotics',
      },
      {
        label: 'Expert consensus on the definition and scope of prebiotics',
        source: 'Nature Reviews Gastroenterology & Hepatology (ISAPP)',
        url: 'https://www.nature.com/articles/nrgastro.2017.75',
      },
    ],
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
    content: `"Boosts your immune system" might be the most overused phrase in wellness marketing. So let us be careful here. Ginger is one of the most studied spices on the planet, and the results are genuinely promising — but they are promising, not magical, and the immune-system claims need nuance.

## What the studies actually suggest

Clinical and laboratory studies suggest ginger can:

• Support a healthy inflammatory response — gingerols and shogaols inhibit several inflammatory signalling pathways.
• Reduce muscle soreness after exercise in some trials, likely via that same anti-inflammatory action.
• Help with nausea and digestive discomfort, which is its best-evidenced benefit.
• Provide antioxidant compounds that help protect cells from oxidative stress.

## The honest part about "immunity"

There is no single food that "boosts" immunity on demand — the immune system is a vast, finely balanced network, and more activity is not always better. What the evidence does support is that chronic inflammation and a poorly diversified gut microbiome are bad for immune health, and that anti-inflammatory, fibre-rich, fermented-food-friendly diets tend to help. Ginger fits comfortably into that picture.

## A realistic take

None of this means ginger fizz replaces medicine, vaccines, sleep, or a balanced diet. But choosing a drink made with real ginger and no artificial junk is a small, enjoyable way to support overall wellness.

Our unpasteurized version also adds the live-culture angle, which ties into the growing scientific understanding that gut health and immune health are closely linked — a large share of your immune cells live in and around the gut.`,
    references: [
      {
        label: 'Anti-inflammatory and antioxidant properties of ginger',
        source: 'International Journal of Preventive Medicine, PMC',
        url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3665023/',
      },
      {
        label: 'The gut microbiome and the immune system',
        source: 'Nature Reviews Immunology',
        url: 'https://www.nature.com/articles/nri.2016.42',
      },
    ],
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
    content: `A typical can of commercial ginger ale or soda contains somewhere around 30–40 grams of sugar — close to or beyond the entire daily added-sugar limit the World Health Organization recommends for an adult. Traditional ginger "ale" often is not even fermented; it is carbonated sugar water with ginger flavouring. We take a different approach.

## The ginger bug eats the sugar

This is the quiet superpower of real fermentation. During our 7-day natural process, the wild yeast and bacteria in the ginger bug consume much of the cane sugar we start with, converting it into carbon dioxide, a trace of organic acids, and flavour. What is left at bottling is a small amount of residual sugar — just enough to balance the ginger heat and support natural carbonation.

In other words, the sweetness is not something we engineer out with artificial sweeteners. It is something the microbes eat on our behalf.

## Why we do not use sugar substitutes

We could push the sugar to zero with stevia or sucralose, but artificial sweeteners can leave a metallic aftertaste and there is ongoing research into how some of them interact with the gut microbiome. We would rather let fermentation do the work and keep the ingredient list short.

The result is a ginger fizz that tastes bright and refreshing without being syrupy. For anyone watching their sugar intake, this makes GingerBros a better mixer and standalone drink than most commercial alternatives.

> Of course, moderation still matters. But it is nice when the better choice also tastes better.`,
    references: [
      {
        label: 'Guideline: sugars intake for adults and children',
        source: 'World Health Organization',
        url: 'https://www.who.int/publications/i/item/9789241549028',
      },
      {
        label: 'How fermentation transforms sugars in food and drink',
        source: 'Journal of Food Science and Technology, PMC',
        url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8538215/',
      },
    ],
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
    content: `Thailand is hot. When you sweat, you lose water and electrolytes — mainly sodium, with smaller amounts of potassium, magnesium and chloride. While plain water should always be your first line of defence, the truth is that flavour matters: studies on "voluntary dehydration" show people simply drink more when a beverage tastes good. A naturally fermented ginger fizz can be exactly that kind of nudge.

## A little help from the rhizome

Ginger contains potassium and magnesium in small amounts. Combined with the carbonation and gentle spice, it can feel more satisfying than plain water on a humid afternoon, which makes it easier to keep sipping.

## When fizz fits — and when it does not

For everyday warm-weather hydration or a relaxed afternoon, a chilled bottle is a pleasant way to drink more fluids. After heavy, prolonged sweating — long runs, hot-yoga, a full day of manual work — your body needs meaningful sodium replacement, and that is a job for water plus salty food or a proper oral-rehydration drink, not soda.

> Our take: keep a few bottles chilled, enjoy them after light activity, and never rely on any flavoured drink as a substitute for plain water and electrolytes when you are seriously dehydrated.

Used wisely, GingerBros makes hydration a lot more interesting.`,
    references: [
      {
        label: 'Fluid replacement and voluntary dehydration: beverage palatability',
        source: 'Sports Medicine / American College of Sports Medicine',
        url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2908954/',
      },
    ],
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

## First, what pasteurization actually does

Pasteurization, named after Louis Pasteur who developed it in the 1860s, is the process of heating a food or drink to a specific temperature for a set time to kill microorganisms. It is a genuinely brilliant food-safety innovation that has saved countless lives — and it is also, by design, the thing that ends fermentation. Heat does not distinguish between bacteria you want and bacteria you do not.

That single fact explains every difference below.

## Unpasteurized

• Contains live cultures from natural fermentation
• Must stay refrigerated, always
• Shorter shelf life
• Brighter, slightly tart, more complex flavour that can keep evolving in the bottle
• Best for gut-health seekers and flavour chasers

## Pasteurized

• Shelf-stable at room temperature
• Longer shelf life, easier to travel with
• No live cultures
• Cleaner, more consistent, "locked-in" flavour
• Best for convenience, gifting, and warm-climate storage

## How to choose

If live cultures are your priority and you have fridge space, go unpasteurized. If you want something to stash in a cupboard, take on a trip, or give as a gift, pasteurized is the practical pick. Both start from exactly the same 7-day brew — the only difference is whether we apply heat at the end.

> There is no wrong answer — only the bottle that fits your week.`,
    references: [
      {
        label: 'Pasteurization: history and food-safety science',
        source: 'U.S. FDA / Encyclopædia Britannica',
        url: 'https://www.britannica.com/technology/pasteurization',
      },
    ],
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
    content: `Because our unpasteurized fizz is alive, it behaves a little differently from a regular soda. The cultures keep slowly working inside the sealed bottle, which is exactly what keeps the flavour lively — but it also means a few simple habits make all the difference.

## Keep it cold

Cold slows fermentation. Yeast activity drops dramatically near refrigerator temperatures, so the fridge is essentially a pause button. Store unpasteurized GingerBros in the fridge from the moment it arrives, and keep it there until you drink it. Warmth wakes the cultures back up, they eat more sugar, and they build extra carbon-dioxide pressure inside the bottle.

## Open it slowly

Always open a well-chilled bottle, and crack the cap slowly to let pressure escape gradually — you will hear it hiss in stages rather than erupt. If a bottle has been left out and warmed up, chill it for a few hours before opening, and open it over the sink the first time just in case.

## Drink it fresh

• Best within the date on the bottle
• Reseal and refrigerate if you do not finish it; it will lose fizz over a day or two once opened
• A little sediment at the bottom is completely normal — that is the living culture settling, not a flaw. Give it a gentle tilt rather than a vigorous shake.

## A quick safety note

Never store living fizz in a warm car, a sunny windowsill, or a freezer. Heat builds pressure; freezing expands the liquid and can crack glass. The fridge is the only home it wants.

> Treat it like fresh food, not a canned drink, and it will reward you with bright, lively flavour.`,
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
    content: `Ginger has been crossing borders for as long as people have been trading. Native to maritime Southeast Asia, it was one of the first spices to travel the ancient routes to the Mediterranean — the Romans prized it, and by the Middle Ages it was one of the most common spices in Europe after black pepper. The fizzy version we love today is the product of centuries of that wandering.

## Born in England

Fermented ginger beer became popular in 18th-century England, brewed with ginger, sugar, water, and a starter culture much like our ginger bug — often using a symbiotic mass nicknamed the "ginger beer plant". Pubs and households kept their own brews going for years, and by the Victorian era ginger beer was sold from stoneware bottles on street corners across Britain.

## A split in the family tree

It is worth knowing that "ginger beer" and "ginger ale" parted ways over time. Ginger beer stayed fermented, cloudy and assertive; ginger ale, which emerged in the 19th century (the famous "dry" style was perfected in Canada), became a clearer, sweeter, carbonated soft drink. Ours is firmly on the ginger-beer side of the family — fermented and alive.

## Spread across the world

As trade and empire expanded, ginger beer travelled to the Caribbean, where it picked up local spices and became central to drinks like the Dark 'n' Stormy, and across Asia, where fresh ginger was already a staple of daily cooking and medicine.

## A natural fit for Thailand

Thailand has cooked with ginger and its cousins — galangal, turmeric, fingerroot — for centuries. A bright, spicy, fermented ginger drink feels right at home here.

> At GingerBros, we like to think of our fizz as the latest chapter in a very long, very delicious story.`,
    references: [
      {
        label: 'Ginger: history, trade and culinary use',
        source: 'Encyclopædia Britannica',
        url: 'https://www.britannica.com/plant/ginger',
      },
      {
        label: 'The history of ginger beer and the "ginger beer plant"',
        source: 'Royal Society of Chemistry / historical food science',
        url: 'https://edu.rsc.org/everyday-chemistry/the-chemistry-of-ginger-beer/4014823.article',
      },
    ],
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
    content: `Taste two gingers side by side and you will notice they are not the same plant experience at all. Like wine grapes or coffee cherries, ginger has terroir — climate, soil, rainfall, and harvest timing change everything about how it tastes.

## The chemistry behind "spicy"

Ginger's heat comes mainly from gingerol, and its aroma from volatile oils like zingiberene. The exact balance of these compounds shifts with growing conditions and the age of the rhizome at harvest. That is why some ginger tastes sharp and lemony while other ginger tastes earthy and hot — it is not your imagination.

## What makes Thai ginger sing

Grown in warm, humid highlands with rich volcanic and alluvial soils, Thai ginger tends to be aromatic, juicy, and assertively spicy without turning harsh or fibrous. Young ginger (harvested early) is tender, pale-skinned and floral; mature ginger brings deeper, more pungent heat. We blend with intent depending on the season.

## We source close to home

We work with growers in northern Thailand so the rhizome reaches our brewhouse within days, fresh and whole — never dried, powdered, or shipped halfway around the world first. Freshness is the difference between a fizz that tastes alive and one that tastes flat, because those aromatic volatile oils fade quickly once ginger is cut or dried.

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
    content: `Ginger fizz is one of the most food-friendly drinks there is. Three things make it so versatile: its spice cuts through richness, its tartness lifts sweetness, and its carbonation physically scrubs fat and salt from your palate between bites — the same reason sparkling wine pairs with so many foods. Here is how to put that to work.

## Best food matches

• Spicy Thai curries — the fizz cools and refreshes between bites, and ginger is already a flavour cousin to galangal and lemongrass.
• Fatty grilled meats — ginger and carbonation cut through richness and reset the palate.
• Sharp, aged cheeses — the bubbles cleanse, the ginger contrasts.
• Sushi and raw fish — ginger is the traditional palate cleanser for a reason.
• Citrusy desserts — ginger and lime are old friends.

## Best spirits to mix

• Dark rum for a Dark 'n' Stormy
• Vodka for a Mule
• Blanco tequila for a spicy margarita
• Bourbon for a ginger highball
• Aperol or Campari for a low-alcohol, bittersweet spritz

## Garnishes that earn their place

• Fresh lime, every time
• Candied ginger for sweetness
• Mint for brightness
• A pinch of chili salt for adventurous palates
• A strip of cucumber for a cooling, spa-like version

## A simple framework

If you remember nothing else: match intensity (bold food wants bold ginger), and use contrast (fizz against fat, tart against sweet). Those two rules will get you most of the way to a perfect pairing.

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
    content: `Behind every bottle of GingerBros is a small team that treats brewing as a craft, not a production line. There are no flavour scientists in white coats here — just a handful of people, a brewhouse in Chiang Mai, and a stubborn belief that the best things are made slowly.

## Brewing by taste

Our head brewer, Nong, learned fermentation from her grandmother before there was a single piece of stainless steel in the building. She grew up watching jars of fermenting fruit and ginger bubble away on a shaded shelf, and she still trusts her senses over any gauge. To this day, every batch is smelled, tasted and adjusted by hand before it is approved for bottling.

> Numbers tell us the batch is safe. Our tongues tell us the batch is good.

![A glass of freshly poured GingerBros ginger fizz](/images/product-unpasteurized.jpg)

## A drink with a place

Working out of Chiang Mai means we are surrounded by some of the best fresh ginger in the world. Our team shops the same morning markets the home cooks do, choosing rhizomes by snapping them to check for juiciness and smelling the cut ends for brightness. That daily ritual ties the brew to the season — a batch in cool, dry January tastes subtly different from one in the humid heat of April, and we like it that way.

## Why small stays small

We could grow faster by pasteurizing everything and automating the line. We choose not to, because the moment the brew stops being hand-balanced, it stops being GingerBros. Staying small lets us keep making decisions by taste, pay our growers fairly, and stand behind every single bottle. Some things are worth keeping small.`,
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
    content: `Curious how the magic works? You can culture a simple ginger bug in your own kitchen. It will not be GingerBros — that takes our specific cultures, water and seven years of practice — but it will teach you to respect the process, and it is genuinely one of the most satisfying things you can grow on a countertop.

## What you need

• A clean glass jar (a 1-litre mason jar is perfect)
• Fresh, organic ginger — the wild yeast and bacteria live on the skin, so do not peel it, and avoid non-organic ginger that may be irradiated or treated
• White cane sugar (the microbes prefer simple sugar)
• Filtered, non-chlorinated water — chlorine and chloramine are designed to kill microbes, so they will sabotage your bug
• A breathable cover: a cloth or coffee filter held with a rubber band

## The daily ritual

• Day 1 — Add 1 tbsp grated ginger, 1 tbsp sugar, and 1 cup of water to the jar. Stir well and cover loosely so gas can escape but bugs cannot get in.
• Days 2 to 5 — Each day, "feed" it another tablespoon each of grated ginger and sugar, and stir vigorously to add oxygen. Keep it somewhere warm-ish (20–26°C is ideal) and out of direct sun.
• Around day 5 — You should see bubbles rising when you stir, and smell a bright, yeasty, gingery aroma. That fizz means the wild yeast has woken up and your bug is alive.

## Keeping it going

Once active, a ginger bug is like a pet. Feed it every day at room temperature, or "put it to sleep" in the fridge and feed it once a week. To make soda, strain off some of the liquid, mix it with sweetened juice or tea, bottle it, and let it carbonate for a day or two before refrigerating.

## Safety first

> If your bug ever smells rotten, grows fuzzy or coloured mould, or turns slimy and stringy, throw it out and start again. A healthy bug smells sharp, sweet, and gingery — never foul. When in doubt, trust your nose.

Respect the pressure when you bottle — use bottles built for carbonation, "burp" them daily, and never leave them sealed at room temperature for long. This is the oldest soda technology on earth, and a little caution keeps it fun.`,
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
    content: `Making a living drink that is also kind to the planet is a moving target. We are a small brewery, not a climate authority, so this is a progress report rather than a victory lap — including the parts we are still figuring out.

## What we are proud of

• Recyclable glass bottles instead of single-use plastic. Glass is endlessly recyclable without loss of quality, and we encourage refilling and returns where we can.
• Ginger pulp from brewing — a large volume of fibrous waste — goes to local farms as compost and animal feed instead of landfill.
• Short supply chains: we source ginger from growers close to the brewhouse, cutting the emissions of long-haul ingredient transport.
• Small batches mean very little overproduction or waste.

## What is hard

We will not pretend it is all solved. Refrigerated shipping for unpasteurized fizz uses real energy, and the cold chain is the single biggest part of our footprint. Glass is heavier than plastic, which raises transport emissions even as it lowers waste. These are genuine trade-offs, and lifecycle studies show the "best" packaging choice really does depend on how far it travels and whether it is reused.

## Where we are heading

We are working on lighter-weight bottles, denser regional shipping routes to reduce cold-chain mileage, and giving customers easy ways to return and reuse packaging.

> We would rather make slow, real progress than greenwash. Every quarter we pick one concrete improvement and actually ship it.

Sustainability is not a finish line for us. It is a brewing decision we make again with every batch.`,
    references: [
      {
        label: 'Comparative lifecycle assessment of glass vs plastic beverage packaging',
        source: 'Environmental science review, ScienceDirect',
        url: 'https://www.sciencedirect.com/science/article/pii/S0959652620304256',
      },
    ],
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

    // Inline image: ![alt](src)
    const imgMatch = /^!\[([^\]]*)\]\(([^)]+)\)$/.exec(trimmed);
    if (imgMatch) {
      const [, alt, src] = imgMatch;
      return (
        <figure key={i} className="my-8 -mx-2 sm:mx-0">
          <img
            src={src}
            alt={alt}
            loading="lazy"
            className="w-full rounded-2xl border border-soft-peach/60 shadow-sm object-cover max-h-[420px]"
          />
          {alt && (
            <figcaption className="mt-2 text-center font-body text-[13px] text-earth/60 italic">
              {alt}
            </figcaption>
          )}
        </figure>
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
  const { slug } = useParams<{ slug?: string }>();
  const [filter, setFilter] = useState<'All' | Category>('All');
  const [query, setQuery] = useState('');

  const activePost = slug ? POSTS.find((p) => p.slug === slug) ?? null : null;

  const openPost = (postSlug: string) => navigate(`/blog/${postSlug}`);
  const closePost = () => navigate('/blog');

  // A slug that matches no post should fall back to the journal index.
  useEffect(() => {
    if (slug && !activePost) navigate('/blog', { replace: true });
  }, [slug, activePost, navigate]);

  // Scroll to the top whenever we switch between the index and an article,
  // or move from one article to another.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [slug]);
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
      url: `https://gingerbrosshop.com/blog/${p.slug}`,
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
        url: `https://gingerbrosshop.com/blog/${activePost.slug}`,
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
          path={`/blog/${activePost.slug}`}
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

            <div className="relative max-w-[1280px] mx-auto px-6 pt-16 pb-12 text-center">
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
                  onClick={() => openPost(featured.slug)}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map((post) => (
                  <PostCard key={post.slug} post={post} onClick={() => openPost(post.slug)} />
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
                onClick={closePost}
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

            {/* References */}
            {activePost.references && activePost.references.length > 0 && (
              <div className="mt-12 pt-8 border-t border-soft-peach">
                <h2 className="flex items-center gap-2 font-display font-bold text-deep-brown text-xl mb-4">
                  <BookOpen className="w-5 h-5 text-rust" /> References &amp; further reading
                </h2>
                <ol className="space-y-3">
                  {activePost.references.map((ref, i) => (
                    <li key={ref.url} className="flex gap-3 font-body text-[14px] leading-relaxed">
                      <span className="font-semibold text-rust flex-shrink-0">{i + 1}.</span>
                      <span className="text-earth">
                        <a
                          href={ref.url}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className="font-medium text-deep-brown underline decoration-amber/60 underline-offset-2 hover:text-rust transition-colors inline-flex items-start gap-1"
                        >
                          {ref.label}
                          <ExternalLink className="w-3 h-3 mt-1 flex-shrink-0" />
                        </a>
                        <span className="block text-earth/60 text-[13px] italic">{ref.source}</span>
                      </span>
                    </li>
                  ))}
                </ol>
                <p className="mt-4 font-body text-[12px] text-earth/50 italic">
                  Sources are provided for general education. This article is not medical advice; consult a
                  healthcare professional for personal guidance.
                </p>
              </div>
            )}

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
                  <PostCard key={post.slug} post={post} onClick={() => openPost(post.slug)} />
                ))}
              </div>
            </div>
          )}
        </article>
      )}
    </div>
  );
}
