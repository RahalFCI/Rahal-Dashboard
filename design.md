---
name: Relic Modernism
colors:
  surface: '#fff8f2'
  surface-dim: '#e1d9cf'
  surface-bright: '#fff8f2'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fbf2e8'
  surface-container: '#f5ede2'
  surface-container-high: '#efe7dc'
  surface-container-highest: '#eae1d7'
  on-surface: '#1f1b15'
  on-surface-variant: '#4e4637'
  inverse-surface: '#343029'
  inverse-on-surface: '#f8efe5'
  outline: '#7f7666'
  outline-variant: '#d1c5b2'
  surface-tint: '#785a03'
  primary: '#584100'
  on-primary: '#ffffff'
  primary-container: '#755700'
  on-primary-container: '#f9cf73'
  inverse-primary: '#eac167'
  secondary: '#665e48'
  on-secondary: '#ffffff'
  secondary-container: '#ede2c5'
  on-secondary-container: '#6c644d'
  tertiary: '#224478'
  on-tertiary: '#ffffff'
  tertiary-container: '#3c5c91'
  on-tertiary-container: '#c1d5ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdf9d'
  primary-fixed-dim: '#eac167'
  on-primary-fixed: '#251a00'
  on-primary-fixed-variant: '#5b4300'
  secondary-fixed: '#ede2c5'
  secondary-fixed-dim: '#d1c6aa'
  on-secondary-fixed: '#201b0a'
  on-secondary-fixed-variant: '#4d4632'
  tertiary-fixed: '#d7e3ff'
  tertiary-fixed-dim: '#aac7ff'
  on-tertiary-fixed: '#001b3e'
  on-tertiary-fixed-variant: '#25467a'
  background: '#fff8f2'
  on-background: '#1f1b15'
  surface-variant: '#eae1d7'
typography:
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Space Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Space Grotesk
    fontSize: 15px
    fontWeight: '400'
    lineHeight: '1.5'
  label-sm:
    fontFamily: Space Grotesk
    fontSize: 11px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  label-md:
    fontFamily: Space Grotesk
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  sidebar-width: 240px
  sidebar-accent: 4px
  gutter: 24px
  margin-desktop: 48px
  margin-mobile: 20px
  section-gap: 40px
---

## Brand & Style
The design system for Rahal is rooted in "Relic Modernism"—a philosophy that blends the technical precision of digital exploration with the warmth of a sun-drenched, high-end travel editorial. The aesthetic is sophisticated and gallery-like, prioritizing breathing room over information density.

The target audience consists of discerning travelers and explorers who value curation over gamification. The UI avoids the loud, colorful tropes of social apps in favor of a quiet, authoritative presence. The style is defined by tonal shifts rather than hard lines, using light and shadow to create a sense of physical depth and architectural space.

## Colors
The palette is inspired by natural parchment and golden-hour light. The Primary Amber-gold (#755700) is used sparingly for high-intent actions and critical data points, ensuring it retains its "relic" significance. 

Surfaces are layered to create hierarchy without the need for borders. The background sits at `Surface`, while the navigation and structural sidebars occupy `Surface Container Low`. Content pieces and interactive cards are elevated to `Surface Container Lowest` (pure white) to draw the eye. Text remains grounded in a Slate Charcoal to maintain high legibility against the warm amber tones.

## Typography
Space Grotesk is used exclusively to provide a technical yet eccentric character. 

- **Page Titles:** Utilize `headline-lg` with tight tracking. These should be left-offset from the main content grid to create an asymmetric, editorial feel.
- **Section Labels:** All-caps `label-sm` with expanded tracking provides a clear, architectural signpost for different dashboard modules.
- **Body Copy:** Maintains a generous line height to ensure long-form exploration logs remain readable and inviting.

## Layout & Spacing
The layout follows a "Fluid-Asymmetric" model. The content is anchored by a 240px sidebar on the left, but the main stage uses intentional white space to separate thematic blocks rather than rigid lines.

- **Grid:** A 12-column grid is used for card layouts, but large headers and hero imagery should break the grid or offset from the main container to reinforce the gallery aesthetic.
- **Breakpoints:** 
    - **Desktop (1440px+):** 48px margins, 24px gutters.
    - **Tablet (768px - 1439px):** Sidebar collapses to icons; 32px margins.
    - **Mobile (<767px):** Single column; 20px margins; sidebar moves to a bottom navigation bar or drawer.

## Elevation & Depth
Depth is communicated through "Tonal Stacking" and "Atmospheric Blurs" rather than traditional drop shadows.

- **The Tonal Stack:** Objects closer to the user are lighter in color. The background is the darkest light-neutral, while interactive cards are pure white.
- **Dividers:** 1px solid lines are strictly forbidden. Use subtle shifts in background color (e.g., a card on a surface container) or generous whitespace to denote separation.
- **Modals:** Use a glassmorphic effect with 80% opacity and a 20px backdrop blur. Only modals and top-level overlays utilize the "Ambient Shadow" (a very soft, 6% opacity charcoal tint) to simulate a floating object caught in light.

## Shapes
The shape language is "Calculated Softness." We use varying radii to distinguish between containers and interactive elements.

- **Cards & Containers:** Fixed at an 8px radius to maintain a structural, architectural look.
- **Buttons & Interactive Elements:** Fixed at a 12px radius to provide a softer, more inviting touchpoint that contrasts with the structural containers.
- **Sidebar Accent:** A sharp 4px vertical bar indicates the active state, providing a crisp geometric contrast to the rounded buttons.

## Components
- **Buttons:**
    - **Primary:** Solid #755700 with white text. 12px radius. No shadow.
    - **Secondary:** Solid #FFF3D6 with #755700 text. 12px radius.
    - **Danger:** Solid #C0392B with white text.
- **Cards:** Pure white (#FFFFFF) with an 8px radius. Content inside should have 24px padding. No borders or shadows.
- **Sidebar Items:** Background is transparent by default. Active items feature a 4px primary-colored bar on the extreme left and a subtle shift to a slightly lighter tint of the sidebar background.
- **Input Fields:** Use `Surface` color for the fill. No border. On focus, use a 2px bottom-only border in Primary Gold.
- **Chips/Labels:** Small 4px radius, using `Surface Container Low` for the background with `On-Surface Variant` text.
- **Lists:** Use vertical spacing (16px - 24px) to separate items. Do not use hair-line separators.