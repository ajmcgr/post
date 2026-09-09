import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Home, Plus, Settings } from "lucide-react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useSubscription } from "@/hooks/useSubscription";

export function WorkspaceSwitcher() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { plan } = useSubscription();
  const { currentWorkspace, workspaces, switchWorkspace } = useWorkspace();

  const handleNew = () => {
    navigate("/dashboard/workspaces?new=1");
    setOpen(false);
  };

  const handleManage = () => {
    navigate("/dashboard/workspaces");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2 hover:bg-muted/50">
            <Home className="h-4 w-4" />
            <span>{currentWorkspace?.name ?? "main"}</span>
            <ChevronDown className="h-4 w-4 opacity-60" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2" align="end">
          <div className="space-y-1">
            {workspaces.map((workspace) => (
              <Button
                key={workspace.id}
                variant={workspace.id === currentWorkspace?.id ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => {
                  switchWorkspace(workspace.id);
                  setOpen(false);
                }}
              >
                <Home className="mr-2 h-4 w-4" />
                {workspace.name}
              </Button>
            ))}
            {plan === "business" && (
              <>
                <Button variant="ghost" className="w-full justify-start" onClick={handleManage}>
                  <Settings className="mr-2 h-4 w-4" />
                  Manage Workspaces
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={handleNew}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Workspace
                </Button>
              </>
            )}
          </div>
        </PopoverContent>
    </Popover>
  );
}
