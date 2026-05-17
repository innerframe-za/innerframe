/**
 * Small badge shown on documents that were added by Innerframe (global documents).
 * Gold border, cream background — subtle accent only.
 */
export function GlobalBadge() {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border"
      style={{
        color: '#B8960C',
        backgroundColor: '#F5F0E8',
        borderColor: '#D4AF37',
      }}
    >
      Innerframe
    </span>
  )
}
