import './Contact.css'

export default function Contact() {
  return (
    <section className="section contact" id="contact" aria-labelledby="contact-heading">
      <span className="section-label" aria-hidden="true">Contact</span>
      <h2 className="section-title" id="contact-heading">Let's Work Together</h2>
      <p className="section-sub">
        Want to collaborate on AI apps, backend systems, or data-driven tooling?
        I'm available for new projects and opportunities.
      </p>

      <div className="contact-cards">
        <div className="contact-main card-glass">
          <p className="contact-lead">
            Whether it's building production AI systems, open-source collaboration,
            or backend architecture — I'd love to hear about your project.
            I respond promptly and genuinely enjoy connecting with other builders.
          </p>

          <div className="contact-methods">
            <a
              href="mailto:bhaktiruparel3@gmail.com"
              className="contact-method"
              aria-label="Send email to Bhakti"
            >
              <span className="method-icon" aria-hidden="true">✉️</span>
              <div>
                <span className="method-label">Email me</span>
                <span className="method-value">bhaktiruparel3@gmail.com</span>
              </div>
            </a>

            <a
              href="https://linkedin.com/in/bhakti-ruparel"
              target="_blank"
              rel="noreferrer"
              className="contact-method"
              aria-label="Connect on LinkedIn"
            >
              <span className="method-icon" aria-hidden="true">💼</span>
              <div>
                <span className="method-label">LinkedIn</span>
                <span className="method-value">Bhakti Ruparel</span>
              </div>
            </a>

            <a
              href="https://github.com/Bhakti-Ruparel"
              target="_blank"
              rel="noreferrer"
              className="contact-method"
              aria-label="View GitHub profile"
            >
              <span className="method-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#64748b" aria-hidden="true">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                </svg>
              </span>
              <div>
                <span className="method-label">GitHub</span>
                <span className="method-value">@Bhakti-Ruparel</span>
              </div>
            </a>
          </div>
        </div>

        <div className="contact-info card-glass">
          <h3 className="contact-info-title">Quick Info</h3>
          <ul className="info-list" role="list">
            <li role="listitem">
              <span className="info-icon" aria-hidden="true">📍</span>
              <span>Vadodara, Gujarat, India</span>
            </li>
            <li role="listitem">
              <span className="info-icon" aria-hidden="true">🎓</span>
              <span>B.Tech AI &amp; ML — CHARUSAT</span>
            </li>
            <li role="listitem">
              <span className="info-icon" aria-hidden="true">💼</span>
              <span>AI/ML Intern — Sentiment AI</span>
            </li>
            <li role="listitem">
              <span className="info-icon" aria-hidden="true">⚡</span>
              <span>FastAPI · React · Python · Docker</span>
            </li>
          </ul>

          <a
            href="mailto:bhaktiruparel3@gmail.com"
            className="contact-cta-btn"
            aria-label="Start a conversation via email"
          >
            Say Hello 👋
          </a>
        </div>
      </div>
    </section>
  )
}
