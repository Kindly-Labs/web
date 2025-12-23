/**
 * knowledgeBase.ts
 * The structured data source for The Digital Concierge chatbot.
 * Refactored for Fuzzy Search (Fuse.js).
 */

export interface KnowledgeEntry {
  id: string;
  keywords: string[];
  triggers?: string[]; // New: Natural language phrases for fuzzy matching
  text: string | string[]; // Can be a single string or an array of variations
  suggestions?: string[];
}

export const knowledgeBase: KnowledgeEntry[] = [
  // 1. Core Profile & Natural Questions
  {
    id: 'mission',
    keywords: ['mission', 'purpose', 'why', 'vision', 'goal', 'about'],
    triggers: [
      'what is your mission',
      'what is kindly lab',
      'tell me about kindly',
      'what do you stand for',
      'why do you exist',
    ],
    text: [
      "We're on a mission to democratize digital access. Think of us as a 'Digital Forest'—we help small businesses grow by providing the high-tech ecosystem they need to thrive. <a href='/about' class='text-neon-400 hover:underline'>Learn more.</a>",
      "Our goal is simple: connect small business owners with free, high-quality technical resources. We're a Fair Trade AI built on radical transparency and community growth. <a href='/about' class='text-neon-400 hover:underline'>Read our story.</a>",
    ],
    suggestions: ['What do you do?', 'How can I help?', 'See Transparency'],
  },
  {
    id: 'who',
    keywords: ['who', 'team', 'founder', 'people', 'staff'],
    triggers: [
      'who runs kindly',
      'who is the founder',
      'who works here',
      'meet the team',
      'are you an agency',
    ],
    text: "We are a Founder-Led, Volunteer-Run Fair Trade AI built on Radical Transparency. We operate as a 'Tech Deployment Corps' rather than a traditional agency.",
    suggestions: ['What services?', 'Join the team'],
  },
  {
    id: 'services',
    keywords: ['services', 'offer', 'capabilities', 'work'],
    triggers: [
      'what do you do',
      'how can you help me',
      'what services do you offer',
      'can you help my business',
      'what can i get',
    ],
    text: "We are a 'Tech Deployment Corps' for small businesses. We build websites, secure accounts, and set up marketing tools—100% free of charge. <a href='/services' class='text-neon-400 hover:underline'>Browse Service Catalog.</a>",
    suggestions: ['I need a website', 'Digitize my business', 'Volunteer'],
  },
  {
    id: 'how_it_works',
    keywords: ['process', 'steps', 'start', 'begin'],
    triggers: ['how does it work', 'how do i start', 'what is the process', 'how do i apply'],
    text: "It's simple: Business owners browse our Service Portal, pick what they need, and book a free Setup Session. Volunteers claim these tasks and complete them in 15-45 minute sprints.",
    suggestions: ['Browse Services', 'Apply for help'],
  },

  // 2. Transparency & Values
  {
    id: 'transparency',
    keywords: ['transparency', 'open', 'records', 'data'],
    triggers: [
      'are you transparent',
      'show me the money',
      'open registry',
      'see your code',
      'internal docs',
    ],
    text: "We practice Radical Transparency via our 'Open Registry,' sharing financials, code, and all system documentation with the world. <a href='/transparency' class='text-neon-400 hover:underline'>Visit the Open Registry.</a>",
    suggestions: ['Open Registry', 'Internal Docs'],
  },
  {
    id: 'pricing',
    keywords: ['price', 'cost', 'free', 'charge', 'payment', 'money', 'fee'],
    triggers: [
      'how much does it cost',
      'is it really free',
      'do i have to pay',
      'what are your rates',
    ],
    text: 'Yes! All our services are 100% free for eligible small businesses. We are a Fair Trade AI supported by donations and volunteers, so we never charge you for our time or expertise.',
    suggestions: ['Browse Services', 'Apply now', 'Donate'],
  },

  // 3. Specific Services
  {
    id: 'website',
    keywords: ['website', 'web', 'site', 'landing page'],
    triggers: ['i need a website', 'build me a site', 'create a webpage', 'get online'],
    text: "We build simple, professional websites to help you get online fast. This is a basic 'Getting Started' service designed to give your business a digital home quickly. <a href='/services#web' class='text-neon-400 hover:underline'>See Website Service.</a>",
    suggestions: ['Book Setup', 'Other Services'],
  },
  {
    id: 'security',
    keywords: ['security', 'cyber', 'hack', 'protect', 'password', 'safe'],
    triggers: ['i got hacked', 'secure my business', 'password help', 'cyber security check'],
    text: 'Our Cyber Security sprint helps you secure your accounts, set up password managers, and protect your business from common digital threats.',
    suggestions: ['Book Security Check', 'Services'],
  },
  {
    id: 'digitize',
    keywords: ['digitize', 'digital', 'transform', 'modernize', 'tech'],
    triggers: [
      'digitize my business',
      'help me go digital',
      'modernize my shop',
      'i need tech help',
    ],
    text: "Ready to modernize? We offer free 'Foundational Tech' sprints to set up your website, social media, and security. It's fast, free, and volunteer-run. <a href='/contact?type=business' class='text-neon-400 hover:underline'>Start Digitizing Now.</a>",
    suggestions: ['I need a website', 'Cyber Security', 'Book Setup'],
  },

  // 4. Business Owner
  {
    id: 'business_owner',
    keywords: ['business', 'owner', 'shop', 'store', 'restaurant', 'cafe', 'boba', 'retail'],
    triggers: [
      'i own a boba shop',
      'i run a small business',
      'i have a store',
      'help for restaurant owners',
      'small business help',
    ],
    text: "That's great! We specialize in helping small business owners like you navigate the digital world. We can help you set up a website, improve your security, or grow your online presence - all for free.",
    suggestions: ['I need a website', 'Digitize my business', 'Apply for Help'],
  },

  // 5. Volunteer
  {
    id: 'volunteer',
    keywords: ['volunteer', 'join', 'help', 'contribute', 'quest', 'apply'],
    triggers: [
      'i want to volunteer',
      'how can i help',
      'join the team',
      'apply to volunteer',
      'start the quest',
      'i have free time',
      'i want to give back',
    ],
    text: "Join our mission! We are looking for tech-savvy volunteers to join our 'Deployment Corps.' It starts with a values-first application. <a href='/contact?type=volunteer' class='text-neon-400 hover:underline'>Apply to Volunteer.</a>",
    suggestions: ['Apply to Volunteer', 'Read Handbook', 'How can I help?'],
  },
  {
    id: 'handbook',
    keywords: ['handbook', 'manual', 'guide', 'rules', 'code of conduct'],
    triggers: ['read the handbook', 'what are the rules', 'code of conduct', 'volunteer manual'],
    text: "Our 'Empathy-First Handbook' is our north star. It outlines our Code of Conduct, values, and commitment to integrity. <a href='/volunteer#handbook' class='text-neon-400 hover:underline'>Read the Handbook.</a>",
    suggestions: ['Code of Conduct', 'Volunteer'],
  },

  // 6. Small Talk
  {
    id: 'greeting',
    keywords: ['hello', 'hi', 'hey', 'greetings', 'yo', 'sup'],
    triggers: [
      'hello there',
      'hi robot',
      'good morning',
      'good afternoon',
      'how are you',
      'how are you doing',
      'how r u',
      'how are u',
    ],
    text: [
      "Hello! I'm the Digital Concierge. I can help you navigate Owly Labs, understand our mission, or find the right services. What can I do for you?",
      "Hi there! Welcome to Owly Labs. Whether you're a business owner or a volunteer, I'm here to help. What do you need?",
      "Greetings! I'm functioning perfectly and ready to help. Ask me anything about our services or mission.",
    ],
    suggestions: ['What do you do?', 'Digitize my business', 'I want to volunteer'],
  },
  {
    id: 'gratitude',
    keywords: ['thanks', 'thank you', 'thx', 'appreciate', 'cool', 'awesome', 'great'],
    triggers: [
      'thank you so much',
      'thanks for help',
      'that is cool',
      'awesome thanks',
      'this is good news',
      'that is great',
    ],
    text: [
      "You're very welcome! Is there anything else I can help you with?",
      'Happy to help! Let me know if you need anything else.',
      "No problem at all. We're here to serve.",
    ],
    suggestions: ['Back to Services', 'Volunteer', 'Contact'],
  },
  {
    id: 'bye',
    keywords: ['bye', 'goodbye', 'see ya', 'later'],
    triggers: ['goodbye', 'see you later', 'ending chat'],
    text: "Goodbye! Feel free to come back if you have more questions. We're here to help.",
    suggestions: [],
  },

  // 7. Edge Cases & Specifics
  {
    id: 'tech_stack',
    keywords: ['tech', 'stack', 'technology', 'react', 'astro', 'code', 'open source'],
    triggers: [
      'what tech do you use',
      'is this built with react',
      'do you use wordpress',
      'how is this built',
      'can i see the code',
    ],
    text: "We run on a modern stack: Astro v5, React v19, and Tailwind CSS. We avoid heavy CMS platforms like WordPress in favor of performance and transparency. <a href='/transparency' class='text-neon-400 hover:underline'>View our Codebase.</a>",
    suggestions: ['View Code', 'Volunteer', 'Transparency'],
  },
  {
    id: 'location',
    keywords: ['location', 'where', 'office', 'based', 'city', 'sf', 'san francisco'],
    triggers: [
      'where are you located',
      'do you have an office',
      'are you in san francisco',
      'can i visit you',
    ],
    text: "We are a digital-first organization born in San Francisco. While we don't have a physical office, our 'Digital Ecosystem' is always open.",
    suggestions: ['Contact Us', 'Our Mission'],
  },
  {
    id: 'donate',
    keywords: ['donate', 'give', 'support', 'money', 'fund', 'contribute'],
    triggers: [
      'i want to donate',
      'how can i give money',
      'support the cause',
      'do you accept donations',
      'how can i donate',
      'where to donate',
    ],
    text: "Thank you for your generosity! As a Fair Trade AI, we rely on support from people like you to keep our services free for small businesses. <a href='/donate' class='text-neon-400 hover:underline'>Make a Donation.</a>",
    suggestions: ['Donate Now', 'Transparency'],
  },
  {
    id: 'emergency',
    keywords: ['emergency', 'urgent', 'hacked', 'down', 'broken', 'critical'],
    triggers: ['my site is down', 'i was hacked', 'urgent help needed', 'emergency'],
    text: "If this is a digital emergency (like a security breach), please visit our Contact page and select 'Urgent' or email our security team immediately.",
    suggestions: ['Contact Support', 'Cyber Security'],
  },

  // 8. Contact
  {
    id: 'contact',
    keywords: ['contact', 'email', 'phone', 'call', 'reach', 'talk', 'human'],
    triggers: [
      'how do i contact you',
      'talk to a human',
      'send an email',
      'what is your phone number',
    ],
    text: "You can contact us directly by navigating to the <a href='/contact' class='text-neon-400 hover:underline'>Contact page</a>, or I can guide you to the right form if you tell me what you need.",
    suggestions: ['I need a website', 'I want to volunteer', 'General Inquiry'],
  },
];
