import Image from 'next/image';

type RemoLogoProps = {
  variant?: 'full' | 'compact' | 'mark';
  className?: string;
  priority?: boolean;
};

const variantStyles = {
  full: 'h-32 w-auto max-w-[min(100%,320px)]',
  compact: 'h-14 w-auto max-w-[200px]',
  mark: 'h-10 w-10 rounded-lg object-cover object-left',
} as const;

export function RemoLogo({
  variant = 'compact',
  className = '',
  priority = false,
}: RemoLogoProps) {
  return (
    <Image
      src="/remo-logo.png"
      alt="REMO — Event Operating System"
      width={variant === 'full' ? 320 : variant === 'compact' ? 200 : 40}
      height={variant === 'full' ? 128 : variant === 'compact' ? 56 : 40}
      className={`${variantStyles[variant]} ${className}`}
      priority={priority}
    />
  );
}
