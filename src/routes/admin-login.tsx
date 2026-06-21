import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/admin-login")({
  head: () => ({
    meta: [
      { title: "Admin Sign in — Premium Goats" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user && isAdmin) navigate({ to: "/admin" });
  }, [user, isAdmin, loading, navigate]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    if (!email || !password) {
      toast.error("Enter email and password.");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Welcome, admin.");
      navigate({ to: "/admin" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto grid min-h-[80vh] max-w-md place-items-center px-4 py-16">
      <div className="w-full rounded-3xl border border-border/60 bg-card p-8 shadow-soft">
        <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <h1 className="font-display text-3xl">Admin sign in</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Restricted area. Authorized staff only.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="email" className="mb-1.5 block text-sm">Email</Label>
            <Input id="email" name="email" type="email" required className="h-11" autoComplete="email" />
          </div>
          <div>
            <Label htmlFor="password" className="mb-1.5 block text-sm">Password</Label>
            <Input id="password" name="password" type="password" required className="h-11" autoComplete="current-password" />
          </div>
          <Button type="submit" size="lg" disabled={busy} className="h-11 w-full rounded-full">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in to admin"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Back to home</Link>
        </p>
      </div>
    </div>
  );
}
