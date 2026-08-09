import Image from 'next/image';

type RemoLogoProps = {
  variant?: 'full' | 'header' | 'compact' | 'footer' | 'mark';
  className?: string;
  priority?: boolean;
};

const variantConfig = {
  full: {
    imageClass: 'h-auto w-full max-w-[min(100%,340px)] sm:max-w-[380px]',
    width: 380,
    height: 420,
    wrapClass:
      'inline-block overflow-hidden rounded-[1.75rem] rounded-tl-[2.25rem] bg-brand-950 shadow-[0_16px_40px_-20px_rgba(5,11,23,0.8)]',
  },
  header: {
    imageClass: 'h-[4.25rem] w-[9.5rem] object-cover object-top sm:h-[4.75rem] sm:w-[10.5rem]',
    width: 168,
    height: 76,
    wrapClass:
      'inline-flex overflow-hidden rounded-2xl rounded-tl-[1.35rem] bg-brand-950 shadow-[0_8px_24px_-14px_rgba(5,11,23,0.65)]',
  },
  compact: {
    imageClass: 'h-[3.75rem] w-[8.5rem] object-cover object-top',
    width: 136,
    height: 60,
    wrapClass:
      'inline-flex overflow-hidden rounded-xl rounded-tl-[1.1rem] bg-brand-950 shadow-sm',
  },
  footer: {
    imageClass: 'h-auto w-full max-w-[280px] sm:max-w-[300px]',
    width: 300,
    height: 330,
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
