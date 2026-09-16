// Deterministic user color based on id
const USER_PALETTE = [
  '#6bb5e0', // blue
  '#ec7a9c', // pink
  '#f5b94a', // amber
  '#5bbfad', // mint
  '#b58cd9', // purple
  '#f0955e', // orange
]

export function userColor(userId: string): string {
  let h = 0
  for (let i = 0; i < userId.length; i++) h = (h * 31 + userId.charCodeAt(i)) >>> 0
  return USER_PALETTE[h % USER_PALETTE.length]
}
