import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface RecommendedProductItem {
  name: string;
  description?: string;
  href: string;
  imageSrc?: string;
}

interface RecommendedProductsSectionProps {
  title?: string;
  products?: RecommendedProductItem[];
  className?: string;
}

export function RecommendedProductsSection({
  title = "Recommended Products",
  products = [],
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
                        src={p.imageSrc}
                        alt={p.name}
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
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
                        <a href={p.href} target="_blank" rel="noopener noreferrer">
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
