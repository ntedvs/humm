export const formatMoney = (value: string | null): string => {
  if (value === null) return "—"

  const num = parseFloat(value)
  if (isNaN(num)) return "—"

  // Format in compact notation
  if (num >= 1_000_000_000) {
    return `$${(num / 1_000_000_000).toFixed(1)}B`
  } else if (num >= 1_000_000) {
    return `$${(num / 1_000_000).toFixed(1)}M`
  } else if (num >= 1_000) {
    return `$${(num / 1_000).toFixed(0)}K`
  } else {
    return `$${num.toLocaleString()}`
  }
}
