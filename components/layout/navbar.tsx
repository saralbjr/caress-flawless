"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingCart,
  User,
  LogIn,
  LogOut,
  Menu,
  X,
  Home,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface User {
  _id: string;
  name: string;
  email: string;
}

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();

  // Check if user is logged in
  useEffect(() => {
    const userJson = localStorage.getItem("user");
    if (userJson) {
      try {
        setUser(JSON.parse(userJson));
      } catch (error) {
        console.error("Failed to parse user data", error);
        localStorage.removeItem("user");
      }
    }
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      // Clear local storage
      localStorage.removeItem("user");
      setUser(null);

      // Redirect to home page
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  // Handle scroll events to change navbar appearance
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/", icon: <Home className="h-5 w-5" /> },
    {
      name: "Shop",
      href: "/products",
      icon: <ShoppingBag className="h-5 w-5" />,
    },
    {
      name: "Skin Quiz",
      href: "/skin-quiz",
      icon: <Sparkles className="h-5 w-5" />,
    },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white dark:bg-gray-950 shadow-md py-2"
          : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="text-2xl font-bold text-primary flex items-center"
          >
            <ShoppingBag className="h-6 w-6 mr-2" />
            <span>Caress&Flawless</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === link.href
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* User actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Cart button */}
            <Link href="/cart">
              <Button variant="ghost" size="icon" aria-label="Shopping Cart">
                <ShoppingCart className="h-5 w-5" />
              </Button>
            </Link>

            {/* User menu / auth buttons */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    aria-label="Account"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
                  <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                    {user.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/account">My Account</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/account/orders">My Orders</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link href="/login">
                    <LogIn className="h-4 w-4 mr-2" />
                    Login
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Menu">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="sm:max-w-xs">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-6">
                    <Link
                      href="/"
                      className="text-xl font-bold text-primary flex items-center"
                    >
                      <ShoppingBag className="h-5 w-5 mr-2" />
                      <span>ShopNest</span>
                    </Link>
                    <SheetTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Close menu"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </SheetTrigger>
                  </div>

                  <div className="space-y-4">
                    {navLinks.map((link) => (
                      <Link
                        key={link.name}
                        href={link.href}
                        className={`flex items-center py-2 px-3 rounded-md text-sm font-medium ${
                          pathname === link.href
                            ? "bg-accent text-accent-foreground"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        }`}
                      >
                        <span className="mr-3">{link.icon}</span>
                        {link.name}
                      </Link>
                    ))}
                  </div>

                  <div className="mt-auto space-y-4 pt-4 border-t">
                    <Link
                      href="/cart"
                      className="flex items-center py-2 px-3 rounded-md text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    >
                      <ShoppingCart className="h-5 w-5 mr-3" />
                      Cart
                    </Link>

                    {user ? (
                      <>
                        <Link
                          href="/account"
                          className="flex items-center py-2 px-3 rounded-md text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        >
                          <User className="h-5 w-5 mr-3" />
                          My Account
                        </Link>
                        <Button
                          variant="ghost"
                          className="w-full justify-start px-3"
                          onClick={handleLogout}
                        >
                          <LogOut className="h-5 w-5 mr-3" />
                          Log out
                        </Button>
                      </>
                    ) : (
                      <div className="flex flex-col space-y-2">
                        <Button variant="outline" asChild>
                          <Link href="/login" className="w-full">
                            <LogIn className="h-4 w-4 mr-2" />
                            Login
                          </Link>
                        </Button>
                        <Button asChild>
                          <Link href="/signup" className="w-full">
                            Sign Up
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </div>
    </header>
  );
}
