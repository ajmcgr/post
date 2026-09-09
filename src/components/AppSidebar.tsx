import {
  Calendar,
  Layers,
  FileEdit,
  Clock,
  CheckCircle2,
  FileCheck,
  Settings,
  FileStack,
  Link2,
  HelpCircle,
  ListOrdered,
  PanelLeft,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "New post", url: "/dashboard", icon: FileEdit },
  { title: "Bulk post", url: "/dashboard/bulk-tools", icon: Layers },
  { title: "Calendar", url: "/dashboard/calendar", icon: Calendar },
  { title: "Queue", url: "/dashboard/queue", icon: ListOrdered },
  { title: "All posts", url: "/dashboard/posts", icon: FileStack },
  { title: "Scheduled", url: "/dashboard/scheduled", icon: Clock },
  { title: "Posted", url: "/dashboard/posted", icon: CheckCircle2 },
  { title: "Drafts", url: "/dashboard/drafts", icon: FileCheck },
  { title: "Social Platforms", url: "/dashboard/connections", icon: Link2 },
];

const footerItems = [
  { title: "Settings", url: "/dashboard/account/settings", icon: Settings },
  { title: "Help", url: "mailto:alex@trypost.ai", icon: HelpCircle },
];

const itemClasses =
  "h-10 rounded-xl px-4 gap-3 text-sm font-medium text-foreground/70 hover:bg-muted hover:text-foreground data-[active=true]:bg-foreground data-[active=true]:text-background data-[active=true]:font-semibold [&>svg]:!size-[18px] group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:!size-11 group-data-[collapsible=icon]:!p-2.5 group-data-[collapsible=icon]:justify-center";

const ctaItemClasses =
  "h-10 rounded-xl px-4 gap-3 text-sm font-semibold bg-brand-blue text-brand-blue-foreground hover:bg-brand-blue/90 shadow-sm [&>svg]:!size-[18px] group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:!size-11 group-data-[collapsible=icon]:!p-2.5 group-data-[collapsible=icon]:justify-center";

interface SidebarMenuProps {
  collapsed: boolean;
  isActive: (path: string) => boolean;
  onItemClick?: () => void;
  toggleSidebar: () => void;
}

function SidebarMenuContent({ collapsed, isActive, onItemClick, toggleSidebar }: SidebarMenuProps) {
  return (
    <>
      <SidebarContent className="gap-0">
        <SidebarMenu className="px-3 gap-1 pt-2 group-data-[collapsible=icon]:px-0">
          <SidebarMenuItem>
            <SidebarMenuButton onClick={toggleSidebar} className={itemClasses}>
              <PanelLeft />
              {!collapsed && <span className="text-xs">Collapse</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>

          {mainItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={isActive(item.url)}
                className={item.title === "New post" ? ctaItemClasses : itemClasses}
                onClick={onItemClick}
              >
                <NavLink to={item.url}>
                  <item.icon />
                  {!collapsed && <span>{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="pb-4">
        <SidebarMenu className="px-3 gap-1 group-data-[collapsible=icon]:px-0">
          {footerItems.map((item) => {
            const isExternal = item.url.startsWith("mailto:") || item.url.startsWith("http");
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={!isExternal && isActive(item.url)} className={itemClasses} onClick={onItemClick}>
                  {isExternal ? (
                    <a href={item.url}>
                      <item.icon />
                      {!collapsed && <span>{item.title}</span>}
                    </a>
                  ) : (
                    <NavLink to={item.url}>
                      <item.icon />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}

export function AppSidebar() {
  const { isMobile, state, toggleSidebar, openMobile, setOpenMobile } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";
  const isActive = (path: string) => currentPath === path;

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent
          data-sidebar="sidebar"
          data-mobile="true"
          className="w-[--sidebar-width] bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden"
          style={{ "--sidebar-width": "18rem" } as React.CSSProperties}
          side="left"
        >
          <div className="flex h-full w-full flex-col">
            <SidebarMenuContent
              collapsed={false}
              isActive={isActive}
              toggleSidebar={toggleSidebar}
              onItemClick={() => setOpenMobile(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      data-state={state}
      data-collapsible={state === "collapsed" ? "icon" : ""}
      className="group peer hidden text-sidebar-foreground md:flex flex-col border-r bg-sidebar shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] self-start"
      style={
        {
          width: collapsed ? "4rem" : "var(--sidebar-width)",
        } as React.CSSProperties
      }
    >
      <div className="flex h-full w-full flex-col">
        <SidebarMenuContent
          collapsed={collapsed}
          isActive={isActive}
          toggleSidebar={toggleSidebar}
        />
      </div>
    </div>
  );
}
