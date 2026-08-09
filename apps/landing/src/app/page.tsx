import { PlatformPreview } from '@/components/PlatformPreview';
import { FaqAccordion } from '@/components/FaqAccordion';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import {
  planComparison,
  pricingPlans,
  problems,
  productFeatures,
  registroUrl,
  siteConfig,
} from '@/lib/config';

function formatPrice(amount: number) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(amount);
}

function SectionTitle({
  eyebrow,
  title,
  description,
  light,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  light?: boolean;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      {eyebrow && <p className={`eyebrow ${light ? 'text-brand-200' : ''}`}>{eyebrow}</p>}
      <h2
        className={`mt-3 text-3xl font-bold tracking-tight sm:text-4xl ${light ? 'text-white' : 'text-slate-900'}`}
      >
        {title}
      </h2>
      {description && (
        <p className={`mt-4 text-lg leading-relaxed ${light ? 'text-slate-300' : 'text-slate-600'}`}>
          {description}
        </p>
      )}
    </div>
  );
}

export default function LandingPage() {
  return (
    <>
      <Header />

      <main className="min-w-0 overflow-x-hidden">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-brand-950 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(203,67,54,0.25),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.08),transparent_35%)]" />
          <div className="section-shell relative section-pad">
            <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
              <div>
                <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-sm font-medium text-brand-100 backdrop-blur-sm">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  {siteConfig.company} · Plataforma para proveedores
                </p>
                <h1 className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.25rem]">
                  {siteConfig.heroHeadline}
                </h1>
                <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
                  Deja Excel y WhatsApp atrás. Opera clientes, eventos, inventario y cobros desde un
                  panel profesional como el que ya usas en Remo&Rent.
                </p>
                <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                  <a href={registroUrl({ tipo: 'prueba' })} className="btn-primary">
                    Empieza gratis
                  </a>
                  <a href={registroUrl({ tipo: 'demo' })} className="btn-ghost-light">
                    Solicitar demostración
                  </a>
                </div>
                <p className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-400">
                  <span>✓ 30 días gratis</span>
                  <span>✓ Sin permanencia</span>
                  <span>✓ Desde $300/mes</span>
                </p>
              </div>
              <div className="lg:translate-y-2">
                <PlatformPreview variant="dashboard" />
              </div>
            </div>
          </div>
        </section>

        {/* Problema */}
        <section id="problema" className="section-pad bg-white">
          <div className="section-shell">
            <SectionTitle
              eyebrow="El problema"
              title="Así opera la mayoría de los proveedores hoy"
              description="Herramientas desconectadas que frenan el crecimiento y generan errores costosos."
            />
            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {problems.map((item) => (
                <div
                  key={item.title}
                  className="group card p-6 transition hover:-translate-y-1 hover:border-red-200 hover:shadow-lg"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-2xl ring-1 ring-red-100 transition group-hover:bg-red-100">
                    {item.icon}
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Solución */}
        <section id="solucion" className="section-pad bg-slate-50">
          <div className="section-shell">
            <div className="grid items-center gap-14 lg:grid-cols-2">
              <div className="order-2 lg:order-1">
                <PlatformPreview variant="calendario" />
              </div>
              <div className="order-1 lg:order-2">
                <p className="eyebrow">La solución</p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  Un portal diseñado para tu operación de eventos
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-slate-600">
                  REMO centraliza clientes, calendario, cotizaciones, catálogo y cobros. El mismo
                  panel que usa tu equipo en producción — listo desde el día uno.
                </p>
                <ul className="mt-8 space-y-4">
                  {[
                    'Dashboard financiero con ingresos, cobranza y tendencias',
                    'Calendario con entregas, eventos y cobros del día',
                    'Órdenes de cobro con estados claros y seguimiento',
                    'Catálogo e inventario con disponibilidad por fecha',
                  ].map((item) => (
                    <li key={item} className="flex gap-3 text-slate-700">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                        ✓
                      </span>
                      <span className="text-sm font-medium sm:text-base">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Funciones */}
        <section id="funciones" className="section-pad bg-white">
          <div className="section-shell">
            <SectionTitle
              eyebrow="Funciones"
              title="Todo lo que necesitas para operar"
              description="Módulos pensados para el día a día de una empresa de renta y producción de eventos."
            />
            <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {productFeatures.map((feature, i) => (
                <div
                  key={feature.title}
                  className="card group p-5 transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-xl text-brand-600 ring-1 ring-brand-100 transition group-hover:bg-brand-100">
                    {feature.icon}
                  </div>
                  <h3 className="mt-4 font-bold text-slate-900">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.description}</p>
                  {i === productFeatures.length - 1 && (
                    <span className="mt-3 inline-block text-xs font-semibold text-brand-600">
                      Plan Pro →
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-16">
              <p className="text-center text-sm font-semibold uppercase tracking-wider text-brand-600">
                Así se ve en el portal web (escritorio)
              </p>
              <div className="mt-8 space-y-8">
                <PlatformPreview variant="calendario" />
                <PlatformPreview variant="cobros" />
              </div>
            </div>
          </div>
        </section>

        {/* Comparación */}
        <section id="comparacion" className="section-pad bg-slate-50">
          <div className="section-shell max-w-3xl">
            <SectionTitle
              eyebrow="Comparación"
              title="Básico vs Pro"
              description="Elige el plan que mejor se adapte a tu operación."
            />
            <div className="card mt-12 overflow-x-auto">
              <table className="w-full min-w-[480px] text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-6 py-4 text-left font-semibold text-slate-700">Función</th>
                    <th className="px-6 py-4 text-center font-semibold text-slate-700">Básico</th>
                    <th className="px-6 py-4 text-center font-semibold text-brand-700">Pro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {planComparison.map((row) => (
                    <tr key={row.feature} className="transition hover:bg-slate-50/80">
                      <td className="px-6 py-4 font-medium text-slate-800">{row.feature}</td>
                      <td className="px-6 py-4 text-center text-lg">
                        {row.basico ? (
                          <span className="text-emerald-600">✅</span>
                        ) : (
                          <span className="text-slate-300">❌</span>
                        )}
                      </td>
                      <td className="bg-brand-50/40 px-6 py-4 text-center text-lg">
                        {row.pro ? (
                          <span className="text-emerald-600">✅</span>
                        ) : (
                          <span className="text-slate-300">❌</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Precios */}
        <section id="precios" className="section-pad bg-white">
          <div className="section-shell">
            <SectionTitle
              eyebrow="Precios"
              title="Planes simples, sin sorpresas"
              description="30 días gratis en cualquier plan. Sin permanencia."
            />
            <div className="mx-auto mt-14 grid max-w-4xl gap-8 md:grid-cols-2">
              {pricingPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative flex flex-col rounded-3xl border p-8 transition hover:-translate-y-1 ${
                    plan.highlighted
                      ? 'border-brand-300 bg-white shadow-xl shadow-brand-100 ring-2 ring-brand-500'
                      : 'card hover:shadow-lg'
                  }`}
                >
                  {plan.highlighted && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-4 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-md">
                      Recomendado
                    </span>
                  )}
                  <p className="text-sm font-bold uppercase tracking-wider text-slate-500">
                    {plan.name}
                  </p>
                  <p className="mt-5">
                    <span className="text-5xl font-bold tracking-tight text-slate-900">
                      {formatPrice(plan.price)}
                    </span>
                    <span className="text-slate-500"> / mes</span>
                  </p>
                  <p className="mt-4 inline-flex w-fit rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-800 ring-1 ring-emerald-100">
                    🎁 {plan.trialDays} días gratis
                  </p>
                  <ul className="mt-8 flex-1 space-y-2 text-sm text-slate-600">
                    {(plan.id === 'pro'
                      ? ['Pasarela Mercado Pago', 'Links de pago', 'Reportes y automatización']
                      : ['CRM, clientes y calendario', 'Catálogo e inventario', 'Cobros manuales']
                    ).map((f) => (
                      <li key={f} className="flex gap-2">
                        <span className="text-brand-600">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="section-pad bg-slate-50">
          <div className="section-shell max-w-3xl">
            <SectionTitle title="Preguntas frecuentes" />
            <div className="mt-12">
              <FaqAccordion />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-pad">
          <div className="section-shell">
            <div className="hero-panel px-8 py-14 text-center lg:px-16 lg:py-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Empieza a operar mejor hoy
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-slate-300">
                Prueba REMO 30 días gratis o agenda una demo con nuestro equipo.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <a href={registroUrl({ tipo: 'prueba' })} className="btn-primary">
                  Empieza gratis
                </a>
                <a href={registroUrl({ tipo: 'demo' })} className="btn-ghost-light">
                  Solicitar demostración
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
