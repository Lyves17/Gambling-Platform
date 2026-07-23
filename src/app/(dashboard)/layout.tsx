import Sidebar from '@/components/Sidebar' // Default export
import { Navbar } from '@/components/layout/Navbar'
import GlobalChat from '@/components/chat/GlobalChat'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-black">
      {/* Sidebar - Fixed on desktop, overlay on mobile */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-h-screen">
        {/* Navbar as Top Header */}
        <Navbar variant="dashboard" />
        
        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 pt-6 relative overflow-hidden">
             {/* Background Gradients */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-background to-background z-0 pointer-events-none" />
            
            <div className="relative z-10">
                {children}
            </div>
        </main>
      </div>
      
      {/* Global Chat Overlay */}
      <GlobalChat />
    </div>
  )
}
