---
name: Premium Monetization Matrix
colors:
  surface: '#051424'
  surface-dim: '#051424'
  surface-bright: '#2c3a4c'
  surface-container-lowest: '#010f1f'
  surface-container-low: '#0d1c2d'
  surface-container: '#122131'
  surface-container-high: '#1c2b3c'
  surface-container-highest: '#273647'
  on-surface: '#d4e4fa'
  on-surface-variant: '#c2c6d6'
  inverse-surface: '#d4e4fa'
  inverse-on-surface: '#233143'
  outline: '#8c909f'
  outline-variant: '#424754'
  surface-tint: '#adc6ff'
  primary: '#adc6ff'
  on-primary: '#002e6a'
  primary-container: '#4d8eff'
  on-primary-container: '#00285d'
  inverse-primary: '#005ac2'
  secondary: '#4ae176'
  on-secondary: '#003915'
  secondary-container: '#00b954'
  on-secondary-container: '#004119'
  tertiary: '#ffb786'
  on-tertiary: '#502400'
  tertiary-container: '#df7412'
  on-tertiary-container: '#461f00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#6bff8f'
  secondary-fixed-dim: '#4ae176'
  on-secondary-fixed: '#002109'
  on-secondary-fixed-variant: '#005321'
  tertiary-fixed: '#ffdcc6'
  tertiary-fixed-dim: '#ffb786'
  on-tertiary-fixed: '#311400'
  on-tertiary-fixed-variant: '#723600'
  background: '#051424'
  on-background: '#d4e4fa'
  surface-variant: '#273647'
typography:
  h1-desktop:
    fontFamily: Space Grotesk
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h1-mobile:
    fontFamily: Space Grotesk
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h2:
    fontFamily: Space Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: -0.01em
  body:
    fontFamily: Space Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0em
  label-badge:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  container-margin: 20px
  gutter: 16px
---

## Brand & Style

The design system is engineered for an elite educational environment focusing on high-ticket digital monetization. The personality is authoritative, technical, and high-performance. It targets digital entrepreneurs who value precision and "insider" access.

The visual style is **Corporate Modern with subtle Glassmorphism**. By combining a deep, tech-centric dark palette with crisp, geometric typography, the interface evokes the feeling of a professional trading terminal or a high-end dashboard. The aesthetic prioritizes clarity and perceived value, using light-to-dark surface layering to guide the user through complex training modules.

## Colors

The palette is optimized for long-form viewing in dark environments, reducing eye strain during deep-dive training sessions.

- **Background & Surface:** The foundation uses a "Deep Space" hierarchy. The primary background is a rich dark navy, while interactive containers use a slightly lighter elevation to create separation without high-contrast fatigue.
- **Primary Accent:** A vibrant "Cyber Blue" used exclusively for primary actions, progress indicators, and active states.
- **Success/Badge:** A "Growth Green" used for monetization milestones, completed lessons, and positive financial data.
- **Borders:** A low-contrast navy-grey that defines structure without breaking the seamless flow of the dark interface.

## Typography

This design system utilizes **Space Grotesk** across all levels to maintain a technical, futuristic edge. 

- **Headlines:** Use tight letter-spacing and bold weights to command attention. H1 elements should be treated as "Hero" statements.
- **Body:** Set with generous line-height (1.6) to ensure legibility of instructional text and documentation.
- **Labels:** Small-caps or increased letter-spacing is encouraged for badges and metadata to differentiate from standard body copy.
- **Scale:** On mobile, headline sizes are slightly reduced to prevent awkward line breaks while maintaining visual weight.

## Layout & Spacing

The system follows a **8px rhythmic grid** to ensure consistency across all components.

- **Mobile-First Focus:** Content should be primarily stacked in a single column with a 20px safe margin. 
- **Desktop Strategy:** A 12-column fluid grid. Cards and video players should utilize wide-span layouts (8-12 columns) to maximize the "cinematic" feel of the training content.
- **Negative Space:** Generous vertical padding between sections (40px+) is required to maintain the premium, "uncluttered" aesthetic. Information density should be kept low to focus the user's attention on one task at a time.

## Elevation & Depth

Hierarchy is communicated through **Tonal Layering** and **Soft Ambient Shadows**.

- **Level 0 (Background):** #0A0F1E - The base canvas.
- **Level 1 (Cards/Sidebar):** #131929 - Elevated surfaces using a 1px border (#1E2D45) to define edges.
- **Level 2 (Modals/Popovers):** #1C2438 - The highest elevation, utilizing a soft, diffused shadow (0px 10px 30px rgba(0,0,0,0.5)) to appear as if floating.
- **Interactive Depth:** Buttons and cards should utilize a subtle 10% brightness increase on hover, rather than a physical lift, to maintain the sophisticated flat-modern hybrid look.

## Shapes

The shape language is consistently **Rounded**, striking a balance between modern technology and approachability. 

- **Primary Radius:** 12px (0.5rem) is the standard for all cards, input fields, and main containers.
- **Small Elements:** Buttons and badges should scale down to 8px where appropriate, but the 12px standard remains the core identity.
- **Icons:** Use linear, 2px stroke icons with slightly rounded terminals to match the font's geometric nature.

## Components

- **Buttons:** Primary buttons are solid #3B82F6 with white text (#F1F5F9). Secondary buttons use an outline style with #1E2D45 borders. All buttons feature 12px rounded corners and a height of 48px for mobile tap-friendliness.
- **Chips/Badges:** Small, 12px uppercase text inside containers with 20% opacity backgrounds based on the badge's category (e.g., Green for "Success", Blue for "Module").
- **Cards:** The core of the platform. Cards feature a 1px #1E2D45 border, #131929 background, and 24px internal padding.
- **Input Fields:** Darker than the surface (#0A0F1E), with a subtle 1px border. On focus, the border transitions to #3B82F6.
- **Progress Bars:** Thin, 4px height tracks with #1E2D45 background and #3B82F6 fill, used for lesson completion tracking.
- **Lists:** Clean, border-bottom separated rows with chevron-right icons to indicate drill-down navigation.