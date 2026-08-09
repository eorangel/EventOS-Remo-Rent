import Image from 'next/image';

type RemoLogoProps = {
  variant?: 'full' | 'header' | 'compact' | 'footer' | 'mark';
  className?: string;
  priority?: boolean;
};

const variantConfig = {
  full: {
    className: 'h-36 w-auto max-w-[min(100%,380px)] sm:h-40',
    width: 380,
    height: 160,
  },
  header: {
    className: 'h-16 w-auto max-w-[min(100%,260px)] sm:h-[4.5rem] sm:max-w-[300px]',
    width: 300,
    height: 72,
  },
  compact: {
    className: 'h-14 w-auto max-w-[220px]',
    width: 220,
    height: 56,
  },
  footer: {
    className: 'h-20 w-auto max-w-[280px] sm:h-24 sm:max-w-[320px]',
    width: 320,
    height: 96,
  },
  mark: {
    className: 'h-10 w-10 rounded-lg object-cover object-left',
    width: 40,
    height: 40,
  },
} as const;

export function RemoLogo({
  variant = 'compact',
  className = '',
  priority = false,
}: RemoLogoProps) {
  const config = variantConfig[variant];

  return (
    <Image
      src="/remo-logo.png"
      alt="REMO — Event Operating System"
      width={config.width}
      height={config.height}
      className={`${config.className} ${className}`}
      priority={priority}
    />
  );
}
