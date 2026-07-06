import { AppSidebar, SidebarProvider } from "@/components/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-dvh w-full">
        <AppSidebar />
        <div className="h-full min-w-0 flex-1">{children}</div>
      </div>
    </SidebarProvider>
  );
}
