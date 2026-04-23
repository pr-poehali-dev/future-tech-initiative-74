import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'

const BETS = [10, 25, 50, 100, 200]

type Side = 'heads' | 'tails'
type Phase = 'bet' | 'flip' | 'result'

export default function CoinFlip({ balance, setBalance }: { balance: number; setBalance: (b: number) => void }) {
  const [bet, setBet] = useState(25)
  const [choice, setChoice] = useState<Side>('heads')
  const [phase, setPhase] = useState<Phase>('bet')
  const [result, setResult] = useState<Side>('heads')
  const [win, setWin] = useState(false)
  const [flipping, setFlipping] = useState(false)
  const [streak, setStreak] = useState(0)
  const [history, setHistory] = useState<{ side: Side; win: boolean }[]>([])

  const flip = () => {
    if (balance < bet || flipping) return
    setBalance(balance - bet)
    setFlipping(true)
    setPhase('flip')

    setTimeout(() => {
      const landed: Side = Math.random() < 0.5 ? 'heads' : 'tails'
      const didWin = landed === choice
      setResult(landed)
      setWin(didWin)
      setFlipping(false)
      setPhase('result')
      if (didWin) {
        setBalance(balance - bet + bet * 2)
        setStreak(s => s + 1)
      } else {
        setStreak(0)
      }
      setHistory(h => [{ side: landed, win: didWin }, ...h].slice(0, 8))
    }, 1800)
  }

  const reset = () => setPhase('bet')

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-1">🪙 Орёл и решка</h2>
        <p className="text-neutral-400 text-sm">50/50 — удвой ставку</p>
        {streak >= 2 && <p className="text-yellow-400 text-sm font-bold mt-1">🔥 Серия: {streak}</p>}
      </div>

      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-8">
        {/* Coin */}
        <div className="flex justify-center mb-8">
          <motion.div
            className="relative w-36 h-36"
            animate={flipping ? { rotateY: [0, 360, 720, 1080] } : {}}
            transition={{ duration: 1.8, ease: 'easeInOut' }}
          >
            <div className={`w-36 h-36 rounded-full flex items-center justify-center text-6xl shadow-2xl border-4 transition-all duration-500 ${
              phase === 'result'
                ? result === 'heads'
                  ? 'bg-gradient-to-br from-yellow-300 to-yellow-600 border-yellow-400'
                  : 'bg-gradient-to-br from-neutral-400 to-neutral-600 border-neutral-500'
                : 'bg-gradient-to-br from-yellow-400 to-yellow-600 border-yellow-300'
            }`}>
              {flipping ? '🪙' : phase === 'result' ? (result === 'heads' ? '🦅' : '🔵') : (choice === 'heads' ? '🦅' : '🔵')}
            </div>
          </motion.div>
        </div>

        {/* Result */}
        <AnimatePresence>
          {phase === 'result' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className={`text-center py-3 px-4 rounded-xl mb-5 font-bold ${win ? 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/30' : 'bg-red-900/20 text-red-400 border border-red-500/30'}`}
            >
              {result === 'heads' ? '🦅 Орёл' : '🔵 Решка'} — {win ? `Выигрыш +${bet} ₽!` : 'Проигрыш!'}
            </motion.div>
          )}
        </AnimatePresence>

        {phase !== 'flip' && (
          <>
            {/* Side choice */}
            <div className="flex gap-3 mb-5">
              <button
                onClick={() => setChoice('heads')}
                className={`flex-1 py-3 rounded-xl font-bold text-lg transition-all border-2 ${choice === 'heads' ? 'bg-yellow-400/10 border-yellow-400 text-yellow-400' : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:border-neutral-600'}`}
              >
                🦅 Орёл
              </button>
              <button
                onClick={() => setChoice('tails')}
                className={`flex-1 py-3 rounded-xl font-bold text-lg transition-all border-2 ${choice === 'tails' ? 'bg-blue-500/10 border-blue-400 text-blue-400' : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:border-neutral-600'}`}
              >
                🔵 Решка
              </button>
            </div>

            {/* Bet */}
            <div className="flex gap-2 justify-center mb-5">
              {BETS.map(b => (
                <button key={b} onClick={() => setBet(b)}
                  className={`px-3 py-2 rounded-lg text-sm font-bold transition-all ${bet === b ? 'bg-yellow-400 text-black' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'}`}>
                  {b}₽
                </button>
              ))}
            </div>

            {phase === 'bet' ? (
              <Button onClick={flip} disabled={balance < bet}
                className="w-full bg-yellow-400 text-black hover:bg-yellow-300 font-bold h-12 text-lg">
                Подбросить — {bet} ₽
              </Button>
            ) : (
              <Button onClick={reset}
                className="w-full bg-yellow-400 text-black hover:bg-yellow-300 font-bold h-11">
                Ещё раз
              </Button>
            )}
          </>
        )}

        {phase === 'flip' && (
          <p className="text-center text-neutral-400 font-bold animate-pulse">Монета в воздухе...</p>
        )}
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="mt-4">
          <p className="text-neutral-500 text-xs uppercase tracking-widest mb-2">История бросков</p>
          <div className="flex gap-2 flex-wrap">
            {history.map((h, i) => (
              <span key={i} className={`text-lg ${h.win ? 'opacity-100' : 'opacity-40'}`}>
                {h.side === 'heads' ? '🦅' : '🔵'}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
