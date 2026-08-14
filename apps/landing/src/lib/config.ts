export const siteConfig = {
  name: 'REMO',
  tagline: 'Event Operating System',
  company: 'REMO',
  heroHeadline:
    'Organiza tus eventos, administra tu inventario y cobra más rápido desde una sola plataforma.',
  description:
    'CRM, calendario, catálogo, inventario y cobros para empresas de renta de mobiliario y producción de eventos.',
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'contacto@remorent.mx',
  social: {
    instagram:
      process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM ??
      'https://www.instagram.com/remo.conecta?igsh=OXkzZTN0eWdncjY4',
    facebook:
      process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK ??
      'https://www.facebook.com/share/18672raJjE/?mibextid=wwXIfr',
    linkedin:
      process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN ?? 'https://www.linkedin.com/company/remorent',
    whatsapp: process.env.NEXT_PUBLIC_SOCIAL_WHATSAPP ?? '',
    tiktok: process.env.NEXT_PUBLIC_SOCIAL_TIKTOK ?? '',
  },
};

export type SocialLinkKey = keyof typeof siteConfig.social;

export const socialLinkLabels: Record<SocialLinkKey, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  whatsapp: 'WhatsApp',
  tiktok: 'TikTok',
};

/** Redes con URL configurada (omite placeholders vacíos o `#`). */
export function getSocialLinks() {
  return (Object.keys(siteConfig.social) as SocialLinkKey[])
    .map((key) => ({
      key,
      label: socialLinkLabels[key],
      href: siteConfig.social[key].trim(),
    }))
    .filter((link) => link.href && link.href !== '#');
}

export const problems = [
  {
    title: 'Excel',
    description: 'Listas desactualizadas, versiones distintas y cero visibilidad en tiempo real.',
    icon: '📊',
  },
  {
    title: 'WhatsApp',
    description: 'Cotizaciones, confirmaciones y pagos mezclados en chats que se pierden.',
    icon: '💬',
  },
  {
    title: 'Cobros atrasados',
    description: 'Sin recordatorios ni seguimiento claro de quién debe y cuánto.',
    icon: '⏳',
  },
  {
    title: 'Doble reserva de mobiliario',
    description: 'Prometes el mismo inventario a dos eventos el mismo día.',
    icon: '⚠️',
  },
] as const;

/** Funciones alineadas con la tabla Básico vs Pro: `planPro` = exclusivo del plan Pro. */
export const planFeatures = [
  {
    feature: 'CRM',
    description: 'Eventos, cotizaciones y pipeline comercial en un solo flujo.',
    icon: '◫',
    basico: true,
    pro: true,
  },
  {
    feature: 'Clientes',
    description: 'Expediente completo e historial por cliente.',
    icon: '👥',
    basico: true,
    pro: true,
  },
  {
    feature: 'Calendario',
    description: 'Entregas, montajes y recogidas integrados a tu operación.',
    icon: '📅',
    basico: true,
    pro: true,
  },
  {
    feature: 'Catálogo',
    description: 'Productos con fotos, precios y categorías listos para cotizar.',
    icon: '▣',
    basico: true,
    pro: true,
  },
  {
    feature: 'Cobros manuales',
    description: 'Órdenes de cobro, estados y seguimiento de pagos.',
    icon: '◈',
    basico: true,
    pro: true,
  },
  {
    feature: 'Pasarela',
    description: 'Integración con Mercado Pago para cobrar en línea.',
    icon: '💳',
    basico: false,
    pro: true,
  },
  {
    feature: 'Links de pago',
    description: 'Genera y comparte links de cobro con tus clientes.',
    icon: '🔗',
    basico: false,
    pro: true,
  },
  {
    feature: 'Automatización',
    description: 'Recordatorios y flujos automáticos para cobros y operación.',
    icon: '⚡',
    basico: false,
    pro: true,
  },
] as const;

export const pricingPlans = [
  {
    id: 'basico',
    name: 'Plan Básico',
    price: 299,
    trialDays: 30,
    highlighted: false,
  },
  {
    id: 'pro',
    name: 'Plan Pro',
    price: 699,
    trialDays: 30,
    highlighted: true,
  },
] as const;

export const faqItems = [
  {
    question: '¿Tiene permanencia?',
    answer:
      'No. Puedes contratar mes a mes. El plan Pro y el Básico se renuevan mensualmente sin plazos forzosos.',
  },
  {
    question: '¿Puedo cancelar?',
    answer:
      'Sí, en cualquier momento desde tu cuenta o escribiéndonos antes de tu próximo cobro. No hay penalización por cancelación.',
  },
  {
    question: '¿Cómo funciona la prueba?',
    answer:
      'Tienes 30 días gratis para explorar el plan que elijas. No pedimos tarjeta al registrarte. Al terminar la prueba, decides si continúas.',
  },
  {
    question: '¿Cómo conecto Mercado Pago?',
    answer:
      'En el plan Pro, ve a Configuración → Pasarela de pagos e ingresa tu Access Token de Mercado Pago. En minutos puedes generar links de cobro.',
  },
  {
    question: '¿Hay soporte?',
    answer:
      'Sí. Soporte por correo en todos los planes. En Pro priorizamos incidencias operativas y te ayudamos con la configuración inicial.',
  },
] as const;

export function signupMailto(plan?: string) {
  const subject = plan
    ? `Quiero empezar — ${plan}`
    : 'Quiero empezar gratis — REMO';
  const body = plan
    ? `Hola,\n\nQuiero comenzar con el ${plan} y activar mi prueba de 30 días.\n\nEmpresa:\nNombre:\nTeléfono:\n`
    : `Hola,\n\nMe interesa empezar gratis con REMO.\n\nEmpresa:\nNombre:\nTeléfono:\n`;
  return `mailto:${siteConfig.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function demoMailto() {
  return `mailto:${siteConfig.contactEmail}?subject=${encodeURIComponent('Solicitud de demostración — REMO')}&body=${encodeURIComponent('Hola,\n\nMe gustaría agendar una demostración de REMO.\n\nEmpresa:\nNombre:\nTeléfono:\nHorario preferido:\n')}`;
}

/** Ruta de registro de interesados (sin pago en línea por ahora). */
export function registroUrl(options?: {
  tipo?: 'prueba' | 'demo';
  plan?: 'basico' | 'pro';
}) {
  const params = new URLSearchParams();
  if (options?.tipo) params.set('tipo', options.tipo);
  if (options?.plan) params.set('plan', options.plan);
  const query = params.toString();
  return query ? `/registro?${query}` : '/registro';
}
