import { Navbar } from '@/components/layout/Navbar'
import { Toaster } from '@/components/ui/sonner'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container py-6">
        {children}
      </main>
      <Toaster richColors position="top-right" />
    </div>
  )
}
