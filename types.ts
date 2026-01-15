

export enum CategoryType {
  BUSINESS = 'Business',
  TECH = 'Tech',
  DIGITAL_ASSETS = 'Digital Assets'
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
  metaTitle?: string;
  metaDescription?: string;
  featured?: boolean;
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
  // Added 'Blueprint' to the valid product types to match constants.ts
  type: 'Ebook' | 'Course' | 'Template' | 'Guide' | 'Toolkit' | 'Roadmap' | 'Blueprint';
  features: string[];
  targetAudience: string;
  problemSolved: string;
  downloadUrl?: string;
  // Enhanced Sales Page Fields
  fullSalesCopy?: string;
  modules?: { title: string; items: string[] }[];
  bonuses?: ProductBonus[];
  faqs?: ProductFAQ[];
}

export interface CMSData {
  articles: Article[];
  products: Product[];
  siteSettings: {
    heroTitle: string;
    heroSubtitle: string;
    announcement: string;
  };
}

export interface AIRecommendation {
  type: 'article' | 'product';
  id: string;
  title: string;
  reason: string;
}