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
    imageClass:
      'h-[5.5rem] w-[11rem] object-cover object-top sm:h-[6.75rem] sm:w-[13rem] md:h-[9.5rem] md:w-[15.5rem] lg:h-[11rem] lg:w-[17.5rem] xl:h-[12.5rem] xl:w-[19rem]',
    width: 304,
    height: 200,
    wrapClass:
      'inline-flex overflow-hidden rounded-2xl rounded-tl-[1.35rem] bg-brand-950 shadow-[0_8px_24px_-14px_rgba(5,11,23,0.65)] lg:rounded-tl-[1.75rem]',
  },
  compact: {
    imageClass: 'h-[5rem] w-[10rem] object-cover object-top sm:h-[5.75rem] sm:w-[11.5rem]',
    width: 184,
    height: 92,
    wrapClass:
      'inline-flex overflow-hidden rounded-xl rounded-tl-[1.1rem] bg-brand-950 shadow-sm',
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
