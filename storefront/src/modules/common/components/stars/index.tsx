export default function Stars({
  value = 5,
  size = 14,
}: {
  value?: number
  size?: number
}) {
  return (
    <div style={{ display: "inline-flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={i <= value ? "#C8893C" : "#F5E6D3"}
          stroke="#C8893C"
          strokeWidth="1.5"
          strokeLinejoin="round"
        >
          <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7l3-7z" />
        </svg>
      ))}
    </div>
  )
}
