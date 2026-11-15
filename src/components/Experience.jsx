import './Experience.css'
import { EXPERIENCE } from '../data/portfolio'

export default function Experience() {
  return (
    <section className="section experience" id="experience" aria-labelledby="experience-heading">
      <span className="section-label" aria-hidden="true">Experience</span>
      <h2 className="section-title" id="experience-heading">Where I've worked</h2>
      <p className="section-sub">
        Technical internships and marketing roles — building products and getting people to care about them.
      </p>

      <ol className="exp-timeline">
        {EXPERIENCE.map((item) => (
          <li className="exp-item" key={item.company}>
            <span className="exp-dot" aria-hidden="true" />
            <article className="exp-card">
              <header className="exp-card-head">
                <div>
                  <h3 className="exp-company">{item.company}</h3>
                  <p className="exp-role">{item.role}</p>
                </div>
                <span className="exp-type">{item.type}</span>
              </header>

              {item.highlights.length > 0 && (
                <div className="exp-highlights">
                  {item.highlights.map((h) => (
                    <div className="exp-highlight" key={h.label}>
                      <span className="exp-highlight-value">{h.value}</span>
                      <span className="exp-highlight-label">{h.label}</span>
                    </div>
                  ))}
                </div>
              )}

              <ul className="exp-points">
                {item.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          </li>
        ))}
      </ol>
    </section>
  )
}
