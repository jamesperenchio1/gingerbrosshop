import { useState, useMemo, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import {
  ArrowLeft,
  ArrowRight,
  ChefHat,
  Leaf,
  Sparkles,
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
import { BLOG_SEO_META, type BlogSeoMeta } from '@/lib/blogSeoMeta';

type Category = 'Recipe' | 'Drinks' | 'Culture' | 'Guide';

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

function seoFor(slug: string): BlogSeoMeta {
  const meta = BLOG_SEO_META.find((m) => m.slug === slug);
  if (!meta) throw new Error(`Missing BLOG_SEO_META entry for slug "${slug}"`);
  return meta;
}

const POSTS: Post[] = [
  {
    ...seoFor('how-to-serve-ginger-fizz'),
    category: 'Guide',
    readTime: '4 min',
    icon: Sparkles,
    tags: ['serving', 'ginger fizz', 'basics'],
    featured: true,
    content: `Ginger Fizz is built to be easy: open, pour, done. But a few small choices turn a good bottle into a great one. Here is how we drink it, and how we'd love you to.

## 1. Cold. Properly cold.

Ginger tastes sharper and cleaner when it's cold, and the sparkle holds on longer. Give the bottle at least a few hours in the fridge, ideally the coldest shelf at the back. If you're in a hurry, 15 minutes in a bucket of ice and water does more than an hour in the freezer door.

## 2. Glass, lots of ice

A tall glass packed to the top with ice is the move. More ice means it melts slower, so your last sip is as punchy as your first. Pour slowly down the side of the glass to keep the bubbles.

## 3. Or straight from the bottle

Honestly? At a night market, on the BTS, on a stoop with friends, the bottle is the glass. That's how [Ginger Fizz](/product/ginger-fizz) was meant to travel.

## 4. A squeeze of lime

Fizz is already made with real lime, so a wedge on the rim just turns the brightness up. Want it moodier? Try a strip of orange peel instead.

## 5. Make it a long drink

Top half a glass of Fizz with soda water for a lighter, all-afternoon drink. Or go the other way: a splash of Fizz over iced Thai tea or cold brew is a surprisingly good wake-up.

## The short version

• Fridge-cold bottle
• Tall glass, full of ice
• Pour slowly, add lime if you like
• Drink it with food, friends, or both

Stocking up? The [6-pack](/product/ginger-fizz-6pack) works out cheaper per bottle, and multi-buy deals apply automatically in your cart.`,
  },
  {
    ...seoFor('ginger-tea-hot-or-iced'),
    category: 'Guide',
    readTime: '4 min',
    icon: Leaf,
    tags: ['ginger tea', 'serving', 'hot', 'iced'],
    content: `[Ginger Tea · Thai Spice](/product/ginger-tea) is still, not sparkling. Real ginger slowly simmered with lemongrass, lime and spices, then bottled. That makes it one of the most flexible drinks we make: it's great cold, and just as good warm.

## Iced (our default)

Pour over a full glass of ice. The cold tightens the ginger and lets the lemongrass and lime come through clean. Perfect for a hot afternoon or alongside spicy food.

**Upgrade it:** add a slice of lime and a sprig of mint, or a splash of soda water for a little sparkle.

## Warm (rainy-season mode)

Pour into a small pan and warm gently until it's steaming, but don't let it boil, so the aromatics stay bright. Serve in a mug. The spice blend really opens up when it's warm.

**Upgrade it:** a thin slice of fresh ginger, a stick of cinnamon, or a spoon of honey if you like it sweeter.

## Fizz or Tea?

• **Ginger Fizz:** sparkling, bright, lime-forward. Big kick, best ice-cold.
• **Ginger Tea:** still, rounded, warmly spiced. Great iced, just as good warm.

Can't decide? That's exactly why the [Fizz & Tea Duo](/product/fizz-tea-duo) exists.`,
  },
  {
    ...seoFor('ginger-and-thai-food'),
    category: 'Guide',
    readTime: '5 min',
    icon: ChefHat,
    tags: ['food pairing', 'thai food', 'ginger fizz', 'ginger tea'],
    content: `Ginger and Thai food have been friends for a very long time. Here's our cheat sheet for what to drink with what.

## Som tam + gai yang → Ginger Fizz

Sour, salty, fiery papaya salad and smoky grilled chicken want something cold and sparkling. The bubbles and lime in [Ginger Fizz](/product/ginger-fizz) reset your palate between bites, and the ginger stands up to the chilli instead of disappearing.

## Pad kra pao → Ginger Fizz

Holy basil, garlic, chilli, a crispy fried egg. Big, savoury flavours that a sweet soda just flattens. Fizz's ginger heat matches it beat for beat.

## Khao man gai → Ginger Tea, iced

The ginger-soy sauce on chicken rice is begging for more ginger. Iced [Ginger Tea](/product/ginger-tea) brings it, with lemongrass to keep things fresh.

## Tom yum / tom kha → Ginger Tea, iced

Lemongrass in the soup, lemongrass in the glass. They echo each other without fighting.

## Moo ping and night-market grills → Ginger Fizz

Sweet, sticky, charred pork skewers plus a cold, sharp, sparkling drink is about as good as a Bangkok evening gets.

## Mango sticky rice → Ginger Tea, warm

A warm cup of spiced ginger tea next to coconut-rich mango sticky rice is a dessert pairing people don't expect. Try it once.

## Why it works

Ginger brings heat, freshness and a little bitterness that cuts through richness, fat and sweetness. That's why it already appears in so many Thai dishes, and why it belongs in the glass next to them too.

Hosting? Grab the [Fizz & Tea 4-Pack](/product/fizz-tea-4pack) and cover every dish on the table.`,
  },
  {
    ...seoFor('ginger-mocktails'),
    category: 'Recipe',
    readTime: '6 min',
    icon: Wine,
    tags: ['mocktail', 'zero proof', 'recipe'],
    content: `Five easy, zero-proof drinks that make the most of GingerBros. Nothing here needs a shaker or bar skills: a glass, ice and a spoon will do.

## 1. Bangkok Mule (no vodka)

• 200ml Ginger Fizz
• Juice of half a lime
• A few mint leaves
• Lots of ice

Bruise the mint in the glass, add ice and lime, top with Fizz. Serve in a copper mug if you have one.

## 2. Lemongrass Cooler

• 150ml Ginger Tea, chilled
• 100ml soda water
• 1 bruised lemongrass stalk to stir

Build over ice. Light, aromatic, endlessly drinkable.

## 3. Ginger Tamarind Spritz

• 1 tbsp tamarind concentrate, loosened with a little water
• 200ml Ginger Fizz
• A pinch of salt and a lime wedge

Stir the tamarind and salt over ice, top with Fizz. Sweet, sour, salty, spicy: very Thai.

## 4. Thai Tea Kick

• 150ml strong Thai iced tea (no milk)
• 100ml Ginger Fizz

Pour the tea over ice, float the Fizz on top. Earthy, spicy and sparkling at once.

## 5. Warm Ginger Toddy (no booze)

• 200ml Ginger Tea, warmed
• 1 tsp honey
• A cinnamon stick and a slice of lime

Stir until the honey melts. For rainy nights.

## Bonus: make a pitcher

Scale any of these up by the bottle: a [6-pack of Fizz](/product/ginger-fizz-6pack) or [Tea](/product/ginger-tea-6pack) makes a big jug for a party, and multi-buy deals apply automatically.`,
  },
  {
    ...seoFor('thai-ginger-101'),
    category: 'Culture',
    readTime: '5 min',
    icon: Mountain,
    tags: ['thai ginger', 'education', 'ingredients'],
    content: `Ginger is in almost every Thai kitchen, but most of us never stop to think about it. Here's a quick crash course.

## Ginger, galangal and fingerroot

Thai cooking uses a whole family of rhizomes:

• **Khing (ขิง):** ginger. Peppery, warm, bright. The star of GingerBros.
• **Kha (ข่า):** galangal. Piney, citrusy and sharper. The backbone of tom kha and tom yum.
• **Krachai (กระชาย):** fingerroot. Earthy and aromatic, used in curries and stir-fries.

They look similar but taste very different. Swap one for another and you'll notice immediately.

## Young ginger vs mature ginger

**Young ginger (ขิงอ่อน)** has thin, pinkish skin and is juicy, tender and mild, which is why it's used for pickled ginger and stir-fries. **Mature ginger (ขิงแก่)** has tougher, tan skin and much more heat and aroma. It's the one you want for a drink with a proper kick.

## Why does ginger burn?

The heat comes from natural compounds in the rhizome called **gingerols**. When ginger is heated or dried, some of them change into **shogaols**, which taste even more pungent. That's why cooked or simmered ginger can taste spicier than raw. It's also why our [Ginger Tea](/product/ginger-tea), slowly simmered, has a different warmth from the bright, fresh kick of [Ginger Fizz](/product/ginger-fizz).

## How to pick good ginger

• Firm and heavy for its size
• Smooth, tight skin, no wrinkles or soft spots
• A sharp, fresh smell when you snap a piece

## Thailand grows a lot of it

Thailand is one of the world's notable ginger producers, and much of the crop is exported. We think Thai ginger deserves its moment at home, which is a big part of [why GingerBros exists](/story).`,
  },
  {
    ...seoFor('moscow-mule'),
    category: 'Recipe',
    readTime: '5 min',
    icon: ChefHat,
    tags: ['cocktail', 'vodka', 'classic'],
    content: `The Moscow Mule is one of the simplest cocktails in the canon, vodka, lime, ginger, which is exactly why the *quality* of each part matters so much. There is nowhere to hide. A great Mule lives or dies on its ginger, and fresh Thai ginger with real lime brings a bite that mass-market ginger sodas simply cannot match. Most commercial mules lean on sweet, one-note ginger beer; ours leans on a bright, low-sugar fizz that lets the lime and vodka breathe.

## A little history

The Moscow Mule was invented in the early 1940s in Los Angeles, reportedly a three-way collaboration between a vodka distributor struggling to sell an then-unfamiliar spirit, a bar owner sitting on a surplus of unsold ginger beer, and an acquaintance who happened to have a line of copper mugs. The story is part myth, but the result is history: the drink single-handedly helped popularise vodka in mid-century America. The copper mug began as a marketing flourish, and it stuck, because it genuinely keeps the drink colder.

## Ingredients

• 60ml vodka
• 15ml fresh lime juice (always fresh, bottled lime tastes flat and slightly bitter)
• 120ml GingerBros Ginger Fizz, well chilled
• Lime wedge and a sprig of mint for garnish

## Instructions

1. Fill a copper mug (or a highball glass) to the brim with ice, more ice actually melts *slower*, keeping the drink colder and less diluted.
2. Add the vodka and fresh lime juice.
3. Top slowly with GingerBros so the natural carbonation holds.
4. Stir once, gently, and garnish with a lime wedge and a sprig of mint that you have clapped between your palms to release its aroma.

## Why the copper mug actually matters

Copper is an excellent conductor of heat, so the mug rapidly takes on the icy temperature of the drink and holds it. That frosty exterior is not just for the photo, a colder drink tastes crisper, the carbonation feels sharper, and the ginger's heat reads cleaner against the cold. If you do not own copper mugs, a chilled highball works; just keep the glass in the freezer beforehand.

## Choosing your vodka

Because vodka is meant to be neutral, people assume it does not matter here, but it does, subtly. A clean, well-made vodka lets the ginger and lime shine; a harsh one adds an alcoholic burn that fights the ginger. You do not need anything expensive, just something smooth. The drink is the star, not the spirit.

## Why our fizz works so well

Fresh Thai ginger gives our fizz a peppery depth that sets this classic apart. Because it is less sweet than standard ginger beer, you taste the ginger heat and the citrus rather than syrup, the difference between a Mule that refreshes and one that cloys.

## Make it your own

• **Mexican Mule**, swap vodka for mezcal for a smoky backbone.
• **Kentucky Mule**, use bourbon; the vanilla-oak notes love ginger.
• **Spicy Mule**, muddle a slice of fresh chilli or add 10ml fresh ginger syrup for extra fire.
• **Zero-proof Mule**, skip the spirit, add a splash of soda and a dash of aromatic bitters for depth.

## Common mistakes to avoid

• Using bottled lime juice, it tastes dull and flat; fresh is non-negotiable.
• Skimping on ice, too little ice melts faster and waters the drink down.
• Stirring too hard, you will knock the natural carbonation out of the fizz.

> Pro tip: build the drink in this order, ice, spirit, lime, then fizz last, so the carbonation goes in at the end and stays lively all the way to the bottom of the mug.`,
  },
  {
    ...seoFor('dark-and-stormy'),
    category: 'Recipe',
    readTime: '5 min',
    icon: ChefHat,
    tags: ['cocktail', 'rum', 'classic'],
    content: `The Dark ’n’ Stormy is Bermuda’s national drink for a reason: dark rum and ginger were made for each other. The rum brings molasses, caramel and a little funk; the ginger brings heat and brightness to cut straight through it. Our version swaps the usual flat soda for GingerBros, so instead of sugar water you get real Thai ginger with a proper sparkle. The drink is named for its appearance, dark rum clouding through pale, stormy ginger like a squall rolling in off the Atlantic.

## The most protected cocktail in the world

Here is a fun bit of trivia: "Dark 'n Stormy" is a registered trademark held by Gosling's, the Bermudian rum house, and the name is legally tied to their Black Seal rum. They have actually defended it in court. Bartenders take liberties with the rum all the time at home, but if you see it spelled exactly that way on a menu, tradition says it should be poured with Gosling's, dark and layered, not stirred together.

## Ingredients

• 60ml dark rum (Gosling’s Black Seal is traditional; any rich, dark rum works)
• 120ml GingerBros Ginger Fizz, well chilled
• 10ml fresh lime juice
• Lime wheel and candied ginger for garnish

## Instructions

1. Fill a tall glass with ice.
2. Add the fresh lime juice and top with chilled GingerBros.
3. Float the dark rum slowly over the back of a bar spoon so it sits on top in a dramatic, stormy layer.
4. Garnish with a lime wheel and a piece of candied ginger, and give it one gentle stir just before drinking.

## Why the layering matters

This is the detail that separates a good Dark 'n' Stormy from a great one. Dark rum is denser than the ginger fizz, but pouring it last and gently lets it sit on top first, then slowly cascade down through the drink as the ice shifts. The result is a built-in flavour arc: the first sip is bright, fizzy and gingery; the last is rich, dark and molasses-deep. Stir it all together up front and you lose that journey. It is theatre, but it is also genuinely better.

## Choosing your rum

Reach for a dark or "black" rum rather than a light or spiced one. You want the heavy molasses character that stands up to the ginger's bite. Aged dark rums add vanilla and oak; younger black rums keep it punchy and traditional. Avoid pre-spiced rums here, the ginger is providing all the spice you need.

## A note on the lime

The classic Bermudian recipe is sometimes served without lime, but a squeeze of fresh lime brightens the whole thing and balances the rum's sweetness. Our ginger fizz is already made with real lime, so a little more amplifies that fresh, clean edge rather than fighting it.

> Pro tip: serve it tall and over plenty of ice. This is a long, slow sipper meant for a hot evening, the kind of drink that tastes like the tropics whether or not you are anywhere near them.`,
  },
  {
    ...seoFor('ginger-margarita'),
    category: 'Recipe',
    readTime: '6 min',
    icon: ChefHat,
    tags: ['cocktail', 'tequila', 'spicy'],
    content: `The classic margarita is a near-perfect balance of strong (tequila), sour (lime) and sweet (orange liqueur). This version keeps that balance but adds a fourth dimension, spice and effervescence, by replacing some of the orange liqueur with ginger fizz. The result is lighter, drier and more refreshing, with a warm ginger backbone that makes it perfect for a hot Bangkok afternoon.

## Ingredients

• 45ml blanco tequila (100% agave is worth it, it tastes cleaner and greener)
• 30ml fresh lime juice
• 15ml triple sec or orange liqueur
• 60ml GingerBros Ginger Fizz, chilled
• Salt or chili-salt rim and a jalapeño slice (optional)

## Instructions

1. Rub a lime wedge around the rim of a rocks glass and dip it in salt (or a chili-lime salt for extra kick). Tip: only salt half the rim, so you can choose salt or no-salt with each sip.
2. Fill the glass with ice.
3. Shake the tequila, lime juice, and triple sec hard with ice for 10–12 seconds, then strain over the fresh ice.
4. Top with chilled GingerBros and garnish with a jalapeño slice.

## Why ginger and tequila get along

Blanco (unaged) tequila is bright, peppery and faintly vegetal, characteristics that echo the natural heat of fresh ginger rather than clash with it. They share a family of aromatic, slightly herbal notes, so the pairing feels intentional rather than novel. The fizz also does practical work: it lengthens the drink, lowers the overall sugar, and keeps each sip lively and effervescent instead of dense and syrupy like a frozen-machine margarita.

## Reposado vs blanco

Blanco keeps things crisp and citrus-forward, which is our default. If you prefer something rounder, a reposado (lightly aged in oak) adds vanilla and caramel that play beautifully against ginger, closer in spirit to a margarita-meets-Mule. Either works; it simply shifts the drink from sharp to mellow.

## Spice control

This is a build-your-own-heat cocktail:

• **Mild**, use the jalapeño purely as a garnish.
• **Medium**, add one or two thin slices to the shaker.
• **Hot**, muddle the jalapeño (seeds included) in the shaker before adding ice, then double-strain to catch the bits.

Because the chilli goes in at the shaking stage, you stay fully in charge of the burn.

## Make it a pitcher

Scale the tequila, lime and triple sec for the crowd and keep that base chilled in a jug. Add ice and top each glass with GingerBros individually, to order, that way every margarita keeps its fizz instead of going flat in the pitcher.

> The result is tart, spicy, and dangerously drinkable. Serve it the moment it is built, while the carbonation is at its liveliest.`,
  },
  {
    ...seoFor('spicy-ginger-lemonade'),
    category: 'Recipe',
    readTime: '5 min',
    icon: ChefHat,
    tags: ['mocktail', 'zero-proof', 'citrus'],
    content: `Not every great drink needs alcohol. A well-made zero-proof drink is not a sad consolation prize, it is a deliberately built beverage with the same attention to balance you would give a cocktail. This spicy ginger lemonade leans on real ginger heat, fresh citrus and natural carbonation to wake up your palate, with no hangover and no compromise. It is the drink we reach for when we want something that *feels* like an occasion without the alcohol.

## Ingredients

• 30ml fresh lemon juice
• 15ml honey or simple syrup (warm the honey slightly so it dissolves)
• 120ml GingerBros Ginger Fizz, chilled
• Lemon wheel and a sprig of fresh mint
• Optional: a pinch of sea salt to round out the flavour

## Instructions

1. If using honey, stir it into the lemon juice first with a splash of warm water so it dissolves completely, honey will not mix into a cold drink otherwise.
2. Shake the lemon juice and sweetener with ice until well chilled.
3. Strain into an ice-filled glass.
4. Top with chilled GingerBros and garnish with a lemon wheel and a sprig of mint you have clapped between your palms.

## Why it beats regular lemonade

Most commercial lemonade is essentially sugar water with a little citrus flavouring, often 25 grams of sugar or more per glass. By letting the ginger fizz carry the carbonation and a big share of the flavour, you can use far less added sweetener and still get something that tastes festive and complex. The ginger's natural heat fills the space where all that sugar used to be.

## The pinch-of-salt trick

This is the secret that separates a flat lemonade from a lively one. A tiny pinch of salt does not make the drink taste salty. It suppresses bitterness and amplifies the perception of sweetness and sourness, so the lemon reads brighter and the whole glass tastes more "alive". Professional kitchens use the same trick in everything from fruit to desserts.

## Make it your own

• **Herbal**, muddle a few basil or Thai basil leaves before topping with fizz.
• **Berry**, add a spoon of muddled raspberries or a splash of pomegranate.
• **Extra-spicy**, add a thin slice of fresh chilli or a few cracks of black pepper.
• **Cucumber-mint**, muddle cucumber for a cooling, spa-like version.

## Kid- and crowd-friendly

Batch the lemon-and-honey base in a jug and keep it chilled, then top each glass with fizz to order so it never goes flat. It goes down well at a barbecue: adults can add a measure of vodka or gin, while kids and non-drinkers get exactly the same vibrant glass.

> It is crisp, naturally effervescent, and far lower in sugar than most lemonades, especially when you let the ginger do most of the flavour work.`,
  },
  {
    ...seoFor('ginger-glazed-chicken'),
    category: 'Recipe',
    readTime: '6 min',
    icon: ChefHat,
    tags: ['food', 'glaze', 'dinner'],
    content: `You can cook with ginger fizz too. Reduce it down and it becomes a tangy, caramelised glaze that clings to wings, tofu or roasted vegetables in a glossy, sticky lacquer. It is one of our favourite ways to use up a bottle that has lost a little of its sparkle, the carbonation does not matter once it hits the pan, but all that real ginger flavour does.

## Ingredients

• 500g chicken wings (or firm tofu cubes for a vegan version)
• 240ml GingerBros Ginger Fizz
• 2 tbsp soy sauce
• 1 tbsp honey
• 1 tsp grated fresh ginger
• 2 cloves garlic, minced
• Optional: 1 tsp chili flakes or a spoon of gochujang
• Sesame seeds and sliced scallions for garnish

## Instructions

1. Pat the wings completely dry and season with salt, dry skin is the single biggest secret to crispiness, because surface moisture steams instead of browns.
2. Simmer the ginger fizz, soy sauce, honey, ginger, garlic and any chilli in a small saucepan over medium heat until reduced by half and syrupy, about 8–10 minutes. Stir often near the end so it does not scorch, sugar goes from glaze to burnt fast.
3. Toss the wings in half the glaze and bake at 200°C (400°F) for 25–30 minutes, turning once.
4. Brush with the remaining glaze and broil/grill for 2–3 minutes until sticky and lacquered.
5. Finish with sesame seeds and scallions.

## The science of the glaze

This recipe is really a lesson in two kinds of browning. As the fizz reduces, its residual sugars concentrate and begin to **caramelise**, deepening in colour and flavour. Meanwhile, when the glaze hits the hot wings, the sugars and the proteins in the meat undergo the **Maillard reaction**, the same chemistry behind seared steak and toasted bread, producing hundreds of savoury, roasted aroma compounds. The soy sauce adds glutamate-rich umami that layers with the ginger heat into one complex sauce.

## Make it a meal

• **Vegetarian**, press firm tofu, cube it, and roast until golden before glazing; the glaze caramelises on the edges.
• **Sheet-pan dinner**, toss broccoli, carrots or cauliflower in a little glaze and roast alongside.
• **Rice bowl**, spoon extra reduced glaze over steamed rice with the wings and a handful of herbs.

## Storage and reuse

The reduced glaze keeps in the fridge for up to a week in a sealed jar. Brush it on grilled corn, stir it into a stir-fry, or use it as a dipping sauce. The fizz cooks off in the reduction, but the real ginger flavour stays intense and bright.

> Make a double batch of glaze. You will find a use for it within days, it is that good.`,
  },
  {
    ...seoFor('ginger-affogato-float'),
    category: 'Recipe',
    readTime: '4 min',
    icon: ChefHat,
    tags: ['dessert', 'coffee', 'float'],
    content: `When you cannot decide between dessert, coffee and a cold drink, make all three at once. The affogato, Italian for "drowned", is traditionally a scoop of vanilla gelato drowned in a shot of hot espresso. We give it a spicy, fizzy twist by adding cold ginger fizz, turning a two-ingredient classic into a theatrical, temperature-contrasting float that is our answer to a sweltering afternoon.

## Ingredients

• 2 scoops vanilla bean ice cream (the better the vanilla, the better the float)
• 1 shot hot espresso
• 120ml chilled GingerBros Ginger Fizz
• Grated dark chocolate or candied ginger to finish

## Instructions

1. Chill your glass in the freezer for a few minutes first, a cold glass keeps the ice cream from melting too fast and gives you longer to enjoy it.
2. Drop the ice cream into the tall glass.
3. Pour the hot espresso over the top so it starts to melt the edges and releases its aroma.
4. Slowly top with cold ginger fizz, it will foam dramatically as the carbonation hits the fat in the ice cream.
5. Finish with grated dark chocolate or a few shards of candied ginger.

## Why the foam happens

That dramatic eruption of foam is genuine food science. Ice cream is an emulsion full of milk proteins and fat. When carbon dioxide escapes from the fizz, those proteins and fats trap the gas in a web of tiny, stabilised bubbles instead of letting them pop, exactly the same mechanism that makes a root-beer float foam over its glass. Colder ingredients hold more dissolved CO₂, so chilling everything first makes the foam both more controlled and more impressive.

## Flavour balance

What makes this work as a dessert is the sheer number of contrasts happening at once: **hot** espresso against **cold** ice cream, **bitter** coffee against **sweet** vanilla, and the **warm spice** of ginger threading through all of it. Ginger and coffee are natural partners, both have roasty, aromatic depth, and the fizz lifts the whole thing so it never feels heavy.

## Variations

• **Boozy**, add 15ml of dark rum or coffee liqueur for an adults-only version.
• **Vegan**, use a good coconut or oat-milk ice cream; the foam still works thanks to the plant fats.
• **Decadent**, swap vanilla for salted-caramel or dark-chocolate ice cream.

> Serve it the instant it is built, with a spoon and a straw, and eat it fast. The whole point is to catch the hot, cold, fizzy and creamy all in the same mouthful before it melts together.`,
  },
  {
    ...seoFor('history-of-ginger-beer'),
    category: 'Culture',
    readTime: '7 min',
    icon: Mountain,
    tags: ['history', 'culture', 'ginger'],
    content: `Ginger has been crossing borders for as long as people have been trading. Native to maritime Southeast Asia, it was one of the very first spices to travel the ancient routes westward, overland and by sea, through Indian and Arab merchants, into the Mediterranean world. The Romans prized it enough to tax it; by the Middle Ages it was one of the most common spices in Europe after black pepper, valuable enough that a pound of it could cost as much as a live sheep. The fizzy drink we love today is the product of centuries of that wandering.

## From medicine to merriment

For most of its history, ginger was treated as medicine as much as flavour. Greek and Roman physicians prescribed it for the stomach; medieval European apothecaries used it for everything from plague to seasickness. That dual identity, delicious *and* good for you, is woven right into ginger's story, and it is part of why ginger drinks felt so natural when they finally appeared.

## Born in England

Fermented ginger beer became hugely popular in 18th-century England, brewed from ginger, sugar, water and a starter culture, often a curious symbiotic mass nicknamed the "ginger beer plant." Households and pubs kept their own brews bubbling along for years, topping them up like a sourdough. By the Victorian era, ginger beer was a genuine street-corner staple, sold from heavy salt-glazed stoneware bottles built to contain its natural pressure. It was, in every sense, the craft soda of its day.

## A split in the family tree

Here is a distinction worth knowing, because the two are constantly confused. "Ginger beer" and "ginger ale" parted ways over time. **Ginger beer** stayed true to its roots: fermented, cloudy, assertive and spicy. **Ginger ale** emerged in the 19th century as something different, the famous pale, "dry" style was perfected in Canada, and became a clearer, sweeter, simply carbonated soft drink with little or no fermentation. GingerBros takes the best of both and goes its own way: not fermented, made with fresh Thai ginger and real lime, low in sugar and unafraid of real heat.

## Spread across the world

As trade and empire expanded, ginger beer travelled. In the Caribbean it picked up local spices and became central to rum drinks like the Dark 'n' Stormy. Across Asia and Africa it met cultures where fresh ginger was already woven into daily cooking and traditional medicine, so a spicy ginger drink needed no introduction. Everywhere it landed, it adapted to local tastes, which is exactly what we are doing here.

## A natural fit for Thailand

Thailand has cooked with ginger and its aromatic cousins, galangal, turmeric, fingerroot, all members of the same plant family, for centuries. Ginger turns up in curries, soups, medicines and desserts across the country. So a bright, spicy ginger drink does not feel like a foreign import here; it feels like it has come home.

> At GingerBros, we like to think of our fizz as the latest chapter in a very long, very delicious story, one that started on a Southeast-Asian hillside and, after a few thousand years of travel, came right back.`,
    references: [
      {
        label: 'Ginger: the plant, its southeast-Asian origin, and its spread to the Mediterranean and England',
        source: 'Encyclopædia Britannica',
        url: 'https://www.britannica.com/plant/ginger',
      },
      {
        label: 'Herbs in History: Ginger, origins, ancient trade routes, and culinary/medicinal use',
        source: 'American Herbal Products Association (2023)',
        url: 'https://www.ahpa.org/herbs_in_history_ginger',
      },
    ],
  },
  {
    ...seoFor('thai-ginger-vs-the-world'),
    category: 'Culture',
    readTime: '7 min',
    icon: Mountain,
    tags: ['ingredients', 'thailand', 'sourcing'],
    content: `Taste two gingers side by side and you will quickly realise they are not the same experience at all. We tend to think of ginger as a single, fixed ingredient, a generic brown knob from the supermarket, but it is a living agricultural product with as much variation as wine grapes or coffee cherries. Ginger has *terroir*: climate, soil, rainfall and harvest timing change everything about how it tastes. For a drink whose entire identity is ginger, that variation is not a detail. It is the whole game.

## The chemistry behind "spicy"

Ginger's signature heat comes mainly from a compound called **gingerol**, while its bright, aromatic top notes come from volatile oils like **zingiberene**. The exact balance of these compounds is not fixed, it shifts with growing conditions, soil minerals and, crucially, the age of the rhizome at harvest. That is why one ginger can taste sharp, juicy and almost lemony while another tastes earthy, dry and aggressively hot. It is not your imagination, and it is not random; it is chemistry responding to place.

## What makes Thai ginger sing

Grown in warm, humid conditions with rich alluvial soils, Thai ginger tends to be aromatic, juicy and assertively spicy without tipping into harsh or woody. There is a real difference by age, too:

• **Young ginger**, harvested early, is tender, pale-skinned, low in fibre and almost floral, gentle heat with a fresh, perfumed lift.
• **Mature ginger**, left in the ground longer, develops thicker skin, more fibre and a deeper, more pungent burn.

We taste and blend across these depending on the season, chasing the same target flavour in the bottle even as the raw ginger shifts month to month.

## Why freshness beats everything

Here is the part most drinks brands quietly skip: those aromatic volatile oils are fragile, and they begin to fade the moment ginger is cut, dried or powdered. A spice jar of ground ginger is convenient, but it has lost much of the bright, living character that makes fresh ginger sing. We work with growers close to home so the rhizome reaches our kitchen fresh and whole, never dried, never powdered, never shipped halfway around the world first. Freshness is the single biggest reason our drinks taste bright instead of flat.

## Heat with character

When it is sourced and handled right, good ginger gives you a complete arc of flavour in a single sip:

• Floral, citrusy high notes from younger ginger
• A clean, peppery middle
• A warming finish that lingers without scorching

> Origin is not a marketing word for us. It is the literal reason our fizz tastes the way it does, and the reason no two seasons taste exactly alike.`,
  },
  {
    ...seoFor('flavor-pairing-guide'),
    category: 'Guide',
    readTime: '7 min',
    icon: Leaf,
    tags: ['pairing', 'food', 'tips'],
    content: `Ginger fizz might be the most food-friendly drink in your fridge, and there is real sensory science behind why. Three properties make it so versatile: its **spice** cuts through richness, its **tartness** lifts sweetness, and its **carbonation** physically scrubs fat and salt from your palate between bites. That last point is the same reason Champagne pairs with almost everything, bubbles act like a little reset button for your taste buds. Here is how to put all of that to work, whether you are mixing a cocktail or planning a meal.

## Best food matches

• **Spicy Thai curries**, the fizz cools and refreshes between mouthfuls, and ginger is already a flavour cousin to the galangal and lemongrass in the dish, so it harmonises rather than competes.
• **Fatty grilled meats**, ginger and carbonation cut straight through richness and reset the palate, the way a squeeze of lime does on grilled pork.
• **Sharp, aged cheeses**, the bubbles cleanse the fat while the ginger's warmth contrasts the salt.
• **Sushi and raw fish**, there is a reason pickled ginger sits on every sushi plate; the pairing is centuries old.
• **Fried food**, tempura, spring rolls, fried chicken: effervescence and acidity are the classic antidote to grease.
• **Citrusy or spiced desserts**, ginger and lime are old friends, and ginger loves anything with caramel, honey or stone fruit.

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
2. **Use contrast.** Play the fizz *against* the dish, bubbles against fat, tart against sweet, warm spice against cool and creamy.

> When in doubt: cold glass, lots of ice, a squeeze of lime. That is never wrong, and it is the right answer nine times out of ten.`,
  },
  {
    ...seoFor('ginger-fizz-bar-menu'),
    category: 'Drinks',
    readTime: '8 min',
    icon: Wine,
    tags: ['bar', 'menu', 'restaurants', 'cocktails'],
    content: `A good ginger fizz menu does not try to be everything. It picks a few strong ideas, executes them consistently, and gives guests a reason to order something they cannot make at home. For bars and restaurants, that is the difference between a dead list and one that sells.

GingerBros works on a drinks menu because it brings three things at once: real ginger heat, a lively sparkle, and a Thai-ginger story that sounds interesting when a server describes it. Guests notice the difference between a flat ginger ale and something that actually bites back.

## Start with three house serves

You do not need twenty cocktails. Most successful ginger fizz menus are built around three dependable serves:

• **The Mule variation**, vodka, lime, GingerBros. Familiar enough to order without thinking, different enough to remember.
• **The Dark serve**, dark rum, lime, GingerBros. Richer, slower, and perfect for evening service.
• **The zero-proof option**, ginger fizz, citrus, and a seasonal herb or spice. This is where restaurants win over non-drinkers and designated drivers.

## Make it signature without making it complicated

The easiest way to own a drink is to control the garnish and the glass. A chilled copper mug for the mule, a tall collins for the dark serve, and a rocks glass with a salted rim for the margarita-style serve instantly separate your version from a standard recipe.

Train staff to mention one detail: "It's a Thai ginger fizz made with fresh ginger and real lime." That single line justifies the price and gives guests a reason to choose it over a generic mixer.

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
    ...seoFor('batching-cocktails-for-service'),
    category: 'Drinks',
    readTime: '7 min',
    icon: Wine,
    tags: ['batching', 'service', 'speed', 'cocktails'],
    content: `Speed kills quality unless you build for it. The smartest way to serve ginger fizz cocktails during a busy shift is to pre-batch everything except the fizz itself. Spirit, citrus, syrups, and bitters can all be combined ahead of time. The carbonation must go in last.

This approach cuts pour time to under ten seconds per drink and keeps every serve identical. It also protects the most important part of the drink: the bubbles.

## What to batch and what to leave fresh

Batch the base, not the fizz:

• **Batch**, spirit, citrus juice, simple syrup, bitters, tinctures, saline.
• **Do not batch:** GingerBros, fresh garnishes, ice.

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
    ...seoFor('zero-proof-restaurant-drinks'),
    category: 'Drinks',
    readTime: '6 min',
    icon: Wine,
    tags: ['mocktails', 'zero-proof', 'restaurants', 'menu'],
    content: `The non-drinking guest is no longer an afterthought. Designated drivers, pregnant guests, people on medication, and the simply not-drinking-today crowd all want something that feels considered. A good zero-proof menu turns that obligation into a sales opportunity.

Ginger fizz is an ideal base for mocktails because it already has complexity. It is spicy, tart, effervescent, and slightly savoury. You do not need to hide it under sugar or fake spirits.

## Why zero-proof menus matter

A restaurant that only offers juice and soda to non-drinkers is leaving money on the table and sending a message that those guests are less important. A thoughtful zero-proof section:

• Increases average spend from guests who would otherwise order only water
• Reduces pressure on groups with mixed drinkers
• Gives your venue a reputation for inclusivity
• Costs less to make than most cocktails while supporting premium pricing

## Price it like a cocktail

Do not apologise with the price. A zero-proof drink should cost roughly 70–80% of its alcoholic equivalent. Guests are paying for craft, ingredients, glassware, and garnish, not just ethanol. If you price it like a soft drink, that is how staff will sell it.

## Three builds that work

**The Spicy Ginger Lemonade**
Fresh lemon juice, honey syrup, GingerBros, mint. Bright, refreshing, and low in sugar.

**The Ginger Shrub**
GingerBros topped with a house shrub or drinking vinegar and soda water. Tart, complex, and conversation-worthy.

**The Smoked Ginger Mule**
GingerBros, lime, and a non-alcoholic smoked tea or mezcal-style syrup in a copper mug. Gives the theatre of a cocktail without the alcohol.

> The best mocktails are not cocktails with the spirit removed. They are drinks that stand on their own logic.

## Service tips

List zero-proof drinks on the same menu as cocktails, not on a separate card. Use the same glassware and garnish standards. Train staff to offer them proactively, not just when asked. And name them like real drinks, not "virgin" anything.

A strong zero-proof section makes your whole drinks program look more thoughtful, and GingerBros gives you a base that already tastes like a crafted ingredient.`,
  },

];

const ALL_CATEGORIES: ('All' | Category)[] = ['All', 'Guide', 'Recipe', 'Drinks', 'Culture'];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Render inline markdown inside a single block: **bold**, *italic*, and
 * [label](url) links. External links open in a new tab; /internal ones don't.
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
    } else if (match[4].startsWith('/')) {
      // Internal links stay in the app (and in the same tab).
      nodes.push(
        <Link
          key={`${keyPrefix}a${k}`}
          to={match[4]}
          className="text-rust font-semibold underline decoration-amber/60 underline-offset-2 hover:text-deep-brown transition-colors"
        >
          {match[3]}
        </Link>
      );
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
            <figcaption className="mt-2 text-center font-body text-[13px] text-earth/80 italic">
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
      to={`/guide/${post.slug}`}
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
        <div className="flex items-center gap-3 mb-2 text-earth/80">
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

/** Slugs of every post, used by the build to prerender /blog/:slug. */
export const BLOG_SLUGS: string[] = POSTS.map((p) => p.slug);

export default function BlogPage() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug?: string }>();
  const [filter, setFilter] = useState<'All' | Category>('All');
  const [query, setQuery] = useState('');

  const activePost = slug ? POSTS.find((p) => p.slug === slug) ?? null : null;

  const closePost = () => navigate('/guide');

  // A slug that matches no post should fall back to the journal index.
  useEffect(() => {
    if (slug && !activePost) navigate('/guide', { replace: true });
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
    name: 'The Ginger Guide by GingerBros',
    url: 'https://gingerbrosshop.com/guide',
    description:
      'How to serve, mix and pair ginger drinks: recipes, mocktails, Thai food pairings and Thai ginger know-how from GingerBros.',
    blogPost: POSTS.map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      description: p.excerpt,
      datePublished: p.date,
      author: { '@type': 'Organization', name: p.author },
      url: `https://gingerbrosshop.com/guide/${p.slug}`,
    })),
  };

  const activePostBreadcrumb = activePost
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://gingerbrosshop.com' },
          { '@type': 'ListItem', position: 2, name: 'Ginger Guide', item: 'https://gingerbrosshop.com/guide' },
          { '@type': 'ListItem', position: 3, name: activePost.title, item: `https://gingerbrosshop.com/guide/${activePost.slug}` },
        ],
      }
    : null;

  const activePostSchema = activePost
    ? {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: activePost.title,
        description: activePost.excerpt,
        inLanguage: 'en',
        datePublished: activePost.date,
        dateModified: activePost.date,
        keywords: activePost.tags.join(', '),
        url: `https://gingerbrosshop.com/guide/${activePost.slug}`,
        mainEntityOfPage: { '@type': 'WebPage', '@id': `https://gingerbrosshop.com/guide/${activePost.slug}` },
        ...(activePost.image ? { image: `https://gingerbrosshop.com${activePost.image}` } : {}),
        author: { '@type': 'Organization', name: activePost.author },
        publisher: {
          '@type': 'Organization',
          name: 'GingerBros',
          logo: {
            '@type': 'ImageObject',
            url: 'https://gingerbrosshop.com/icon-512.png',
          },
        },
      }
    : null;

  return (
    <div className="min-h-screen bg-warm-white">
      {activePost ? (
        <SEO
          title={activePost.title}
          description={activePost.excerpt}
          path={`/guide/${activePost.slug}`}
          type="article"
          image={activePost.image ? `https://gingerbrosshop.com${activePost.image}` : undefined}
          jsonLd={activePostSchema && activePostBreadcrumb ? [activePostSchema, activePostBreadcrumb] : undefined}
        />
      ) : (
        <SEO route="/guide" jsonLd={[blogListSchema]} />
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
              <h1 className="font-poster text-deep-brown text-[clamp(3rem,9vw,6.5rem)] mb-4">
                The Ginger Guide
              </h1>
              <p className="font-body text-earth text-base md:text-lg max-w-[620px] mx-auto mb-8">
                How to serve it, what to mix it with, what to eat with it, and everything worth knowing about
                Thai ginger.
              </p>

              {/* Search */}
              <div className="max-w-[480px] mx-auto relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-earth/80" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search serves, recipes, pairings…"
                  className="w-full bg-warm-white border border-soft-peach rounded-full pl-11 pr-10 py-3 font-body text-deep-brown placeholder:text-earth/80 focus:outline-none focus:ring-2 focus:ring-rust/30 shadow-sm"
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-earth/80 hover:text-rust transition-colors"
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
                  to={`/guide/${featured.slug}`}
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
                      <span className="inline-flex items-center gap-1 font-body text-[12px] text-earth/80">
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
              <p className="font-body text-sm text-earth/80 mb-6" aria-live="polite">
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
                    activePost.image ? 'text-cream/80' : 'text-earth/80'
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
                  activePost.image ? 'text-cream/80' : 'text-earth/80'
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
                        <span className="block text-earth/80 text-[13px] italic">{ref.source}</span>
                      </span>
                    </li>
                  ))}
                </ol>
                <p className="mt-4 font-body text-[12px] text-earth/80 italic">
                  Sources are provided for general education. This article is not medical advice; consult a
                  healthcare professional for personal guidance.
                </p>
              </div>
            )}

            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2 mt-10 pt-8 border-t border-soft-peach">
              <TagIcon className="w-4 h-4 text-earth/80" />
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
                Fresh Thai ginger, real lime, low sugar. Grab a bottle and try it for yourself.
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