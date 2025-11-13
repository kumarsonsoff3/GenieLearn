"use client";

import React, { useCallback, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { logoutUser } from "../store/authSlice";
import { prefetchPageData } from "../utils/pageCache";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Users, Settings, LogOut, Home, User } from "lucide-react";

const Layout = React.memo(({ children }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useSelector(state => state.auth);

  const handleLogout = useCallback(async () => {
    try {
      await dispatch(logoutUser());
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, [dispatch, router]);

  const navItems = useMemo(
    () => [
      { path: "/dashboard", label: "Dashboard", icon: Home },
      { path: "/groups", label: "Groups", icon: Users },
    ],
    []
  );

  const userInitial = useMemo(
    () => user?.name?.charAt(0).toUpperCase() || "U",
    [user?.name]
  );

  // Prefetch data for better page transitions
  useEffect(() => {
    const handleMouseEnter = page => {
      prefetchPageData(page);
    };

    // Add hover listeners to navigation links for prefetching
    const dashboardLink = document.querySelector('a[href="/dashboard"]');
    const groupsLink = document.querySelector('a[href="/groups"]');

    if (dashboardLink) {
      dashboardLink.addEventListener("mouseenter", () =>
        handleMouseEnter("dashboard")
      );
    }
    if (groupsLink) {
      groupsLink.addEventListener("mouseenter", () =>
        handleMouseEnter("groups")
      );
    }

    return () => {
      if (dashboardLink) {
        dashboardLink.removeEventListener("mouseenter", () =>
          handleMouseEnter("dashboard")
        );
      }
      if (groupsLink) {
        groupsLink.removeEventListener("mouseenter", () =>
          handleMouseEnter("groups")
        );
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center space-x-8">
              <Link
                href="/dashboard"
                className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
              >
                <Image
                  src="/logo.png"
                  alt="GenieLearn Logo"
                  width={32}
                  height={32}
                  className="h-8 w-8 object-contain"
                />
                <h1 className="text-xl font-semibold text-gray-900">
                  GenieLearn
                </h1>
              </Link>

              <nav className="hidden md:flex items-center space-x-1">
                {navItems.map(item => {
                  const Icon = item.icon;
                  const isActive = pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-gray-100 text-gray-900"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="flex items-center space-x-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full p-0 hover:bg-gray-100 touch-manipulation"
                  >
                    <Avatar className="h-8 w-8 border border-gray-300">
                      <AvatarFallback className="text-xs font-semibold bg-gray-900 text-white">
                        {userInitial}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-64 z-[9999] shadow-lg border border-gray-200 bg-white"
                  align="end"
                  forceMount
                  sideOffset={8}
                  avoidCollisions={true}
                  collisionPadding={8}
                >
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-2 p-2">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10 border border-gray-300">
                          <AvatarFallback className="text-sm font-semibold bg-gray-900 text-white">
                            {userInitial}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col space-y-1 min-w-0 flex-1">
                          <p className="text-sm font-medium leading-none truncate">
                            {user?.name || "User"}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground truncate">
                            {user?.email || ""}
                          </p>
                        </div>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      href="/profile"
                      className="flex items-center space-x-2 cursor-pointer touch-manipulation py-3"
                    >
                      <User className="h-4 w-4" />
                      <span>Profile Settings</span>
                    </Link>
                  </DropdownMenuItem>

                  {/* Mobile Navigation Items - shown only on mobile */}
                  <div className="block md:hidden">
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link
                        href="/dashboard"
                        className="flex items-center space-x-2 cursor-pointer touch-manipulation py-3"
                      >
                        <Home className="h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/groups"
                        className="flex items-center space-x-2 cursor-pointer touch-manipulation py-3"
                      >
                        <Users className="h-4 w-4" />
                        <span>Groups</span>
                      </Link>
                    </DropdownMenuItem>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center space-x-2 cursor-pointer text-red-600 focus:text-red-600 touch-manipulation py-3"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
});

Layout.displayName = "Layout";

export default Layout;
