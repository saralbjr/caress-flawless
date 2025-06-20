import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    price: number;
    image: string;
    category: string;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="h-full overflow-hidden group transition-all hover:shadow-md">
      <div className="aspect-square relative overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="capitalize">
            {product.category}
          </Badge>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-medium text-lg line-clamp-1" title={product.name}>
          {product.name}
        </h3>
        <p className="text-primary font-semibold mt-1">
          Rs.{product.price.toFixed(2)}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="flex justify-between items-center w-full">
          <p className="text-xl font-bold text-primary">
            Rs.{product.price.toFixed(2)}
          </p>
          <Button asChild>
            <Link href={`/products/${product._id}`}>View Details</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
