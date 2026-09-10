import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  type?: 'website' | 'article';
  structuredData?: any;
  robots?: string;
  image?: string;
}

const defaultMeta = {
  title: 'GamepadTest - Professional Controller Testing Tool | Free Online Gamepad Tester',
  description: 'GamepadTest: The #1 online gamepad testing tool. Test Xbox, PlayStation & PC controllers with real-time input detection, button mapping & performance analysis. Free & instant results.',
  keywords: 'gamepad tester, controller test, xbox controller test, playstation controller test, pc gamepad test, joystick test, controller checker, gamepad checker, gaming controller test, hardware diagnostics',
  type: 'website' as const,
  image: 'https://gamepadtest.vercel.app/og-image.jpg',
};

export function SEO({
  title = defaultMeta.title,
  description = defaultMeta.description,
  keywords = defaultMeta.keywords,
  type = defaultMeta.type,
  structuredData,
  robots,
  image = defaultMeta.image
}: SEOProps) {
  const location = useLocation();
  const canonicalUrl = `https://gamepadtest.vercel.app${location.pathname === '/' ? '' : location.pathname}`;

  return (
    <Helmet>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      {robots && <meta name="robots" content={robots} />}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      {title && <meta property="og:title" content={title} />}
      {description && <meta property="og:description" content={description} />}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content="GamepadTest" />
      {image && <meta property="og:image" content={image} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@GamepadTest" />
      {title && <meta name="twitter:title" content={title} />}
      {description && <meta name="twitter:description" content={description} />}
      {image && <meta name="twitter:image" content={image} />}

      {/* Structured Data */}
      {structuredData && (
        Array.isArray(structuredData) ? (
          structuredData.map((data, index) => (
            <script key={index} type="application/ld+json">
              {JSON.stringify(data)}
            </script>
          ))
        ) : (
          <script type="application/ld+json">
            {JSON.stringify(structuredData)}
          </script>
        )
      )}
    </Helmet>
  );
}

// Predefined structured data
export const createWebsiteStructuredData = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'GamepadTest',
  alternateName: ['Gamepad Tester', 'Controller Tester', 'Gamepad Checker'],
  description: 'The #1 professional gamepad testing tool. Test Xbox, PlayStation & PC controllers with real-time input detection and performance analysis.',
  url: 'https://gamepadtest.vercel.app',
  sameAs: [
    'https://twitter.com/gamepadchecker',
    'https://facebook.com/gamepadchecker',
    'https://github.com/gamepadchecker'
  ],
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://gamepadtest.vercel.app/search?q={search_term_string}',
    'query-input': 'required name=search_term_string'
  },
  mainEntity: {
    '@type': 'WebApplication',
    name: 'GamepadTest',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    }
  }
});

export const createFAQStructuredData = (faqs: Array<{ question: string; answer: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(faq => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer
    }
  }))
});

export const createHowToStructuredData = (name: string, steps: string[]) => ({
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: name,
  step: steps.map((step, index) => ({
    '@type': 'HowToStep',
    position: index + 1,
    text: step
  }))
});

export const createBreadcrumbStructuredData = (breadcrumbs: Array<{ name: string; url: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: breadcrumbs.map((breadcrumb, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: breadcrumb.name,
    item: breadcrumb.url
  }))
});

export const createToolPageStructuredData = (toolName: string, description: string, url: string) => ({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: `${toolName} | GamepadTest`,
  description: description,
  url: url,
  isPartOf: {
    '@type': 'WebSite',
    name: 'GamepadTest',
    url: 'https://gamepadtest.vercel.app'
  },
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://gamepadtest.vercel.app'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: toolName,
        item: url
      }
    ]
  }
});
