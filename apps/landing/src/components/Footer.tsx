import Link from 'next/link';
import { siteConfig } from '@/lib/config';
import { RemoLogo } from '@/components/RemoLogo';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer id="contacto" className="border-t border-brand-900 bg-brand-950 text-slate-300">
      <div className="section-shell py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <RemoLogo variant="footer" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
              {siteConfig.description}
            </p>
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
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <a
                  href={siteConfig.social.instagram}
                  className="transition hover:text-white"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.social.facebook}
                  className="transition hover:text-white"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Facebook
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.social.linkedin}
                  className="transition hover:text-white"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-brand-900 pt-8 text-center text-xs text-slate-500">
          © {year} {siteConfig.name}. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
