import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen overflow-hidden">
        {/* Sidebar */}
        <AppSidebar />

        {/* Main content adjusts automatically */}
        <main className="flex-1 overflow-y-auto bg-background transition-[width] duration-300">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
