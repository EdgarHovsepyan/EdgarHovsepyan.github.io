export interface NavLink {
  label: string;
  href: string;
}

export interface Stat {
  value: string;
  suffix?: string;
  label: string;
  tone?: 'gold';
}

export interface SocialLink {
  label: string;
  href: string;
}

export interface ExperienceEntry {
  period: string;
  role: string;
  org: string;
  description: string;
  tags: string[];
  highlights: string[];
}

export interface WorkProject {
  id: string;
  title: string;
  description: string;
  tags: string[];
}

export interface BentoCell {
  label: string;
  chips: string[];
  wide?: boolean;
  accent?: boolean;
  title?: string;
  body?: string;
}

export type MarqueeToken =
  | { kind: 'word'; text: string; accent?: boolean }
  | { kind: 'star' };

export interface ContactDetail {
  label: string;
  value: string;
  href?: string;
  tone?: 'green';
}
