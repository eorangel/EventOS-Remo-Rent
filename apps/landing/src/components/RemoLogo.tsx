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
    imageClass: 'h-full w-auto max-h-full object-contain object-left object-top',
    width: 380,
    height: 420,
    wrapClass:
      'relative inline-flex h-[4.5rem] w-[10rem] max-w-[calc(100vw-5.5rem)] items-start overflow-hidden rounded-2xl rounded-tl-[1.5rem] rounded-br-[1.25rem] bg-brand-950 px-2.5 shadow-[0_6px_18px_-12px_rgba(5,11,23,0.6)] sm:h-[5.75rem] sm:w-[12.5rem] sm:max-w-none sm:rounded-tl-[1.75rem] sm:px-3 md:h-[7rem] md:w-[15.5rem] md:px-3.5 lg:h-[7.75rem] lg:w-[17.5rem] lg:rounded-3xl lg:rounded-tl-[2.25rem] lg:rounded-br-[1.75rem] lg:px-4',
  },
  compact: {
    imageClass: 'h-full w-auto max-h-full object-contain object-left object-top',
    width: 380,
    height: 420,
    wrapClass:
      'relative inline-flex h-[4rem] w-[9rem] max-w-[calc(100vw-6rem)] items-start overflow-hidden rounded-xl rounded-tl-[1.25rem] rounded-br-[1.1rem] bg-brand-950 px-2 shadow-sm sm:h-[5.25rem] sm:w-[11.5rem] sm:max-w-none sm:rounded-2xl sm:px-2.5',
  },
  footer: {
    imageClass: 'h-auto w-full max-w-[320px] sm:max-w-[360px] lg:max-w-[400px]',
    width: 400,
    height: 440,
    wrapClass: 'inline-block',
  },
  mark: {
    imageClass: 'h-10 w-10 object-contain',
    width: 40,
    height: 40,
    wrapClass: 'inline-flex overflow-hidden rounded-lg bg-brand-950 p-1',
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
        src={variant === 'mark' ? '/remo-mark.png' : '/remo-logo.png'}
        alt="REMO — Event Operating System"
        width={config.width}
        height={config.height}
        className={config.imageClass}
        priority={priority}
      />
    </div>
  );
}
