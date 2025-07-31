// utils/getColorConfigFromString.js
const COLOR_MAP = {
  red:     { bg: 'bg-red-950', border: 'border-red-500', bar: 'bg-red-400' },
  rose:    { bg: 'bg-rose-950', border: 'border-rose-500', bar: 'bg-rose-400' },
  pink:    { bg: 'bg-pink-950', border: 'border-pink-500', bar: 'bg-pink-400' },
  orange:  { bg: 'bg-orange-950', border: 'border-orange-500', bar: 'bg-orange-400' },
  amber:   { bg: 'bg-amber-950', border: 'border-amber-500', bar: 'bg-amber-400' },
  yellow:  { bg: 'bg-yellow-950', border: 'border-yellow-500', bar: 'bg-yellow-400' },
  lime:    { bg: 'bg-lime-950', border: 'border-lime-500', bar: 'bg-lime-400' },
  green:   { bg: 'bg-green-950', border: 'border-green-500', bar: 'bg-green-400' },
  emerald: { bg: 'bg-emerald-950', border: 'border-emerald-500', bar: 'bg-emerald-400' },
  teal:    { bg: 'bg-teal-950', border: 'border-teal-500', bar: 'bg-teal-400' },
  cyan:    { bg: 'bg-cyan-950', border: 'border-cyan-500', bar: 'bg-cyan-400' },
  sky:     { bg: 'bg-sky-950', border: 'border-sky-500', bar: 'bg-sky-400' },
  blue:    { bg: 'bg-blue-950', border: 'border-blue-500', bar: 'bg-blue-400' },
  indigo:  { bg: 'bg-indigo-950', border: 'border-indigo-500', bar: 'bg-indigo-400' },
  violet:  { bg: 'bg-violet-950', border: 'border-violet-500', bar: 'bg-violet-400' },
  purple:  { bg: 'bg-purple-950', border: 'border-purple-500', bar: 'bg-purple-400' },
  fuchsia: { bg: 'bg-fuchsia-950', border: 'border-fuchsia-500', bar: 'bg-fuchsia-400' },
}

const COLOR_KEYS = Object.keys(COLOR_MAP)

export function getColorConfigFromString(str = '') {
  const seed = str.toLowerCase().slice(0, 5)
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash += seed.charCodeAt(i) * (i + 7)
  }
  const color = COLOR_KEYS[hash % COLOR_KEYS.length]
  return COLOR_MAP[color]
}
