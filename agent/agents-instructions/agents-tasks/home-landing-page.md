## Home Landing Page

**Description:** Create a new public landing page to replace the current public dashboard. The landing page should have no public bet display, only marketing/info content.
the page should have the join the action which takes the user to the auth page/ or the user dashboard for bets.
another button to sign up page.
and anoother which takes to the football matches page , which sould remain as is.

**MD files to read before changes:**

- [`agent/dashboards/public-dashbaord.md`](../../dashboards/public-dashbaord.md) (will be deprecated)
- [`agent/components/navbar.md`](../../components/navbar.md)

### Landing Page Sections

The new home page ([`src/app/page.tsx`](../../../src/app/page.tsx)) will have 4 sections:

#### 1. Hero Carousel Section

- [x] Create [`src/components/landing/hero-carousel/`](../../../src/components/landing/hero-carousel/)
  - [x] `component.tsx` - Auto-playing image carousel with fullscreen and split variants
  - [x] `types.ts` - Carousel item types with optional primary/secondary buttons
  - [x] `utils.ts` - Auto-play logic
  - [x] `index.ts` - Export
- [x] Auto-play with 5-second intervals
- [x] Manual navigation dots
- [x] Images with overlay text for CTA
- [x] "Get Started" / "Join Now" button linking to signup
- [x] Optional buttons - only render if provided in item data
- [x] Two layout variants: fullscreen (image background) and split (text left, image right)

#### 2. Features Section

- [x] Create [`src/components/landing/features-section/`](../../../src/components/landing/features-section/)
  - [x] `component.tsx` - Feature cards grid
  - [x] `types.ts` - Feature item types
  - [x] `index.ts` - Export
- [x] 4 feature cards explaining the website:
  - Easy betting on various events
  - Secure & Private
  - Real-time notifications
  - Track your performance

#### 3. FAQ Section

- [x] Create [`src/components/landing/faq-section/`](../../../src/components/landing/faq-section/)
  - [x] `component.tsx` - Accordion-style FAQ
  - [x] `types.ts` - FAQ item types
  - [x] `index.ts` - Export
- [x] Questions included:
  - How do I create an account?
  - How does betting work?
  - How can I participate in a bet?
  - What happens when a bet is resolved?
  - How do I track my bets?

#### 4. Footer with Disclaimer

- [x] Create [`src/components/landing/footer/`](../../../src/components/landing/footer/)
  - [x] `component.tsx` - Footer with disclaimer
  - [x] `index.ts` - Export
- [x] Disclaimer text about responsible betting
- [x] Copyright notice
- [x] Links to terms and conditions, sign up, and login

### Component Structure

```
src/components/landing/
├── hero-carousel/
│   ├── component.tsx
│   ├── types.ts
│   ├── utils.ts
│   └── index.ts
├── features-section/
│   ├── component.tsx
│   ├── types.ts
│   └── index.ts
├── faq-section/
│   ├── component.tsx
│   ├── types.ts
│   └── index.ts
├── footer/
│   ├── component.tsx
│   └── index.ts
└── index.ts (exports all landing components)
```

### Main Landing Page

Update [`src/app/page.tsx`](../../../src/app/page.tsx):

```typescript
import { HeroCarousel } from "@/components/landing/hero-carousel";
import { FeaturesSection } from "@/components/landing/features-section";
import { FaqSection } from "@/components/landing/faq-section";
import { LandingFooter } from "@/components/landing/footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroCarousel />
      <FeaturesSection />
      <FaqSection />
      <LandingFooter />
    </main>
  );
}
```

### Hero Carousel Content

```typescript
const carouselItems = [
  {
    id: 1,
    image: "/images/hero-1.jpg", // Placeholder - use existing logo or gradient
    title: "Welcome to Shoroot",
    subtitle: "The ultimate betting platform",
    ctaText: "Get Started",
    ctaLink: "/auth/signup",
  },
  {
    id: 2,
    image: "/images/hero-2.jpg",
    title: "Bet on Your Favorites",
    subtitle: "Sports, events, and more",
    ctaText: "Join Now",
    ctaLink: "/auth/signup",
  },
  {
    id: 3,
    image: "/images/hero-3.jpg",
    title: "Win Big",
    subtitle: "Track your performance and win",
    ctaText: "Start Betting",
    ctaLink: "/auth/login",
  },
];
```

### Features Content

```typescript
const features = [
  {
    icon: "🎯",
    title: "Easy Betting",
    description:
      "Place bets on various events with just a few clicks. Simple and intuitive interface.",
  },
  {
    icon: "🔒",
    title: "Secure & Private",
    description:
      "Your data and transactions are protected. Private bets available for exclusive groups.",
  },
  {
    icon: "🔔",
    title: "Real-time Notifications",
    description:
      "Get instant updates on bet status, results, and new opportunities.",
  },
  {
    icon: "📊",
    title: "Track Performance",
    description:
      "Monitor your betting history, wins, and statistics in your personal dashboard.",
  },
];
```

### FAQ Content

```typescript
const faqItems = [
  {
    question: "How do I create an account?",
    answer:
      "Click the 'Sign Up' button and fill in your email and password. You'll be ready to start betting in seconds!",
  },
  {
    question: "How does betting work?",
    answer:
      "Browse available bets, select your preferred option, and place your bet. Once the event concludes, winners are determined and notified.",
  },
  {
    question: "How can I participate in a bet?",
    answer:
      "Navigate to the dashboard, find an active bet you're interested in, click 'Participate', and choose your option.",
  },
  {
    question: "What happens when a bet is resolved?",
    answer:
      "The admin determines the winning option. All participants are notified, and winners can see their success in their dashboard.",
  },
  {
    question: "How do I track my bets?",
    answer:
      "Your personal dashboard shows all your participations, active bets, and historical performance.",
  },
];
```

### Disclaimer Text

```
Disclaimer: This betting platform is for entertainment purposes only.
Please bet responsibly and within your means. Users must be of legal age
to participate. The platform reserves the right to modify or cancel bets
if necessary. Past performance does not guarantee future results.
```

### Files to Create

- [x] [`src/components/landing/hero-carousel/component.tsx`](../../../src/components/landing/hero-carousel/component.tsx)
- [x] [`src/components/landing/hero-carousel/types.ts`](../../../src/components/landing/hero-carousel/types.ts)
- [x] [`src/components/landing/hero-carousel/utils.ts`](../../../src/components/landing/hero-carousel/utils.ts)
- [x] [`src/components/landing/hero-carousel/index.ts`](../../../src/components/landing/hero-carousel/index.ts)
- [x] [`src/components/landing/features-section/component.tsx`](../../../src/components/landing/features-section/component.tsx)
- [x] [`src/components/landing/features-section/types.ts`](../../../src/components/landing/features-section/types.ts)
- [x] [`src/components/landing/features-section/index.ts`](../../../src/components/landing/features-section/index.ts)
- [x] [`src/components/landing/faq-section/component.tsx`](../../../src/components/landing/faq-section/component.tsx)
- [x] [`src/components/landing/faq-section/types.ts`](../../../src/components/landing/faq-section/types.ts)
- [x] [`src/components/landing/faq-section/index.ts`](../../../src/components/landing/faq-section/index.ts)
- [x] [`src/components/landing/footer/component.tsx`](../../../src/components/landing/footer/component.tsx)
- [x] [`src/components/landing/footer/index.ts`](../../../src/components/landing/footer/index.ts)
- [x] [`src/components/landing/index.ts`](../../../src/components/landing/index.ts)

### Files to Modify

- [x] [`src/app/page.tsx`](../../../src/app/page.tsx) - Replace with landing page

### Files to Remove/Deprecate

- [x] [`src/components/public-dashboard/`](../../../src/components/public-dashboard/) - No longer needed
- [x] [`src/app/api/bets/public/route.ts`](../../../src/app/api/bets/public/route.ts) - No longer needed

### Design Notes

- Use existing color scheme from globals.css
- Responsive design for mobile and desktop
- Use Shadcn UI components where appropriate
- Keep it lightweight and fast-loading
- No authentication required to view landing page
