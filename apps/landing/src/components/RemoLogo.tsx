import Image from 'next/image';

type RemoLogoProps = {
  variant?: 'full' | 'header' | 'compact' | 'footer' | 'mark';
  className?: string;
  priority?: boolean;
};

const variantConfig = {
  full: {
    src: '/remo-logo.png',
    imageClass: 'h-auto w-full max-w-[min(100%,380px)] sm:max-w-[420px] lg:max-w-[460px]',
    width: 460,
    height: 510,
    wrapClass:
      'inline-block overflow-hidden rounded-[1.75rem] rounded-tl-[2.25rem] bg-brand-950 shadow-[0_16px_40px_-20px_rgba(5,11,23,0.8)]',
  },
  header: {
    src: '/remo-logo-header.png',
    imageClass: 'h-full w-full object-contain object-center',
    width: 400,
    height: 90,
    wrapClass:
      'relative inline-flex h-14 w-[12rem] items-center overflow-hidden rounded-2xl rounded-tl-[1.75rem] rounded-br-[1.35rem] bg-brand-950 px-3 py-2 shadow-[0_6px_18px_-12px_rgba(5,11,23,0.6)] sm:h-[3.75rem] sm:w-[13rem] sm:rounded-tl-[2rem] md:w-[14rem] lg:rounded-3xl lg:rounded-tl-[2.25rem] lg:rounded-br-[1.75rem] lg:px-4',
  },
  compact: {
    src: '/remo-logo-header.png',
    imageClass: 'h-full w-full object-contain object-center',
    width: 400,
    height: 90,
    wrapClass:
      'relative inline-flex h-[3.25rem] w-[10.5rem] items-center overflow-hidden rounded-2xl rounded-tl-[1.5rem] rounded-br-[1.25rem] bg-brand-950 px-2.5 py-1.5 shadow-sm sm:h-14 sm:w-[11.5rem] sm:px-3',
  },
  footer: {
    src: '/remo-logo.png',
    imageClass: 'h-auto w-full max-w-[320px] sm:max-w-[360px] lg:max-w-[400px]',
    width: 400,
    height: 440,
    wrapClass: 'inline-block',
  },
  mark: {
    src: '/remo-mark.png',
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
        src={config.src}
        alt="REMO"
        width={config.width}
        height={config.height}
        className={config.imageClass}
        priority={priority}
      />
    </div>
  );
}
