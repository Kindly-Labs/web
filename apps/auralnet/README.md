# Owly Labs Website Template

This is the official website for **Owly Labs**, a Fair Trade AI technology consulting firm dedicated to empowering local small businesses. The website is built as a reusable template with the Astro framework, designed to be professional, approachable, and easy to maintain.

## Core Objective

The primary goal of this website is to serve as the main online presence for Owly Labs, clearly communicating its mission, services, and community-focused approach. It aims to help immigrant-owned small businesses in San Francisco access free technology consulting and support.

## 🚀 Project Structure

This project is a multi-page Astro website with a component-based architecture and comprehensive design system.

```text
/
├── public/                # Static assets (images, fonts, favicon)
├── src/
│   ├── components/
│   │   ├── layouts/      # Page layouts (Layout.astro, DocumentationLayout.astro)
│   │   ├── sections/     # Page-specific sections and 3D components
│   │   ├── shared/       # Shared components (Header, Footer, ChatWidget)
│   │   └── ui/           # Reusable UI components (Button, Card, Form, etc.)
│   ├── pages/            # Site pages (.astro) - each file becomes a route
│   ├── data/             # Typed data modules (site config, metrics)
│   ├── styles/           # Global styles and theme (new-theme.css)
│   ├── assets/           # Assets that need to be processed
│   └── lib/              # Utility functions
├── memory-bank/          # Project documentation and context
├── STYLE_GUIDE.md        # Complete design system documentation
├── COMPONENTS.md         # Component usage reference
├── astro.config.mjs      # Astro configuration
├── package.json          # Project dependencies and scripts
└── tsconfig.json         # TypeScript configuration
```

### Key Directories

- **`src/pages/`**: Contains all pages for the site. Each `.astro` file becomes a page route.
- **`src/data/`**: Typed data modules for site configuration, metrics, and content.
- **`src/components/ui/`**: Reusable UI components following the design system.
- **`src/components/layouts/`**: Layout components that wrap pages.
- **`src/components/shared/`**: Shared components used across the site (Header, Footer).
- **`src/components/sections/`**: Page-specific sections and interactive components.
- **`src/styles/`**: Global styles including the comprehensive theme system.
- **`public/`**: Static assets served directly.

## Tech Stack

- **Framework**: [Astro](https://astro.build/) 5.15.5
- **UI Library**: [React](https://reactjs.org/) 19.2.0 (for 3D components)
- **3D Graphics**: [Three.js](https://threejs.org/) 0.181.1 with [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber)
- **Deployment**: [Netlify](https://www.netlify.com/)
- **Forms**: Netlify Forms
- **Styling**: CSS Custom Properties + Scoped Component Styles
- **Typography**: Google Fonts (Inter, Roboto Mono)

## Design System

This project includes a comprehensive design system based on a nature-inspired forest theme. Key features:

### Theme & Colors

- **Nature-inspired palette**: Deep forest greens, sunset oranges, and fresh leaf accents
- **CSS Custom Properties**: All colors, spacing, and typography use CSS variables
- **Glass morphism effects**: Frosted glass cards and overlays
- **Consistent gradients**: Orange to green transitions throughout

### Components

- **20+ Reusable UI Components**: Button, Card, Form elements, Layout helpers
- **Consistent API**: All components follow similar prop patterns
- **Accessibility built-in**: Proper ARIA labels, keyboard navigation, focus states
- **Responsive by default**: Mobile-first design with consistent breakpoints

### Documentation

- **[STYLE_GUIDE.md](./STYLE_GUIDE.md)**: Complete design system documentation
- **[COMPONENTS.md](./COMPONENTS.md)**: Component usage reference and examples

### Key Components

**UI Components:**

- `Button` - 5 variants (primary, secondary, outline, ghost, glass)
- `Card` - 3 variants with hover effects
- `Form`, `FormGroup`, `Input`, `Textarea`, `Select` - Complete form system
- `Container`, `Section`, `PageHeader` - Layout helpers
- `Prose` - Rich text content wrapper

**Layout Components:**

- `Layout` - Standard page layout with header/footer
- `DocumentationLayout` - Article/documentation pages with TOC

**Shared Components:**

- `Header` - Fixed navigation with mobile menu
- `Footer` - Multi-column footer with sitemap
- `ChatWidget` - Support widget placeholder

## 🧞 Commands

All commands are run from the root of the project in a terminal:

| Command           | Action                                                       |
| :---------------- | :----------------------------------------------------------- |
| `npm install`     | Installs all project dependencies.                           |
| `npm run dev`     | Starts the local development server at `localhost:4321`.     |
| `npm run build`   | Builds the production-ready site to the `./dist/` directory. |
| `npm run preview` | Previews the production build locally before deploying.      |

## 📝 Development Guidelines

### Creating New Pages

1. Create a new `.astro` file in `src/pages/`
2. Use the standard page template:

```astro
---
import Layout from '../components/layouts/Layout.astro';
import Container from '../components/ui/Container.astro';
import Section from '../components/ui/Section.astro';
import PageHeader from '../components/ui/PageHeader.astro';
---

<Layout title="Page Title">
  <Section spacing="lg">
    <Container size="lg">
      <PageHeader title="Page Title" subtitle="Subtitle" />

      <!-- Your content here -->
    </Container>
  </Section>
</Layout>
```

### Using Components

1. **Always use existing components** before creating new ones
2. **Import from the ui directory**: `import Button from '../components/ui/Button.astro'`
3. **Use CSS variables**: Reference theme variables instead of hardcoded values
4. **Follow the style guide**: See [STYLE_GUIDE.md](./STYLE_GUIDE.md) for details

### Styling Best Practices

1. Use CSS custom properties from the theme system
2. Leverage existing spacing variables (`--spacing-4`, `--spacing-8`, etc.)
3. Use theme colors (`--color-primary`, `--color-accent`, etc.)
4. Keep component styles scoped
5. Use responsive utilities (`clamp()`, `auto-fit grid`)

### Code Organization

```
src/components/
├── layouts/           # Page layouts only
├── sections/          # Page-specific sections
├── shared/            # Site-wide shared components
└── ui/                # Reusable UI components (use these!)
```

### Data-Driven Architecture

To ensure maintainability, we separate content from presentation using typed data modules in `src/data/`.

- `siteConfig.ts`: Global configuration (social links, footer navigation, metadata).
- `impactMetrics.ts`: Dynamic stats for the Impact Dashboard.
- `homeData.ts`: Content for the landing page (Hero, Activity Feed, Mission).

## 🚀 Deployment

This project is configured for easy deployment on **Netlify**. To deploy:

1.  Push your code to a GitHub repository.
2.  Connect the repository to a new site on Netlify.
3.  Configure the build settings:
    - **Build command:** `npm run build`
    - **Publish directory:** `dist`
4.  Deploy the site. Netlify will automatically build and deploy the site whenever you push new changes to your repository.

## 🎨 Recent Refactoring (2025-11-19)

The website underwent a comprehensive refactoring to improve consistency, maintainability, and reusability:

### What Was Done

1. **Design System Established**
   - Created comprehensive theme with CSS custom properties
   - Added missing color variables (--color-accent-2, --color-background-secondary, etc.)
   - Standardized all spacing, typography, and color usage

2. **Component Library Refactored**
   - Rewrote all form components (Input, Textarea, Select) with consistent styling
   - Fixed Card component to work without Tailwind CSS
   - Created new layout components (Container, Section, PageHeader)
   - Added Form and FormGroup components for better form handling

3. **Pages Updated**
   - Refactored services, contact, and donate pages with new components
   - Improved content organization and clarity
   - Standardized page structures across the site
   - Fixed all undefined CSS variable references

4. **Documentation Created**
   - [STYLE_GUIDE.md](./STYLE_GUIDE.md) - Complete design system documentation
   - [COMPONENTS.md](./COMPONENTS.md) - Component usage reference
   - Updated README with development guidelines

### Benefits

- **Consistency**: All pages now follow the same design patterns
- **Maintainability**: Easier to update styles globally via CSS variables
- **Reusability**: 20+ reusable components reduce code duplication
- **Scalability**: Clear patterns make adding new pages straightforward
- **Documentation**: Comprehensive guides for future development

## 📚 Additional Resources

- **[STYLE_GUIDE.md](./STYLE_GUIDE.md)**: Complete design system and usage guidelines
- **[COMPONENTS.md](./COMPONENTS.md)**: Component API reference with examples
- **[Astro Documentation](https://docs.astro.build)**: Framework documentation
- **[Astro Discord](https://astro.build/chat)**: Community support

## 🤝 Contributing

When contributing to this project:

1. Review the [STYLE_GUIDE.md](./STYLE_GUIDE.md) first
2. Use existing components from `src/components/ui/`
3. Follow the established patterns and conventions
4. Test responsive design on mobile, tablet, and desktop
5. Ensure accessibility standards are met

## 📄 License

This project is maintained by Owly Labs, a Fair Trade AI organization.
