export function ErrorIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="250" cy="250" r="200" fill="#F3F4F6" />
      <path
        d="M316.5 200.5C316.5 238.5 285.5 269.5 247.5 269.5C209.5 269.5 178.5 238.5 178.5 200.5C178.5 162.5 209.5 131.5 247.5 131.5C285.5 131.5 316.5 162.5 316.5 200.5Z"
        stroke="#6B7280"
        strokeWidth="10"
      />
      <path
        d="M178.5 335.5C178.5 297.5 209.5 266.5 247.5 266.5C285.5 266.5 316.5 297.5 316.5 335.5"
        stroke="#6B7280"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <circle cx="247.5" cy="200.5" r="15" fill="#6B7280" />
    </svg>
  );
}

export function NotFoundIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="250" cy="250" r="200" fill="#F3F4F6" />
      <path
        d="M175 175L325 325M325 175L175 325"
        stroke="#6B7280"
        strokeWidth="20"
        strokeLinecap="round"
      />
    </svg>
  );
}
