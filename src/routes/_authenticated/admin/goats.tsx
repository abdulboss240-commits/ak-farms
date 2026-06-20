import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Loader2, Image as ImageIcon, X } from "lucide-react";
import { z } from "zod";
import { fetchGoats, createGoat, updateGoat, deleteGoat, type GoatRow, type GoatStatus } from "@/lib/goats-api";
import { uploadGoatImage, deleteGoatImage, goatImageUrl } from "@/lib/storage";
import { formatPKR } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/goats")({
  head: () => ({ meta: [{ title: "Products — Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminGoats,
});

const goatSchema = z.object({
  name: z.string().trim().min(1).max(80),
  breed: z.string().trim().min(1).max(80),
  age_months: z.coerce.number().int().min(0).max(360),
  weight_kg: z.coerce.number().min(0).max(500),
  price: z.coerce.number().min(0).max(10_000_000),
  description: z.string().trim().max(2000).default(""),
  farm: z.string().trim().max(200).optional(),
  status: z.enum(["available", "reserved", "sold"]),
  featured: z.boolean(),
});

function AdminGoats() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<GoatRow | null>(null);
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<GoatRow | null>(null);

  const { data: goats = [], isLoading } = useQuery({ queryKey: ["goats"], queryFn: fetchGoats });

  const removeMut = useMutation({
    mutationFn: async (g: GoatRow) => {
      // delete uploaded images (skip seed)
      await Promise.all(g.images.map((p) => deleteGoatImage(p)));
      await deleteGoat(g.id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["goats"] });
      toast.success("Goat deleted.");
      setConfirmDelete(null);
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Failed to delete."),
  });

  function openCreate() { setEditing(null); setOpen(true); }
  function openEdit(g: GoatRow) { setEditing(g); setOpen(true); }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl">Products</h1>
          <p className="mt-1 text-muted-foreground">Add, edit and manage your goat catalog.</p>
        </div>
        <Button onClick={openCreate} className="rounded-full"><Plus className="me-1 h-4 w-4" /> Add goat</Button>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-soft">
        {isLoading ? (
          <div className="flex justify-center p-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : goats.length === 0 ? (
          <p className="p-12 text-center text-muted-foreground">No goats yet. Add your first one.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-start">Goat</th>
                <th className="px-4 py-3 text-start">Breed</th>
                <th className="px-4 py-3 text-end">Age</th>
                <th className="px-4 py-3 text-end">Weight</th>
                <th className="px-4 py-3 text-end">Price</th>
                <th className="px-4 py-3 text-start">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {goats.map((g) => (
                <tr key={g.id} className="border-t border-border/60">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={goatImageUrl(g.images[0])} alt="" className="h-10 w-10 rounded-lg object-cover" />
                      <span className="font-medium">{g.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{g.breed}</td>
                  <td className="px-4 py-3 text-end">{g.age_months} mo</td>
                  <td className="px-4 py-3 text-end">{g.weight_kg} kg</td>
                  <td className="px-4 py-3 text-end font-medium">{formatPKR(Number(g.price))}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      g.status === "available" ? "bg-success/15 text-success" :
                      g.status === "reserved" ? "bg-amber-500/15 text-amber-700" :
                      "bg-destructive/15 text-destructive"
                    }`}>{g.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(g)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => setConfirmDelete(g)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <GoatFormDialog
        key={editing?.id ?? "new"}
        open={open}
        onOpenChange={setOpen}
        goat={editing}
        onSaved={() => { qc.invalidateQueries({ queryKey: ["goats"] }); setOpen(false); }}
      />

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {confirmDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>This permanently removes the goat and its images. This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDelete && removeMut.mutate(confirmDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function GoatFormDialog({
  open, onOpenChange, goat, onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  goat: GoatRow | null;
  onSaved: () => void;
}) {
  const [name, setName] = useState(goat?.name ?? "");
  const [breed, setBreed] = useState(goat?.breed ?? "");
  const [ageMonths, setAgeMonths] = useState(String(goat?.age_months ?? ""));
  const [weightKg, setWeightKg] = useState(String(goat?.weight_kg ?? ""));
  const [price, setPrice] = useState(String(goat?.price ?? ""));
  const [description, setDescription] = useState(goat?.description ?? "");
  const [farm, setFarm] = useState(goat?.farm ?? "");
  const [status, setStatus] = useState<GoatStatus>(goat?.status ?? "available");
  const [featured, setFeatured] = useState(goat?.featured ?? false);
  const [images, setImages] = useState<string[]>(goat?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    try {
      const paths = await Promise.all(files.map(uploadGoatImage));
      setImages((prev) => [...prev, ...paths]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function removeImage(path: string) {
    setImages((p) => p.filter((x) => x !== path));
    await deleteGoatImage(path);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = goatSchema.safeParse({
      name, breed, age_months: ageMonths, weight_kg: weightKg, price,
      description, farm: farm || undefined, status, featured,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || "Check the form.");
      return;
    }
    setSaving(true);
    try {
      if (goat) {
        await updateGoat(goat.id, { ...parsed.data, images });
        toast.success("Goat updated.");
      } else {
        await createGoat({ ...parsed.data, images });
        toast.success("Goat added.");
      }
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{goat ? "Edit goat" : "Add new goat"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name"><Input value={name} onChange={(e) => setName(e.target.value)} required maxLength={80} /></Field>
            <Field label="Breed"><Input value={breed} onChange={(e) => setBreed(e.target.value)} required maxLength={80} placeholder="e.g. Beetal" /></Field>
            <Field label="Age (months)"><Input type="number" value={ageMonths} onChange={(e) => setAgeMonths(e.target.value)} required min={0} max={360} /></Field>
            <Field label="Weight (kg)"><Input type="number" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} required min={0} step="0.1" /></Field>
            <Field label="Price (PKR)"><Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required min={0} /></Field>
            <Field label="Status">
              <Select value={status} onValueChange={(v) => setStatus(v as GoatStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="Farm (optional)">
            <Input value={farm} onChange={(e) => setFarm(e.target.value)} maxLength={200} />
          </Field>

          <Field label="Description">
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} maxLength={2000} />
          </Field>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
            Feature on homepage
          </label>

          <div>
            <Label className="mb-1.5 block text-sm">Images</Label>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {images.map((p) => (
                <div key={p} className="group relative overflow-hidden rounded-lg border border-border bg-muted">
                  <img src={goatImageUrl(p)} alt="" className="aspect-square w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(p)}
                    className="absolute top-1 end-1 grid h-7 w-7 place-items-center rounded-full bg-destructive/90 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary">
                {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImageIcon className="h-5 w-5" />}
                <span className="text-xs">{uploading ? "Uploading…" : "Add image"}</span>
                <input type="file" accept="image/*" multiple onChange={onFiles} className="hidden" />
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={saving || uploading}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : goat ? "Save changes" : "Add goat"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-1.5 block text-sm">{label}</Label>
      {children}
    </div>
  );
}
