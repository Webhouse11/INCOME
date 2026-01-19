
export enum CategoryType {
  BUSINESS = 'Business',
  TECH = 'Tech',
  DIGITAL_ASSETS = 'Digital Assets'
}

export interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'RECOVERY';
  message: string;
  source: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: CategoryType;
  image: string;
  author: string;
  createdAt: string;
  updatedAt?: string;
  metaTitle?: string;
  metaDescription?: string;
  featured?: boolean;
  source?: 'system' | 'user';
}

export interface ProductBonus {
  title: string;
  description: string;
  value: number;
}

export interface ProductFAQ {
  question: string;
  answer: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  currency: 'USD' | 'NGN';
  category: CategoryType;
  image: string;
  type: 'Ebook' | 'Course' | 'Template' | 'Guide' | 'Toolkit' | 'Roadmap' | 'Blueprint';
  features: string[];
  targetAudience: string;
  problemSolved: string;
  downloadUrl?: string;
  createdAt: string;
  updatedAt?: string;
  fullSalesCopy?: string;
  modules?: { title: string; items: string[] }[];
  bonuses?: ProductBonus[];
  faqs?: ProductFAQ[];
  source?: 'system' | 'user';
}

export interface CMSData {
  articles: Article[];
  products: Product[];
  logs: LogEntry[];
  siteSettings: {
    heroTitle: string;
    heroSubtitle: string;
    announcement: string;
  };
  lastAuditAt?: string;
}

export interface AIRecommendation {
  type: 'article' | 'product';
  id: string;
  title: string;
  reason: string;
}
