import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'

const BETS = [10, 25, 50, 100, 200]

type Phase = 'bet' | 'show' | 'shuffle' | 'guess' | 'result'

export default function Cups({ balance, setBalance }: { balance: number; setBalance: (b: number) => void }) {
  const [bet, setBet] = useState(25)
  const [phase, setPhase] = useState<Phase>('bet')
  const [ballPos, setBallPos] = useState(0)
  const [positions, setPositions] = useState([0, 1, 2])
  const [lifted, setLifted] = useState<number | null>(null)
  const [chosen, setChosen] = useState<number | null>(null)
  const [win, setWin] = useState(false)
  const [shuffleStep, setShuffleStep] = useState(0)

  const startGame = () => {
    if (balance < bet) return
    setBalance(balance - bet)
    const ball = Math.floor(Math.random() * 3)
    setBallPos(ball)
    setPositions([0, 1, 2])
    setLifted(ball)
    setChosen(null)
    setWin(false)
    setShuffleStep(0)
    setPhase('show')

    // Hide ball and start shuffle after showing
    setTimeout(() => {
      setLifted(null)
      setTimeout(() => doShuffle(ball, [0, 1, 2]), 600)
    }, 1200)
  }

  const doShuffle = (ball: number, pos: number[]) => {
    setPhase('shuffle')
    const shuffles = 6 + Math.floor(Math.random() * 4)
    const current = [...pos]
    let currentBall = ball
    let step = 0

    const doStep = () => {
      if (step >= shuffles) {
        setBallPos(currentBall)
        setPositions(current)
        setPhase('guess')
        return
      }
      const i = Math.floor(Math.random() * 3)
      let j = Math.floor(Math.random() * 2)
      if (j >= i) j++
      ;[current[i], current[j]] = [current[j], current[i]]
      if (currentBall === i) currentBall = j
      else if (currentBall === j) currentBall = i
      setPositions([...current])
      setShuffleStep(s => s + 1)
      step++
      setTimeout(doStep, 280)
    }
    doStep()
  }

  const guess = (idx: number) => {
    if (phase !== 'guess') return
    setChosen(idx)
    setLifted(idx)
    const didWin = idx === ballPos

    setTimeout(() => {
      if (!didWin) setLifted(ballPos)
      setTimeout(() => {
        setWin(didWin)
        if (didWin) setBalance(balance - bet + bet * 3)
        setPhase('result')
      }, 600)
    }, 400)
  }

  const reset = () => {
    setPhase('bet')
    setLifted(null)
    setChosen(null)
    setPositions([0, 1, 2])
  }

  const cupOrder = positions.map((originalIdx, visualPos) => ({ originalIdx, visualPos }))
    .sort((a, b) => a.originalIdx - b.originalIdx)

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-1">🎩 Стаканчики</h2>
        <p className="text-neutral-400 text-sm">Следи за шариком и угадай стакан</p>
      </div>

      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-8">
        {/* Game field */}
        <div className="flex justify-center gap-8 mb-10 min-h-[140px] items-end relative">
          {[0, 1, 2].map(visualPos => {
            const originalIdx = positions[visualPos]
            const isLifted = lifted === originalIdx
            const isChosen = chosen === originalIdx
            const hasBall = ballPos === originalIdx

            return (
              <motion.div
                key={originalIdx}
                className="flex flex-col items-center gap-2"
                animate={{ x: (positions[visualPos] - visualPos) * 0 }}
                layout
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                {/* Ball */}
                <AnimatePresence>
                  {isLifted && hasBall && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      className="w-8 h-8 rounded-full bg-yellow-400 shadow-lg shadow-yellow-400/40"
                    />
                  )}
                </AnimatePresence>

                {/* Cup */}
                <motion.button
                  onClick={() => guess(originalIdx)}
                  disabled={phase !== 'guess'}
                  animate={{ y: isLifted ? -40 : 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  whileHover={phase === 'guess' ? { scale: 1.05, y: -8 } : {}}
                  whileTap={phase === 'guess' ? { scale: 0.95 } : {}}
                  className={`text-7xl leading-none cursor-pointer transition-all ${phase !== 'guess' ? 'cursor-default' : ''} ${isChosen && phase === 'result' ? (win ? 'drop-shadow-[0_0_12px_rgba(250,204,21,0.8)]' : 'drop-shadow-[0_0_12px_rgba(239,68,68,0.8)]') : ''}`}
                >
                  🎩
                </motion.button>

                {phase === 'guess' && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-neutral-500"
                  >
                    Нажми
                  </motion.span>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Status */}
        <div className="text-center mb-6 min-h-[32px]">
          {phase === 'bet' && <p className="text-neutral-400">Сделай ставку и начни игру</p>}
          {phase === 'show' && <p className="text-yellow-400 font-bold">Запоминай, под каким стаканом шарик!</p>}
          {phase === 'shuffle' && <p className="text-neutral-300 font-bold">Следи внимательно... 👀</p>}
          {phase === 'guess' && <p className="text-white font-bold text-lg">Где шарик? Выбирай!</p>}
          {phase === 'result' && (
            <motion.p
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`font-bold text-lg ${win ? 'text-yellow-400' : 'text-red-400'}`}
            >
              {win ? `🎉 Правильно! +${bet * 3} ₽` : '❌ Не угадал!'}
            </motion.p>
          )}
        </div>

        {phase === 'bet' ? (
          <>
            <div className="flex gap-2 justify-center mb-5">
              {BETS.map(b => (
                <button key={b} onClick={() => setBet(b)}
                  className={`px-3 py-2 rounded-lg text-sm font-bold transition-all ${bet === b ? 'bg-yellow-400 text-black' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'}`}>
                  {b}₽
                </button>
              ))}
            </div>
            <Button onClick={startGame} disabled={balance < bet}
              className="w-full bg-yellow-400 text-black hover:bg-yellow-300 font-bold h-12 text-lg">
              Играть — {bet} ₽ (выигрыш x3)
            </Button>
          </>
        ) : phase === 'result' ? (
          <Button onClick={reset} className="w-full bg-yellow-400 text-black hover:bg-yellow-300 font-bold h-11">
            Играть снова
          </Button>
        ) : null}
      </div>
    </div>
  )
}
