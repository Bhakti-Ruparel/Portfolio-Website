import './Skills.css'

const SKILL_CATEGORIES = [
  {
    icon: '⚡',
    title: 'Languages',
    variant: '',
    skills: ['Python', 'JavaScript', 'Java', 'SQL', 'HTML / CSS'],
  },
  {
    icon: '🖥️',
    title: 'Frontend',
    variant: 'chip--blue',
    skills: ['React.js', 'Vite', 'Responsive Design', 'CSS Animations'],
  },
  {
    icon: '🔧',
    title: 'Backend',
    variant: 'chip--green',
    skills: ['FastAPI', 'Node.js', 'REST APIs', 'Supabase'],
  },
  {
    icon: '🤖',
    title: 'AI / ML',
    variant: 'chip--orange',
    skills: ['Machine Learning', 'Prompt Engineering', 'NumPy', 'Pandas'],
  },
  {
    icon: '🛠️',
    title: 'Tools & DevOps',
    variant: 'chip--blue',
    skills: ['Git', 'GitHub', 'Docker', 'VS Code', 'Postman'],
  },
  {
    icon: '🗄️',
    title: 'Databases',
    variant: '',
    skills: ['PostgreSQL', 'Supabase', 'MySQL'],
  },
]

export default function Skills() {
  return (
    <section className="section skills" id="skills" aria-labelledby="skills-heading">
      <span className="section-label" aria-hidden="true">Skills</span>
      <h2 className="section-title" id="skills-heading">Technical Skills</h2>
      <p className="section-sub">
        My toolkit across AI, backend engineering, and modern web development.
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
