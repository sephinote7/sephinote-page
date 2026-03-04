import { notFound, redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { AdminLayout } from "@/components/layout";
import PostEditForm from "@/components/admin/PostEditForm";
import type { Profile, Post } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getProfileAndPost(id: string) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .eq("del_yn", "N")
    .single();

  return {
    profile: profile as Profile,
    post: (post as Post) || null,
  };
}

export default async function AdminEditPage({ params }: PageProps) {
  const { id } = await params;
  const { profile, post } = await getProfileAndPost(id);

  if (!post) {
    notFound();
  }

  return (
    <AdminLayout profile={profile}>
      <div className="p-6 lg:p-8">
        <PostEditForm initialPost={post} />
      </div>
    </AdminLayout>
  );
}

