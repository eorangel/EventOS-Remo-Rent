import Link from 'next/link';
import { getSocialLinks, siteConfig } from '@/lib/config';
import { RemoLogo } from '@/components/RemoLogo';

export function Footer() {
  const year = new Date().getFullYear();
  const socialLinks = getSocialLinks();

  return (
    <footer id="contacto" className="border-t border-brand-900 bg-brand-950 text-slate-300">
      <div className="section-shell py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <RemoLogo variant="footer" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
              {siteConfig.description}
            </p>
            {socialLinks.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {socialLinks.map((link) => (
                  <a
                    key={link.key}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-full border border-brand-800 bg-brand-900/60 px-3.5 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-brand-600 hover:bg-brand-800 hover:text-white"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="text-sm font-semibold text-white">Legal</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <a href={`mailto:${siteConfig.contactEmail}`} className="transition hover:text-white">
                  Contacto
                </a>
              </li>
              <li>
                <Link href="/privacidad" className="transition hover:text-white">
                  Aviso de privacidad
                </Link>
              </li>
              <li>
                <Link href="/terminos" className="transition hover:text-white">
                  Términos y condiciones
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-white">Redes sociales</p>
            {socialLinks.length > 0 ? (
              <ul className="mt-4 space-y-2.5 text-sm">
                {socialLinks.map((link) => (
                  <li key={link.key}>
                    <a
                      href={link.href}
                      className="transition hover:text-white"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-slate-500">Próximamente</p>
            )}
          </div>
        </div>

        <div className="mt-12 border-t border-brand-900 pt-8 text-center text-xs text-slate-500">
          © {year} {siteConfig.name}. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
