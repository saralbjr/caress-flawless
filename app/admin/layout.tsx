"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Package,
  Settings,
  LogOut,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const router = useRouter();
  const pathname = usePathname();

  // Check if user is logged in and has admin access
  useEffect(() => {
    const userJson = localStorage.getItem("user");

    if (!userJson) {
      router.push("/login?redirect=/admin");
      return;
    }

    try {
      const userData = JSON.parse(userJson) as User;

      if (userData.role !== "admin" && userData.role !== "superadmin") {
        router.push("/");
        return;
      }

      setUser(userData);
    } catch (error) {
      console.error("Failed to parse user data", error);
      localStorage.removeItem("user");
      router.push("/login?redirect=/admin");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      // Clear local storage
      localStorage.removeItem("user");

      // Redirect to login page
      router.push("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  // Toggle collapsible items
  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Navigation items
  const navItems = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: "User Management",
      icon: <Users className="h-5 w-5" />,
      subitems: [
        { title: "All Users", href: "/admin/users" },
        { title: "Add User", href: "/admin/users/add" },
        { title: "Roles", href: "/admin/users/roles" },
      ],
    },
    {
      title: "Product Management",
      icon: <ShoppingBag className="h-5 w-5" />,
      subitems: [
        { title: "All Products", href: "/admin/products" },
        { title: "Add Product", href: "/admin/products/add" },
        { title: "Categories", href: "/admin/products/categories" },
        { title: "Inventory", href: "/admin/products/inventory" },
      ],
    },
    {
      title: "Order Management",
      icon: <Package className="h-5 w-5" />,
      subitems: [
        { title: "All Orders", href: "/admin/orders" },
        { title: "Shipments", href: "/admin/orders/shipments" },
      ],
    },
    {
      title: "Settings",
      href: "/admin/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <Link href="/admin" className="flex items-center">
            <ShoppingBag className="h-6 w-6 text-primary mr-2" />
            <span className="text-xl font-bold">
              Caress&Flawless Admin Panel
            </span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {navItems.map((item, index) => (
              <li key={index}>
                {item.subitems ? (
                  <Collapsible
                    open={openItems[item.title] || false}
                    onOpenChange={() => toggleItem(item.title)}
                  >
                    <CollapsibleTrigger asChild>
                      <button className="flex items-center justify-between w-full p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                        <div className="flex items-center">
                          {item.icon}
                          <span className="ml-3">{item.title}</span>
                        </div>
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${
                            openItems[item.title] ? "transform rotate-180" : ""
                          }`}
                        />
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <ul className="mt-1 pl-6 space-y-1">
                        {item.subitems.map((subitem, subIndex) => (
                          <li key={subIndex}>
                            <Link
                              href={subitem.href}
                              className={`block p-2 rounded-md ${
                                pathname === subitem.href
                                  ? "bg-gray-100 dark:bg-gray-700 font-medium"
                                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
                              }`}
                            >
                              {subitem.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </CollapsibleContent>
                  </Collapsible>
                ) : (
                  <Link
                    href={item.href}
                    className={`flex items-center p-2 rounded-md ${
                      pathname === item.href
                        ? "bg-gray-100 dark:bg-gray-700 font-medium"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    {item.icon}
                    <span className="ml-3">{item.title}</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user?.email}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Log out
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="md:hidden fixed top-4 left-4 z-40"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <Link href="/admin" className="flex items-center">
              <ShoppingBag className="h-6 w-6 text-primary mr-2" />
              <span className="text-xl font-bold">Caress&Flawless Admin</span>
            </Link>
          </div>

          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {navItems.map((item, index) => (
                <li key={index}>
                  {item.subitems ? (
                    <Collapsible
                      open={openItems[item.title] || false}
                      onOpenChange={() => toggleItem(item.title)}
                    >
                      <CollapsibleTrigger asChild>
                        <button className="flex items-center justify-between w-full p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                          <div className="flex items-center">
                            {item.icon}
                            <span className="ml-3">{item.title}</span>
                          </div>
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${
                              openItems[item.title]
                                ? "transform rotate-180"
                                : ""
                            }`}
                          />
                        </button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <ul className="mt-1 pl-6 space-y-1">
                          {item.subitems.map((subitem, subIndex) => (
                            <li key={subIndex}>
                              <Link
                                href={subitem.href}
                                className={`block p-2 rounded-md ${
                                  pathname === subitem.href
                                    ? "bg-gray-100 dark:bg-gray-700 font-medium"
                                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                                }`}
                              >
                                {subitem.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <Link
                      href={item.href}
                      className={`flex items-center p-2 rounded-md ${
                        pathname === item.href
                          ? "bg-gray-100 dark:bg-gray-700 font-medium"
                          : "hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      {item.icon}
                      <span className="ml-3">{item.title}</span>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Log out
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8">{children}</main>
    </div>
  );
}
