import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Slots from '@/components/games/Slots'
import Roulette from '@/components/games/Roulette'
import Blackjack from '@/components/games/Blackjack'
import Icon from '@/components/ui/icon'

type GameId = 'slots' | 'roulette' | 'blackjack'

const GAMES = [
  { id: 'slots' as GameId, name: 'Слоты', emoji: '🎰', desc: 'Крути барабаны' },
  { id: 'roulette' as GameId, name: 'Рулетка', emoji: '🎡', desc: 'Ставь на число' },
  { id: 'blackjack' as GameId, name: 'Блэкджек', emoji: '🃏', desc: '21 — твоя цель' },
]

export default function Games() {
  const [balance, setBalance] = useState(1000)
  const [activeGame, setActiveGame] = useState<GameId | null>(null)

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-neutral-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="/" className="text-neutral-500 hover:text-white transition-colors">
            <Icon name="ArrowLeft" size={20} />
          </a>
          <span className="text-yellow-400 font-bold text-lg tracking-wide">🎰 Royal Casino</span>
        </div>
        <div className="flex items-center gap-2 bg-neutral-900 border border-yellow-400/30 rounded-xl px-4 py-2">
          <Icon name="Coins" size={16} className="text-yellow-400" />
          <span className="text-yellow-400 font-bold">{balance.toLocaleString()} ₽</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {!activeGame ? (
          <>
            <motion.h1
              className="text-4xl font-bold mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Выбери игру
            </motion.h1>
            <p className="text-neutral-400 mb-10">Демо-режим · Виртуальный баланс: {balance.toLocaleString()} ₽</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {GAMES.map((game, i) => (
                <motion.button
                  key={game.id}
                  onClick={() => setActiveGame(game.id)}
                  className="group bg-neutral-950 border border-neutral-800 hover:border-yellow-400/50 rounded-2xl p-8 text-left transition-all"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="text-5xl mb-4">{game.emoji}</div>
                  <h2 className="text-xl font-bold mb-1 group-hover:text-yellow-400 transition-colors">{game.name}</h2>
                  <p className="text-neutral-500 text-sm">{game.desc}</p>
                </motion.button>
              ))}
            </div>
          </>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeGame}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <button
                onClick={() => setActiveGame(null)}
                className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-6"
              >
                <Icon name="ArrowLeft" size={16} />
                <span>Все игры</span>
              </button>
              {activeGame === 'slots' && <Slots balance={balance} setBalance={setBalance} />}
              {activeGame === 'roulette' && <Roulette balance={balance} setBalance={setBalance} />}
              {activeGame === 'blackjack' && <Blackjack balance={balance} setBalance={setBalance} />}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
