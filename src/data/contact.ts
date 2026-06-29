import { profile } from './profile.ts';
import type { ContactDetail, SocialLink } from './types.ts';

export const socials: SocialLink[] = [
  { label: 'GitHub', href: profile.github },
  { label: 'LinkedIn', href: profile.linkedin },
  { label: 'Telegram', href: profile.telegram },
];

export const contactDetails: ContactDetail[] = [
  { label: 'Location', value: 'Yerevan, Armenia' },
  { label: 'Phone', value: profile.phone, href: profile.phoneHref },
  { label: 'Status', value: 'Remote worldwide · or on-site Yerevan', tone: 'green' },
];
