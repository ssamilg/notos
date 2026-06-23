"use client";

import { useParams } from "next/navigation";
import { Canvas } from "@/app/(dashboard)/project/[id]/_components/Canvas";

export default function CanvasCreatePage() {
  const params = useParams<{ id: string }>();

  return <Canvas projectId={params.id} />;
}
