import { useEffect } from "react";
import { useNavigate, Outlet, NavLink } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { WorkspaceSwitcher } from "@/components/WorkspaceSwitcher";
import { NotificationsBell } from "@/components/NotificationsBell";
import { UserMenu } from "@/components/UserMenu";
import { initNotificationsPatch } from "@/lib/notifications";
import { Loader2 } from "lucide-react";
import postLogo from "@/assets/post-logo.png";
import { claimLaunchAttribution } from "@/lib/launchAttribution";
import { trackEvent } from "@/lib/analytics";

initNotificationsPatch();


const DashboardLayout = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    void claimLaunchAttribution()
      .then((claimed) => {
        if (claimed) trackEvent('launch_post_signup_completed', { campaign: 'post_launch_analytics' });
      })
      .catch((error) => console.warn('Could not claim Launch referral attribution:', error));
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col w-full bg-background">
        <header className="sticky top-0 z-50 bg-background h-14 flex items-center justify-between gap-2 px-4 shrink-0 border-b">
          <NavLink to="/dashboard" className="flex items-center">
            <img src={postLogo} alt="Post" className="h-7 w-auto object-contain" />
          </NavLink>
          <div className="flex items-center gap-2">
            <WorkspaceSwitcher />
            <NotificationsBell />
            <UserMenu />
          </div>
        </header>
        <div className="flex flex-1 min-w-0">
          <AppSidebar />
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
