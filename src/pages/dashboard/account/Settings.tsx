import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useSubscription } from "@/hooks/useSubscription";
import { trackEvent } from "@/lib/analytics";

const TAB_LIST = ["profile", "team", "integrations", "notifications", "account", "billing"] as const;

const Settings = () => {
  const { user, signOut } = useAuth();
  const { plan, status } = useSubscription();
  const [tab, setTab] = useState<(typeof TAB_LIST)[number]>("profile");

  // Profile
  const initialHandle = (user?.email?.split("@")[0] ?? "").toLowerCase();
  const [username, setUsername] = useState(initialHandle);
  const [newPassword, setNewPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Notifications
  const [emailConnectionSuccess, setEmailConnectionSuccess] = useState(true);
  const [emailPostFail, setEmailPostFail] = useState(true);
  const [savingNotifications, setSavingNotifications] = useState(false);

  // Account
  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("notification_preferences")
      .select("connection_success,post_failed")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setEmailConnectionSuccess(data.connection_success);
          setEmailPostFail(data.post_failed);
        }
      });
  }, [user]);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      if (newPassword) {
        if (newPassword.length < 6) {
          toast.error("Password must be at least 6 characters");
          setSavingProfile(false);
          return;
        }
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
        setNewPassword("");
      }
      const { error: profileError } = await supabase.auth.updateUser({
        data: { username: username.trim().replace(/^@/, "") },
      });
      if (profileError) throw profileError;
      toast.success("Profile saved");
    } catch (e: any) {
      toast.error(e.message || "Failed to save profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleManageBilling = async () => {
    trackEvent("billing_portal_opened", { plan });
    const { data, error } = await supabase.functions.invoke("customer-portal");
    if (error || !data?.url) {
      toast.error(data?.error || error?.message || "Unable to open billing");
      return;
    }
    window.location.assign(data.url);
  };

  const handleSaveNotifications = async () => {
    if (!user) return;
    setSavingNotifications(true);
    const { error } = await supabase.from("notification_preferences").upsert({
      user_id: user.id,
      connection_success: emailConnectionSuccess,
      post_failed: emailPostFail,
      updated_at: new Date().toISOString(),
    });
    setSavingNotifications(false);
    if (error) toast.error("Failed to save notification preferences");
    else toast.success("Notification preferences saved");
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      const { error } = await supabase.rpc("delete_user");
      if (error) throw error;
      toast.success("Account deleted");
      await signOut();
    } catch (e: any) {
      toast.error(e.message || "Failed to delete account");
    } finally {
      setDeletingAccount(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-10 max-w-4xl">
      <h1 className="text-4xl mb-8 font-serif">Settings</h1>

      <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
        <div className="mb-6">
          <TabsList className="bg-muted/60 rounded-xl p-1 h-auto">
            {TAB_LIST.map((t) => (
              <TabsTrigger
                key={t}
                value={t}
                className="rounded-xl px-5 py-2 text-sm capitalize data-[state=active]:bg-foreground data-[state=active]:text-background"
              >
                {t}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="profile">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div>
                <h2 className="font-semibold mb-1">Profile</h2>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="flex items-center rounded-xl border bg-background px-3">
                  <span className="text-muted-foreground text-sm">@</span>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="border-0 focus-visible:ring-0 shadow-none px-2"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Leave blank to keep current"
                />
              </div>
              <Button onClick={handleSaveProfile} disabled={savingProfile}>
                {savingProfile ? "Saving..." : "Save profile"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="font-semibold">Team</h2>
              <p className="text-sm text-muted-foreground">
                Invite teammates and manage roles from the Teams page.
              </p>
              <Button variant="outline" onClick={() => (window.location.href = "/dashboard/teams")}>
                Go to Teams
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="font-semibold">Integrations</h2>
              <p className="text-sm text-muted-foreground">
                Connect and manage your social platforms.
              </p>
              <Button variant="outline" onClick={() => (window.location.href = "/dashboard/connections")}>
                Manage social platforms
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardContent className="p-6 space-y-6">
              <h2 className="font-semibold">Email notifications</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Account connected</p>
                  <p className="text-xs text-muted-foreground">Confirmation when a social account connects</p>
                </div>
                <Switch checked={emailConnectionSuccess} onCheckedChange={setEmailConnectionSuccess} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Post failures</p>
                  <p className="text-xs text-muted-foreground">Alerts when a scheduled post fails</p>
                </div>
                <Switch checked={emailPostFail} onCheckedChange={setEmailPostFail} />
              </div>
              <Button onClick={handleSaveNotifications} disabled={savingNotifications}>
                {savingNotifications ? "Saving..." : "Save preferences"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div>
                <h2 className="font-semibold mb-1">Account</h2>
                <p className="text-sm text-muted-foreground">Signed in as {user?.email}</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={signOut}>
                  Sign out
                </Button>
              </div>
              <div className="pt-6 border-t">
                <h3 className="text-sm font-semibold text-destructive mb-1">Delete account</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  This permanently deletes your account and all data.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Delete account</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account and remove all
                        your data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        disabled={deletingAccount}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {deletingAccount ? "Deleting..." : "Delete account"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="font-semibold">Billing</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium capitalize">{plan} Plan</p>
                  <p className="text-xs text-muted-foreground">{plan === "free" ? "Upgrade for more accounts and unlimited scheduling" : `${status} subscription`}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleManageBilling} disabled={plan === "free"}>
                    Manage billing
                  </Button>
                  <Button onClick={() => window.open("/pricing", "_blank")}>Upgrade</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
