import { createClient } from "@/lib/supabase-server";

export async function getCurrentUserOrThrow() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  if (!user) {
    throw new Error("请先登录");
  }

  return { supabase, user };
}

export async function getCurrentMembershipOrThrow() {
  const { supabase, user } = await getCurrentUserOrThrow();

  const { data: membership, error } = await supabase
    .from("garden_members")
    .select("*")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!membership) {
    throw new Error("你还没有加入任何庭院");
  }

  return { supabase, user, membership };
}

export async function getCurrentGardenOrThrow() {
  const { supabase, user, membership } = await getCurrentMembershipOrThrow();

  const { data: garden, error } = await supabase
    .from("gardens")
    .select("*")
    .eq("id", membership.garden_id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!garden) {
    throw new Error("没有找到当前庭院");
  }

  return { supabase, user, membership, garden };
}