import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sabor Gourmet',
  description: 'Cardápio digital',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-gray-50">{children}</body>
    </html>
  )
}
