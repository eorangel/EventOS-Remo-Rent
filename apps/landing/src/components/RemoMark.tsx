import { useId } from 'react';

type RemoMarkProps = {
  className?: string;
};

export function RemoMark({ className = 'h-9 w-9' }: RemoMarkProps) {
  const uid = useId().replace(/:/g, '');

  return (
    <svg
      viewBox="0 0 52 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={`remo-mark-a-${uid}`}
          x1="8"
          y1="6"
          x2="40"
          y2="44"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#A7F3EC" />
          <stop offset="0.4" stopColor="#22D3BC" />
          <stop offset="1" stopColor="#0D9488" />
        </linearGradient>
        <linearGradient
          id={`remo-mark-b-${uid}`}
          x1="24"
          y1="22"
          x2="44"
          y2="46"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#5EEAD4" />
          <stop offset="1" stopColor="#14BBA6" />
        </linearGradient>
      </defs>

      <path
        d="M14 10V42"
        stroke={`url(#remo-mark-a-${uid})`}
        strokeWidth="7.5"
        strokeLinecap="round"
      />
      <path
        d="M14 10H27.5C34.4036 10 40 15.5964 40 22.5C40 29.4036 34.4036 35 27.5 35H22"
        stroke={`url(#remo-mark-a-${uid})`}
        strokeWidth="7.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22 35L38.5 42"
        stroke={`url(#remo-mark-b-${uid})`}
        strokeWidth="7.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
