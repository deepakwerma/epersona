"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import {
  Sidebar as SidebarPrimitive,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  SquarePen,
  MessageSquare,
  Settings,
  LogOut,
  BadgeCheck,
  ChevronsUpDown,
} from "lucide-react";

type ChatHistoryItem = { id: string; title: string };
const CHAT_HISTORY: ChatHistoryItem[] = [];

function ProfileFooter() {
  const { user } = useUser();
  const { signOut } = useClerk();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger render={<SidebarMenuButton size="lg" />}>
            <Avatar className="h-6 w-6 rounded-md">
              <AvatarImage
                src={user?.imageUrl}
                alt={user?.fullName ?? "User"}
              />
              <AvatarFallback className="rounded-md text-xs">
                {user?.fullName?.[0] ?? "U"}
              </AvatarFallback>
            </Avatar>
            <span className="truncate">{user?.fullName ?? "Account"}</span>
            <ChevronsUpDown className="ml-auto h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-56">
            <DropdownMenuItem>
              <BadgeCheck className="h-4 w-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="h-4 w-4" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()}>
              <LogOut className="h-4 w-4" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export function AppSidebar() {
  return (
    <SidebarPrimitive collapsible="icon">
      <SidebarHeader className="px-3 py-3">
        <span className="font-heading text-lg font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
          e Persona
        </span>
        <span className="hidden font-heading text-lg font-semibold group-data-[collapsible=icon]:block">
          eP
        </span>
      </SidebarHeader>

      <SidebarContent>
        <div className="px-2 pt-1">
          <Button
            variant="secondary"
            className="w-full justify-start gap-2 group-data-[collapsible=icon]:justify-center"
          >
            <SquarePen className="h-4 w-4" />
            <span className="group-data-[collapsible=icon]:hidden">
              New chat
            </span>
          </Button>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Chats</SidebarGroupLabel>
          <SidebarMenu>
            {CHAT_HISTORY.map((chat) => (
              <SidebarMenuItem key={chat.id}>
                <SidebarMenuButton>
                  <MessageSquare className="h-4 w-4" />
                  <span>{chat.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <ProfileFooter />
      </SidebarFooter>
    </SidebarPrimitive>
  );
}

export { SidebarProvider, SidebarTrigger };
