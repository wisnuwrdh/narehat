interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 36, className = "text-slate-900" }: LogoProps) {
  return (
    <div className="flex items-center gap-2">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 256 256"
        width={size}
        height={size}
        fill="none"
      >
        <rect width="256" height="256" fill="none" />
        <g transform="translate(-22,0)">
          <path
            d="M64 208 V64 C64 44 80 28 100 28 C116 28 126 34 136 46 L188 110"
            stroke="#3525CD"
            strokeWidth="22"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M116 108 L176 180 C188 194 204 198 220 190 C230 184 236 172 236 158 V64"
            stroke="#3525CD"
            strokeWidth="22"
            strokeLinecap="butt"
            strokeLinejoin="round"
          />
          <ellipse cx="236" cy="61" rx="11" ry="6" fill="none" />
          <circle cx="236" cy="36" r="14" fill="#3525CD" />
        </g>
      </svg>
      <span className={`font-bold text-lg ${className}`}>Narehat</span>
    </div>
  );
}
