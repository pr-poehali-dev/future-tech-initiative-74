import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'

const GRID_SIZE = 25
const BETS = [10, 25, 50, 100, 200]
const MINE_COUNTS = [3, 5, 10, 15]

function generateMines(count: number, exclude: number): Set<number> {
  const mines = new Set<number>()
  while (mines.size < count) {
    const idx = Math.floor(Math.random() * GRID_SIZE)
    if (idx !== exclude) mines.add(idx)
  }
  return mines
}

function getMultiplier(revealed: number, mines: number): number {
  const safe = GRID_SIZE - mines
  let mult = 1
  for (let i = 0; i < revealed; i++) {
    mult *= (safe - i) / (GRID_SIZE - i)
  }
  return Math.max(1, +(1 / mult * 0.97).toFixed(2))
}

interface Props { balance: number; setBalance: (b: number) => void }

type Phase = 'bet' | 'play' | 'result'
type CellState = 'hidden' | 'gem' | 'mine'

export default function Mines({ balance, setBalance }: Props) {
  const [bet, setBet] = useState(25)
  const [mineCount, setMineCount] = useState(5)
  const [phase, setPhase] = useState<Phase>('bet')
  const [cells, setCells] = useState<CellState[]>(Array(GRID_SIZE).fill('hidden'))
  const [mines, setMines] = useState<Set<number>>(new Set())
  const [revealed, setRevealed] = useState(0)
  const [multiplier, setMultiplier] = useState(1)
  const [message, setMessage] = useState('')
  const [win, setWin] = useState(false)

  const startGame = () => {
    if (balance < bet) return
    setBalance(balance - bet)
    setCells(Array(GRID_SIZE).fill('hidden'))
    setRevealed(0)
    setMultiplier(1)
    setMessage('')
    setWin(false)
    setMines(new Set())
    setPhase('play')
  }

  const clickCell = (idx: number) => {
    if (phase !== 'play' || cells[idx] !== 'hidden') return

    let m = mines
    if (m.size === 0) {
      m = generateMines(mineCount, idx)
      setMines(m)
    }

    const newCells = [...cells]
    if (m.has(idx)) {
      // Reveal all mines
      m.forEach(mi => { newCells[mi] = 'mine' })
      newCells[idx] = 'mine'
      setCells(newCells)
      setMessage('💥 Взрыв! Вы потеряли ставку.')
      setWin(false)
      setPhase('result')
    } else {
      newCells[idx] = 'gem'
      const newRevealed = revealed + 1
      setCells(newCells)
      setRevealed(newRevealed)
      const mult = getMultiplier(newRevealed, mineCount)
      setMultiplier(mult)

      if (newRevealed === GRID_SIZE - mineCount) {
        const winAmount = Math.floor(bet * mult)
        setBalance(balance - bet + winAmount)
        setMessage(`🏆 Все алмазы найдены! +${winAmount} ₽`)
        setWin(true)
        setPhase('result')
      }
    }
  }

  const cashOut = () => {
    const winAmount = Math.floor(bet * multiplier)
    setBalance(balance - bet + winAmount)
    const newCells = [...cells]
    mines.forEach(mi => { newCells[mi] = 'mine' })
    setCells(newCells)
    setMessage(`✅ Забрал выигрыш! +${winAmount} ₽`)
    setWin(true)
    setPhase('result')
  }

  const reset = () => {
    setPhase('bet')
    setCells(Array(GRID_SIZE).fill('hidden'))
    setRevealed(0)
    setMultiplier(1)
    setMessage('')
    setMines(new Set())
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-1">💣 Mines</h2>
        <p className="text-neutral-400 text-sm">Открывай алмазы — избегай мин</p>
      </div>

      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6">
        {phase === 'bet' ? (
          <div>
            <p className="text-neutral-500 text-xs uppercase tracking-widest mb-2">Количество мин</p>
            <div className="flex gap-2 mb-5">
              {MINE_COUNTS.map(m => (
                <button key={m} onClick={() => setMineCount(m)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${mineCount === m ? 'bg-red-500 text-white' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'}`}>
                  {m} 💣
                </button>
              ))}
            </div>
            <p className="text-neutral-500 text-xs uppercase tracking-widest mb-2">Ставка</p>
            <div className="flex gap-2 mb-5">
              {BETS.map(b => (
                <button key={b} onClick={() => setBet(b)}
                  className={`px-3 py-2 rounded-lg text-sm font-bold transition-all ${bet === b ? 'bg-yellow-400 text-black' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'}`}>
                  {b}₽
                </button>
              ))}
            </div>
            <Button onClick={startGame} disabled={balance < bet}
              className="w-full bg-yellow-400 text-black hover:bg-yellow-300 font-bold h-12 text-lg">
              Начать — {bet} ₽
            </Button>
          </div>
        ) : (
          <>
            {phase === 'play' && revealed > 0 && (
              <div className="flex items-center justify-between mb-4">
                <span className="text-neutral-400 text-sm">Множитель: <span className="text-yellow-400 font-bold text-lg">x{multiplier}</span></span>
                <Button onClick={cashOut} size="sm"
                  className="bg-green-500 hover:bg-green-400 text-white font-bold">
                  Забрать +{Math.floor(bet * multiplier)} ₽
                </Button>
              </div>
            )}

            <div className="grid grid-cols-5 gap-2 mb-4">
              {cells.map((state, i) => (
                <motion.button
                  key={i}
                  onClick={() => clickCell(i)}
                  disabled={state !== 'hidden' || phase === 'result'}
                  className={`h-14 rounded-xl text-2xl font-bold transition-all border ${
                    state === 'hidden'
                      ? 'bg-neutral-800 border-neutral-700 hover:bg-neutral-700 hover:border-yellow-400/40 cursor-pointer'
                      : state === 'gem'
                      ? 'bg-blue-900/40 border-blue-500/50 cursor-default'
                      : 'bg-red-900/40 border-red-500/50 cursor-default'
                  }`}
                  whileHover={state === 'hidden' && phase === 'play' ? { scale: 1.05 } : {}}
                  whileTap={state === 'hidden' && phase === 'play' ? { scale: 0.95 } : {}}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.01 }}
                >
                  {state === 'gem' ? '💎' : state === 'mine' ? '💣' : ''}
                </motion.button>
              ))}
            </div>

            <AnimatePresence>
              {message && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  className={`text-center py-3 rounded-xl font-bold mb-3 ${win ? 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/30' : 'bg-red-900/20 text-red-400 border border-red-500/30'}`}>
                  {message}
                </motion.div>
              )}
            </AnimatePresence>

            {phase === 'result' && (
              <Button onClick={reset} className="w-full bg-yellow-400 text-black hover:bg-yellow-300 font-bold h-11">
                Играть снова
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
