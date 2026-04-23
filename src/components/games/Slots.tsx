import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'

const SYMBOLS = ['🍒', '🍋', '🍇', '⭐', '💎', '7️⃣', '🔔', '🍀']
const PAYOUTS: Record<string, number> = {
  '💎': 20, '7️⃣': 15, '⭐': 10, '🍀': 8, '🔔': 5, '🍇': 4, '🍒': 3, '🍋': 2
}

const BETS = [10, 25, 50, 100, 200]

function randomSymbol() {
  return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
}

interface Props { balance: number; setBalance: (b: number) => void }

export default function Slots({ balance, setBalance }: Props) {
  const [reels, setReels] = useState(['🍒', '🍋', '🍇'])
  const [spinning, setSpinning] = useState(false)
  const [bet, setBet] = useState(25)
  const [result, setResult] = useState<{ win: boolean; amount: number; message: string } | null>(null)
  const [history, setHistory] = useState<{ win: boolean; amount: number }[]>([])
  const spinRef = useRef(false)

  const spin = () => {
    if (spinning || spinRef.current) return
    if (balance < bet) return
    spinRef.current = true
    setSpinning(true)
    setResult(null)
    setBalance(balance - bet)

    const finalReels = [randomSymbol(), randomSymbol(), randomSymbol()]
    // 30% chance all match
    if (Math.random() < 0.15) finalReels[1] = finalReels[2] = finalReels[0]
    // 20% chance two match
    else if (Math.random() < 0.3) finalReels[1] = finalReels[0]

    setTimeout(() => {
      setReels(finalReels)
      setSpinning(false)
      spinRef.current = false

      const allSame = finalReels[0] === finalReels[1] && finalReels[1] === finalReels[2]
      const twoSame = finalReels[0] === finalReels[1] || finalReels[1] === finalReels[2] || finalReels[0] === finalReels[2]

      let winAmount = 0
      let message = ''
      if (allSame) {
        winAmount = bet * (PAYOUTS[finalReels[0]] || 5)
        message = `ДЖЕКПОТ! x${PAYOUTS[finalReels[0]] || 5}`
      } else if (twoSame) {
        winAmount = bet * 2
        message = 'Два совпадения! x2'
      } else {
        message = 'Не повезло, попробуй ещё!'
      }

      if (winAmount > 0) setBalance(balance - bet + winAmount)
      setResult({ win: winAmount > 0, amount: winAmount, message })
      setHistory(h => [{ win: winAmount > 0, amount: winAmount - bet }, ...h].slice(0, 5))
    }, 1200)
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-1">🎰 Слоты</h2>
        <p className="text-neutral-400 text-sm">Три одинаковых символа — джекпот!</p>
      </div>

      {/* Reels */}
      <div className="bg-neutral-950 border border-yellow-400/20 rounded-2xl p-8 mb-6">
        <div className="flex justify-center gap-4 mb-6">
          {reels.map((symbol, i) => (
            <motion.div
              key={i}
              className="w-24 h-24 bg-neutral-900 border border-neutral-700 rounded-xl flex items-center justify-center text-5xl"
              animate={spinning ? { y: [0, -10, 10, -8, 8, 0], rotate: [0, -5, 5, -3, 3, 0] } : {}}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
            >
              {spinning ? SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)] : symbol}
            </motion.div>
          ))}
        </div>

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className={`text-center py-3 px-4 rounded-xl mb-4 font-bold ${result.win ? 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/30' : 'bg-neutral-800 text-neutral-400'}`}
            >
              {result.message}
              {result.win && <span className="ml-2">+{result.amount} ₽</span>}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bet selector */}
        <div className="flex gap-2 justify-center mb-4">
          {BETS.map(b => (
            <button
              key={b}
              onClick={() => setBet(b)}
              className={`px-3 py-1 rounded-lg text-sm font-bold transition-all ${bet === b ? 'bg-yellow-400 text-black' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'}`}
            >
              {b}₽
            </button>
          ))}
        </div>

        <Button
          onClick={spin}
          disabled={spinning || balance < bet}
          className="w-full bg-yellow-400 text-black hover:bg-yellow-300 font-bold h-12 text-lg disabled:opacity-50"
        >
          {spinning ? 'Крутим...' : `Крутить — ${bet} ₽`}
        </Button>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="space-y-2">
          <p className="text-neutral-500 text-xs uppercase tracking-widest">История</p>
          {history.map((h, i) => (
            <div key={i} className={`flex justify-between text-sm px-4 py-2 rounded-lg ${h.win ? 'bg-green-900/20 text-green-400' : 'bg-neutral-900 text-neutral-500'}`}>
              <span>{h.win ? 'Выигрыш' : 'Проигрыш'}</span>
              <span>{h.win ? `+${h.amount}` : `-${bet}`} ₽</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
