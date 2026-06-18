import { useState, useMemo, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
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
  Wine,
  X,
  BookOpen,
  ExternalLink,
} from 'lucide-react';
import SEO from '@/components/SEO';
import Newsletter from '@/components/Newsletter';

type Category = 'Recipe' | 'Drinks' | 'Health' | 'Brewing' | 'Culture' | 'Guide';

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
  Drinks: {
    icon: Wine,
    gradient: 'from-rust/25 via-amber/20 to-warm-gold/15',
    ring: 'text-rust',
    chip: 'bg-rust/15 text-rust',
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
      'Step inside our Bangkok brewhouse for a look at the wild ferment that powers every bottle — from raw rhizome to bubbling, living soda.',
    category: 'Brewing',
    readTime: '9 min',
    icon: FlaskConical,
    date: '2026-06-02',
    author: 'James, Founder',
    tags: ['fermentation', 'process', 'behind the scenes'],
    featured: true,
    image: '/images/story-brewing.webp',
    content: `Every bottle of GingerBros begins with something most people throw away: a knob of fresh ginger, a spoon of sugar, and a little patience. We call it the ginger bug, and it is the wild, living heart of our brew. There is no laboratory yeast, no factory carbonation tank, and no flavour concentrate. There is only time, temperature, and the invisible community of microbes that has lived on ginger skin for as long as ginger has grown.

In this piece I want to pull back the curtain on what actually happens in our brewhouse — the biology, the daily rhythm, and the judgement calls that no machine can make for us. By the end you will understand not just *how* we brew, but *why* a living soda is fundamentally different from anything that comes out of a factory.

## What exactly is a ginger bug?

A ginger bug is a natural starter culture — a spontaneous colony of wild yeasts and lactic-acid bacteria that live on the skin of fresh ginger. Feed them sugar and water, and within a week they wake up, multiply, and begin producing carbon dioxide. That CO2 is what gives our fizz its natural sparkle. No injected carbonation, no shortcuts.

Two groups of organisms do most of the work:

• **Wild yeasts** (largely *Saccharomyces* and its relatives) convert sugar into a trace of alcohol and a great deal of carbon dioxide. They are the engine of the carbonation.
• **Lactic-acid bacteria** (mainly *Lactobacillus*) produce the gentle lactic-acid tang that keeps the brew bright instead of cloying, and they steadily lower the pH into a naturally acidic, self-protecting range.

Together they form a tiny, self-regulating ecosystem: the yeasts and bacteria balance each other, and the rising acidity crowds out spoilage organisms. In short, it is a lot like a sourdough starter — but for soda.

![Fresh ginger being grated in the GingerBros brewhouse](/images/story-brewing.webp)

## How we build, feed, and keep the bug alive

This is the part most people never see, and it is the single most important habit in the whole operation. A ginger bug is not an ingredient you buy once — it is a culture you keep alive, and a living culture has to be **fed**.

**Building it from scratch (the first week).** We start by grating fresh, unpeeled organic ginger into filtered, non-chlorinated water with a measured spoon of cane sugar. The skin matters: the wild yeast and bacteria live on it, so we never peel and never use chlorinated tap water, which would kill the very microbes we are trying to wake up.

**Feeding it every single day.** For a bug to thrive, it needs fresh fuel daily. Each day we "feed" the culture with another spoonful of grated ginger and another spoonful of sugar, and then we **stir it well**. Both steps matter for a specific reason:

• **Adding sugar** replenishes the food supply. The microbes eat sugar continuously; starve them and the colony weakens, sours too far, and eventually dies.
• **Stirring daily** folds in oxygen, which the yeast needs to multiply vigorously in this open, early stage. Stirring also keeps the grated ginger submerged and discourages mould from forming on the surface.

**Reading the signs of a healthy bug.** Within a few days you should see a rush of fine bubbles when you stir, and smell a bright, sharp, yeasty-gingery aroma. That is the sign the culture is alive and ready to work. A healthy bug always smells clean and peppery — never foul, never rotten.

**Keeping the mother culture going between batches.** We never let the bug die between brews. Like a sourdough starter, it lives on indefinitely as long as it is fed. When we are brewing daily, it stays at room temperature and is fed every day. To slow it down between batches, we move it to the cold, where its metabolism nearly stops, and feed it about once a week to keep it healthy. Cold is the pause button; warmth and food are the wake-up call.

> A ginger bug is less like a recipe and more like a pet. Feed it, stir it, keep it clean, and it will reward you for years.

## Day by day in the brewhouse

Once the mother bug is lively, we use it to inoculate a full batch. Our 7-day process is slow on purpose. Here is roughly how a batch moves through our Bangkok brewhouse:

• Day 1 — We grate fresh, organic Thai ginger and combine it with filtered, non-chlorinated water, a measured amount of cane sugar, and a generous pour of active ginger bug to kick-start fermentation.
• Day 2 to 3 — The wild cultures bloom. Tiny bubbles cling to the side of the vessel. The smell turns bright and peppery as the yeast population climbs into the millions.
• Day 4 to 5 — Fermentation hits full stride. The ginger bug eats most of the sugar, leaving behind complexity instead of sweetness, while the pH drops into a safe, naturally acidic range.
• Day 6 — We taste, adjust, and balance each batch by hand, checking aroma, acidity and carbonation.
• Day 7 — Bottling day. The fizz is alive, lightly tart, and unmistakably gingery.

## The chemistry of the fizz

Carbonation in a living soda is not pumped in — it is grown. As yeast metabolises sugar through fermentation, it releases carbon dioxide. In a sealed bottle that gas has nowhere to go, so it dissolves back into the liquid under pressure. The result is a fine, persistent bead that feels softer on the tongue than the aggressive sparkle of force-carbonated soda. It is the same principle that puts bubbles in traditional sparkling wine and farmhouse cider.

This is also why a living soda keeps evolving in the bottle: as long as a little sugar and a few active cultures remain, fermentation creeps slowly forward. Keeping the bottle cold slows that process to a crawl, which is exactly why our raw line travels chilled.

## Unpasteurized by default, pasteurized by choice

Here is where I want to be completely honest, because it is a question we get all the time: **do we pasteurize?** The answer is — it depends on the bottle, and we make both.

Pasteurization means gently heating a drink to a set temperature to kill microorganisms and extend shelf life. It is a genuinely brilliant food-safety tool. The catch is that heat does not discriminate: the same process that makes a drink shelf-stable also ends the fermentation and removes the live cultures.

So we offer two honest options instead of pretending one size fits all:

• **Our unpasteurized (raw) line** keeps every live culture intact. It is brighter, more complex, and a little tart — but it must stay refrigerated and is best enjoyed fresh. This is the bottle for people who want the living, gut-friendly version.
• **Our pasteurized line** is gently heat-treated so it becomes shelf-stable, travel-friendly, and easy to gift. It trades the live cultures for convenience and a longer, more consistent shelf life.

> We would rather give you a clear choice between living and shelf-stable than quietly pasteurize everything and call it "raw".

Same 7-day brew, same real ginger, same care — the only difference is whether we apply heat at the very end. If live cultures are your priority, reach for the raw bottle and keep it cold. If you want something for the cupboard or a long trip, the pasteurized bottle is the practical pick.

## The takeaway

Great fizz is not manufactured — it is cultivated. Whether you choose the raw bottle or the pasteurized one, you are tasting a week of patient, living chemistry that started with a fed, stirred, carefully kept ginger bug. That is worth slowing down for.`,
    references: [
      {
        label: 'Fermentation: how yeast produces carbon dioxide and alcohol, and lactic-acid fermentation',
        source: 'Encyclopædia Britannica',
        url: 'https://www.britannica.com/science/fermentation',
      },
      {
        label: 'Why is milk pasteurized? Process, temperatures, and food safety',
        source: 'Encyclopædia Britannica',
        url: 'https://www.britannica.com/science/Why-Is-Milk-Pasteurized',
      },
    ],
  },
  {
    slug: 'moscow-mule',
    title: 'The Perfect Moscow Mule with GingerBros',
    excerpt:
      'Why our 7-day fermented ginger fizz makes the best Moscow Mule you have ever tasted — and the copper-mug ritual that goes with it.',
    category: 'Recipe',
    readTime: '5 min',
    icon: ChefHat,
    date: '2026-05-28',
    author: 'The GingerBros Kitchen',
    tags: ['cocktail', 'vodka', 'classic'],
    image: '/images/product-unpasteurized-2.jpg',
    content: `The Moscow Mule is one of the simplest cocktails in the canon — vodka, lime, ginger — which is exactly why the *quality* of each part matters so much. There is nowhere to hide. A great Mule lives or dies on its ginger, and our 7-day naturally fermented brew brings a depth of flavour that mass-market ginger sodas simply cannot match. Most commercial mules lean on sweet, one-note ginger beer; ours leans on a living, lightly tart fizz that lets the lime and vodka breathe.

## A little history

The Moscow Mule was invented in the early 1940s in Los Angeles, reportedly a three-way collaboration between a vodka distributor struggling to sell an then-unfamiliar spirit, a bar owner sitting on a surplus of unsold ginger beer, and an acquaintance who happened to have a line of copper mugs. The story is part myth, but the result is history: the drink single-handedly helped popularise vodka in mid-century America. The copper mug began as a marketing flourish — and it stuck, because it genuinely keeps the drink colder.

## Ingredients

• 60ml vodka
• 15ml fresh lime juice (always fresh — bottled lime tastes flat and slightly bitter)
• 120ml GingerBros Unpasteurized Ginger Fizz, well chilled
• Lime wedge and a sprig of mint for garnish

## Instructions

1. Fill a copper mug (or a highball glass) to the brim with ice — more ice actually melts *slower*, keeping the drink colder and less diluted.
2. Add the vodka and fresh lime juice.
3. Top slowly with GingerBros so the natural carbonation holds.
4. Stir once, gently, and garnish with a lime wedge and a sprig of mint that you have clapped between your palms to release its aroma.

## Why the copper mug actually matters

Copper is an excellent conductor of heat, so the mug rapidly takes on the icy temperature of the drink and holds it. That frosty exterior is not just for the photo — a colder drink tastes crisper, the carbonation feels sharper, and the ginger's heat reads cleaner against the cold. If you do not own copper mugs, a chilled highball works; just keep the glass in the freezer beforehand.

## Choosing your vodka

Because vodka is meant to be neutral, people assume it does not matter here — but it does, subtly. A clean, well-made vodka lets the ginger and lime shine; a harsh one adds an alcoholic burn that fights the ginger. You do not need anything expensive, just something smooth. The drink is the star, not the spirit.

## Why our fizz works so well

The natural fermentation gives our unpasteurized ginger fizz a subtle funk and complexity that elevates this classic from good to unforgettable. Because our brew is less sweet than standard ginger beer, you taste the ginger heat and the citrus rather than syrup — the difference between a Mule that refreshes and one that cloys.

## Make it your own

• **Mexican Mule** — swap vodka for mezcal for a smoky backbone.
• **Kentucky Mule** — use bourbon; the vanilla-oak notes love ginger.
• **Spicy Mule** — muddle a slice of fresh chilli or add 10ml fresh ginger syrup for extra fire.
• **Zero-proof Mule** — skip the spirit, add a splash of soda and a dash of aromatic bitters for depth.

## Common mistakes to avoid

• Using bottled lime juice — it tastes dull and flat; fresh is non-negotiable.
• Skimping on ice — too little ice melts faster and waters the drink down.
• Stirring too hard — you will knock the natural carbonation out of the fizz.

> Pro tip: build the drink in this order — ice, spirit, lime, then fizz last — so the carbonation goes in at the end and stays lively all the way to the bottom of the mug.`,
  },
  {
    slug: 'dark-and-stormy',
    title: 'Dark ’n’ Stormy with a Thai Ginger Kick',
    excerpt: 'A rum-forward classic gets brighter with fresh, fiery Thai ginger and live-culture fizz.',
    category: 'Recipe',
    readTime: '5 min',
    icon: ChefHat,
    date: '2026-05-20',
    author: 'The GingerBros Kitchen',
    tags: ['cocktail', 'rum', 'classic'],
    image: '/images/product-detail-1.jpg',
    content: `The Dark ’n’ Stormy is Bermuda’s national drink for a reason: dark rum and ginger were made for each other. The rum brings molasses, caramel and a little funk; the ginger brings heat and brightness to cut straight through it. Our version swaps the usual flat soda for GingerBros, so instead of sugar water you get real, living ginger and natural carbonation. The drink is named for its appearance — dark rum clouding through pale, stormy ginger like a squall rolling in off the Atlantic.

## The most protected cocktail in the world

Here is a fun bit of trivia: "Dark 'n Stormy" is a registered trademark held by Gosling's, the Bermudian rum house, and the name is legally tied to their Black Seal rum. They have actually defended it in court. Bartenders take liberties with the rum all the time at home, but if you see it spelled exactly that way on a menu, tradition says it should be poured with Gosling's, dark and layered, not stirred together.

## Ingredients

• 60ml dark rum (Gosling’s Black Seal is traditional; any rich, dark rum works)
• 120ml GingerBros Unpasteurized Ginger Fizz, well chilled
• 10ml fresh lime juice
• Lime wheel and candied ginger for garnish

## Instructions

1. Fill a tall glass with ice.
2. Add the fresh lime juice and top with chilled GingerBros.
3. Float the dark rum slowly over the back of a bar spoon so it sits on top in a dramatic, stormy layer.
4. Garnish with a lime wheel and a piece of candied ginger — and give it one gentle stir just before drinking.

## Why the layering matters

This is the detail that separates a good Dark 'n' Stormy from a great one. Dark rum is denser than the ginger fizz, but pouring it last and gently lets it sit on top first, then slowly cascade down through the drink as the ice shifts. The result is a built-in flavour arc: the first sip is bright, fizzy and gingery; the last is rich, dark and molasses-deep. Stir it all together up front and you lose that journey. It is theatre — but it is also genuinely better.

## Choosing your rum

Reach for a dark or "black" rum rather than a light or spiced one. You want the heavy molasses character that stands up to the ginger's bite. Aged dark rums add vanilla and oak; younger black rums keep it punchy and traditional. Avoid pre-spiced rums here — the ginger is providing all the spice you need.

## A note on the lime

The classic Bermudian recipe is sometimes served without lime, but a squeeze of fresh lime brightens the whole thing and balances the rum's sweetness. Our unpasteurized fizz already carries a faint lactic tartness from its live cultures, so a little lime amplifies that fresh, clean edge rather than fighting it.

> Pro tip: serve it tall and over plenty of ice. This is a long, slow sipper meant for a hot evening — the kind of drink that tastes like the tropics whether or not you are anywhere near them.`,
  },
  {
    slug: 'ginger-margarita',
    title: 'Ginger Fizz Margarita',
    excerpt: 'Tequila, lime, and fiery ginger fizz come together in a refreshingly different margarita.',
    category: 'Recipe',
    readTime: '6 min',
    icon: ChefHat,
    date: '2026-05-12',
    author: 'The GingerBros Kitchen',
    tags: ['cocktail', 'tequila', 'spicy'],
    image: '/images/product-detail-2.jpg',
    content: `The classic margarita is a near-perfect balance of strong (tequila), sour (lime) and sweet (orange liqueur). This version keeps that balance but adds a fourth dimension — spice and effervescence — by replacing some of the orange liqueur with ginger fizz. The result is lighter, drier and more refreshing, with a warm ginger backbone that makes it perfect for a hot Bangkok afternoon.

## Ingredients

• 45ml blanco tequila (100% agave is worth it — it tastes cleaner and greener)
• 30ml fresh lime juice
• 15ml triple sec or orange liqueur
• 60ml GingerBros Unpasteurized Ginger Fizz, chilled
• Salt or chili-salt rim and a jalapeño slice (optional)

## Instructions

1. Rub a lime wedge around the rim of a rocks glass and dip it in salt (or a chili-lime salt for extra kick). Tip: only salt half the rim, so you can choose salt or no-salt with each sip.
2. Fill the glass with ice.
3. Shake the tequila, lime juice, and triple sec hard with ice for 10–12 seconds, then strain over the fresh ice.
4. Top with chilled GingerBros and garnish with a jalapeño slice.

## Why ginger and tequila get along

Blanco (unaged) tequila is bright, peppery and faintly vegetal — characteristics that echo the natural heat of fresh ginger rather than clash with it. They share a family of aromatic, slightly herbal notes, so the pairing feels intentional rather than novel. The fizz also does practical work: it lengthens the drink, lowers the overall sugar, and keeps each sip lively and effervescent instead of dense and syrupy like a frozen-machine margarita.

## Reposado vs blanco

Blanco keeps things crisp and citrus-forward, which is our default. If you prefer something rounder, a reposado (lightly aged in oak) adds vanilla and caramel that play beautifully against ginger — closer in spirit to a margarita-meets-Mule. Either works; it simply shifts the drink from sharp to mellow.

## Spice control

This is a build-your-own-heat cocktail:

• **Mild** — use the jalapeño purely as a garnish.
• **Medium** — add one or two thin slices to the shaker.
• **Hot** — muddle the jalapeño (seeds included) in the shaker before adding ice, then double-strain to catch the bits.

Because the chilli goes in at the shaking stage, you stay fully in charge of the burn.

## Make it a pitcher

Scale the tequila, lime and triple sec for the crowd and keep that base chilled in a jug. Add ice and top each glass with GingerBros individually, to order — that way every margarita keeps its fizz instead of going flat in the pitcher.

> The result is tart, spicy, and dangerously drinkable. Serve it the moment it is built, while the carbonation is at its liveliest.`,
  },
  {
    slug: 'spicy-ginger-lemonade',
    title: 'Spicy Ginger Lemonade (Zero-Proof)',
    excerpt: 'A bright, alcohol-free refresher that still feels like a special occasion.',
    category: 'Recipe',
    readTime: '5 min',
    icon: ChefHat,
    date: '2026-05-05',
    author: 'The GingerBros Kitchen',
    tags: ['mocktail', 'zero-proof', 'citrus'],
    image: '/images/product-detail-3.jpg',
    content: `Not every great drink needs alcohol. A well-made zero-proof drink is not a sad consolation prize — it is a deliberately built beverage with the same attention to balance you would give a cocktail. This spicy ginger lemonade leans on real ginger heat, fresh citrus and natural carbonation to wake up your palate, with no hangover and no compromise. It is the drink we reach for when we want something that *feels* like an occasion without the alcohol.

## Ingredients

• 30ml fresh lemon juice
• 15ml honey or simple syrup (warm the honey slightly so it dissolves)
• 120ml GingerBros Unpasteurized Ginger Fizz, chilled
• Lemon wheel and a sprig of fresh mint
• Optional: a pinch of sea salt to round out the flavour

## Instructions

1. If using honey, stir it into the lemon juice first with a splash of warm water so it dissolves completely — honey will not mix into a cold drink otherwise.
2. Shake the lemon juice and sweetener with ice until well chilled.
3. Strain into an ice-filled glass.
4. Top with chilled GingerBros and garnish with a lemon wheel and a sprig of mint you have clapped between your palms.

## Why it beats regular lemonade

Most commercial lemonade is essentially sugar water with a little citrus flavouring — often 25 grams of sugar or more per glass. By letting the fermented ginger fizz carry the carbonation and a big share of the flavour, you can use far less added sweetener and still get something that tastes festive and complex. The ginger's natural heat fills the space where all that sugar used to be.

## The pinch-of-salt trick

This is the secret that separates a flat lemonade from a vibrant one. A tiny pinch of salt does not make the drink taste salty — it suppresses bitterness and amplifies the perception of sweetness and sourness, so the lemon reads brighter and the whole glass tastes more "alive". Professional kitchens use the same trick in everything from fruit to desserts.

## Make it your own

• **Herbal** — muddle a few basil or Thai basil leaves before topping with fizz.
• **Berry** — add a spoon of muddled raspberries or a splash of pomegranate.
• **Extra-spicy** — add a thin slice of fresh chilli or a few cracks of black pepper.
• **Cucumber-mint** — muddle cucumber for a cooling, spa-like version.

## Kid- and crowd-friendly

Batch the lemon-and-honey base in a jug and keep it chilled, then top each glass with fizz to order so it never goes flat. It is a genuine crowd-pleaser at a barbecue: adults can add a measure of vodka or gin, while kids and non-drinkers get exactly the same vibrant glass.

> It is crisp, naturally effervescent, and far lower in sugar than most lemonades — especially when you let the ginger do most of the flavour work.`,
  },
  {
    slug: 'ginger-glazed-chicken',
    title: 'Ginger Fizz Glazed Chicken Wings',
    excerpt: 'Reduce GingerBros into a sticky, spicy glaze for oven or grill.',
    category: 'Recipe',
    readTime: '6 min',
    icon: ChefHat,
    date: '2026-04-26',
    author: 'The GingerBros Kitchen',
    tags: ['food', 'glaze', 'dinner'],
    image: '/images/product-unpasteurized.jpg',
    content: `Ginger fizz is not just for drinking. Reduce it down and it becomes a tangy, caramelised glaze that clings to wings, tofu or roasted vegetables in a glossy, sticky lacquer. It is one of our favourite ways to use up a bottle that has lost a little of its sparkle — the carbonation does not matter once it hits the pan, but all that real ginger flavour does.

## Ingredients

• 500g chicken wings (or firm tofu cubes for a vegan version)
• 240ml GingerBros Ginger Fizz (unpasteurized or pasteurized — both reduce beautifully)
• 2 tbsp soy sauce
• 1 tbsp honey
• 1 tsp grated fresh ginger
• 2 cloves garlic, minced
• Optional: 1 tsp chili flakes or a spoon of gochujang
• Sesame seeds and sliced scallions for garnish

## Instructions

1. Pat the wings completely dry and season with salt — dry skin is the single biggest secret to crispiness, because surface moisture steams instead of browns.
2. Simmer the ginger fizz, soy sauce, honey, ginger, garlic and any chilli in a small saucepan over medium heat until reduced by half and syrupy, about 8–10 minutes. Stir often near the end so it does not scorch — sugar goes from glaze to burnt fast.
3. Toss the wings in half the glaze and bake at 200°C (400°F) for 25–30 minutes, turning once.
4. Brush with the remaining glaze and broil/grill for 2–3 minutes until sticky and lacquered.
5. Finish with sesame seeds and scallions.

## The science of the glaze

This recipe is really a lesson in two kinds of browning. As the fizz reduces, its residual sugars concentrate and begin to **caramelise**, deepening in colour and flavour. Meanwhile, when the glaze hits the hot wings, the sugars and the proteins in the meat undergo the **Maillard reaction** — the same chemistry behind seared steak and toasted bread — producing hundreds of savoury, roasted aroma compounds. The soy sauce adds glutamate-rich umami (a product of its own fermentation), so you are really layering two fermented ingredients into one complex sauce.

## Make it a meal

• **Vegetarian** — press firm tofu, cube it, and roast until golden before glazing; the glaze caramelises on the edges.
• **Sheet-pan dinner** — toss broccoli, carrots or cauliflower in a little glaze and roast alongside.
• **Rice bowl** — spoon extra reduced glaze over steamed rice with the wings and a handful of herbs.

## Storage and reuse

The reduced glaze keeps in the fridge for up to a week in a sealed jar. Brush it on grilled corn, stir it into a stir-fry, or use it as a dipping sauce. The live cultures cook off in the reduction, but the real ginger flavour stays intense and bright.

> Make a double batch of glaze. You will find a use for it within days — it is that good.`,
  },
  {
    slug: 'ginger-affogato-float',
    title: 'Ginger Fizz Affogato Float',
    excerpt: 'A grown-up dessert: cold ginger fizz poured over vanilla ice cream and a shot of espresso.',
    category: 'Recipe',
    readTime: '4 min',
    icon: ChefHat,
    date: '2026-04-18',
    author: 'The GingerBros Kitchen',
    tags: ['dessert', 'coffee', 'float'],
    image: '/images/bundle-6pack.jpg',
    content: `When you cannot decide between dessert, coffee and a cold drink, make all three at once. The affogato — Italian for "drowned" — is traditionally a scoop of vanilla gelato drowned in a shot of hot espresso. We give it a spicy, fizzy twist by adding cold ginger fizz, turning a two-ingredient classic into a theatrical, temperature-contrasting float that is our answer to a sweltering afternoon.

## Ingredients

• 2 scoops vanilla bean ice cream (the better the vanilla, the better the float)
• 1 shot hot espresso
• 120ml chilled GingerBros Ginger Fizz
• Grated dark chocolate or candied ginger to finish

## Instructions

1. Chill your glass in the freezer for a few minutes first — a cold glass keeps the ice cream from melting too fast and gives you longer to enjoy it.
2. Drop the ice cream into the tall glass.
3. Pour the hot espresso over the top so it starts to melt the edges and releases its aroma.
4. Slowly top with cold ginger fizz — it will foam dramatically as the carbonation hits the fat in the ice cream.
5. Finish with grated dark chocolate or a few shards of candied ginger.

## Why the foam happens

That dramatic eruption of foam is genuine food science. Ice cream is an emulsion full of milk proteins and fat. When carbon dioxide escapes from the fizz, those proteins and fats trap the gas in a web of tiny, stabilised bubbles instead of letting them pop — exactly the same mechanism that makes a root-beer float foam over its glass. Colder ingredients hold more dissolved CO₂, so chilling everything first makes the foam both more controlled and more impressive.

## Flavour balance

What makes this work as a dessert is the sheer number of contrasts happening at once: **hot** espresso against **cold** ice cream, **bitter** coffee against **sweet** vanilla, and the **warm spice** of ginger threading through all of it. Ginger and coffee are natural partners — both have roasty, aromatic depth — and the fizz lifts the whole thing so it never feels heavy.

## Variations

• **Boozy** — add 15ml of dark rum or coffee liqueur for an adults-only version.
• **Vegan** — use a good coconut or oat-milk ice cream; the foam still works thanks to the plant fats.
• **Decadent** — swap vanilla for salted-caramel or dark-chocolate ice cream.

> Serve it the instant it is built, with a spoon and a straw, and eat it fast — the whole point is to catch the hot, cold, fizzy and creamy all in the same mouthful before it melts together.`,
  },
  {
    slug: 'gut-health',
    title: 'Ginger Fizz & Gut Health: What You Should Know',
    excerpt: 'The science behind ginger, fermentation, and why your gut loves unpasteurized ginger fizz.',
    category: 'Health',
    readTime: '9 min',
    icon: Heart,
    date: '2026-06-08',
    author: 'GingerBros Wellness',
    tags: ['gut health', 'probiotics', 'science'],
    image: '/images/product-unpasteurized.png',
    featured: true,
    content: `Ginger has been used for digestive health for thousands of years, from Ayurvedic medicine in India to traditional Chinese formulas to the kitchens of Southeast Asia. Modern research is now catching up to what traditional medicine long suspected — and in some areas, confirming it outright. This article walks through what the evidence actually says, where it is strong, and where the honest answer is "we are not sure yet."

A quick, important note before we start: food is not medicine, and no drink cures anything. What follows is a summary of published research, with sources you can read yourself. If you have a medical condition, talk to a professional rather than a beverage label.

## Meet your gut microbiome

Your large intestine is home to trillions of microorganisms — bacteria, yeasts and others — collectively called the gut microbiome. Far from being passive passengers, these microbes help digest fibre, produce certain vitamins, train your immune system, and manufacture short-chain fatty acids that nourish the cells lining your gut. Research over the last two decades has increasingly linked a *diverse* microbiome with better digestive, metabolic and even mental health. Diversity, in this context, generally means resilience.

## The compounds in ginger that do the work

Ginger's biological activity comes largely from a family of pungent compounds called **gingerols**, and the **shogaols** they convert into when ginger is heated or dried. These compounds have well-documented anti-inflammatory and antioxidant effects in laboratory and clinical studies — they scavenge free radicals and dampen several inflammatory signalling pathways. In the context of digestion, the research suggests ginger can help:

• **Reduce nausea** — this is ginger's single best-evidenced benefit, with support across motion sickness, morning sickness and post-operative nausea.
• **Speed up gastric emptying** — ginger appears to increase gastric motility, which may ease that heavy, over-full feeling after a big meal.
• **Soothe digestion** — many people find it reduces bloating and gas, though responses vary.
• **Support a healthy inflammatory response** throughout the body.

## Where fermentation and live cultures come in

This is where a *living* ginger soda differs from a flavoured one. Our unpasteurized line delivers live cultures straight from natural fermentation. A growing body of research links fermented foods to a more diverse microbiome: a widely cited Stanford study found that a diet high in fermented foods increased gut-microbiome diversity and lowered nearly twenty markers of inflammation in just ten weeks — an effect a high-fibre diet did not match over the same period.

It is worth being precise about what this does and does not mean. Fermented foods are not a magic bullet, and a single drink is not a clinical dose. But as part of a varied diet, foods and drinks carrying live cultures are one easy, enjoyable lever you can pull.

> Keep in mind: the live-culture benefits apply only to our unpasteurized line. Our pasteurized bottles are gently heat-treated for shelf stability, which removes the live cultures — a fair trade for travel and gifting, but a different product nutritionally.

## How to actually get the benefit

• Choose the **unpasteurized** bottle if live cultures are your goal, and keep it cold so the cultures stay viable.
• Pair it with **prebiotic fibre** (think onions, garlic, oats, bananas) — fibre is the fuel your gut microbes live on.
• Think **consistency over intensity**: a little variety of fermented foods across the week beats an occasional megadose.
• Do not expect overnight miracles; the microbiome shifts gradually.

## A realistic bottom line

Ginger fizz is not a supplement, and we will never pretend otherwise. But if you enjoy a drink made with real ginger and live cultures instead of artificial flavour and a heavy sugar load, you are making a small, pleasant choice that the science treats kindly. If gut health is your goal, the label matters more than the marketing — look for the word "unpasteurized," keep it cold, and let it be one good habit among many.`,
    references: [
      {
        label: 'The health benefits of ginger, including nausea, digestion and gastric motility',
        source: 'Cleveland Clinic (2023)',
        url: 'https://health.clevelandclinic.org/ginger-health-benefits',
      },
      {
        label: 'Fermented-food diet increases microbiome diversity, decreases inflammatory proteins',
        source: 'Stanford Medicine (2021)',
        url: 'https://med.stanford.edu/news/all-news/2021/07/fermented-food-diet-increases-microbiome-diversity-lowers-inflammation.html',
      },
      {
        label: 'Anti-oxidative and anti-inflammatory effects of ginger: review of current evidence',
        source: 'International Journal of Preventive Medicine, PMC',
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3665023/',
      },
    ],
  },
  {
    slug: 'probiotics-prebiotics',
    title: 'Probiotics vs Prebiotics: A Simple Guide',
    excerpt: 'Learn the difference and how to pair unpasteurized ginger fizz with gut-friendly foods.',
    category: 'Guide',
    readTime: '6 min',
    icon: Leaf,
    date: '2026-05-30',
    author: 'GingerBros Wellness',
    tags: ['gut health', 'nutrition', 'guide'],
    image: '/images/product-pasteurized.png',
    content: `The two words sound almost identical, and the marketing on most supermarket shelves does nothing to clear up the confusion. Here is the simple version, and then we will go a little deeper: **probiotics** are live, beneficial microorganisms, and **prebiotics** are the special fibres that feed them. One is the seed, the other is the fertiliser. You need both.

## Probiotics: the live cultures

Probiotics are the beneficial bacteria (and sometimes yeasts) themselves. The widely used scientific definition, from an expert panel convened around the World Health Organization's guidance, is "live microorganisms that, when administered in adequate amounts, confer a health benefit." Three things have to be true: the microbes must be **alive**, present in **adequate amounts**, and tied to a **documented benefit**.

They turn up in fermented foods — yoghurt, kefir, kimchi, sauerkraut, miso — and in unpasteurized fermented drinks. Our unpasteurized ginger fizz carries live cultures straight from natural fermentation, so every chilled bottle delivers them to your gut. (Note the word *unpasteurized*: heat treatment, by design, removes live cultures.)

One nuance worth knowing: different strains do different things. "Probiotic" is a category, not a single magic ingredient, and the research is strain-specific. That is a reason to get your cultures from a *variety* of real fermented foods rather than relying on one source.

## Prebiotics: the fuel

Prebiotics are not alive at all. They are specialised plant fibres your own digestive enzymes cannot break down, so they travel intact to the large intestine, where your resident bacteria ferment them for fuel. As your microbes digest these fibres, they produce short-chain fatty acids that nourish your gut lining — which is a big part of why fibre is so good for you. Prebiotic-rich foods include:

• Bananas (especially slightly green ones)
• Oats and barley
• Garlic, onions, and leeks
• Asparagus
• Chicory root and Jerusalem artichoke
• Cooled cooked potatoes and rice (which form resistant starch)

## Putting them together: synbiotics

> Think of probiotics as the seed and prebiotics as the water. You need both for a thriving gut garden.

When you eat probiotics and prebiotics together, the combination is sometimes called a **synbiotic** — the live cultures and their food arrive as a package, giving the beneficial microbes a better chance to settle in and get to work. You do not need a supplement aisle to do this. A glass of GingerBros alongside a fibre-rich meal — say, a grain bowl with onions, garlic and greens — is an easy, genuinely enjoyable synbiotic.

## A simple weekly habit

You do not have to overthink any of this. Aim for a little variety of fermented foods across the week, eat plenty of plants for fibre, and your gut largely takes care of the rest. Slow and consistent beats intense and occasional.`,
    references: [
      {
        label: 'Probiotics: definition and the criteria for a live microorganism to qualify',
        source: 'International Scientific Association for Probiotics and Prebiotics (ISAPP)',
        url: 'https://isappscience.org/for-scientists/resources/probiotics/',
      },
      {
        label: 'Prebiotics: the consensus definition and how they feed your gut microbes',
        source: 'International Scientific Association for Probiotics and Prebiotics (ISAPP)',
        url: 'https://isappscience.org/for-scientists/resources/prebiotics/',
      },
    ],
  },
  {
    slug: 'ginger-immunity',
    title: 'Ginger for Immunity: Fact or Fad?',
    excerpt: 'What research actually says about ginger, inflammation, and immune support.',
    category: 'Health',
    readTime: '6 min',
    icon: Sparkles,
    date: '2026-05-22',
    author: 'GingerBros Wellness',
    tags: ['immunity', 'science', 'inflammation'],
    image: '/images/hero-bottle.png',
    content: `"Boosts your immune system" might be the most overused phrase in all of wellness marketing. So let us be careful and honest here. Ginger is one of the most studied spices on the planet, and the results are genuinely promising — but promising is not the same as magical, and the word "immunity" deserves a lot more nuance than a label usually gives it.

## What the studies actually suggest

Clinical and laboratory studies indicate ginger can:

• **Support a healthy inflammatory response** — gingerols and shogaols inhibit several inflammatory signalling pathways in the body.
• **Reduce muscle soreness after exercise** in some trials, likely through that same anti-inflammatory action.
• **Help with nausea and digestive discomfort** — comfortably its best-evidenced benefit.
• **Provide antioxidants** that help protect cells from oxidative stress, the cumulative "wear and tear" caused by reactive molecules.

## Why "boosting" immunity is the wrong mental model

Here is the part the supplement aisle never tells you. Your immune system is not a single dial you can turn up. It is a vast, finely tuned network of cells and signals, and in many situations *more* immune activity is actively harmful — autoimmune disease and chronic inflammation are examples of an immune system doing too much, not too little. So a food that genuinely "boosted" immunity on demand would be as likely to hurt as to help.

What the evidence actually supports is more useful: chronic, low-grade inflammation and a poorly diversified gut microbiome are bad for immune health, and diets that are anti-inflammatory, fibre-rich and friendly to fermented foods tend to support a better-regulated immune system. The goal is *balance and regulation*, not a boost. Ginger — anti-inflammatory, antioxidant, and easy to enjoy — fits comfortably into that picture.

## The gut-immune connection

There is a reason gut health keeps coming up in immunity conversations: a large share of your immune cells live in and around the gut, in constant dialogue with your microbiome. That is one mechanism by which fermented foods appear to influence immune markers — the Stanford fermented-foods study, for instance, found reduced inflammatory proteins and calmer immune-cell activation. Our unpasteurized line adds that live-culture angle on top of the ginger.

## A realistic take

None of this means ginger fizz replaces medicine, vaccines, sleep, exercise or a balanced diet — the genuinely powerful levers for immune health. But choosing a drink made with real ginger and no artificial junk, ideally one carrying live cultures, is a small and pleasant way to support overall wellness. Treat it as one good habit among many, not a shield in a bottle.`,
    references: [
      {
        label: 'Anti-oxidative and anti-inflammatory effects of ginger: review of current evidence',
        source: 'International Journal of Preventive Medicine, PMC',
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3665023/',
      },
      {
        label: 'Fermented foods reduce inflammatory proteins and immune-cell activation',
        source: 'Stanford Medicine (2021)',
        url: 'https://med.stanford.edu/news/all-news/2021/07/fermented-food-diet-increases-microbiome-diversity-lowers-inflammation.html',
      },
    ],
  },
  {
    slug: 'low-sugar-drinking',
    title: 'Why We Keep the Sugar Lower',
    excerpt: 'Most of the sugar in our brew is eaten by the ginger bug during fermentation.',
    category: 'Health',
    readTime: '5 min',
    icon: Heart,
    date: '2026-05-14',
    author: 'GingerBros Wellness',
    tags: ['low sugar', 'fermentation', 'nutrition'],
    image: '/images/product-detail-1.jpg',
    content: `A typical can of commercial ginger ale or soda contains somewhere around 30–40 grams of sugar. To put that in perspective: the World Health Organization recommends adults keep "free sugars" under 10% of daily energy — roughly 50 grams, or about 12 teaspoons — and suggests that dropping to 5% brings further benefit. A single sweet soda can eat most of that allowance in one go. Worse, most so-called ginger "ale" is not even fermented; it is carbonated sugar water with ginger flavouring added. We take a fundamentally different approach.

## The ginger bug eats the sugar

This is the quiet superpower of real fermentation, and it is worth understanding because it is genuinely different from how a diet soda is made. During our 7-day natural process, the wild yeast and bacteria in the ginger bug *consume* much of the cane sugar we start with as their food, converting it into carbon dioxide (the bubbles), a trace of organic acids (the bright tang) and a cascade of flavour compounds. By the time we bottle, only a modest amount of residual sugar remains — just enough to balance the ginger's heat and sustain the natural carbonation.

In other words, the lower sweetness is not something we engineer out with chemistry at the end. It is something the microbes do for us, gradually, over a week. The drink tastes less sweet because it genuinely *is* less sweet.

## Why we do not use artificial sweeteners

We could push the sugar number to zero with stevia, sucralose or aspartame. We choose not to, for a few reasons. Many artificial sweeteners carry a metallic or lingering aftertaste that fights the clean ginger flavour we work hard to build. There is also active scientific debate about how some non-nutritive sweeteners interact with the gut microbiome — and since our whole philosophy is built around a healthy ferment, adding ingredients that may disrupt gut microbes would be working against ourselves. We would rather let fermentation do the job and keep the ingredient list honest and short.

## What this means for you

• **As a standalone drink**, it satisfies a soda craving with a fraction of the sugar.
• **As a mixer**, it will not bury your spirit under syrup — your cocktail tastes of ginger and citrus, not sugar.
• **For anyone watching their intake**, it is a far gentler choice than a conventional ginger ale, without resorting to sweeteners.

> Of course, moderation still matters — lower-sugar is not no-sugar, and it is still a treat. But it is a genuinely nice thing when the better choice also happens to taste better.`,
    references: [
      {
        label: 'Healthy diet: limit free sugars to under 10% of total energy intake',
        source: 'World Health Organization',
        url: 'https://www.who.int/news-room/fact-sheets/detail/healthy-diet',
      },
      {
        label: 'Fermentation: how microbes consume sugar to produce CO₂ and acids',
        source: 'Encyclopædia Britannica',
        url: 'https://www.britannica.com/science/fermentation',
      },
    ],
  },
  {
    slug: 'hydration-electrolytes',
    title: 'Ginger Fizz, Hydration, and Hot Days',
    excerpt: 'Can a fermented ginger drink actually help on sweaty afternoons?',
    category: 'Health',
    readTime: '5 min',
    icon: Leaf,
    date: '2026-05-08',
    author: 'GingerBros Wellness',
    tags: ['hydration', 'summer', 'electrolytes'],
    image: '/images/product-detail-2.jpg',
    content: `Bangkok is hot, and staying hydrated here is not optional — it is daily maintenance. When you sweat, you lose water *and* electrolytes — mainly sodium, with smaller amounts of potassium, magnesium and chloride. These minerals carry the electrical signals your nerves and muscles run on, which is why serious dehydration leaves you foggy, crampy and drained. So can a fizzy ginger drink actually help on a sweaty afternoon? The honest answer is: in the right way, yes — but not for the reason most "hydration" marketing implies.

## The most underrated factor in hydration: taste

Here is something the research is surprisingly clear about. The biggest reason people fail to hydrate is simply that they do not drink enough — and they do not drink enough partly because plain water is boring. Studies on fluid intake show that **people voluntarily drink more when a beverage is palatable and flavourful**. A drink you actually *want* to reach for does more for your hydration than a "perfect" electrolyte formula you leave half-finished. A cold, lively ginger fizz is exactly that kind of nudge: it makes drinking more fluid feel like a pleasure rather than a chore.

## A little help from the rhizome

Ginger naturally contains small amounts of potassium and magnesium. These quantities are modest — this is not an electrolyte tablet — but combined with the carbonation and the gentle warmth of the spice, a ginger fizz tends to feel more satisfying and "complete" than plain water on a humid day. Ginger's long-standing reputation for settling the stomach also makes it a friendly choice when heat has left you queasy.

## When fizz fits — and when it does not

Honesty matters here, so let us draw a clear line:

• **Everyday warm-weather sipping or a relaxed afternoon** — a chilled bottle is a genuinely pleasant way to keep your fluid intake up.
• **Heavy, prolonged sweating** — long runs, a full session of hot yoga, a day of manual labour outdoors — calls for meaningful sodium replacement. That is a job for water plus salty food, or a proper oral-rehydration solution, not a soda.

In short: use it to drink *more*, not as a medical rehydration drink.

> Our take: keep a few bottles chilled, enjoy them through the day and after light activity, and never lean on any flavoured drink as a substitute for plain water and electrolytes when you are seriously dehydrated. Used wisely, GingerBros simply makes the ordinary, important habit of drinking enough a lot more interesting.`,
    references: [
      {
        label: 'Water, hydration and health — palatability, thirst, and voluntary fluid intake',
        source: 'Nutrition Reviews (2010), PMC',
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC2908954/',
      },
    ],
  },
  {
    slug: 'unpasteurized-vs-pasteurized',
    title: 'Unpasteurized vs Pasteurized: The Honest Difference',
    excerpt: 'A clear, no-spin comparison so you can choose the bottle that fits your life.',
    category: 'Guide',
    readTime: '6 min',
    icon: Leaf,
    date: '2026-04-30',
    author: 'GingerBros Wellness',
    tags: ['guide', 'probiotics', 'storage'],
    image: '/images/product-pasteurized.png',
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

## Side by side

Think of it as the same drink at two different moments in its life:

• **Flavour** — unpasteurized is brighter, tangier and more layered, with a faint lactic edge from the live cultures; pasteurized is cleaner, rounder and more uniform from bottle to bottle.
• **Storage** — unpasteurized must live in the fridge; pasteurized is happy in the cupboard.
• **Shelf life** — unpasteurized is best enjoyed fresh; pasteurized keeps for months.
• **Cultures** — unpasteurized carries live cultures; pasteurized does not.
• **Best for** — unpasteurized for gut-health seekers and flavour chasers at home; pasteurized for travel, gifting, offices and warm-climate storage.

## A note on safety

Both bottles are completely safe to drink. Unpasteurized does not mean unsafe — fermentation naturally lowers the pH into an acidic, self-protecting range, and we test every batch. What "unpasteurized" really means is *alive*: the cultures are intact, which is exactly why it needs to stay cold and is best enjoyed sooner rather than later. Pasteurization is simply a tool for shelf stability, not a safety rescue.

## How to choose

If live cultures are your priority and you have fridge space, go unpasteurized. If you want something to stash in a cupboard, take on a trip, or give as a gift, pasteurized is the practical pick. Both start from exactly the same 7-day brew with the same real ginger — the only difference is whether we apply gentle heat at the very end.

> There is no wrong answer — only the bottle that fits your week.`,
    references: [
      {
        label: 'Why is milk pasteurized? Temperatures, pathogen control, and shelf life',
        source: 'Encyclopædia Britannica',
        url: 'https://www.britannica.com/science/Why-Is-Milk-Pasteurized',
      },
      {
        label: 'Louis Pasteur — fermentation, germ theory, and the origins of pasteurization',
        source: 'Encyclopædia Britannica',
        url: 'https://www.britannica.com/biography/Louis-Pasteur',
      },
    ],
  },
  {
    slug: 'storing-living-fizz',
    title: 'How to Store Living Fizz (and Open It Safely)',
    excerpt: 'Live cultures keep working in the bottle. Here is how to keep yours happy and avoid a fountain.',
    category: 'Guide',
    readTime: '6 min',
    icon: Leaf,
    date: '2026-04-22',
    author: 'The GingerBros Kitchen',
    tags: ['storage', 'tips', 'fermentation'],
    image: '/images/product-unpasteurized.jpg',
    content: `Our unpasteurized fizz is, quite literally, alive. Inside that sealed bottle the cultures keep slowly working — and that is a feature, not a flaw, because it is exactly what keeps the flavour bright and evolving. But a living drink behaves differently from a dead one in a can, so a handful of simple habits will keep every bottle perfect (and keep you from wearing it).

## Why storage matters more than for normal soda

A regular soda is force-carbonated and biologically inert: the bubbles are pumped in and nothing changes after bottling. Our fizz makes its own carbonation through fermentation, and the microbes responsible are still present. Give them warmth and the remaining sugar, and they get back to work — producing more CO₂ and building pressure. Understanding that one fact explains every rule below.

## Keep it cold

Cold is the off-switch. Yeast activity drops dramatically near refrigerator temperatures, so the fridge essentially puts the ferment on pause. Store unpasteurized GingerBros in the fridge from the moment it arrives, and keep it there until you drink it. Leave it somewhere warm and the cultures wake up, eat more sugar, and steadily raise the internal pressure — which affects both taste and how lively the bottle is when you open it.

## Open it slowly

Always open a well-chilled bottle (cold liquid holds onto dissolved CO₂, so it is far calmer). Crack the cap slowly and let the pressure escape in stages — you want a series of gentle hisses, not one big release. If a bottle has been sitting out and warmed up, chill it for several hours first, and the very first time, open it over the sink just in case.

## Drink it fresh

• Best enjoyed within the date on the bottle, while flavour and fizz are at their peak.
• Once opened, reseal and refrigerate; it will gradually lose carbonation over a day or two, like any live soda.
• A little cloudiness or sediment at the bottom is completely normal — that is the living culture settling out, not spoilage. Tilt the bottle gently to rouse it rather than shaking it hard.

## Reading your bottle

A healthy bottle smells sharp, gingery and clean, and pours with a lively fizz. Trust your senses: if something ever smells genuinely off or the bottle seems wildly over-pressurised from heat exposure, do not chance it. With proper cold storage, that essentially never happens.

## A quick safety note

Never store living fizz in a warm car, on a sunny windowsill, or in the freezer. Heat builds pressure; freezing expands the liquid and can crack the glass. The fridge is the only home it wants.

> Treat it like fresh food, not a canned drink, and it will reward you with bright, lively flavour every single time.`,
  },
  {
    slug: 'history-of-ginger-beer',
    title: 'A Short, Spicy History of Ginger Beer',
    excerpt: 'From 18th-century England to Thai street stalls, the global journey of fermented ginger.',
    category: 'Culture',
    readTime: '7 min',
    icon: Mountain,
    date: '2026-04-14',
    author: 'GingerBros Stories',
    tags: ['history', 'culture', 'ginger'],
    image: '/images/story-brewing.jpg',
    content: `Ginger has been crossing borders for as long as people have been trading. Native to maritime Southeast Asia, it was one of the very first spices to travel the ancient routes westward — overland and by sea, through Indian and Arab merchants, into the Mediterranean world. The Romans prized it enough to tax it; by the Middle Ages it was one of the most common spices in Europe after black pepper, valuable enough that a pound of it could cost as much as a live sheep. The fizzy drink we love today is the product of centuries of that wandering.

## From medicine to merriment

For most of its history, ginger was treated as medicine as much as flavour. Greek and Roman physicians prescribed it for the stomach; medieval European apothecaries used it for everything from plague to seasickness. That dual identity — delicious *and* good for you — is woven right into ginger's story, and it is part of why fermented ginger drinks felt so natural when they finally appeared.

## Born in England

Fermented ginger beer became hugely popular in 18th-century England, brewed from ginger, sugar, water and a starter culture much like our ginger bug — often a curious symbiotic mass nicknamed the "ginger beer plant." Households and pubs kept their own brews bubbling along for years, topping them up like a sourdough. By the Victorian era, ginger beer was a genuine street-corner staple, sold from heavy salt-glazed stoneware bottles built to contain its natural pressure. It was, in every sense, the craft soda of its day.

## A split in the family tree

Here is a distinction worth knowing, because the two are constantly confused. "Ginger beer" and "ginger ale" parted ways over time. **Ginger beer** stayed true to its roots: fermented, cloudy, assertive and spicy. **Ginger ale** emerged in the 19th century as something different — the famous pale, "dry" style was perfected in Canada — and became a clearer, sweeter, simply carbonated soft drink with little or no fermentation. Ours sits firmly, proudly on the ginger-*beer* side of the family: fermented, alive, and unafraid of real heat.

## Spread across the world

As trade and empire expanded, ginger beer travelled. In the Caribbean it picked up local spices and became central to rum drinks like the Dark 'n' Stormy. Across Asia and Africa it met cultures where fresh ginger was already woven into daily cooking and traditional medicine, so a spicy fermented ginger drink needed no introduction. Everywhere it landed, it adapted to local tastes — which is exactly what we are doing here.

## A natural fit for Thailand

Thailand has cooked with ginger and its aromatic cousins — galangal, turmeric, fingerroot, all members of the same plant family — for centuries. Ginger turns up in curries, soups, medicines and desserts across the country. So a bright, spicy, fermented ginger drink does not feel like a foreign import here; it feels like it has come home.

> At GingerBros, we like to think of our fizz as the latest chapter in a very long, very delicious story — one that started on a Southeast-Asian hillside and, after a few thousand years of travel, came right back.`,
    references: [
      {
        label: 'Ginger: the plant, its southeast-Asian origin, and its spread to the Mediterranean and England',
        source: 'Encyclopædia Britannica',
        url: 'https://www.britannica.com/plant/ginger',
      },
      {
        label: 'Herbs in History: Ginger — origins, ancient trade routes, and culinary/medicinal use',
        source: 'American Herbal Products Association (2023)',
        url: 'https://www.ahpa.org/herbs_in_history_ginger',
      },
    ],
  },
  {
    slug: 'thai-ginger-vs-the-world',
    title: 'Thai Ginger vs the World: Why Origin Matters',
    excerpt: 'Not all ginger is created equal. Here is what makes the Thai rhizome special.',
    category: 'Culture',
    readTime: '7 min',
    icon: Mountain,
    date: '2026-04-06',
    author: 'GingerBros Stories',
    tags: ['ingredients', 'thailand', 'sourcing'],
    image: '/images/story-brewing.webp',
    content: `Taste two gingers side by side and you will quickly realise they are not the same experience at all. We tend to think of ginger as a single, fixed ingredient — a generic brown knob from the supermarket — but it is a living agricultural product with as much variation as wine grapes or coffee cherries. Ginger has *terroir*: climate, soil, rainfall and harvest timing change everything about how it tastes. For a drink whose entire identity is ginger, that variation is not a detail. It is the whole game.

## The chemistry behind "spicy"

Ginger's signature heat comes mainly from a compound called **gingerol**, while its bright, aromatic top notes come from volatile oils like **zingiberene**. The exact balance of these compounds is not fixed — it shifts with growing conditions, soil minerals and, crucially, the age of the rhizome at harvest. That is why one ginger can taste sharp, juicy and almost lemony while another tastes earthy, dry and aggressively hot. It is not your imagination, and it is not random; it is chemistry responding to place.

## What makes Thai ginger sing

Grown in warm, humid conditions with rich alluvial soils, Thai ginger tends to be aromatic, juicy and assertively spicy without tipping into harsh or woody. There is a real difference by age, too:

• **Young ginger**, harvested early, is tender, pale-skinned, low in fibre and almost floral — gentle heat with a fresh, perfumed lift.
• **Mature ginger**, left in the ground longer, develops thicker skin, more fibre and a deeper, more pungent burn.

We taste and blend across these depending on the season, chasing the same target flavour in the bottle even as the raw ginger shifts month to month.

## Why freshness beats everything

Here is the part most drinks brands quietly skip: those aromatic volatile oils are fragile, and they begin to fade the moment ginger is cut, dried or powdered. A spice jar of ground ginger is convenient, but it has lost much of the bright, living character that makes fresh ginger sing. We work with growers close to home so the rhizome reaches our Bangkok brewhouse within days — fresh and whole, never dried, never powdered, never shipped halfway around the world first. Freshness is the single biggest reason our fizz tastes alive instead of flat.

## Heat with character

When it is sourced and handled right, good ginger gives you a complete arc of flavour in a single sip:

• Floral, citrusy high notes from younger ginger
• A clean, peppery middle
• A warming finish that lingers without scorching

> Origin is not a marketing word for us. It is the literal reason our fizz tastes the way it does — and the reason no two seasons taste exactly alike.`,
  },
  {
    slug: 'flavor-pairing-guide',
    title: 'The GingerBros Flavor Pairing Guide',
    excerpt: 'What to eat, mix, and serve alongside ginger fizz for maximum deliciousness.',
    category: 'Guide',
    readTime: '7 min',
    icon: Leaf,
    date: '2026-03-28',
    author: 'The GingerBros Kitchen',
    tags: ['pairing', 'food', 'tips'],
    image: '/images/bundle-6pack.jpg',
    content: `Ginger fizz might be the most food-friendly drink in your fridge, and there is real sensory science behind why. Three properties make it so versatile: its **spice** cuts through richness, its **tartness** lifts sweetness, and its **carbonation** physically scrubs fat and salt from your palate between bites. That last point is the same reason Champagne pairs with almost everything — bubbles act like a little reset button for your taste buds. Here is how to put all of that to work, whether you are mixing a cocktail or planning a meal.

## Best food matches

• **Spicy Thai curries** — the fizz cools and refreshes between mouthfuls, and ginger is already a flavour cousin to the galangal and lemongrass in the dish, so it harmonises rather than competes.
• **Fatty grilled meats** — ginger and carbonation cut straight through richness and reset the palate, the way a squeeze of lime does on grilled pork.
• **Sharp, aged cheeses** — the bubbles cleanse the fat while the ginger's warmth contrasts the salt.
• **Sushi and raw fish** — there is a reason pickled ginger sits on every sushi plate; the pairing is centuries old.
• **Fried food** — tempura, spring rolls, fried chicken: effervescence and acidity are the classic antidote to grease.
• **Citrusy or spiced desserts** — ginger and lime are old friends, and ginger loves anything with caramel, honey or stone fruit.

## Best spirits to mix

• **Dark rum** for a Dark 'n' Stormy
• **Vodka** for a Moscow Mule
• **Blanco tequila** for a spicy margarita
• **Bourbon** for a ginger highball (the oak and vanilla adore ginger)
• **Gin** for a bright, botanical buck
• **Aperol or Campari** for a low-alcohol, bittersweet spritz

## Garnishes that earn their place

• Fresh lime, every single time
• Candied ginger for a sweet, chewy finish
• Mint, clapped to release its aroma
• A pinch of chilli salt for adventurous palates
• A ribbon of cucumber for a cooling, spa-like version

## The two rules that never fail

If you forget everything else, remember these two principles and you will rarely go wrong:

1. **Match intensity.** Bold, spicy or fatty food wants the full, assertive ginger character; delicate food wants a lighter touch.
2. **Use contrast.** Play the fizz *against* the dish — bubbles against fat, tart against sweet, warm spice against cool and creamy.

> When in doubt: cold glass, lots of ice, a squeeze of lime. That is never wrong, and it is the right answer nine times out of ten.`,
  },
  {
    slug: 'meet-the-brewers',
    title: 'Meet the Brewers Behind the Bottle',
    excerpt: 'The small Bangkok team that hand-balances every batch — and why they do it by taste, not by formula.',
    category: 'Culture',
    readTime: '7 min',
    icon: Mountain,
    date: '2026-03-20',
    author: 'GingerBros Stories',
    tags: ['team', 'behind the scenes', 'craft'],
    image: '/images/story-brewing.jpg',
    content: `Behind every bottle of GingerBros is a small team that treats brewing as a craft, not a production line. There are no flavour scientists in white coats here, no giant automated vats running unattended overnight — just a handful of people, a brewhouse in Bangkok, and a stubborn belief that the best things are made slowly and tasted often.

## Brewing by taste, not by formula

Our founder, James, learned fermentation the slow, hands-on way — long before there was a single piece of stainless steel in the building. It started, as these things often do, with curiosity: jars of fermenting fruit and ginger bubbling away on a shaded shelf, a lot of failed experiments, and even more patience. Over time the failures turned into instinct, and the instinct turned into GingerBros.

To this day, every batch is smelled, tasted and adjusted by hand before it earns a bottle. Instruments tell us a batch is *safe* — the right acidity, the right pressure — but they cannot tell us a batch is *good*. Only a person can do that.

> Numbers tell us the batch is safe. Our tongues tell us the batch is good.

![A glass of freshly poured GingerBros ginger fizz](/images/product-unpasteurized.jpg)

## A drink with a place

Working out of Bangkok means we are surrounded by some of the best fresh ginger in the world, and we use that shamelessly. Our team shops the same morning markets the home cooks do, choosing rhizomes by snapping them to check for juiciness and smelling the cut ends for brightness — the kind of judgement no supplier spec sheet can replace.

That daily ritual ties the brew to the season. A batch made in cool, dry January tastes subtly different from one made in the humid heat of April, because the ginger itself is different. Most large producers see that variation as a problem to engineer away. We see it as the signature of a real, agricultural product, and we let it show.

## Why small stays small

We could grow faster. We could pasteurize the entire range, automate the line, and standardise every drop until each bottle was identical and forgettable. We have chosen a different path: we offer a pasteurized line for the people who need shelf stability, but our raw line stays hand-balanced, and the brewing itself never becomes a hands-off machine process. The moment the brew stops being tasted and adjusted by a person, it stops being GingerBros.

Staying small lets us keep making decisions by palate, pay our growers fairly, react to each season, and stand behind every single bottle with our own name. Some things are worth keeping small on purpose.`,
  },
  {
    slug: 'ginger-bug-at-home',
    title: 'Start Your Own Ginger Bug at Home',
    excerpt: 'A beginner-friendly walkthrough to culture your own wild ginger starter — the same idea behind our brew.',
    category: 'Brewing',
    readTime: '8 min',
    icon: FlaskConical,
    date: '2026-03-12',
    author: 'James, Founder',
    tags: ['DIY', 'fermentation', 'tutorial'],
    image: '/images/product-unpasteurized.png',
    content: `Curious how the magic actually works? You can culture a simple ginger bug on your own kitchen counter with nothing more than ginger, sugar, water and a week of attention. It will not be GingerBros — that takes our specific cultures, our water and years of practice — but it is genuinely one of the most satisfying things you can grow at home, and it will teach you to respect the living process behind every fermented drink. Consider this your friendly, beginner-proof starting point.

## A quick word on what you are doing

A ginger bug is a wild starter culture: a community of yeasts and bacteria that naturally live on ginger skin. You are not adding anything magic — you are simply giving those microbes the conditions to wake up, multiply and start fermenting. Everything below is in service of that one goal.

## What you need

• A clean glass jar (a 1-litre mason jar is perfect)
• Fresh, **organic** ginger — the wild yeast and bacteria live on the skin, so do not peel it, and avoid conventional ginger that may have been irradiated or treated
• White cane sugar (the microbes prefer simple sugar to start)
• Filtered, **non-chlorinated** water — chlorine and chloramine are literally designed to kill microbes, so tap water can sabotage your bug; leave tap water out overnight or filter it
• A breathable cover: a cloth or coffee filter held with a rubber band, so gases escape but dust and insects cannot get in

## The daily ritual (this is the whole secret)

A ginger bug is not a recipe you finish — it is a culture you feed. Consistency over the first week is everything:

• **Day 1** — Add 1 tbsp grated ginger, 1 tbsp sugar and 1 cup of water to the jar. Stir well and cover loosely.
• **Days 2 to 5** — Each day, "feed" it another tablespoon each of grated ginger and sugar, and stir vigorously. Both steps matter: the **sugar** is fresh food for the microbes, and the **stirring** folds in oxygen that helps the yeast multiply while keeping mould from forming on the surface.
• **Around day 5** — You should see bubbles rising when you stir and smell a bright, yeasty, gingery aroma. That fizz is the sign your wild yeast has woken up and the bug is alive and ready to use.

Keep the jar somewhere warm-ish (20–26°C / 68–79°F is ideal) and out of direct sunlight throughout.

## Troubleshooting

• **No bubbles after 5–6 days?** Your water may be chlorinated or your kitchen too cold. Switch to filtered water and find a warmer spot.
• **A thin film or yeasty smell?** Usually normal — stir it back in and keep feeding.
• **Fuzzy, coloured, or slimy growth?** That is mould or contamination. Do not try to save it; start fresh (see safety, below).

## Keeping it alive long-term

Once active, treat your bug like a pet. To use it constantly, keep it at room temperature and feed it every day. To slow it down between projects, move it to the fridge and feed it about once a week — the cold nearly stops its metabolism, exactly the way we rest our mother culture between batches. To make a simple soda, strain off some of the liquid, mix it with sweetened juice or tea, bottle it, and let it carbonate for a day or two before refrigerating.

## Safety first

> If your bug ever smells rotten or putrid, grows fuzzy or coloured mould, or turns slimy and stringy, throw it out and start again — no exceptions. A healthy bug smells sharp, sweet and gingery, never foul. When in doubt, trust your nose.

And respect the pressure when you bottle: use bottles built for carbonation, "burp" them daily to release gas, and never leave a sealed bottle at room temperature for long. This is the oldest soda technology on earth, and a little caution keeps it fun instead of messy.`,
  },
  {
    slug: 'sustainability-bottle-to-soil',
    title: 'From Bottle to Soil: Our Sustainability Promise',
    excerpt: 'Recyclable glass, ginger pulp that becomes compost, and the climate cost we are still working on.',
    category: 'Brewing',
    readTime: '6 min',
    icon: FlaskConical,
    date: '2026-03-04',
    author: 'GingerBros Stories',
    tags: ['sustainability', 'glass', 'compost'],
    image: '/images/product-detail-3.jpg',
    content: `Making a living drink that is also kind to the planet is a moving target, and we want to be honest about where we actually stand. We are a small brewery, not a climate authority, so treat this as a candid progress report rather than a glossy sustainability brochure — including, especially, the parts we have not solved yet. Greenwashing is easy; real accounting is harder, and far more useful to you.

## What we are genuinely proud of

• **Recyclable glass instead of single-use plastic.** Glass is endlessly recyclable without any loss of quality, and unlike plastic it does not shed microplastics into a drink. We encourage refilling and returns wherever we can.
• **Ginger pulp becomes compost, not landfill.** Brewing produces a large volume of fibrous ginger waste; rather than bin it, we send it to local farms as compost and animal feed, closing a small loop.
• **Short supply chains.** We source ginger from growers close to the brewhouse, which cuts the considerable emissions of long-haul ingredient transport and keeps the ginger fresher.
• **Small batches, little waste.** Brewing to demand means very little overproduction, spoilage or dumped stock.

## What is genuinely hard

Here is the part most brands leave out. We will not pretend it is all solved:

• **The cold chain.** Refrigerated shipping for our unpasteurized line uses real energy, and it is honestly the single biggest part of our footprint. Keeping a living product alive has an environmental cost.
• **The weight of glass.** Glass is heavier than plastic, so it takes more energy to transport. Lifecycle studies — including a widely reported University of Southampton analysis — actually found glass bottles can carry a *larger* overall environmental impact than plastic when they are shipped long distances and used only once. The honest takeaway is that the "best" packaging genuinely depends on how far it travels and, above all, whether it is reused.

We sit with that tension rather than hiding it: glass is better for *your* drink and endlessly recyclable, but only truly wins environmentally if it stays in circulation.

## Where we are heading

We are actively working on a few concrete things: lighter-weight bottles to cut transport emissions, denser regional shipping routes to reduce cold-chain mileage, and easier ways for customers to return and reuse packaging so glass does its best job.

> We would rather make slow, real progress than greenwash. Every quarter we pick one concrete improvement and actually ship it — not a slogan, a change.

Sustainability is not a finish line we will one day cross and celebrate. It is a brewing decision we make again, imperfectly and honestly, with every single batch.`,
    references: [
      {
        label: 'Glass bottles among the most environmentally impactful drink packaging (lifecycle study)',
        source: 'University of Southampton — Brock & Williams, Detritus (2020)',
        url: 'https://www.southampton.ac.uk/news/2020/11/drink-bottles-environmental-impact.page',
      },
      {
        label: 'Glass vs plastic bottles: the environmental trade-offs explained',
        source: 'Earth.org (2020)',
        url: 'https://earth.org/glass-bottles-environmental-impact/',
      },
    ],
  },
  {
    slug: 'ginger-fizz-bar-menu',
    title: 'Building a Ginger Fizz Cocktail Menu for Your Bar',
    excerpt:
      'How bars and restaurants can build a focused, profitable ginger fizz menu — from signature serves to garnish stations and staff training.',
    category: 'Drinks',
    readTime: '8 min',
    icon: Wine,
    date: '2026-06-12',
    author: 'The GingerBros Trade Team',
    tags: ['bar', 'menu', 'restaurants', 'cocktails'],
    image: '/images/product-detail-2.jpg',
    content: `A good ginger fizz menu does not try to be everything. It picks a few strong ideas, executes them consistently, and gives guests a reason to order something they cannot make at home. For bars and restaurants, that is the difference between a dead list and one that sells.

GingerBros works on a drinks menu because it brings three things at once: real ginger heat, natural effervescence, and a fermentation story that sounds interesting when a server describes it. Guests notice the difference between a flat ginger ale and something that actually bites back.

## Start with three house serves

You do not need twenty cocktails. Most successful ginger fizz menus are built around three dependable serves:

• **The Mule variation** — vodka, lime, GingerBros. Familiar enough to order without thinking, different enough to remember.
• **The Dark serve** — dark rum, lime, GingerBros. Richer, slower, and perfect for evening service.
• **The zero-proof option** — ginger fizz, citrus, and a seasonal herb or spice. This is where restaurants win over non-drinkers and designated drivers.

## Make it signature without making it complicated

The easiest way to own a drink is to control the garnish and the glass. A chilled copper mug for the mule, a tall collins for the dark serve, and a rocks glass with a salted rim for the margarita-style serve instantly separate your version from a standard recipe.

Train staff to mention one detail: "We use a naturally fermented Thai ginger fizz." That single line justifies the price and gives guests a reason to choose it over a generic mixer.

> A focused menu sells more than a long one. Three well-made ginger fizz drinks will outperform fifteen mediocre ones every time.

## Food pairing for restaurants

If you run a restaurant, put the ginger fizz drinks near the spicy and fatty sections of the menu. They pair naturally with:

• Fried or grilled seafood
• Thai, Indian, or Mexican spice profiles
• Rich cheeses and charcuterie
• Citrus-driven desserts

The carbonation cleanses the palate and the ginger cuts richness, which makes it an easy upsell with food.

## Pricing and pour cost

Ginger fizz cocktails are high-margin by design. The base spirit is the biggest cost; the fizz itself is modest. Price them between your well drinks and your premium cocktails. A 120ml pour of GingerBros is usually enough per serve, so a bottle stretches further than most premium mixers.

## Staff training in one sentence

Cold glass, fresh citrus, gentle stir, no shaking. If your team can remember that, the drinks will look and taste correct every time.`,
  },
  {
    slug: 'batching-cocktails-for-service',
    title: 'Batching Ginger Fizz Cocktails for Busy Service',
    excerpt:
      'Pre-batch the base, pour the fizz fresh. A practical guide to speed, consistency, and carbonation for high-volume bars.',
    category: 'Drinks',
    readTime: '7 min',
    icon: Wine,
    date: '2026-06-10',
    author: 'The GingerBros Trade Team',
    tags: ['batching', 'service', 'speed', 'cocktails'],
    image: '/images/product-detail-3.jpg',
    content: `Speed kills quality unless you build for it. The smartest way to serve ginger fizz cocktails during a busy shift is to pre-batch everything except the fizz itself. Spirit, citrus, syrups, and bitters can all be combined ahead of time. The carbonation must go in last.

This approach cuts pour time to under ten seconds per drink and keeps every serve identical. It also protects the most important part of the drink: the bubbles.

## What to batch and what to leave fresh

Batch the base, not the fizz:

• **Batch** — spirit, citrus juice, simple syrup, bitters, tinctures, saline.
• **Do not batch** — GingerBros, fresh garnishes, ice.

Citrus juice can be batched the morning of service and kept cold. For longer stability, use a measured acid solution or high-quality pre-squeezed juice kept at 2°C.

## The math for a liter batch

For a batched Mule base that yields roughly ten drinks:

• 600ml vodka
• 150ml fresh lime juice
• 100ml simple syrup
• 25ml water to account for dilution

Per serve, pour 90ml of base over ice and top with 120ml chilled GingerBros. Adjust dilution based on how much ice melt you expect in your glassware.

## Storage and service setup

Keep batched bases in labelled squeeze bottles or speed-pour containers in the low-boy fridge. Pre-fill glassware with ice where legal and practical. The closer the setup is to a simple "pour base, top fizz, garnish" rhythm, the faster service becomes.

> Never batch the ginger fizz. Carbonation is the whole point, and it will flatten within an hour of being opened to air.

## Scaling for events and functions

For large events, batch bases in five-liter containers and pre-chill. Serve from a dedicated station with one person pouring base, one topping fizz, one garnishing. This is faster than having each bartender build drinks individually and keeps carbonation lively because bottles are opened and closed quickly.

## Quality check before service

Taste one batched drink at the start of every shift. Batches can drift if citrus oxidises or syrup settles. A ten-second taste catches problems before the first guest does.`,
  },
  {
    slug: 'zero-proof-restaurant-drinks',
    title: 'Zero-Proof Drinks That Restaurants Can Actually Sell',
    excerpt:
      'Why the mocktail menu matters, how to price it, and three zero-proof builds that work on a restaurant floor.',
    category: 'Drinks',
    readTime: '6 min',
    icon: Wine,
    date: '2026-06-07',
    author: 'The GingerBros Trade Team',
    tags: ['mocktails', 'zero-proof', 'restaurants', 'menu'],
    image: '/images/product-detail-1.jpg',
    content: `The non-drinking guest is no longer an afterthought. Designated drivers, pregnant guests, people on medication, and the simply not-drinking-today crowd all want something that feels considered. A good zero-proof menu turns that obligation into a sales opportunity.

Ginger fizz is an ideal base for mocktails because it already has complexity. It is spicy, tart, effervescent, and slightly savoury. You do not need to hide it under sugar or fake spirits.

## Why zero-proof menus matter

A restaurant that only offers juice and soda to non-drinkers is leaving money on the table and sending a message that those guests are less important. A thoughtful zero-proof section:

• Increases average spend from guests who would otherwise order only water
• Reduces pressure on groups with mixed drinkers
• Gives your venue a reputation for inclusivity
• Costs less to make than most cocktails while supporting premium pricing

## Price it like a cocktail

Do not apologise with the price. A zero-proof drink should cost roughly 70–80% of its alcoholic equivalent. Guests are paying for craft, ingredients, glassware, and garnish — not just ethanol. If you price it like a soft drink, that is how staff will sell it.

## Three builds that work

**The Spicy Ginger Lemonade**
Fresh lemon juice, honey syrup, GingerBros, mint. Bright, refreshing, and low in sugar.

**The Ginger Shrub**
GingerBros topped with a house shrub or drinking vinegar and soda water. Tart, complex, and conversation-worthy.

**The Smoked Ginger Mule**
GingerBros, lime, and a non-alcoholic smoked tea or mezcal-style syrup in a copper mug. Gives the theatre of a cocktail without the alcohol.

> The best mocktails are not cocktails with the spirit removed. They are drinks that stand on their own logic.

## Service tips

List zero-proof drinks on the same menu as cocktails, not on a separate card. Use the same glassware and garnish standards. Train staff to offer them proactively, not just when asked. And name them like real drinks — not "virgin" anything.

A strong zero-proof section makes your whole drinks program look more thoughtful, and GingerBros gives you a base that already tastes like a crafted ingredient.`,
  },
];

const ALL_CATEGORIES: ('All' | Category)[] = ['All', 'Recipe', 'Drinks', 'Health', 'Brewing', 'Guide', 'Culture'];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Render inline markdown inside a single block: **bold**, *italic*, and
 * [label](url) links. Links open in a new tab.
 */
function renderInline(text: string, keyPrefix = ''): ReactNode[] {
  const nodes: ReactNode[] = [];
  const regex = /\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let k = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
    if (match[1] !== undefined) {
      nodes.push(
        <strong key={`${keyPrefix}b${k}`} className="font-semibold text-deep-brown">
          {match[1]}
        </strong>
      );
    } else if (match[2] !== undefined) {
      nodes.push(<em key={`${keyPrefix}i${k}`}>{match[2]}</em>);
    } else {
      nodes.push(
        <a
          key={`${keyPrefix}a${k}`}
          href={match[4]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-rust font-medium underline decoration-amber/60 underline-offset-2 hover:text-deep-brown transition-colors"
        >
          {match[3]}
        </a>
      );
    }
    lastIndex = regex.lastIndex;
    k++;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

/** Lightweight markdown-ish renderer for post bodies. */
function renderContent(content: string) {
  const blocks = content.split('\n\n');
  return blocks.map((block, i) => {
    const trimmed = block.trim();

    if (trimmed.startsWith('## ')) {
      return (
        <h2 key={i} className="font-display font-bold text-deep-brown text-xl md:text-2xl mt-8 mb-3 first:mt-0">
          {renderInline(trimmed.replace(/^##\s+/, ''), `${i}-`)}
        </h2>
      );
    }
    if (trimmed.startsWith('### ')) {
      return (
        <h3 key={i} className="font-display font-semibold text-deep-brown text-lg mt-6 mb-2">
          {renderInline(trimmed.replace(/^###\s+/, ''), `${i}-`)}
        </h3>
      );
    }
    if (trimmed.startsWith('> ')) {
      return (
        <blockquote
          key={i}
          className="border-l-4 border-amber bg-amber/10 rounded-r-xl pl-5 pr-4 py-3 my-6 font-display italic text-deep-brown text-lg leading-relaxed"
        >
          {renderInline(trimmed.replace(/^>\s+/, ''), `${i}-`)}
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
              <span>{renderInline(line.replace(/^[•\-\d]+\.?\s*/, ''), `${i}-${j}-`)}</span>
            </li>
          ))}
        </ul>
      );
    }

    return (
      <p key={i} className="font-body text-earth leading-relaxed mb-4 last:mb-0">
        {renderInline(block, `${i}-`)}
      </p>
    );
  });
}

function PostCard({ post }: { post: Post }) {
  const meta = CATEGORY_META[post.category];
  const Icon = post.icon;
  return (
    <Link
      to={`/blog/${post.slug}`}
      data-testid={`blog-post-${post.slug}`}
      className="group blog-card flex flex-col text-left bg-warm-white rounded-3xl overflow-hidden border border-soft-peach/60 hover:border-amber/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      <div className={`relative h-44 w-full overflow-hidden bg-gradient-to-br ${meta.gradient}`}>
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
    </Link>
  );
}

export default function BlogPage() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug?: string }>();
  const [filter, setFilter] = useState<'All' | Category>('All');
  const [query, setQuery] = useState('');

  const activePost = slug ? POSTS.find((p) => p.slug === slug) ?? null : null;

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
                <Link
                  to={`/blog/${featured.slug}`}
                  data-testid={`blog-featured-${featured.slug}`}
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
                </Link>
              </section>
            )}

            {/* Category filters */}
            <div
              role="group"
              aria-label="Filter articles by category"
              className="flex items-center justify-center gap-2 mb-10 flex-wrap"
            >
              {ALL_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFilter(cat)}
                  aria-pressed={filter === cat}
                  aria-label={`${cat} (${counts[cat]} ${counts[cat] === 1 ? 'article' : 'articles'})`}
                  data-testid={`blog-filter-${cat}`}
                  className={`font-body font-medium text-sm px-4 py-2 rounded-full border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-rust/40 ${
                    filter === cat
                      ? 'bg-deep-brown text-cream border-deep-brown'
                      : 'bg-warm-white text-earth border-soft-peach hover:border-amber hover:text-deep-brown'
                  }`}
                >
                  {cat} <span className="opacity-60" aria-hidden="true">({counts[cat]})</span>
                </button>
              ))}
            </div>

            {/* Results meta */}
            {(query || filter !== 'All') && (
              <p className="font-body text-sm text-earth/60 mb-6" aria-live="polite">
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
                  <PostCard key={post.slug} post={post} />
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
                  <PostCard key={post.slug} post={post} />
                ))}
              </div>
            </div>
          )}
        </article>
      )}
    </div>
  );
}
