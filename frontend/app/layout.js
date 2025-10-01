import '../src/index.css'
import StoreProvider from '../src/components/StoreProvider'

export const metadata = {
  title: 'GenieLearn - Your Learning Platform',
  description: 'A real-time learning platform that enables students to form study groups, participate in discussions, and collaborate on learning materials.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans">
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  )
}
