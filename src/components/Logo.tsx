interface LogoProps {
  size?: number
  showText?: boolean
  className?: string
}

export function Logo({ size = 32, showText = true, className = "" }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="logoGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
        {/* Background rounded square */}
        <rect width="40" height="40" rx="10" fill="url(#logoGrad)" />
        {/* Kanban columns — 3 simplified bars */}
        <rect x="8" y="12" width="6" height="18" rx="2" fill="white" fillOpacity="0.9" />
        <rect x="17" y="8" width="6" height="22" rx="2" fill="white" fillOpacity="0.7" />
        <rect x="26" y="15" width="6" height="15" rx="2" fill="white" fillOpacity="0.5" />
        {/* Small accent dot */}
        <circle cx="11" cy="9" r="2" fill="white" fillOpacity="0.6" />
      </svg>
      {showText && (
        <span
          className="font-bold text-white tracking-tight"
          style={{ fontSize: size * 0.55, letterSpacing: "-0.02em" }}
          translate="no"
        >
          TaskFlow
        </span>
      )}
    </div>
  )
}
