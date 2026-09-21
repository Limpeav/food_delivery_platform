import {
  FooterLink,
  ServiceArea,
  PaymentMethodConfig,
  SocialLinkConfig,
  BenefitConfig,
} from '@/types/footer';

export const footerBrand = {
  name: 'Cravery',
  description:
    'Discover great food from local restaurants and get it delivered to your door.',
  benefits: [
    {
      icon: 'shield',
      text: 'Secure online & cash payments',
    },
    {
      icon: 'clock',
      text: 'Real-time order tracking',
    },
    {
      icon: 'mapPin',
      text: 'Local restaurant delivery',
    },
  ] as BenefitConfig[],
};

export const footerCustomerLinks: FooterLink[] = [
  { label: 'Browse Restaurants', href: '/restaurants' },
  { label: 'Hot Deals & Offers', href: '/promotions', badge: 'SAVE' },
  { label: 'My Orders & History', href: '/orders' },
  { label: 'Track Active Order', href: '/orders' },
  { label: 'Saved Addresses & Profile', href: '/account' },
  { label: 'Customer Help Center', href: '/help' },
];

export const footerPartnerLinks: FooterLink[] = [
  { label: 'List Your Restaurant', href: '/restaurant/register', id: 'partner-restaurant-register' },
  { label: 'Restaurant Partner Login', href: '/restaurant/login', id: 'partner-restaurant-login' },
  { label: 'Become a Driver Partner', href: '/driver/register', id: 'partner-driver-register' },
  { label: 'Driver Courier Login', href: '/driver/login', id: 'partner-driver-login' },
  { label: 'Corporate & Team Orders', href: '/help#business' },
  { label: 'Partner Support Hub', href: '/help#partner-support' },
];

export const footerSupportLinks: FooterLink[] = [
  { label: 'Help Center & FAQs', href: '/help' },
  { label: 'Contact Customer Support', href: '/help#contact' },
  { label: 'Order & Delivery Help', href: '/help#orders' },
  { label: 'Payment Methods & Help', href: '/help#payments' },
  { label: 'Refunds & Cancellations', href: '/help#refunds' },
  { label: 'Food Safety & Handling', href: '/help#food-safety' },
];

export const footerServiceAreas: ServiceArea[] = [
  { city: 'Phnom Penh', highlight: 'Central & Suburbs', available: true },
  { city: 'Siem Reap', highlight: 'Downtown & Heritage Area', available: true },
  { city: 'Battambang', highlight: 'Riverside & Center', available: true },
  { city: 'Sihanoukville', highlight: 'Coastal & Business Area', available: true },
];

export const serviceAreaFooterNote = 'More locations coming soon.';

/**
 * Payment methods strictly supported by the platform backend & checkout
 */
export const supportedPaymentMethods: PaymentMethodConfig[] = [
  {
    id: 'CASH_ON_DELIVERY',
    name: 'Cash on Delivery',
    badgeText: 'Cash on Delivery',
    description: 'Pay cash upon arrival',
  },
  {
    id: 'ONLINE_PAYMENT',
    name: 'Online Payment',
    badgeText: 'Online Card / QR',
    description: 'Instant mock card or digital QR checkout',
  },
];

/**
 * Social media configurations.
 * Only accounts with configured URLs will be displayed in the public footer.
 */
export const getAvailableSocialLinks = (): SocialLinkConfig[] => {
  const links: SocialLinkConfig[] = [
    {
      platform: 'Facebook',
      url: process.env.NEXT_PUBLIC_FACEBOOK_URL,
      ariaLabel: 'Follow Cravery on Facebook',
      iconName: 'facebook',
    },
    {
      platform: 'Instagram',
      url: process.env.NEXT_PUBLIC_INSTAGRAM_URL,
      ariaLabel: 'Follow Cravery on Instagram',
      iconName: 'instagram',
    },
    {
      platform: 'X',
      url: process.env.NEXT_PUBLIC_X_URL,
      ariaLabel: 'Follow Cravery on X (formerly Twitter)',
      iconName: 'x',
    },
    {
      platform: 'TikTok',
      url: process.env.NEXT_PUBLIC_TIKTOK_URL,
      ariaLabel: 'Follow Cravery on TikTok',
      iconName: 'tiktok',
    },
    {
      platform: 'Telegram',
      url: process.env.NEXT_PUBLIC_TELEGRAM_URL,
      ariaLabel: 'Join Cravery community on Telegram',
      iconName: 'telegram',
    },
  ];

  // If environment variables are not set during local dev, provide standard official profile handles
  // as graceful fallbacks only if explicitly configured or fallback allowed.
  return links.filter((item) => Boolean(item.url));
};

export const appDownloadConfig = {
  title: 'Get Cravery on your phone',
  subtitle: 'Order faster with mobile notifications & live courier tracking',
  appStoreUrl: process.env.NEXT_PUBLIC_APP_STORE_URL || '',
  googlePlayUrl: process.env.NEXT_PUBLIC_GOOGLE_PLAY_URL || '',
};

export const footerLegalLinks = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Cookie Policy', href: '/terms#cookies' },
  { label: 'Refund Policy', href: '/help#refunds' },
  { label: 'Accessibility', href: '/help#accessibility' },
];

export const copyrightNotice = `© 2026 Cravery. All rights reserved.`;
