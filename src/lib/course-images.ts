import coverCloud from "@/assets/cover-cloud.jpg";
import coverNetwork from "@/assets/cover-network.jpg";
import coverAi from "@/assets/cover-ai.jpg";
import coverSoc from "@/assets/hero-soc.jpg";

const FALLBACKS = [coverSoc, coverNetwork, coverCloud, coverAi];

/** Deterministic professional cover image for a course that has no cover_url yet. */
export function fallbackCover(key: string): string {
  const s = String(key ?? "");
  if (/cloud|aws|azure|devsecops|container/i.test(s)) return coverCloud;
  if (/ai|gen|ml|intelligen/i.test(s)) return coverAi;
  if (/network|firewall|endpoint|pen|hack|forensic/i.test(s)) return coverNetwork;
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return FALLBACKS[h % FALLBACKS.length]!;
}
