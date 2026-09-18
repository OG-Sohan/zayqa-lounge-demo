import { createFileRoute } from "@tanstack/react-router";

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  gif: "image/gif",
  svg: "image/svg+xml",
};

export const Route = createFileRoute("/api/public/media/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const raw = params._splat ?? "";
        if (!raw || raw.includes("..") || raw.startsWith("/")) {
          return new Response("Not found", { status: 404 });
        }
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.storage.from("site-media").download(raw);
        if (error || !data) return new Response("Not found", { status: 404 });
        const ext = raw.split(".").pop()?.toLowerCase() ?? "";
        return new Response(await data.arrayBuffer(), {
          headers: {
            "Content-Type": CONTENT_TYPES[ext] ?? "application/octet-stream",
            "Cache-Control": "public, max-age=86400",
          },
        });
      },
    },
  },
});
