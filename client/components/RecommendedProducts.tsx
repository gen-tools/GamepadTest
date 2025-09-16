import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface RecommendedProductItem {
  name: string;
  description?: string;
  href: string;
  imageSrc?: string;
  alt?: string;
}

interface RecommendedProductsSectionProps {
  title?: string;
  products?: RecommendedProductItem[];
  className?: string;
}

const defaultProducts: RecommendedProductItem[] = [
  {
    name: "Logitech for Creators Blue Microphones Yeti USB Microphone (Blackout)",
    href: "https://amzn.to/46sl4Xn",
    imageSrc: "image address: https://m.media-amazon.com/images/I/61KTMvS5JBL._AC_SL1500_.jpg",
    alt: "Blue Yeti USB Microphone"
  },
  {
    name: "Focusrite Scarlett 2i2 (3rd Gen)",
    description: "Best-selling 2-in/2-out USB audio interface for home studios.",
    href: "https://www.amazon.com/dp/B07QR6Z1JB",
    imageSrc: "https://m.media-amazon.com/images/I/71w8mW3l7bL._AC_SL1500_.jpg",
    alt: "Focusrite Scarlett 2i2 Interface"
  },
  {
    name: "AKAI MPK Mini MK3",
    description: "Compact 25-key MIDI keyboard controller with pads and knobs.",
    href: "https://www.amazon.com/dp/B0887Y6DCG",
    imageSrc: "https://m.media-amazon.com/images/I/71kU5lH8vHL._AC_SL1500_.jpg",
    alt: "AKAI MPK Mini MK3"
  }
];

export function RecommendedProductsSection({
  title = "Recommended Products",
  products = defaultProducts,
  className,
}: RecommendedProductsSectionProps) {
  return (
    <section className={cn("mt-12", className)}>
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((p, i) => (
          <Card key={i} className="hover-lift">
            <CardContent className="p-0">
              <div className="p-4">
                <div className="rounded-lg overflow-hidden border bg-white shadow-sm">
                  <div className="w-full h-40 bg-gray-100 flex items-center justify-center">
                    {p.imageSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.imageSrc.startsWith('http') ? `/api/image-proxy?url=${encodeURIComponent(p.imageSrc)}` : p.imageSrc}
                        alt={p.alt || p.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          const img = e.currentTarget as HTMLImageElement;
                          img.onerror = null;
                          img.src = "/placeholder.svg";
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded" />
                    )}
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="font-semibold text-lg text-foreground">{p.name}</div>
                    {p.description ? (
                      <p className="text-sm text-muted-foreground">{p.description}</p>
                    ) : null}
                    <div className="pt-2">
                      <Button asChild className="w-full bg-[#FF9900] hover:bg-[#f5a623] text-black border border-yellow-500/60 focus-visible:ring-yellow-500">
                        <a href={p.href} target="_blank" rel="nofollow sponsored noopener noreferrer">
                          Buy on Amazon
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
