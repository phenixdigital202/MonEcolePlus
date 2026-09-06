"use client"

import { DashboardSidebar } from "./sidebar"
import { X, Menu } from "lucide-react"
import { SidebarProvider, useSidebar } from "@/hooks/use-sidebar"

interface SidebarWrapperProps {
  userRole?: string
  userName?: string
  schoolName?: string
  userPoints?: number
  userLevel?: number
  children: React.ReactNode
}

export function SidebarWrapper(props: SidebarWrapperProps) {
  return (
    <SidebarProvider>
      <SidebarContent {...props} />
    </SidebarProvider>
  )
}

function SidebarContent({ 
  userRole, 
  userName, 
  schoolName, 
  userPoints,
  userLevel,
  children 
}: SidebarWrapperProps) {
  const { isOpen: sidebarOpen, setOpen: setSidebarOpen } = useSidebar()

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[16rem_1fr] print:block print:w-full print:min-h-0 print:bg-white">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden print:hidden no-print">
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-64 shadow-xl">
            <DashboardSidebar 
              userRole={userRole as any} 
              userName={userName} 
              schoolName={schoolName} 
              userPoints={userPoints}
              userLevel={userLevel}
            />
            <button
              className="absolute top-4 right-4 p-2 rounded-md hover:bg-muted"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Fermer</span>
            </button>
          </div>
        </div>
      )}

      {/* Desktop sidebar spacer (sidebar itself is fixed) */}
      <div className="hidden lg:block relative print:hidden no-print">
        <DashboardSidebar 
          userRole={userRole as any} 
          userName={userName} 
          schoolName={schoolName} 
          userPoints={userPoints}
          userLevel={userLevel}
        />
      </div>

      {/* Main content */}
      <div className="flex flex-col min-h-screen min-w-0 overflow-x-hidden print:block print:w-full print:min-h-0 print:overflow-visible print:p-0 print:m-0">
        {children}
      </div>
    </div>
  )
}
