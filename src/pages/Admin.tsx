import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Icon from '@/components/ui/icon'

const GET_PLAYERS_URL = 'https://functions.poehali.dev/0c0bedba-09fa-41eb-9a4d-02c9fd24a258'

interface Player {
  id: number
  name: string
  email: string
  created_at: string
}

export default function Admin() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [players, setPlayers] = useState<Player[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchPlayers = async (pwd: string) => {
    setLoading(true)
    setError('')
    const res = await fetch(GET_PLAYERS_URL, {
      headers: { 'X-Admin-Password': pwd }
    })
    const data = await res.json()
    setLoading(false)
    if (res.status === 401) {
      setError('Неверный пароль')
      return
    }
    setPlayers(data.players)
    setTotal(data.total)
    setAuthed(true)
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    fetchPlayers(password)
  }

  const handleRefresh = () => fetchPlayers(password)

  if (!authed) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-neutral-950 border border-yellow-400/30 rounded-2xl p-8">
          <p className="text-yellow-400 text-sm font-semibold tracking-widest uppercase mb-2">🎰 Royal Casino</p>
          <h1 className="text-white text-2xl font-bold mb-6">Админ-панель</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="password"
              placeholder="Пароль администратора"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-yellow-400 h-12"
              required
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-400 text-black hover:bg-yellow-300 font-bold h-12"
            >
              {loading ? 'Проверка...' : 'Войти'}
            </Button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-yellow-400 text-sm font-semibold tracking-widest uppercase mb-1">🎰 Royal Casino</p>
            <h1 className="text-3xl font-bold">Игроки</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-neutral-400 text-sm">Всего: <span className="text-white font-bold">{total}</span></span>
            <Button
              onClick={handleRefresh}
              variant="outline"
              className="border-yellow-400/40 text-yellow-400 hover:bg-yellow-400/10"
              disabled={loading}
            >
              <Icon name="RefreshCw" size={16} />
              <span className="ml-2">Обновить</span>
            </Button>
          </div>
        </div>

        <div className="border border-neutral-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-900 border-b border-neutral-800">
                <th className="text-left px-6 py-4 text-neutral-400 font-medium text-sm">#</th>
                <th className="text-left px-6 py-4 text-neutral-400 font-medium text-sm">Имя</th>
                <th className="text-left px-6 py-4 text-neutral-400 font-medium text-sm">Email</th>
                <th className="text-left px-6 py-4 text-neutral-400 font-medium text-sm">Дата регистрации</th>
              </tr>
            </thead>
            <tbody>
              {players.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-16 text-neutral-500">
                    Пока нет ни одного игрока
                  </td>
                </tr>
              ) : (
                players.map((p, i) => (
                  <tr
                    key={p.id}
                    className="border-b border-neutral-800/60 hover:bg-neutral-900/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-neutral-500 text-sm">{i + 1}</td>
                    <td className="px-6 py-4 font-medium">{p.name}</td>
                    <td className="px-6 py-4 text-neutral-300">{p.email}</td>
                    <td className="px-6 py-4 text-neutral-400 text-sm">{p.created_at}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
