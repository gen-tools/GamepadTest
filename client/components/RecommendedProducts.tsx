import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface RecommendedProductItem {
  name: string;
  description: string;
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
  products = [
    {
      name: "Product Name",
      description: "Short description goes here. Describe key benefit in one line.",
      href: "#",
      imageSrc: "/placeholder.svg",
    },
    {
      name: "Product Name",
      description: "Short description goes here. Describe key benefit in one line.",
      href: "#",
      imageSrc: "/placeholder.svg",
    },
    {
      name: "Product Name",
      description: "Short description goes here. Describe key benefit in one line.",
      href: "#",
      imageSrc: "/placeholder.svg",
    },
  ],
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
                        className="h-full object-contain"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded" />
                    )}
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="font-semibold text-lg text-foreground">{p.name}</div>
                    <p className="text-sm text-muted-foreground">{p.description}</p>
                    <div className="pt-2">
                      <Button asChild className="w-full">
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
