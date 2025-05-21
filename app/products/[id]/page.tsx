import { notFound } from "next/navigation";
import Image from "next/image";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface ProductPageProps {
  params: { id: string };
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

async function getProduct(id: string): Promise<Product | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/${id}`,
      {
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data.success ? data.product : null;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const product = await getProduct(params.id);

  if (!product) {
    return {
      title: "Product Not Found - ShopNest",
    };
  }

  return {
    title: `${product.name} - ShopNest`,
    description: product.description.slice(0, 160),
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProduct(params.id);

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-24">
      <div className="mb-8">
        <Link
          href="/products"
          className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Product Image */}
        <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <Badge className="mb-4 capitalize">{product.category}</Badge>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <p className="text-2xl font-semibold text-primary">
              ${product.price.toFixed(2)}
            </p>
          </div>

          <div className="prose prose-sm dark:prose-invert">
            <h3 className="text-lg font-medium">Description</h3>
            <p>{product.description}</p>
          </div>

          <div className="pt-4">
            <Button size="lg" className="w-full sm:w-auto">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Add to Cart
            </Button>
          </div>

          <div className="border-t border-border pt-6 mt-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Shipping</h4>
                <p className="text-sm text-muted-foreground">
                  Free shipping on orders over $50
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Returns</h4>
                <p className="text-sm text-muted-foreground">
                  30-day return policy
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
