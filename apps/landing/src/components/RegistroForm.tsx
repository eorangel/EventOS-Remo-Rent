'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { siteConfig } from '@/lib/config';

const planLabels = {
  basico: 'Plan Básico',
  pro: 'Plan Pro',
} as const;

export function RegistroForm() {
  const searchParams = useSearchParams();
  const initialTipo = searchParams.get('tipo') === 'demo' ? 'demo' : 'prueba';
  const initialPlan = searchParams.get('plan') === 'pro' ? 'pro' : searchParams.get('plan') === 'basico' ? 'basico' : '';

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [tipo, setTipo] = useState<'prueba' | 'demo'>(initialTipo);
  const [plan, setPlan] = useState<'basico' | 'pro' | ''>(initialPlan);
  const [mensaje, setMensaje] = useState('');

  const titulo = useMemo(
    () =>
      tipo === 'demo'
        ? 'Solicita una demostración'
        : 'Regístrate para empezar tu prueba gratis',
    [tipo],
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const subject =
      tipo === 'demo'
        ? 'Solicitud de demostración — REMO'
        : plan
          ? `Registro prueba gratis — ${planLabels[plan]}`
          : 'Registro prueba gratis — REMO';

    const body = [
      'Hola, equipo REMO.',
      '',
      `Tipo de solicitud: ${tipo === 'demo' ? 'Demostración' : 'Prueba gratis de 30 días'}`,
      plan ? `Plan de interés: ${planLabels[plan]}` : 'Plan de interés: Por definir',
      '',
      `Nombre: ${nombre}`,
      `Correo: ${email}`,
      `Teléfono: ${telefono}`,
      `Empresa: ${empresa}`,
      mensaje ? `\nComentarios:\n${mensaje}` : '',
      '',
      'Enviado desde remo.mx / landing REMO',
    ]
      .filter(Boolean)
      .join('\n');

    window.location.href = `mailto:${siteConfig.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  return (
    <form onSubmit={handleSubmit} className="card mx-auto max-w-xl space-y-5 p-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{titulo}</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Completa el formulario y te contactaremos en 1–2 días hábiles para activar tu acceso.
          No pedimos tarjeta ni pago en línea por ahora.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-sm font-medium text-slate-700">Nombre completo</span>
          <input
            type="text"
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Correo</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Teléfono</span>
          <input
            type="tel"
            required
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-1 block text-sm font-medium text-slate-700">Empresa</span>
          <input
            type="text"
            required
            value={empresa}
            onChange={(e) => setEmpresa(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">¿Qué buscas?</span>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value as 'prueba' | 'demo')}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
          >
            <option value="prueba">Prueba gratis 30 días</option>
            <option value="demo">Demostración en vivo</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Plan de interés</span>
          <select
            value={plan}
            onChange={(e) => setPlan(e.target.value as 'basico' | 'pro' | '')}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
          >
            <option value="">Aún no sé</option>
            <option value="basico">Plan Básico</option>
            <option value="pro">Plan Pro</option>
          </select>
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-1 block text-sm font-medium text-slate-700">
            Comentarios (opcional)
          </span>
          <textarea
            rows={3}
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            placeholder="Cuéntanos sobre tu operación o el tipo de eventos que manejas."
          />
        </label>
      </div>

      <button type="submit" className="btn-primary w-full">
        Enviar solicitud
      </button>

      <p className="text-center text-xs text-slate-500">
        Al enviar se abrirá tu correo con el mensaje listo para mandarlo a {siteConfig.contactEmail}.
      </p>
    </form>
  );
}
