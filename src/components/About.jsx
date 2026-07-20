import './About.css'
import '../App.css'

export default function About() {
  return (
    <section className="section about" id="about" aria-labelledby="about-heading">
      <span className="section-label" aria-hidden="true">About Me</span>
      <h2 className="section-title" id="about-heading">A little about Bhakti</h2>
      <p className="section-sub">
        Building at the intersection of AI, backend engineering, and real-world impact.
      </p>

      <div className="about-grid">
        <div className="about-card about-intro card-glass">
          <p className="about-intro-text">
            I'm an <span className="highlight-tag">AI-focused full-stack developer</span> from Vadodara,
            specializing in backend systems, prompt-driven applications, and toolchains for production AI workloads.
            I enjoy building automation platforms that make complex workflows easier to manage.
          </p>
          <p className="about-intro-text" style={{ marginTop: '12px' }}>
            With a background spanning AI/ML internships and full-stack development,
            I bring together engineering rigour and product thinking to ship things that matter.
          </p>
        </div>

        <div className="about-card">
          <span className="about-card-icon" aria-hidden="true">🎓</span>
          <h3>Education</h3>

          <div className="about-item">
            <p className="about-item-title">Charotar University of Science &amp; Technology</p>
            <p className="about-item-meta">B.Tech — AI &amp; Machine Learning (Lateral Entry) · CGPA 8.21</p>
            <p className="about-item-desc">Focus on machine learning, deep learning, and software engineering practices.</p>
          </div>

          <div className="about-item">
            <p className="about-item-title">Parul Polytechnic Institute, Parul University</p>
            <p className="about-item-meta">Diploma — Information Technology · CGPA 9.67</p>
            <p className="about-item-desc">Strong foundation in programming, databases, and web technologies.</p>
          </div>
        </div>

        <div className="about-card">
          <span className="about-card-icon" aria-hidden="true">💼</span>
          <h3>Experience</h3>

          <div className="about-item">
            <p className="about-item-title">Sentiment AI</p>
            <p className="about-item-meta">AI / ML Intern</p>
            <p className="about-item-desc">
              Built production-ready AI pipelines for natural language workflow automation,
              backend APIs, and prompt management at scale.
            </p>
          </div>

          <div className="about-item">
            <p className="about-item-title">API &amp; Database Engineering</p>
            <p className="about-item-meta">REST · Supabase · Agent Workflows</p>
            <p className="about-item-desc">
              Designed and integrated REST APIs and database workflows for agent execution,
              prompt management, and application generation.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
