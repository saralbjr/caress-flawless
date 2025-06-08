import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  Github,
  Facebook,
  Twitter,
  Instagram,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-card text-card-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Logo and info */}
          <div className="space-y-4">
            <Link
              href="/"
              className="text-2xl font-bold text-primary inline-flex items-center"
            >
              Caress&Flawless
            </Link>
            <p className="text-muted-foreground max-w-xs">
              Your one-stop shop for all your shopping needs. Quality products
              at the best prices.
            </p>
            <div className="flex space-x-4">
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Github"
              >
                <Github size={20} />
              </Link>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Shop</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/products"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=electronics"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Electronics
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=clothing"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Clothing
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=home"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Home & Kitchen
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=beauty"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Beauty
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Account</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/login"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  href="/signup"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Sign Up
                </Link>
              </li>
              <li>
                <Link
                  href="/account"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  My Account
                </Link>
              </li>
              <li>
                <Link
                  href="/account/orders"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Order History
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 text-primary shrink-0" />
                <span className="text-muted-foreground">
                  123 Commerce St, Suite 456
                  <br />
                  San Francisco, CA 94103
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-2 text-primary" />
                <span className="text-muted-foreground">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-primary" />
                <span className="text-muted-foreground">
                  support@shopnest.com
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} ShopNest. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link
                href="/privacy"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/faq"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                FAQ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
