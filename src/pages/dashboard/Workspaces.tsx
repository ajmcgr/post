import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Home, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { trackEvent } from "@/lib/analytics";

const Workspaces = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { plan } = useSubscription();
  const { workspaces, currentWorkspace, switchWorkspace, refreshWorkspace } = useWorkspace();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (searchParams.get("new") === "1") setShowCreateDialog(true);
  }, [searchParams]);

  const handleAddWorkspace = () => {
    if (plan !== "business") {
      trackEvent("upgrade_prompt_viewed", { source: "workspaces_page", plan });
      toast.error("Upgrade to Business to create multiple workspaces");
      navigate("/dashboard/account/plans?plan=business");
      return;
    }
    setShowCreateDialog(true);
  };

  const handleCreateWorkspace = async () => {
    if (!user || !newWorkspaceName.trim()) return;
    setCreating(true);
    const { data, error } = await supabase
      .from("workspaces")
      .insert({ name: newWorkspaceName.trim(), owner_id: user.id })
      .select("id")
      .single();

    if (!error && data) {
      const { error: memberError } = await supabase.from("workspace_members").insert({
        workspace_id: data.id,
        user_id: user.id,
        role: "owner",
      });
      if (!memberError) {
        localStorage.setItem("currentWorkspaceId", data.id);
        await refreshWorkspace();
        trackEvent("workspace_created");
        toast.success("Workspace created");
        setShowCreateDialog(false);
        setNewWorkspaceName("");
      } else {
        toast.error(memberError.message);
      }
    } else {
      toast.error(error?.message || "Failed to create workspace");
    }
    setCreating(false);
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Manage Workspaces</h1>
          <p className="text-muted-foreground">Keep brands, teammates and social accounts separated.</p>
        </div>
        <Button onClick={handleAddWorkspace}><Plus className="mr-2 h-4 w-4" />Add Workspace</Button>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {workspaces.map((workspace) => (
          <Card key={workspace.id} className={workspace.id === currentWorkspace?.id ? "border-primary" : ""}>
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-muted p-2"><Home className="h-5 w-5" /></div>
                <div>
                  <h3 className="font-semibold">{workspace.name}</h3>
                  <p className="text-xs text-muted-foreground">{workspace.owner_id === user?.id ? "Owner" : "Member"}</p>
                </div>
              </div>
              {workspace.id === currentWorkspace?.id ? (
                <Badge>Current</Badge>
              ) : (
                <Button variant="outline" size="sm" onClick={() => switchWorkspace(workspace.id)}>Switch</Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Workspace</DialogTitle>
            <DialogDescription>Give the workspace a recognizable brand or client name.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <Label htmlFor="workspace-name">Workspace Name</Label>
            <Input id="workspace-name" value={newWorkspaceName} onChange={(event) => setNewWorkspaceName(event.target.value)} placeholder="e.g. Acme Brand" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateWorkspace} disabled={creating || !newWorkspaceName.trim()}>{creating ? "Creating..." : "Create Workspace"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Workspaces;
