import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  type?: 'website' | 'article';
  structuredData?: any;
  robots?: string;
}

const defaultMeta = {
  title: 'GamepadTest - Professional Controller Testing Tool | Free Online Gamepad Tester',
  description: 'GamepadTest: The #1 online gamepad testing tool. Test Xbox, PlayStation & PC controllers with real-time input detection, button mapping & performance analysis. Free & instant results.',
  keywords: 'gamepad tester, controller test, xbox controller test, playstation controller test, pc gamepad test, joystick test, controller checker, gamepad checker, gaming controller test, hardware diagnostics',
  type: 'website' as const,
};

export function SEO({
  title = defaultMeta.title,
  description = defaultMeta.description,
  keywords = defaultMeta.keywords,
  type = defaultMeta.type,
  structuredData,
  robots
}: SEOProps) {
  const location = useLocation();
  const canonicalUrl = `https://www.gamepadtest.tech${location.pathname}`;

  useEffect(() => {
    // Update title
    document.title = title;

    // Update meta tags
    const updateMeta = (name: string, content: string, property = false) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        if (property) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Basic meta tags
    updateMeta('description', description);
    updateMeta('keywords', keywords);

    // Robots (optional per-page)
    if (robots) updateMeta('robots', robots);

    // Open Graph
    updateMeta('og:title', title, true);
    updateMeta('og:description', description, true);
    updateMeta('og:type', type, true);
    updateMeta('og:url', canonicalUrl, true);
    updateMeta('og:site_name', 'GamepadTest', true);

    // Twitter Card
    updateMeta('twitter:card', 'summary_large_image', true);
    updateMeta('twitter:title', title, true);
    updateMeta('twitter:description', description, true);

    // Canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // Structured Data
    if (structuredData) {
      let structuredScript = document.querySelector('script[type="application/ld+json"]');
      if (!structuredScript) {
        structuredScript = document.createElement('script');
        structuredScript.setAttribute('type', 'application/ld+json');
        document.head.appendChild(structuredScript);
      }
      structuredScript.textContent = JSON.stringify(structuredData);
    }
  }, [title, description, keywords, type, canonicalUrl, structuredData]);

  return null;
}

// Predefined structured data
export const createWebsiteStructuredData = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'GamepadTest',
  alternateName: ['Gamepad Tester', 'Controller Tester', 'Gamepad Checker'],
  description: 'The #1 professional gamepad testing tool. Test Xbox, PlayStation & PC controllers with real-time input detection and performance analysis.',
  url: 'https://www.gamepadtest.tech',
  sameAs: [
    'https://twitter.com/gamepadchecker',
    'https://facebook.com/gamepadchecker',
    'https://github.com/gamepadchecker'
  ],
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://www.gamepadtest.tech/search?q={search_term_string}',
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
    url: 'https://www.gamepadtest.tech'
  },
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.gamepadtest.tech'
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
