import './Contact.css'
import ContactForm from './ContactForm'
import { PROFILE, SOCIAL_LINKS, QUICK_INFO } from '../data/portfolio'

const GITHUB_ICON_PATH = 'M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z'

const METHODS = [
  { href: SOCIAL_LINKS.email, icon: '✉️', label: 'Email me', value: PROFILE.email, external: false },
  { href: SOCIAL_LINKS.linkedin, icon: '💼', label: 'LinkedIn', value: PROFILE.name, external: true },
  {
    href: SOCIAL_LINKS.github,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="#64748b" aria-hidden="true">
        <path d={GITHUB_ICON_PATH} />
      </svg>
    ),
    label: 'GitHub',
    value: SOCIAL_LINKS.githubHandle,
    external: true,
  },
]

export default function Contact() {
  return (
    <section className="section contact" id="contact" aria-labelledby="contact-heading">
      <span className="section-label" aria-hidden="true">Contact</span>
      <h2 className="section-title" id="contact-heading">Let's build something interesting</h2>
      <p className="section-sub">
        AI apps, MERN projects, or a product that needs explaining — I'd like to hear about it.
      </p>

      <div className="contact-cards">
        <div className="contact-main card-glass">
          <ContactForm />
        </div>

        <div className="contact-info card-glass">
          <div className="contact-methods">
            {METHODS.map((m) => (
              <a
                key={m.label}
                href={m.href}
                className="contact-method"
                {...(m.external ? { target: '_blank', rel: 'noreferrer' } : {})}
              >
                <span className="method-icon" aria-hidden="true">{m.icon}</span>
                <div>
                  <span className="method-label">{m.label}</span>
                  <span className="method-value">{m.value}</span>
                </div>
              </a>
            ))}
          </div>

          <h3 className="contact-info-title">Quick Info</h3>
          <ul className="info-list" role="list">
            {QUICK_INFO.map((info) => (
              <li role="listitem" key={info.text}>
                <span className="info-icon" aria-hidden="true">{info.icon}</span>
                <span>{info.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
