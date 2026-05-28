const brand = '\x1b[38;2;225;90;67m'
const brandBold = '\x1b[1m\x1b[38;2;225;90;67m'
const accent = '\x1b[38;2;255;177;153m'
const whiteBold = '\x1b[37m\x1b[1m'
const reset = '\x1b[0m'

const logoRows = [
  ' ██████╗ ██╗   ██╗███████╗████████╗ ██████╗ ',
  '██╔════╝ ██║   ██║██╔════╝╚══██╔══╝██╔═══██╗',
  '██║  ███╗██║   ██║███████╗   ██║   ██║   ██║',
  '██║   ██║██║   ██║╚════██║   ██║   ██║   ██║',
  '╚██████╔╝╚██████╔╝███████║   ██║   ╚██████╔╝',
  ' ╚═════╝  ╚═════╝ ╚══════╝   ╚═╝    ╚═════╝ ',
]

const BOX_CHARS = new Set(['╗', '╔', '╝', '╚', '═', '║'])

function colorRow(raw) {
  return raw
    .split('')
    .map(ch => {
      if (ch === '█') return `${brandBold}${ch}${reset}`
      if (BOX_CHARS.has(ch)) return `${accent}${ch}${reset}`
      return ch
    })
    .join('')
}

const PAD = 3
const logoW = Math.max(...logoRows.map(r => r.length))
const innerW = PAD + logoW + PAD
const bdr = s => `${brand}${s}${reset}`
const edge = bdr('║')
const blank = `${edge}${' '.repeat(innerW)}${edge}`

function bline(content, rawLen) {
  return `${edge}${content}${' '.repeat(Math.max(0, innerW - rawLen))}${edge}`
}

console.log()
console.log(`${bdr('╔')}${bdr('═'.repeat(innerW))}${bdr('╗')}`)
console.log(blank)

for (const lr of logoRows) {
  const prefix = ' '.repeat(PAD)
  console.log(bline(prefix + colorRow(lr), PAD + lr.length))
}

const embLabel = 'embedded-react-sdk'
const embOffset = PAD + logoW - embLabel.length
console.log(bline(' '.repeat(embOffset) + `${whiteBold}${embLabel}${reset}`, PAD + logoW))

console.log(blank)
console.log(`${bdr('╚')}${bdr('═'.repeat(innerW))}${bdr('╝')}`)
console.log()
