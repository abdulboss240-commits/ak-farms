import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { resetAdminSection } from "@/lib/admin-reset.functions";

export function ResetSectionButton({
  section,
  label,
  invalidateKeys,
}: {
  section: "goats" | "orders";
  label: string;
  invalidateKeys: string[][];
}) {
  const qc = useQueryClient();
  const reset = useServerFn(resetAdminSection);
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onConfirm(e: React.FormEvent) {
    e.preventDefault();
    if (!password) return;
    setBusy(true);
    try {
      const res = await reset({ data: { section, password } });
      if (!res.ok) {
        toast.error(res.error || "Reset failed");
        return;
      }
      toast.success(`${label} reset successfully.`);
      invalidateKeys.forEach((k) => qc.invalidateQueries({ queryKey: k }));
      setOpen(false);
      setPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="rounded-full border-destructive/40 text-destructive hover:bg-destructive hover:text-destructive-foreground"
      >
        <RotateCcw className="me-1 h-4 w-4" /> Reset {label}
      </Button>

      <AlertDialog open={open} onOpenChange={(o) => { if (!busy) { setOpen(o); if (!o) setPassword(""); } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset all {label.toLowerCase()}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes <strong>all {label.toLowerCase()}</strong> from this section. This cannot be undone.
              Enter the admin reset password to confirm.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <form onSubmit={onConfirm} className="space-y-2">
            <Label htmlFor="reset-pw" className="text-sm">Admin reset password</Label>
            <Input
              id="reset-pw"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              required
            />
            <AlertDialogFooter className="mt-4">
              <AlertDialogCancel disabled={busy} type="button">Cancel</AlertDialogCancel>
              <AlertDialogAction
                type="submit"
                disabled={busy || !password}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : `Reset ${label}`}
              </AlertDialogAction>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
