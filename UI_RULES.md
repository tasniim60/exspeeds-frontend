# UI Design Rules

## 1. Core Design Principle

Build interfaces that feel intentionally designed by a strong product designer, not generated from a generic AI template.

The interface must have a clear visual identity, hierarchy, rhythm, and purpose.

Do not optimize for "modern" by blindly using gradients, glassmorphism, huge rounded cards, excessive shadows, or excessive animation.

Every visual decision should serve the product.

---

## 2. Avoid Generic AI UI

Do NOT default to:

* Purple/blue AI gradients
* Excessive glassmorphism
* Every section inside a rounded card
* Excessive `rounded-2xl` / `rounded-3xl`
* Huge centered hero sections
* Generic SaaS dashboards
* Excessive glowing borders
* Random floating blobs
* Gradient text everywhere
* Excessive drop shadows
* "AI-generated" looking abstract backgrounds
* Repeated card grids with identical dimensions
* Huge headings followed by three generic feature cards
* Unnecessary badges everywhere
* Excessive use of icons
* Fake statistics
* Fake testimonials
* Fake customer logos
* Decorative elements with no UX purpose

If a visual element does not improve hierarchy, usability, branding, or interaction, remove it.

---

## 3. Establish a Visual Direction First

Before implementing the UI, determine:

1. Product type
2. Target users
3. Primary user action
4. Brand personality
5. Visual direction
6. Typography hierarchy
7. Color strategy
8. Layout strategy
9. Interaction style

Do not start by randomly combining components from UI libraries.

The final interface should feel like one coherent design system.

---

## 4. Layout

Prefer intentional layouts over repetitive grids.

Use when appropriate:

* Asymmetric layouts
* Editorial layouts
* Bento layouts
* Split-screen compositions
* Large whitespace
* Strong vertical rhythm
* Full-width sections
* Layered compositions
* Dense information layouts
* Experimental but usable compositions

Do not force asymmetry or bento layouts when they do not fit the product.

### Spacing

Use a consistent spacing scale.

Prefer:

* clear section separation
* predictable internal spacing
* deliberate whitespace
* comfortable reading width

Avoid:

* cramped layouts
* excessive empty space without purpose
* random spacing values

---

## 5. Typography

Typography should carry a significant part of the visual identity.

Use a deliberate hierarchy:

* Display / Hero
* Heading
* Subheading
* Body
* Caption
* Metadata

Do not make every heading oversized.

Use font weight, size, line height, letter spacing, and whitespace intentionally.

Prefer strong typography over decorative effects.

When appropriate, use a distinctive font pairing rather than relying on the default system font.

---

## 6. Color

Use a restrained color system.

Define:

* Background
* Surface
* Primary
* Secondary
* Accent
* Muted
* Border
* Success
* Warning
* Error

A single accent color is often enough.

Do not use gradients simply because they make the interface look "modern."

If gradients are used, they must have a clear visual purpose.

Maintain accessible contrast.

---

## 7. Cards

Cards are a tool, not the default layout primitive.

Do NOT turn every piece of content into a card.

Prefer:

* open layouts
* dividers
* sections
* whitespace
* typography
* subtle surfaces

Use cards when grouping information genuinely improves comprehension.

Avoid:

```text
Card
Card
Card
Card
```

when the same information could be presented more naturally.

---

## 8. Borders and Shadows

Use subtle borders and shadows.

Do not make every component:

```text
rounded
+
border
+
shadow
+
gradient
+
glow
```

Choose only what is necessary.

Visual hierarchy should primarily come from:

1. Layout
2. Typography
3. Spacing
4. Color
5. Contrast

Effects come after these.

---

## 9. Animation

Animation should communicate something.

Good uses:

* Page transitions
* Enter/exit states
* Hover feedback
* Loading states
* Progress
* Data changes
* Navigation
* Focus
* Scroll-based storytelling when appropriate

Avoid:

* animating everything
* continuous movement everywhere
* excessive bouncing
* unnecessary particle effects
* animation that distracts from content

Prefer short, subtle, intentional motion.

Respect:

```css
prefers-reduced-motion
```

---

## 10. Magic UI Usage

Magic UI should enhance the design, not define the entire design.

Use Magic UI when a component provides meaningful visual or interaction value.

Good candidates:

* Animated text
* Marquee
* Border Beam
* Bento Grid
* Aurora backgrounds
* Dock
* Animated Grid
* Shimmer
* Morphing Text
* Ripple
* Spotlight
* Scroll-based effects

Do NOT use Magic UI components simply because they exist.

Never add multiple flashy effects to the same section.

A premium interface often uses fewer effects, not more.

---

## 11. shadcn Usage

Use shadcn for reliable UI primitives and interaction patterns.

Examples:

* Button
* Input
* Select
* Dialog
* Dropdown
* Sheet
* Tabs
* Tooltip
* Table
* Form
* Navigation

Customize the visual treatment to match the project's design system.

Do not ship an untouched default shadcn interface when the product requires a distinctive visual identity.

---

## 12. Component Reuse

Build reusable components when repetition is meaningful.

Avoid creating abstractions too early.

Prefer:

```text
components/
├── ui/
├── layout/
├── navigation/
├── sections/
└── features/
```

Keep feature-specific components close to their feature when appropriate.

Do not create a component abstraction for every small `<div>`.

---

## 13. Responsive Design

Design mobile intentionally.

Do not simply shrink the desktop version.

Check:

* Navigation
* Typography
* Content order
* Spacing
* Touch targets
* Tables
* Cards
* Images
* Forms
* Dialogs
* Horizontal overflow

Mobile layouts may require different composition, not just smaller dimensions.

---

## 14. Accessibility

Accessibility is part of the design.

Ensure:

* semantic HTML
* keyboard navigation
* visible focus states
* accessible labels
* sufficient color contrast
* meaningful alt text
* proper heading hierarchy
* usable touch targets
* reduced-motion support

Do not sacrifice accessibility for visual effects.

---

# Browser Verification

## 15. Always Verify the Actual UI

After implementing a significant UI section:

1. Start the development server.
2. Open the application using Playwright.
3. Inspect the rendered page.
4. Test important interactions.
5. Check desktop layout.
6. Check mobile layout.
7. Look for overflow, clipping, broken spacing, and visual inconsistencies.
8. Fix discovered issues.
9. Re-check after modifications.

Do not assume that correct React/HTML/CSS code means the UI is correct.

---

## 16. Playwright Review Checklist

When reviewing the page, check:

### Layout

* Is anything overflowing?
* Are elements unexpectedly clipped?
* Are sections aligned?
* Is the content hierarchy obvious?
* Are spacing relationships consistent?

### Responsive

Test at minimum:

* Mobile
* Tablet
* Desktop

Check:

* navigation
* hero
* grids
* forms
* tables
* dialogs
* buttons
* images

### Interaction

Test:

* navigation
* buttons
* dropdowns
* dialogs
* forms
* hover states
* focus states
* mobile menu

### Visual Quality

Look for:

* excessive cards
* excessive gradients
* inconsistent radius
* inconsistent spacing
* excessive shadows
* weak typography
* visual clutter
* unnecessary animations
* generic AI aesthetics

---

# Design Before Code

## 17. Think Before Implementing

Before writing a large amount of UI code, briefly determine:

```text
Visual Direction:
Typography:
Color Strategy:
Layout Strategy:
Interaction Style:
Key Components:
```

Then implement.

Do not spend excessive time explaining the design.

The goal is to make the design decisions before blindly generating components.

---

# Content Integrity

## 18. Never Invent Product Data

Do not invent:

* statistics
* users
* revenue
* testimonials
* companies
* reviews
* awards
* customer logos
* product claims

If real content is unavailable, use clearly marked realistic placeholders only when necessary.

Do not present placeholder content as real information.

---

# Final Quality Standard

Before considering a UI complete, ask:

1. Does it have a recognizable visual identity?
2. Does it avoid generic AI aesthetics?
3. Is the hierarchy immediately understandable?
4. Is typography doing real design work?
5. Is the spacing intentional?
6. Are components used because they are appropriate?
7. Are animations purposeful?
8. Does mobile feel intentionally designed?
9. Has the actual rendered UI been checked with Playwright?
10. Would removing some effects make the interface better?

If the answer to the final question is yes, remove the unnecessary effects.

The goal is not to make the interface look impressive.

The goal is to make it feel **designed**.
