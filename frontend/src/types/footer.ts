export interface FooterLink {
  label: string;
  href: string;
  isExternal?: boolean;
  badge?: string;
  id?: string;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

export interface ServiceArea {
  city: string;
  highlight?: string;
  available: boolean;
}

export interface PaymentMethodConfig {
  id: string;
  name: string;
  badgeText: string;
  description?: string;
}

export interface SocialLinkConfig {
  platform: string;
  url?: string;
  ariaLabel: string;
  iconName: 'facebook' | 'instagram' | 'x' | 'tiktok' | 'telegram';
}

export interface BenefitConfig {
  icon: 'shield' | 'clock' | 'mapPin' | 'utensils';
  text: string;
}
