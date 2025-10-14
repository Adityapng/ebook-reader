import { Calendar, Home, Inbox, Search, Settings } from "lucide-react";

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";

// Menu items.
const items = [
  {
    title: "Home",
    url: "#",
    icon: Home,
  },
  {
    title: "Inbox",
    url: "#",
    icon: Inbox,
  },
  {
    title: "Calendar",
    url: "#",
    icon: Calendar,
  },
  {
    title: "Search",
    url: "#",
    icon: Search,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
];

export function AppSidebar() {
  return (
    <div className="flex min-h-dvh">
        {/* Sidebar: on mobile this appears from the bottom; adjust height via mobileHeight */}
        <Sidebar mobileHeight="65svh">
          <SidebarHeader>
            <div className="px-2 text-sm font-medium">My App</div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Main</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Home">
                      <span>Home</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Analytics">
                      <span>Analytics</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarSeparator />

            <SidebarGroup>
              <SidebarGroupLabel>Team</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Team Overview">
                      <span>Team Overview</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            <div className="px-2 text-xs text-muted-foreground">v1.0.0</div>
          </SidebarFooter>
        </Sidebar>

        {/* Main content area */}
        {/* <SidebarInset className="flex flex-1 flex-col">
          <div className="flex h-12 items-center gap-2 border-b px-3">
            <SidebarTrigger />
            <div className="text-sm font-medium">Dashboard</div>
          </div>
          <main className="flex-1 p-4">
            <p className="text-sm text-muted-foreground">
              This is your main content. On mobile, open the menu with the trigger to see the bottom-sheet sidebar.
              Adjust its height via the Sidebar prop mobileHeight="60svh" | "65svh" | "70svh".
            </p>
          </main>
        </SidebarInset> */}
      </div>
  );
}
