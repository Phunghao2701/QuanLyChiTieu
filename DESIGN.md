---
name: Vivid Finance
colors:
  surface: '#fff8f5'
  surface-dim: '#ead6c9'
  surface-bright: '#fff8f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff1e9'
  surface-container: '#ffeadd'
  surface-container-high: '#f9e4d7'
  surface-container-highest: '#f3dfd1'
  on-surface: '#241912'
  on-surface-variant: '#564334'
  inverse-surface: '#3a2e25'
  inverse-on-surface: '#ffede3'
  outline: '#897362'
  outline-variant: '#ddc1ae'
  surface-tint: '#904d00'
  primary: '#904d00'
  on-primary: '#ffffff'
  primary-container: '#ff8c00'
  on-primary-container: '#623200'
  inverse-primary: '#ffb77d'
  secondary: '#0040df'
  on-secondary: '#ffffff'
  secondary-container: '#2d5bff'
  on-secondary-container: '#efefff'
  tertiary: '#006e2a'
  on-tertiary: '#ffffff'
  tertiary-container: '#00c451'
  on-tertiary-container: '#004919'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdcc3'
  primary-fixed-dim: '#ffb77d'
  on-primary-fixed: '#2f1500'
  on-primary-fixed-variant: '#6e3900'
  secondary-fixed: '#dde1ff'
  secondary-fixed-dim: '#b8c3ff'
  on-secondary-fixed: '#001355'
  on-secondary-fixed-variant: '#0035bd'
  tertiary-fixed: '#69ff87'
  tertiary-fixed-dim: '#3ce36a'
  on-tertiary-fixed: '#002108'
  on-tertiary-fixed-variant: '#00531e'
  background: '#fff8f5'
  on-background: '#241912'
  surface-variant: '#f3dfd1'
typography:
  display:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  title-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-bold:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  margin-mobile: 16px
  margin-desktop: 48px
  gutter: 16px
---

## Brand & Style

This design system is built on a foundation of **Corporate Modern** aesthetics infused with a **High-Contrast / Bold** energy. The brand personality is optimistic, proactive, and accessible, aiming to transform the often-daunting task of financial management into a vibrant, engaging experience. 

The target audience consists of young professionals and digital natives who value speed and clarity. The UI evokes a sense of momentum through the use of high-saturation accents against a sterile, organized backdrop. Visual hierarchy is strictly enforced through bold typography and clear containment, ensuring the user feels in total control of their data.

## Colors

The palette is anchored by a "Friendly Orange" primary color, used strategically for main actions and brand presence. To support financial data visualization, a secondary blue and tertiary green are utilized for "Income" and "Savings" metaphors, while red handles "Expenses."

*   **Primary:** Used for primary buttons, active states, and signature headers.
*   **Neutral Surface:** A pure white (#FFFFFF) background to maintain a high-contrast, clean feel.
*   **Neutral Container:** A soft, cool grey (#F5F7F9) used to group information without introducing heavy borders.
*   **Functional Colors:** High-saturation tones for category icons to ensure immediate recognition.

## Typography

The design system utilizes **Inter** exclusively to leverage its exceptional legibility and modern, systematic feel. The scale relies on heavy weight distributions for headlines to create a "bold" editorial feel that stands out against the vibrant orange accents. 

For financial figures, tabular lining figures should be used where possible to ensure columns of numbers align perfectly. Labels use a slightly tighter tracking and bold weights to provide clear signposting in data-heavy views.

## Layout & Spacing

The layout follows a **Fluid Grid** model with a focus on mobile-first utility. On mobile devices, a 4-column system is used with 16px side margins. On desktop, this scales to a 12-column system with a maximum content width of 1200px.

A strict 8px spacing rhythm governs all element relationships. 
*   **Information Density:** Use `md` (16px) for standard padding within cards and `lg` (24px) for vertical separation between distinct sections.
*   **Grouping:** Use `xs` (4px) or `sm` (12px) to link labels to their respective inputs or icons.

## Elevation & Depth

This design system uses **Tonal Layers** combined with **Ambient Shadows** to create a sense of tactile hierarchy. 

*   **Level 0 (Surface):** The main background, pure white.
*   **Level 1 (Containers):** Soft grey surfaces (#F5F7F9) with no shadows, used for secondary grouping.
*   **Level 2 (Cards):** White surfaces with a very soft, diffused shadow (Offset: 0, 4px; Blur: 20px; Color: RGBA(0,0,0, 0.05)).
*   **Level 3 (Interactive):** Primary buttons and active states use a subtle tinted shadow based on the primary color to suggest "glow" and interactivity.

## Shapes

The shape language is overtly **Rounded**, signaling friendliness and safety. A large radius is applied to all major containers and interactive elements to soften the high-contrast color palette.

Specific applications:
*   **Cards & Modals:** Use `rounded-xl` (1.5rem / 24px) to create a distinct, friendly container.
*   **Buttons:** Use `rounded-lg` (1rem / 16px) for a modern, substantial feel.
*   **Inputs:** Use `rounded-md` (0.5rem / 8px) to maintain a slightly more structured look for data entry.

## Components

### Buttons
Primary buttons are solid `#FF8C00` with white `label-bold` text. They feature 16px internal padding. Secondary buttons use the `neutral_container` background with primary-colored text.

### Cards
Cards are the primary vehicle for financial data. They must always use a white background, `rounded-xl` corners, and the Level 2 ambient shadow. Internal padding is fixed at 24px (`lg`).

### Category Icons
Icons are housed in "squircle" containers with 12px radii. Each category uses a distinct high-contrast color (Red for Food, Blue for Transport, Green for Income, Yellow for Entertainment) at 10% opacity for the background and 100% opacity for the icon glyph.

### Input Fields
Inputs use a white background with a 1px border of `#E2E8F0`. On focus, the border transitions to the primary orange with a 2px width.

### Progress Bars
Use thick, 8px heights with fully rounded caps. The track uses `neutral_container` while the indicator uses the primary or functional color associated with the goal.