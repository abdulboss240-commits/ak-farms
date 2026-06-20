import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type GoatRow = Database["public"]["Tables"]["goats"]["Row"];
export type GoatStatus = Database["public"]["Enums"]["goat_status"];

export async function fetchGoats(): Promise<GoatRow[]> {
  const { data, error } = await supabase
    .from("goats")
    .select("*")
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchGoat(id: string): Promise<GoatRow | null> {
  const { data, error } = await supabase.from("goats").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function createGoat(input: Database["public"]["Tables"]["goats"]["Insert"]) {
  const { data, error } = await supabase.from("goats").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function updateGoat(
  id: string,
  input: Database["public"]["Tables"]["goats"]["Update"],
) {
  const { data, error } = await supabase.from("goats").update(input).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteGoat(id: string) {
  const { error } = await supabase.from("goats").delete().eq("id", id);
  if (error) throw error;
}
