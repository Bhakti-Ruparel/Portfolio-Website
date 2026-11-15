// data/portfolioKnowledge.js
// The facts the AI assistant is allowed to use. It is told to answer ONLY
// from this text, so it cannot invent achievements.
//
// Keep this in sync with src/data/portfolio.js (the frontend copy).
// It is duplicated on purpose: the backend Docker image contains only the
// backend/ folder, and the frontend must still build without the backend.

module.exports = `
NAME: Bhakti Ruparel
LOCATION: Vadodara, Gujarat, India
ROLE: AI/ML Engineer & MERN Stack Developer, with a marketing and communication side.
CONTACT: email bhaktiruparel3@gmail.com · GitHub https://github.com/Bhakti-Ruparel · LinkedIn https://linkedin.com/in/bhakti-ruparel

EDUCATION
- Charotar University of Science & Technology (CHARUSAT): B.Tech in AI & Machine Learning (lateral entry), currently in third year, CGPA 8.21/10.
- Parul Polytechnic Institute, Parul University: Diploma in Information Technology, CGPA 9.67/10. Institute Topper of the IT department and University Gold Medal.

EXPERIENCE
- Sentiment AI — AI/ML Intern: built AI pipelines for natural-language workflow automation; designed and integrated REST APIs and database workflows for agent execution and prompt management; created a marketing video for Sentiment AI.
- Hebbrix — Sales & Marketing Intern: prospecting, lead generation, market research, positioning, cold outreach, content and social media marketing.
- AIESEC in VVN — Digital Marketing: brought 100 signups for a paid event; managed a marketing team of 10 people; worked on content and digital marketing.

SKILLS
- Languages: Python, JavaScript, Java, SQL, HTML/CSS
- MERN stack: MongoDB, Express.js, React.js, Node.js, Mongoose, REST APIs
- Frontend: React Router, Vite, Tailwind CSS, responsive design
- AI/ML: machine learning, NLP, scikit-learn, NumPy, Pandas, prompt engineering
- Tools/DevOps: Git, GitHub, Docker, GitHub Actions, Postman
- Databases: MongoDB, PostgreSQL, MySQL, Supabase

PROJECTS
- PlantMind AI: AI platform for industrial knowledge connecting equipment documents, maintenance records and sensor signals (RAG + knowledge graph). Live demo: https://ai-for-industrial-knowledge-intelli.vercel.app/
- Unwire AI: server-management / DevOps dashboard for non-technical users (projects, APIs, dependencies, database schemas, logs, metrics, deployments, AI assistant). Built with React, TanStack Start, Node.js, Express, TypeScript, Prisma, PostgreSQL, Docker.
- JobScam Detection: ML classifier for suspicious job/internship postings. About 27,566 job postings, 95%+ reported accuracy. TF-IDF, Logistic Regression, MiniLM embeddings, Python, scikit-learn.
- Mini Payment Reconciliation System: matches payment transactions against settlement records; finds mismatches, duplicates and failed transactions; keeps an audit trail.
- Intelligent Payment Routing Engine: picks a payment provider per transaction using routing rules, provider health, success rate, latency and cost, with fallback and retry.
- This portfolio: MERN app with JWT auth, a MongoDB task manager, caching, event-driven background jobs, this AI assistant, Docker and GitHub Actions CI.

CURRENTLY EXPLORING: reinforcement learning, computer vision, AI systems, intelligent agents, scalable software engineering.
`.trim();
