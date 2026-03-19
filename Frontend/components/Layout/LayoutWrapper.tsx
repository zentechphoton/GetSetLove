'use client'

import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import Footer from './Footer'

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isDashboardPage = pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin') || pathname?.startsWith('/profile') || pathname?.startsWith('/matches') || pathname?.startsWith('/messages') || pathname?.startsWith('/settings') || pathname?.startsWith('/discover')

  if (isDashboardPage) {
    // Dashboard layout: fixed height, scrollable content, no footer
    return (
      <div className="flex flex-col h-screen w-full overflow-hidden">
        <Navbar />
        <div className="flex-1 flex overflow-hidden pt-[4.5rem] relative">
          <div className="flex-1 overflow-y-auto overflow-x-hidden w-full">
            {children}
          </div>
        </div>
      </div>
    )
  }

  // Normal layout: footer scrolls with content
  return (
    <div className="flex flex-col min-h-screen w-full overflow-x-hidden">
      <Navbar />
      <main className="flex-1 pt-[4.5rem] relative z-0 w-full overflow-x-hidden">
        {children}
      </main>
      <Footer />
    </div>
  )
}

