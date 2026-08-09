import Image from 'next/image';

type RemoLogoProps = {
  variant?: 'full' | 'header' | 'compact' | 'footer' | 'mark';
  className?: string;
  priority?: boolean;
};

const variantConfig = {
  full: {
    imageClass: 'h-auto w-full max-w-[min(100%,380px)] sm:max-w-[420px] lg:max-w-[460px]',
    width: 460,
    height: 510,
    wrapClass:
      'inline-block overflow-hidden rounded-[1.75rem] rounded-tl-[2.25rem] bg-brand-950 shadow-[0_16px_40px_-20px_rgba(5,11,23,0.8)]',
  },
  header: {
    imageClass: 'h-full w-full object-cover object-top',
    width: 380,
    height: 420,
    wrapClass:
      'relative inline-flex h-[5.75rem] w-[10.5rem] overflow-hidden rounded-xl rounded-tl-[1.25rem] bg-brand-950 shadow-[0_6px_18px_-12px_rgba(5,11,23,0.6)] sm:h-[6.25rem] sm:w-[11.5rem] md:h-[7rem] md:w-[12.75rem] lg:h-[7.75rem] lg:w-[14rem]',
  },
  compact: {
    imageClass: 'h-full w-full object-cover object-top',
    width: 380,
    height: 420,
    wrapClass:
      'relative inline-flex h-[5.25rem] w-[9.75rem] overflow-hidden rounded-xl rounded-tl-[1.1rem] bg-brand-950 shadow-sm sm:h-[5.75rem] sm:w-[10.75rem]',
  },
  footer: {
    imageClass: 'h-auto w-full max-w-[320px] sm:max-w-[360px] lg:max-w-[400px]',
    width: 400,
    height: 440,
    wrapClass: 'inline-block',
  },
  mark: {
    imageClass: 'h-10 w-10 object-cover object-top rounded-lg',
    width: 40,
    height: 40,
    wrapClass: 'inline-flex overflow-hidden rounded-lg bg-brand-950',
  },
} as const;

export function RemoLogo({
  variant = 'compact',
  className = '',
  priority = false,
}: RemoLogoProps) {
  const config = variantConfig[variant];

  return (
    <div className={`${config.wrapClass} ${className}`}>
      <Image
        src="/remo-logo.png"
        alt="REMO — Event Operating System"
        width={config.width}
        height={config.height}
        className={config.imageClass}
        priority={priority}
      />
    </div>
  );
}
