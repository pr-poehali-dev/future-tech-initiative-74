import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'

const NUMBERS = Array.from({ length: 37 }, (_, i) => i)
const RED_NUMBERS = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]

function getColor(n: number) {
  if (n === 0) return 'green'
  return RED_NUMBERS.includes(n) ? 'red' : 'black'
}

const BET_TYPES = [
  { id: 'red', label: '🔴 Красное', payout: 2 },
  { id: 'black', label: '⚫ Чёрное', payout: 2 },
  { id: 'even', label: 'Чётное', payout: 2 },
  { id: 'odd', label: 'Нечётное', payout: 2 },
  { id: '1-18', label: '1–18', payout: 2 },
  { id: '19-36', label: '19–36', payout: 2 },
]

const BETS = [10, 25, 50, 100, 200]

interface Props { balance: number; setBalance: (b: number) => void }

export default function Roulette({ balance, setBalance }: Props) {
  const [bet, setBet] = useState(25)
  const [betType, setBetType] = useState<string>('red')
  const [numberBet, setNumberBet] = useState<number | null>(null)
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<{ number: number; win: boolean; amount: number } | null>(null)
  const [rotation, setRotation] = useState(0)

  const spin = () => {
    if (spinning || balance < bet) return
    setSpinning(true)
    setResult(null)
    setBalance(balance - bet)

    const winNumber = Math.floor(Math.random() * 37)
    const newRotation = rotation + 1440 + Math.random() * 360

    setRotation(newRotation)

    setTimeout(() => {
      setSpinning(false)
      const color = getColor(winNumber)
      let win = false

      if (numberBet !== null) {
        win = winNumber === numberBet
        const amount = win ? bet * 36 : 0
        if (win) setBalance(balance - bet + amount)
        setResult({ number: winNumber, win, amount })
      } else {
        if (betType === 'red') win = color === 'red'
        else if (betType === 'black') win = color === 'black'
        else if (betType === 'even') win = winNumber !== 0 && winNumber % 2 === 0
        else if (betType === 'odd') win = winNumber % 2 === 1
        else if (betType === '1-18') win = winNumber >= 1 && winNumber <= 18
        else if (betType === '19-36') win = winNumber >= 19 && winNumber <= 36

        const amount = win ? bet * 2 : 0
        if (win) setBalance(balance - bet + amount)
        setResult({ number: winNumber, win, amount })
      }
    }, 2500)
  }

  const winColor = result ? getColor(result.number) : null

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-1">🎡 Рулетка</h2>
        <p className="text-neutral-400 text-sm">Угадай число или цвет</p>
      </div>

      {/* Wheel */}
      <div className="flex justify-center mb-8">
        <div className="relative">
          <motion.div
            className="w-48 h-48 rounded-full border-4 border-yellow-400/40 flex items-center justify-center text-6xl font-black"
            style={{
              background: 'conic-gradient(from 0deg, #1a1a1a 0deg, #8B0000 40deg, #1a1a1a 80deg, #8B0000 120deg, #1a1a1a 160deg, #8B0000 200deg, #1a1a1a 240deg, #8B0000 280deg, #1a1a1a 320deg, #166534 360deg)'
            }}
            animate={{ rotate: rotation }}
            transition={{ duration: 2.5, ease: [0.2, 0, 0.1, 1] }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black border-2 ${
              result
                ? winColor === 'green' ? 'bg-green-700 border-green-400 text-white'
                : winColor === 'red' ? 'bg-red-700 border-red-400 text-white'
                : 'bg-neutral-900 border-neutral-600 text-white'
                : 'bg-neutral-900 border-neutral-700 text-neutral-400'
            }`}>
              {spinning ? '?' : result ? result.number : '0'}
            </div>
          </div>
        </div>
      </div>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`text-center py-3 px-4 rounded-xl mb-4 font-bold ${result.win ? 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/30' : 'bg-neutral-800 text-neutral-400'}`}
          >
            Выпало: {result.number} ({winColor === 'red' ? '🔴' : winColor === 'black' ? '⚫' : '🟢'})
            {result.win ? ` — Выигрыш +${result.amount} ₽!` : ' — Не угадал'}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 mb-4">
        {/* Bet type */}
        <p className="text-neutral-500 text-xs uppercase tracking-widest mb-3">Тип ставки</p>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {BET_TYPES.map(t => (
            <button
              key={t.id}
              onClick={() => { setBetType(t.id); setNumberBet(null) }}
              className={`py-2 px-3 rounded-lg text-sm font-bold transition-all ${betType === t.id && numberBet === null ? 'bg-yellow-400 text-black' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Number bet */}
        <p className="text-neutral-500 text-xs uppercase tracking-widest mb-3">Или выбери число (x36)</p>
        <div className="grid grid-cols-10 gap-1 mb-4">
          {NUMBERS.map(n => (
            <button
              key={n}
              onClick={() => setNumberBet(n === numberBet ? null : n)}
              className={`h-8 rounded text-xs font-bold transition-all ${
                numberBet === n ? 'ring-2 ring-yellow-400 scale-110' : ''
              } ${
                n === 0 ? 'bg-green-800 text-white' :
                RED_NUMBERS.includes(n) ? 'bg-red-800 text-white' : 'bg-neutral-700 text-white'
              }`}
            >
              {n}
            </button>
          ))}
        </div>

        {/* Bet amount */}
        <p className="text-neutral-500 text-xs uppercase tracking-widest mb-2">Сумма ставки</p>
        <div className="flex gap-2 mb-4">
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
          {spinning ? 'Шарик крутится...' : `Поставить ${bet} ₽`}
        </Button>
      </div>
    </div>
  )
}
