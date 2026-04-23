import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Icon from '@/components/ui/icon'

const REGISTER_URL = 'https://functions.poehali.dev/9191acbb-a0f8-42a0-99b4-173db025be60'

interface RegisterModalProps {
  open: boolean
  onClose: () => void
}

export default function RegisterModal({ open, onClose }: RegisterModalProps) {
  const [form, setForm] = useState({ email: '', password: '', name: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch(REGISTER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    const data = await res.json()
    setLoading(false)
    if (data.success) {
      setSubmitted(true)
    } else {
      setError(data.error || 'Ошибка регистрации')
    }
  }

  const handleClose = () => {
    setSubmitted(false)
    setError('')
    setForm({ email: '', password: '', name: '' })
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div
            className="relative z-10 w-full max-w-md bg-neutral-950 border border-yellow-400/30 rounded-2xl p-8"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors"
            >
              <Icon name="X" size={20} />
            </button>

            {!submitted ? (
              <>
                <div className="mb-6">
                  <p className="text-yellow-400 text-sm font-semibold tracking-widest uppercase mb-2">🎰 Royal Casino</p>
                  <h2 className="text-white text-3xl font-bold leading-tight">Начни выигрывать</h2>
                  <p className="text-neutral-400 mt-2 text-sm">50 бесплатных вращений сразу после регистрации</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    type="text"
                    placeholder="Ваше имя"
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-yellow-400 h-12"
                  />
                  <Input
                    type="email"
                    placeholder="Email"
                    required
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-yellow-400 h-12"
                  />
                  <Input
                    type="password"
                    placeholder="Пароль"
                    required
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    className="bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-yellow-400 h-12"
                  />
                  {error && (
                    <p className="text-red-400 text-sm">{error}</p>
                  )}
                  <Button
                    type="submit"
                    size="lg"
                    disabled={loading}
                    className="w-full bg-yellow-400 text-black hover:bg-yellow-300 font-bold tracking-wide h-12 text-base disabled:opacity-60"
                  >
                    {loading ? 'Регистрация...' : 'Играть сейчас'}
                  </Button>
                </form>

                <p className="text-neutral-600 text-xs text-center mt-4">
                  Регистрируясь, вы подтверждаете, что вам исполнилось 18 лет
                </p>
              </>
            ) : (
              <motion.div
                className="text-center py-6"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="text-5xl mb-4">🎉</div>
                <h2 className="text-white text-2xl font-bold mb-2">Добро пожаловать, {form.name}!</h2>
                <p className="text-neutral-400 mb-6">Ваши 50 бесплатных вращений уже ждут вас.</p>
                <Button
                  onClick={handleClose}
                  className="bg-yellow-400 text-black hover:bg-yellow-300 font-bold px-8"
                >
                  Отлично!
                </Button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
