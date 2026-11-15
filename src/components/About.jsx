import './About.css'
import '../App.css'
import { EDUCATION, ACHIEVEMENTS, CERTIFICATIONS } from '../data/portfolio'

export default function About() {
  return (
    <section className="section about" id="about" aria-labelledby="about-heading">
      <span className="section-label" aria-hidden="true">About Me</span>
      <h2 className="section-title" id="about-heading">A little about Bhakti</h2>
      <p className="section-sub">
        Building at the intersection of AI, full-stack engineering, and communication.
      </p>

      <div className="about-grid">
        <div className="about-card about-intro card-glass">
          <p className="about-intro-text">
            I'm a third-year <span className="highlight-tag">B.Tech AI &amp; ML student</span> from
            Vadodara. I like understanding how things work, building them from scratch, and then
            figuring out how to make people care about them.
          </p>
          <p className="about-intro-text about-intro-text--spaced">
            Most of my work sits between machine learning, MERN-stack development and marketing.
            I usually start with a problem, not a technology — then go from architecture, to
            implementation, to explaining it, to improving it.
          </p>
        </div>

        <div className="about-card">
          <span className="about-card-icon" aria-hidden="true">🎓</span>
          <h3>Education</h3>

          {EDUCATION.map((edu) => (
            <div className="about-item" key={edu.institution}>
              <p className="about-item-title">{edu.institution}</p>
              <p className="about-item-meta">{edu.degree} · {edu.score}</p>
              <p className="about-item-desc">{edu.description}</p>
            </div>
          ))}
        </div>

        <div className="about-card" id="achievements">
          <span className="about-card-icon" aria-hidden="true">🏆</span>
          <h3>Achievements</h3>

          <ul className="achievement-list" role="list">
            {ACHIEVEMENTS.map((item) => (
              <li className="achievement-item" key={item.title}>
                <span className="achievement-icon" aria-hidden="true">{item.icon}</span>
                <div>
                  <p className="about-item-title">{item.title}</p>
                  <p className="about-item-desc">{item.detail}</p>
                </div>
              </li>
            ))}
          </ul>

          {CERTIFICATIONS.length > 0 && (
            <>
              <h3 className="about-subheading">Certifications</h3>
              <ul className="achievement-list" role="list">
                {CERTIFICATIONS.map((cert) => (
                  <li className="achievement-item" key={cert.title}>
                    <span className="achievement-icon" aria-hidden="true">📜</span>
                    <div>
                      <p className="about-item-title">
                        {cert.link ? (
                          <a href={cert.link} target="_blank" rel="noreferrer">{cert.title}</a>
                        ) : cert.title}
                      </p>
                      <p className="about-item-desc">
                        {[cert.issuer, cert.year].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
