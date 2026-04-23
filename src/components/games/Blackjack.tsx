import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'

const SUITS = ['♠', '♥', '♦', '♣']
const VALUES = ['2','3','4','5','6','7','8','9','10','J','Q','K','A']

interface Card { suit: string; value: string }

function makeDeck(): Card[] {
  const deck: Card[] = []
  for (const suit of SUITS) for (const value of VALUES) deck.push({ suit, value })
  return deck.sort(() => Math.random() - 0.5)
}

function cardScore(value: string): number {
  if (['J','Q','K'].includes(value)) return 10
  if (value === 'A') return 11
  return parseInt(value)
}

function handScore(cards: Card[]): number {
  let score = cards.reduce((s, c) => s + cardScore(c.value), 0)
  let aces = cards.filter(c => c.value === 'A').length
  while (score > 21 && aces > 0) { score -= 10; aces-- }
  return score
}

const BETS = [10, 25, 50, 100, 200]
const isRed = (suit: string) => suit === '♥' || suit === '♦'

function CardUI({ card, hidden }: { card: Card; hidden?: boolean }) {
  return (
    <motion.div
      initial={{ rotateY: 90, opacity: 0 }}
      animate={{ rotateY: 0, opacity: 1 }}
      className={`w-16 h-24 rounded-xl border flex flex-col items-center justify-between p-2 text-sm font-bold select-none ${
        hidden ? 'bg-blue-900 border-blue-700' :
        isRed(card.suit) ? 'bg-white border-neutral-300 text-red-600' : 'bg-white border-neutral-300 text-neutral-900'
      }`}
    >
      {hidden ? (
        <span className="text-2xl text-blue-400">?</span>
      ) : (
        <>
          <span className="self-start">{card.value}</span>
          <span className="text-2xl">{card.suit}</span>
          <span className="self-end rotate-180">{card.value}</span>
        </>
      )}
    </motion.div>
  )
}

interface Props { balance: number; setBalance: (b: number) => void }

type Phase = 'bet' | 'play' | 'result'

export default function Blackjack({ balance, setBalance }: Props) {
  const [bet, setBet] = useState(25)
  const [phase, setPhase] = useState<Phase>('bet')
  const [deck, setDeck] = useState<Card[]>([])
  const [playerCards, setPlayerCards] = useState<Card[]>([])
  const [dealerCards, setDealerCards] = useState<Card[]>([])
  const [message, setMessage] = useState('')
  const [win, setWin] = useState(false)

  const deal = () => {
    if (balance < bet) return
    const d = makeDeck()
    const p = [d.pop()!, d.pop()!]
    const dealer = [d.pop()!, d.pop()!]
    setDeck(d)
    setPlayerCards(p)
    setDealerCards(dealer)
    setPhase('play')
    setBalance(balance - bet)
    setMessage('')
  }

  const hit = () => {
    const d = [...deck]
    const card = d.pop()!
    const newCards = [...playerCards, card]
    setDeck(d)
    setPlayerCards(newCards)
    const score = handScore(newCards)
    if (score > 21) {
      setMessage('Перебор! Дилер победил.')
      setWin(false)
      setPhase('result')
    }
  }

  const stand = () => {
    const d = [...deck]
    const dc = [...dealerCards]
    while (handScore(dc) < 17) dc.push(d.pop()!)
    setDeck(d)
    setDealerCards(dc)

    const ps = handScore(playerCards)
    const ds = handScore(dc)

    let msg = ''
    let didWin = false
    if (ds > 21 || ps > ds) {
      msg = `Вы победили! ${ps} vs ${ds}`
      didWin = true
      setBalance(balance - bet + bet * 2)
    } else if (ps === ds) {
      msg = `Ничья! ${ps} vs ${ds}`
      setBalance(balance - bet + bet)
    } else {
      msg = `Дилер победил! ${ps} vs ${ds}`
    }
    setMessage(msg)
    setWin(didWin)
    setPhase('result')
  }

  const reset = () => {
    setPhase('bet')
    setPlayerCards([])
    setDealerCards([])
    setMessage('')
  }

  const playerScore = handScore(playerCards)
  const dealerScore = phase === 'result' ? handScore(dealerCards) : (dealerCards[0] ? cardScore(dealerCards[0].value) : 0)

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-1">🃏 Блэкджек</h2>
        <p className="text-neutral-400 text-sm">Набери 21 — обыграй дилера</p>
      </div>

      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6">
        {phase === 'bet' ? (
          <div className="text-center">
            <p className="text-neutral-400 mb-6">Сделай ставку и начни игру</p>
            <div className="flex gap-2 justify-center mb-6">
              {BETS.map(b => (
                <button
                  key={b}
                  onClick={() => setBet(b)}
                  className={`px-3 py-2 rounded-lg text-sm font-bold transition-all ${bet === b ? 'bg-yellow-400 text-black' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'}`}
                >
                  {b}₽
                </button>
              ))}
            </div>
            <Button
              onClick={deal}
              disabled={balance < bet}
              className="w-full bg-yellow-400 text-black hover:bg-yellow-300 font-bold h-12 text-lg"
            >
              Раздать карты — {bet} ₽
            </Button>
          </div>
        ) : (
          <>
            {/* Dealer */}
            <div className="mb-6">
              <p className="text-neutral-500 text-xs uppercase tracking-widest mb-3">
                Дилер {phase === 'result' ? `— ${dealerScore}` : ''}
              </p>
              <div className="flex gap-2 flex-wrap">
                {dealerCards.map((card, i) => (
                  <CardUI key={i} card={card} hidden={phase === 'play' && i === 1} />
                ))}
              </div>
            </div>

            {/* Player */}
            <div className="mb-6">
              <p className="text-neutral-500 text-xs uppercase tracking-widest mb-3">
                Вы — {playerScore} {playerScore === 21 ? '🎉' : playerScore > 21 ? '💥' : ''}
              </p>
              <div className="flex gap-2 flex-wrap">
                <AnimatePresence>
                  {playerCards.map((card, i) => (
                    <CardUI key={i} card={card} />
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Result message */}
            {message && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`text-center py-3 px-4 rounded-xl mb-4 font-bold ${win ? 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/30' : 'bg-neutral-800 text-neutral-400'}`}
              >
                {message}
              </motion.div>
            )}

            {/* Actions */}
            {phase === 'play' ? (
              <div className="flex gap-3">
                <Button
                  onClick={hit}
                  className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold h-11"
                >
                  Ещё карту
                </Button>
                <Button
                  onClick={stand}
                  variant="outline"
                  className="flex-1 border-yellow-400/40 text-yellow-400 hover:bg-yellow-400/10 font-bold h-11"
                >
                  Хватит
                </Button>
              </div>
            ) : (
              <Button
                onClick={reset}
                className="w-full bg-yellow-400 text-black hover:bg-yellow-300 font-bold h-11"
              >
                Играть снова
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
