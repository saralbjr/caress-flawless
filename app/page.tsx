import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Award, TrendingUp, Shield } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/5625041/pexels-photo-5625041.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
        </div>
        
        <div className="container mx-auto px-4 z-10 relative">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Discover Quality <span className="text-blue-400">Products</span> for Your Lifestyle
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8">
              Shop our curated selection of premium products. Find everything you need with secure checkout and fast delivery.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <Link href="/products">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Shop Now
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                <Link href="/signup">Create Account</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card rounded-lg p-6 shadow-sm flex flex-col items-center text-center transition-all hover:shadow-md">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Premium Quality</h3>
              <p className="text-muted-foreground">We curate only the highest quality products from trusted brands and suppliers.</p>
            </div>
            
            <div className="bg-card rounded-lg p-6 shadow-sm flex flex-col items-center text-center transition-all hover:shadow-md">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Best Prices</h3>
              <p className="text-muted-foreground">Competitive pricing and regular promotions to give you the best value for your money.</p>
            </div>
            
            <div className="bg-card rounded-lg p-6 shadow-sm flex flex-col items-center text-center transition-all hover:shadow-md">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Shopping</h3>
              <p className="text-muted-foreground">Your data is protected with state-of-the-art security and encryption technology.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold mb-4">Featured Products</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover our handpicked selection of premium products across various categories.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <div 
                key={product.id} 
                className="group bg-card rounded-lg overflow-hidden border border-border/50 hover:shadow-md transition-all"
              >
                <div className="aspect-[4/3] relative overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-semibold truncate mb-1">{product.name}</h3>
                  <p className="text-primary font-medium mb-3">${product.price.toFixed(2)}</p>
                  <Button size="sm" className="w-full" asChild>
                    <Link href={`/products/${product.id}`}>
                      View Product
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-10">
            <Button size="lg" variant="outline" asChild>
              <Link href="/products">View All Products</Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Join Our Community</h2>
            <p className="text-lg mb-8 text-primary-foreground/90">
              Create an account today to get personalized recommendations and access exclusive offers.
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/signup">Sign Up Now</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

// Sample featured products
const featuredProducts = [
  {
    id: '1',
    name: 'Wireless Bluetooth Headphones',
    price: 199.99,
    image: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  },
  {
    id: '2',
    name: 'Premium Watch',
    price: 349.99,
    image: 'https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  },
  {
    id: '3',
    name: 'Modern Coffee Table',
    price: 249.99,
    image: 'https://images.pexels.com/photos/1866149/pexels-photo-1866149.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  },
  {
    id: '4',
    name: 'Organic Skincare Set',
    price: 89.99,
    image: 'https://images.pexels.com/photos/725998/pexels-photo-725998.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  },
];