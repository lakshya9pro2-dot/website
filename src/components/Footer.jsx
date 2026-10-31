import './Footer.css'

const columns = [
  ['Audio Description', 'Investor Relations', 'Legal Notices'],
  ['Help Centre', 'Jobs', 'Cookie Preferences'],
  ['Gift Cards', 'Terms of Use', 'Corporate Information'],
  ['Media Centre', 'Privacy', 'Contact Us'],
]

export default function Footer() {
  return (
    <footer className="footer container">
      <div className="footer__social">
        <span>Facebook</span>
        <span>Instagram</span>
        <span>Twitter</span>
        <span>YouTube</span>
      </div>
      <div className="footer__grid">
        {columns.map((col, i) => (
          <ul key={i}>
            {col.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ))}
      </div>
      <p className="footer__copy">© 2026 Veloura, Inc. — demo project, not affiliated with any streaming service.</p>
    </footer>
  )
}
