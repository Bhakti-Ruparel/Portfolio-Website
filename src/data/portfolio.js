// src/data/portfolio.js
// Single source of truth for portfolio content.
// Components import from here, so adding a project / experience / achievement
// means editing one object below, not touching JSX.
//
// RULE: only real information goes here. If something is unknown, leave the
// field empty ('' or []) and the UI simply hides it.

export const PROFILE = {
  name: 'Bhakti Ruparel',
  role: 'AI/ML Engineer & MERN Stack Developer',
  location: 'Vadodara, Gujarat, India',
  email: 'bhaktiruparel3@gmail.com',
  degree: 'B.Tech AI & ML — CHARUSAT',
  tagline:
    'I build AI-powered and full-stack MERN applications — and I like explaining them just as much as building them.',
}

export const SOCIAL_LINKS = {
  github: 'https://github.com/Bhakti-Ruparel',
  githubHandle: '@Bhakti-Ruparel',
  linkedin: 'https://linkedin.com/in/bhakti-ruparel',
  email: `mailto:${PROFILE.email}`,
}

// Hash sections on the home page, used by the Navbar.
export const NAV_SECTIONS = [
  { label: 'About', id: 'about' },
  { label: 'Experience', id: 'experience' },
  { label: 'Skills', id: 'skills' },
  { label: 'Projects', id: 'projects' },
  { label: 'Contact', id: 'contact' },
]

export const EDUCATION = [
  {
    institution: 'Charotar University of Science & Technology (CHARUSAT)',
    degree: 'B.Tech — AI & Machine Learning (Lateral Entry)',
    score: 'CGPA 8.21 / 10',
    description: 'Focus on machine learning, deep learning, and software engineering practices.',
  },
  {
    institution: 'Parul Polytechnic Institute, Parul University',
    degree: 'Diploma — Information Technology',
    score: 'CGPA 9.67 / 10',
    description: 'Strong foundation in programming, databases, and web technologies.',
  },
]

export const EXPERIENCE = [
  {
    company: 'Sentiment AI',
    role: 'AI/ML Intern',
    type: 'Technical',
    points: [
      'Built AI pipelines for natural-language workflow automation.',
      'Designed and integrated REST APIs and database workflows for agent execution and prompt management.',
      'Created a marketing video for Sentiment AI — explaining the product, not just building it.',
    ],
    highlights: [],
  },
  {
    company: 'Hebbrix',
    role: 'Sales & Marketing Intern',
    type: 'Business',
    points: [
      'Prospecting and lead generation.',
      'Market research and product positioning.',
      'Cold outreach to potential customers.',
      'Content and social media marketing.',
    ],
    highlights: [],
  },
  {
    company: 'AIESEC in VVN',
    role: 'Digital Marketing',
    type: 'Leadership',
    points: [
      'Worked on content and digital marketing for AIESEC events.',
      'Managed a marketing team of 10 people.',
    ],
    highlights: [
      { value: '100', label: 'paid-event signups' },
      { value: '10', label: 'people managed in marketing' },
    ],
  },
]

export const ACHIEVEMENTS = [
  {
    icon: '🥇',
    title: 'University Gold Medal',
    detail: 'Parul University — Diploma in Information Technology',
  },
  {
    icon: '🏆',
    title: 'Institute Topper — IT Department',
    detail: 'Parul Polytechnic Institute (CGPA 9.67 / 10)',
  },
  {
    icon: '📣',
    title: '100 signups for a paid event',
    detail: 'AIESEC in VVN — digital marketing campaign',
  },
  {
    icon: '👥',
    title: 'Led a marketing team of 10',
    detail: 'AIESEC in VVN',
  },
]

// Add real certifications here: { title, issuer, year, link }.
// The Certifications block stays hidden while this list is empty.
export const CERTIFICATIONS = []

export const SKILL_CATEGORIES = [
  {
    icon: '⚡',
    title: 'Languages',
    variant: '',
    skills: ['Python', 'JavaScript', 'Java', 'SQL', 'HTML / CSS'],
  },
  {
    icon: '🧩',
    title: 'MERN Stack',
    variant: 'chip--green',
    skills: ['MongoDB', 'Express.js', 'React.js', 'Node.js', 'Mongoose', 'REST APIs'],
  },
  {
    icon: '🖥️',
    title: 'Frontend',
    variant: 'chip--blue',
    skills: ['React Router', 'Vite', 'Tailwind CSS', 'Responsive Design'],
  },
  {
    icon: '🤖',
    title: 'AI / ML',
    variant: 'chip--orange',
    skills: ['Machine Learning', 'NLP', 'scikit-learn', 'NumPy', 'Pandas', 'Prompt Engineering'],
  },
  {
    icon: '🛠️',
    title: 'Tools & DevOps',
    variant: 'chip--blue',
    skills: ['Git', 'GitHub', 'Docker', 'GitHub Actions', 'Postman'],
  },
  {
    icon: '🗄️',
    title: 'Databases',
    variant: '',
    skills: ['MongoDB', 'PostgreSQL', 'MySQL', 'Supabase'],
  },
]

export const PROJECTS = [
  {
    icon: '🏭',
    tag: 'AI · RAG',
    title: 'PlantMind AI',
    description:
      'An AI platform for industrial knowledge: connects equipment documents, maintenance records and sensor signals so that when a machine misbehaves, the relevant context is one question away.',
    tech: ['React.js', 'Python', 'LLM', 'RAG', 'Knowledge Graph'],
    link: 'https://github.com/Bhakti-Ruparel',
    demo: 'https://ai-for-industrial-knowledge-intelli.vercel.app/',
    featured: true,
  },
  {
    icon: '🔍',
    tag: 'DevOps · AI',
    title: 'Unwire AI',
    description:
      'Server management for people who do not live in a terminal: projects, APIs, dependencies, database schemas, logs, metrics and deployments in one dashboard, with an AI assistant on top.',
    tech: ['React', 'TanStack Start', 'Node.js', 'Express', 'TypeScript', 'Prisma', 'PostgreSQL', 'Docker'],
    link: 'https://github.com/Bhakti-Ruparel/unwire-ai-insights',
    demo: '',
    featured: false,
  },
  {
    icon: '🕵️',
    tag: 'ML · NLP',
    title: 'JobScam Detection',
    description:
      'Flags suspicious job and internship postings using text classification. Trained on ~27,566 job postings with 95%+ reported accuracy.',
    tech: ['Python', 'scikit-learn', 'TF-IDF', 'Logistic Regression', 'MiniLM'],
    link: 'https://github.com/Bhakti-Ruparel',
    demo: '',
    featured: false,
  },
  {
    icon: '💳',
    tag: 'Backend · Payments',
    title: 'Mini Payment Reconciliation System',
    description:
      'Matches payment transactions against settlement records and surfaces mismatches, duplicates and failed transactions, with an audit trail.',
    tech: [],
    link: 'https://github.com/Bhakti-Ruparel',
    demo: '',
    featured: false,
  },
  {
    icon: '🔀',
    tag: 'Backend · Systems',
    title: 'Intelligent Payment Routing Engine',
    description:
      'Chooses a payment provider per transaction using routing rules, provider health, success rate, latency and cost, with fallback and retry.',
    tech: [],
    link: 'https://github.com/Bhakti-Ruparel',
    demo: '',
    featured: false,
  },
  {
    icon: '🗂️',
    tag: 'MERN · This site',
    title: 'Portfolio + Task Manager',
    description:
      'This website: React portfolio with a MongoDB-backed task manager, JWT auth, caching, event-driven background jobs, an AI assistant, Docker and CI.',
    tech: ['React', 'Node.js', 'Express', 'MongoDB', 'Docker', 'GitHub Actions'],
    link: 'https://github.com/Bhakti-Ruparel',
    demo: '',
    featured: false,
  },
]

export const QUICK_INFO = [
  { icon: '📍', text: PROFILE.location },
  { icon: '🎓', text: PROFILE.degree },
  { icon: '💼', text: 'AI/ML Intern — Sentiment AI' },
  { icon: '⚡', text: 'MERN · Python · Docker' },
]
