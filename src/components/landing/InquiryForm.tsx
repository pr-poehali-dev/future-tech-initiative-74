import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const SEND_INQUIRY_URL = 'https://functions.poehali.dev/3e485c8d-6bf9-4c8b-b396-2229952cee91'

interface InquiryFormProps {
  isActive: boolean
}

export default function InquiryForm({ isActive }: InquiryFormProps) {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch(SEND_INQUIRY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    const data = await res.json()
    setLoading(false)
    if (data.success) {
      setSent(true)
    } else {
      setError(data.error || 'Ошибка отправки, попробуйте снова')
    }
  }

  return (
    <motion.div
      className="mt-10 w-full max-w-md"
      initial={{ opacity: 0, y: 40 }}
      animate={isActive ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      {!sent ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-3">
            <Input
              type="text"
              placeholder="Ваше имя"
              required
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="bg-white/5 border-white/10 text-white placeholder:text-neutral-500 focus:border-yellow-400 h-11"
            />
            <Input
              type="email"
              placeholder="Email"
              required
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="bg-white/5 border-white/10 text-white placeholder:text-neutral-500 focus:border-yellow-400 h-11"
            />
          </div>
          <Textarea
            placeholder="Сообщение (необязательно)"
            value={form.message}
            onChange={e => setForm({ ...form, message: e.target.value })}
            rows={3}
            className="bg-white/5 border-white/10 text-white placeholder:text-neutral-500 focus:border-yellow-400 resize-none"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-400 text-black hover:bg-yellow-300 font-bold h-11 tracking-wide disabled:opacity-60"
          >
            {loading ? 'Отправляем...' : 'Отправить заявку'}
          </Button>
        </form>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="border border-yellow-400/30 rounded-xl p-6 text-center"
        >
          <div className="text-3xl mb-3">✅</div>
          <p className="text-white font-bold text-lg">Заявка отправлена!</p>
          <p className="text-neutral-400 text-sm mt-1">Мы свяжемся с вами в ближайшее время.</p>
        </motion.div>
      )}
    </motion.div>
  )
}
