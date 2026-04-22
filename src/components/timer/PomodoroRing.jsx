export default function PomodoroRing({ secondsLeft, totalSeconds }) {
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const progress = secondsLeft / totalSeconds;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <svg width="220" height="220" viewBox="0 0 220 220">
      <circle cx="110" cy="110" r={radius} stroke="#334155" strokeWidth="12" fill="none" />
      <circle
        cx="110"
        cy="110"
        r={radius}
        stroke="#7C3AED"
        strokeWidth="12"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        transform="rotate(-90 110 110)"
      />
      <text x="110" y="118" textAnchor="middle" fill="#F8FAFC" fontSize="30" fontWeight="700">
        {String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:{String(secondsLeft % 60).padStart(2, '0')}
      </text>
    </svg>
  );
}
