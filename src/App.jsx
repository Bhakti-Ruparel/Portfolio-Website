import './App.css'

const skills = [
  'Java',
  'Python',
  'JavaScript',
  'SQL',
  'HTML/CSS',
  'FastAPI',
  'React.js',
  'Node.js',
  'Supabase',
  'GitHub',
  'Docker',
  'Machine Learning',
]

const projects = [
  {
    title: 'AI for Industrial Knowledge',
    description:
      'A production-ready AI platform for industrial knowledge workflows, focused on prompt automation and scalable AI-assisted processes.',
    link: 'https://ai-for-industrial-knowledge-intelli.vercel.app/',
  },
  {
    title: 'Unwire AI Insights',
    description:
      'Open-source DevOps automation platform using FastAPI, React.js, and Docker for infrastructure monitoring and AI-driven analysis.',
    link: 'https://github.com/Bhakti-Ruparel/unwire-ai-insights',
  },
]

function App() {
  return (
    <div className="page">
      <header className="hero">
        <div className="hero-content">
          <p className="eyebrow">AI / Full-Stack Developer</p>
          <h1>Ruparel Bhakti</h1>
          <p className="hero-text">
            I build scalable AI and web applications with FastAPI, React.js, and data-driven engineering.
            My work spans AI product development, backend APIs, and modern frontend experiences.
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary" href="#projects">
              View projects
            </a>
            <a className="btn btn-secondary" href="#contact">
              Contact me
            </a>
          </div>
          <ul className="hero-highlights">
            <li>B.Tech AI & ML</li>
            <li>AI/ML Intern</li>
            <li>FastAPI + React</li>
          </ul>
        </div>
      </header>

      <main>
        <section className="card" id="about">
          <h2>About me</h2>
          <p>
            I’m an AI-focused full-stack developer from Vadodara, specializing in backend systems,
            prompt-driven applications, and toolchains for production AI workloads.
            I enjoy building automation platforms that make complex workflows easier to manage.
          </p>
          <div className="details-grid">
            <div>
              <h3>Education</h3>
              <p>
                <strong>Charotar University of Science and Technology (CHARUSAT)</strong>
                <br />B.Tech in Artificial Intelligence & Machine Learning (Lateral Entry)
                <br />CGPA: 8.21 / 10.00
              </p>
              <p>
                <strong>Parul Polytechnic Institute, Parul University</strong>
                <br />Diploma in Information Technology
                <br />CGPA: 9.67 / 10.00
              </p>
            </div>
            <div>
              <h3>Experience</h3>
              <p>
                <strong>Sentiment AI</strong> — AI/ML Intern
                <br />Built production-ready AI pipelines for natural language workflow automation,
                backend APIs, and prompt management.
              </p>
              <p>
                Designed and integrated REST APIs and database workflows for agent execution,
                prompt management, and application generation.
              </p>
            </div>
          </div>
        </section>

        <section className="card" id="skills">
          <h2>Technical skills</h2>
          <div className="chip-list">
            {skills.map((skill) => (
              <span className="chip" key={skill}>
                {skill}
              </span>
            ))}
          </div>
        </section>

        <section className="card" id="projects">
          <h2>Projects</h2>
          <div className="project-grid">
            {projects.map((project) => (
              <article className="project-card" key={project.title}>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <a className="project-link" href={project.link} target="_blank" rel="noreferrer">
                  Visit project
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="card contact-card" id="contact">
          <h2>Let’s connect</h2>
          <p>
            Want to collaborate on AI apps, backend systems, or data-driven tooling?
            I’m available for new projects and opportunities.
          </p>
          <a className="btn btn-primary" href="mailto:bhaktiruparel3@gmail.com">
            bhaktiruparel3@gmail.com
          </a>
          <div className="contact-links">
            <a href="https://linkedin.com/in/bhakti-ruparel" target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            <a href="https://github.com/Bhakti-Ruparel" target="_blank" rel="noreferrer">
              GitHub
            </a>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App

