import { Badge } from "@/components/ui/badge"

export const sections = [
  {
    id: 'hero',
    subtitle: <Badge variant="outline" className="text-yellow-400 border-yellow-400">🎰 Регистрация открыта</Badge>,
    title: "Испытай удачу. Сорви куш.",
    showButton: true,
    buttonText: 'Играть сейчас'
  },
  {
    id: 'about',
    title: 'Почему Royal Casino?',
    content: 'Лицензированное казино с моментальными выплатами, честными играми и круглосуточной поддержкой. Ваша безопасность — наш приоритет.'
  },
  {
    id: 'features',
    title: 'Более 1000 игр',
    content: 'Слоты, рулетка, блэкджек, покер и live-дилеры — всё в одном месте. Новые игры каждую неделю от лучших мировых провайдеров.'
  },
  {
    id: 'testimonials',
    title: 'Бонусы и акции',
    content: 'Приветственный бонус 200% на первый депозит, еженедельный кэшбэк 15% и программа лояльности с VIP-привилегиями для постоянных игроков.'
  },
  {
    id: 'join',
    title: 'Остались вопросы?',
    content: 'Напишите нам — ответим быстро и поможем начать.',
    showForm: true,
  },
]