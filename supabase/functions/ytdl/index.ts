import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface YtResponse {
  downloadUrl?: string;
  title?: string;
  error?: string;
}

function extractVideoId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.slice(1) || null;
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return v;
      const parts = u.pathname.split("/");
      const idx = parts.findIndex((p) => p === "shorts" || p === "embed");
      if (idx >= 0 && parts[idx + 1]) return parts[idx + 1];
    }
    return null;
  } catch {
    return null;
  }
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { url, format } = await req.json();
    if (!url || typeof url !== "string") {
      const body: YtResponse = { error: "URL YouTube wajib diisi." };
      return new Response(JSON.stringify(body), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      const body: YtResponse = { error: "Link YouTube tidak valid." };
      return new Response(JSON.stringify(body), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Fetch metadata via oEmbed (no API key needed, public)
    let title = `YouTube ${videoId}`;
    try {
      const oembedRes = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
      if (oembedRes.ok) {
        const oembed = await oembedRes.json();
        if (oembed.title) title = oembed.title;
      }
    } catch {
      // ignore - metadata is best-effort
    }

    // Direct download from YouTube is not possible from an Edge Function due to:
    // 1. YouTube's anti-bot protections (PO tokens, signature cipher)
    // 2. Edge Function runtime constraints (no native yt-dlp, limited CPU/memory, 150s timeout)
    // 3. Large file sizes exceeding response limits
    //
    // We return metadata + the watch URL so the frontend can provide a helpful
    // experience. For actual file extraction, a dedicated backend with yt-dlp
    // is required (outside the scope of this edge function).
    const fmt = format === "video" ? "mp4" : "mp3";
    const body: YtResponse = {
      title,
      downloadUrl: `https://www.youtube.com/watch?v=${videoId}`,
    };
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const body: YtResponse = { error: err instanceof Error ? err.message : "Terjadi kesalahan." };
    return new Response(JSON.stringify(body), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
