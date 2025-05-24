export function SmartDryLogo({ className = "h-6 w-6", color = "#3b82f6" }: { className?: string; color?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
      <path d="M12 10a2 2 0 0 0-2 2c0 1.1.9 2 2 2 1.1 0 2-.9 2-2a2 2 0 0 0-2-2z" />
      <path d="M12 6a6 6 0 0 0-6 6c0 3.3 2.7 6 6 6 3.3 0 6-2.7 6-6 0-3.3-2.7-6-6-6z" />
      <path d="M7 14c0 2.76 2.24 5 5 5s5-2.24 5-5" />
    </svg>
  )
}
