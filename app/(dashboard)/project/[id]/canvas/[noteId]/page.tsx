"use client";

import { useParams } from "next/navigation";
import { Canvas } from "@/app/(dashboard)/project/[id]/_components/Canvas";

export default function CanvasEditPage() {
  const params = useParams<{ id: string; noteId: string }>();

  return <Canvas projectId={params.id} noteId={params.noteId} />;
}
