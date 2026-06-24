import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function BannerSlideshow() {
  const { data: banners } = useQuery({
    queryKey: ["banners"],
    queryFn: async () => {
      const { data } = await supabase
        .from("banners")
        .select("id,image_url,title_bn,link_url")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      return data ?? [];
    },
  });

  const [idx, setIdx] = useState(0);
  const count = banners?.length ?? 0;

  useEffect(() => {
    if (count <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % count), 4500);
    return () => clearInterval(t);
  }, [count]);

  if (!count) return null;

  return (
    <div className="relative w-full overflow-hidden rounded-xl gold-border bg-card-gradient aspect-[16/7] md:aspect-[21/7]">
      {banners!.map((b, i) => (
        <a
          key={b.id}
          href={b.link_url ?? "#"}
          className={
            "absolute inset-0 transition-opacity duration-700 " +
            (i === idx ? "opacity-100" : "opacity-0 pointer-events-none")
          }
        >
          <img src={b.image_url} alt={b.title_bn ?? ""} className="w-full h-full object-cover" />
          {b.title_bn && (
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent p-4">
              <div className="font-display text-lg md:text-2xl gold-text">{b.title_bn}</div>
            </div>
          )}
        </a>
      ))}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {banners!.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className={"h-1.5 rounded-full transition-all " + (i === idx ? "w-6 bg-gold" : "w-1.5 bg-white/40")}
            aria-label={`স্লাইড ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
