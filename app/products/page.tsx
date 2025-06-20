import { ProductGrid } from "@/components/products/product-grid";
import { Navbar } from "@/components/layout/navbar";
export const metadata = {
  title: "Products - Caress&Flawless",
  description: "Browse our collection of products",
};

export default function ProductsPage() {
  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Products</h1>
          <p className="text-muted-foreground">
            Browse our collection of quality products across various categories.
          </p>
        </div>

        <ProductGrid />
      </div>
    </>
  );
}
