import React from "react"

import { IconProps } from "types/icon"

const PromptPay: React.FC<IconProps> = ({
  size = "20",
  color = "currentColor",
  ...attributes
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      {...attributes}
    >
      <title>PromptPay</title>
      {/* QR code / mobile payment icon representing PromptPay */}
      <rect x="2" y="2" width="8" height="8" rx="1" stroke={color} strokeWidth="1.5" fill="none" />
      <rect x="4" y="4" width="4" height="4" rx="0.5" fill={color} />
      <rect x="14" y="2" width="8" height="8" rx="1" stroke={color} strokeWidth="1.5" fill="none" />
      <rect x="16" y="4" width="4" height="4" rx="0.5" fill={color} />
      <rect x="2" y="14" width="8" height="8" rx="1" stroke={color} strokeWidth="1.5" fill="none" />
      <rect x="4" y="16" width="4" height="4" rx="0.5" fill={color} />
      <rect x="14" y="14" width="2" height="2" fill={color} />
      <rect x="18" y="14" width="2" height="2" fill={color} />
      <rect x="14" y="18" width="2" height="2" fill={color} />
      <rect x="18" y="18" width="4" height="4" fill={color} />
      <rect x="14" y="22" width="2" height="2" fill={color} />
    </svg>
  )
}

export default PromptPay
