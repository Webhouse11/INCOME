
import { CMSData, CategoryType } from './types';

export const INITIAL_DATA: CMSData = {
  articles: [
    {
      id: 'a1',
      title: 'How to Start a Service Business with Zero Capital',
      slug: 'start-service-business-zero-capital',
      excerpt: 'Learn the exact steps to identify a skill you already have and turn it into a high-ticket service business.',
      content: 'Starting a business doesn\'t always require money. In fact, many of the world\'s most successful agencies started with just a laptop and a specialized skill...',
      category: CategoryType.BUSINESS,
      image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=800',
      author: 'IncomeLab Expert',
      createdAt: new Date().toISOString(),
      featured: true
    },
    {
      id: 'a2',
      title: 'The Rise of Prompt Engineering: New Tech Income for 2026',
      slug: 'prompt-engineering-income-2026',
      excerpt: 'AI is creating new job categories. Learn how prompt engineering is becoming a high-paying freelance skill.',
      content: 'The ability to communicate effectively with Large Language Models is no longer a hobby; it is a professional requirement for the modern workforce...',
      category: CategoryType.TECH,
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800',
      author: 'Tech Guide',
      createdAt: new Date().toISOString(),
      featured: true
    }
  ],
  products: [
    {
      id: 'p1',
      name: 'High-Profit Mini-Importation Blueprint',
      slug: 'mini-importation-blueprint',
      description: 'The definitive guide to sourcing high-demand products from China and selling them for 300% profit.',
      price: 25000,
      currency: 'NGN',
      category: CategoryType.BUSINESS,
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=600',
      type: 'Guide',
      features: ['China Sourcing List', 'Customs Clearance Secrets', 'FB Ads Strategy'],
      targetAudience: 'Aspiring entrepreneurs and side-hustlers looking for physical product income.',
      problemSolved: 'Eliminates the fear of being scammed by suppliers and failing to clear customs.',
      fullSalesCopy: 'Stop guessing. Start earning. Most people fail at importation because they buy what "looks nice" instead of what "sells fast." This blueprint gives you our internal "Winning Product Framework" used to generate millions in sales.',
      modules: [
        { title: 'Module 1: Market Research', items: ['Finding hot products', 'Spying on competitors', 'Profit margin calculation'] },
        { title: 'Module 2: Sourcing', items: ['Vetted supplier list', 'Negotiation scripts', 'Payment safety'] },
        { title: 'Module 3: Logistics', items: ['Shipping options explained', 'Customs clearance 101', 'Warehouse management'] }
      ],
      bonuses: [
        { title: '1688 Mobile App Secret Guide', description: 'How to use the app to get even lower prices.', value: 5000 },
        { title: 'Pre-written Facebook Ad Copies', description: 'Plug-and-play ads for hot niches.', value: 10000 }
      ],
      faqs: [
        { question: 'Do I need a large capital?', answer: 'No. You can start with as little as ₦50,000 using our micro-start strategy.' },
        { question: 'Is this only for Nigerians?', answer: 'The logistics module is optimized for Nigeria, but the sourcing principles work globally.' }
      ]
    },
    {
      id: 'p2',
      name: 'Prompt Engineering for Freelance Profits',
      slug: 'prompt-engineering-profits',
      description: 'Master the art of AI communication and sell your prompting services to high-paying clients.',
      price: 15000,
      currency: 'NGN',
      category: CategoryType.TECH,
      image: 'https://images.unsplash.com/photo-1620712943543-bcc4628c9757?auto=format&fit=crop&q=80&w=600',
      type: 'Toolkit',
      features: ['100+ Ready-to-use Prompts', 'Workflow Automation Guide', 'Client Pricing Matrix'],
      targetAudience: 'Freelancers, writers, and virtual assistants.',
      problemSolved: 'Solves the "Blank Page" syndrome and helps you work 10x faster using AI.'
    }
  ],
  siteSettings: {
    heroTitle: 'Learn How to Build Real Income from Business, Tech & Digital Assets',
    heroSubtitle: 'Practical, step-by-step guides, tools, and blueprints designed for people who want real results — not hype.',
    announcement: '🚀 New Course: The 2026 Digital Asset Masterclass is now live!'
  }
};
