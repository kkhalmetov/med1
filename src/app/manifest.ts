import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Qadam — каждый шаг под контролем',
    short_name: 'Qadam',
    description: 'Цифровое сопровождение после выдачи протеза или ортеза',
    start_url: '/ru',
    display: 'standalone',
    background_color: '#f4f7f4',
    theme_color: '#0b5d4b',
    lang: 'ru',
    icons: [
      {
        src: '/icons/qadam.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icons/qadam-maskable.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  }
}
