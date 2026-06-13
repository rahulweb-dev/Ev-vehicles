"use client";

import BlogEditor from "@/components/admin/BlogEditor";
import { useParams } from "next/navigation";

export default function EditBlogPage() {
  const { id } = useParams();
  return <BlogEditor mode="edit" blogId={id} />;
}
