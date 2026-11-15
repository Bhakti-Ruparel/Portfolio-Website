import './Skills.css'
import { SKILL_CATEGORIES } from '../data/portfolio'

export default function Skills() {
  return (
    <section className="section skills" id="skills" aria-labelledby="skills-heading">
      <span className="section-label" aria-hidden="true">Skills</span>
      <h2 className="section-title" id="skills-heading">Technical Skills</h2>
      <p className="section-sub">
        My toolkit across AI/ML, the MERN stack, and the tools I use to ship.
      </p>

      <div className="skills-categories">
        {SKILL_CATEGORIES.map((cat) => (
          <article className="skill-category" key={cat.title}>
            <span className="cat-icon" aria-hidden="true">{cat.icon}</span>
            <h3 className="cat-title">{cat.title}</h3>
            <ul className="chip-list" role="list" aria-label={`${cat.title} skills`}>
              {cat.skills.map((skill) => (
                <li key={skill} className={`chip ${cat.variant}`} role="listitem">
                  {skill}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  )
}
