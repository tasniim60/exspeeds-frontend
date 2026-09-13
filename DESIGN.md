# Design — Dispatch Deck

<!-- impeccable:design-schema 1 -->

World for XSPEED web (login → admin command center → shared primitives). UI-only reskin; all routes, roles, validation, copy, and AR-RTL/EN-LTR behavior preserved.

## Palette

Latte grounds only: `#FDFAF4` canvas-warm, `#F7F1E6` base, `#EFE3D0` sunk, `#E3D2B6` deep. Ink `#251516` carries every border and text. Dark-orange mass: `#C45B2A` primary, `#D4723F` glow/live dots, `#A34920` hover, `#7A3416` small-text-on-latte (contrast-safe). No gray chrome, no gradients-as-decoration, no black shadows.

## Surfaces

Route-dot canvas: `radial-gradient(rgba(196,91,42,.14) 1.2px)` at 22px over latte. Deck card: `#FFFDF8`, 2px ink border, 24px radius, `0 2px 0 ink + warm 18px blur`. Dark rail (sidebar, ribbon, ticket strip) in ink with latte text. Chips/pills for small controls; cards never nest.

## Type & Motion

Cairo for AR-RTL (letter-spacing normal), Inter/General Sans for EN. Display black weight, -0.03em tracking, oversized numerals on stats. One authored moment per surface: live dispatch ribbon (`ribbon-scroll` 22s loop, honors reduced-motion); login card gentle `deck-float`. Focus rings always orange on latte offset.

## Components

Button (ink-bordered, offset-press: translate + shadow collapse), input (tactile 2px, warm shadow), badge (pill, ink-bordered), table (ink header bar, latte hover), tabs (pill group, ink active), sidebar (ink rail, orange active tile, latte ring).

## Notes

Pre-existing prose accents (`.prose-xspeed .lead`, `blockquote` 4px inline-start) intentionally kept — article typography, not deck cards. Live render pass blocked in this environment (broken `@next/swc` binary); `tsc --noEmit` clean, detector run once with the two pre-existing warnings above.
