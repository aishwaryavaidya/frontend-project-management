"use client";
import React, { useState } from "react";
import { Dialog, DialogPanel } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { Session } from "next-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/generateInitials";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Logo from "@/components/global/Logo";
import {ChevronDown } from "lucide-react";
import Image from 'next/image';
import AuthenticatedAvatar from "@/components/global/AuthenticatedAvatar";

export default function SiteHeader({ session }: { session: Session | null }) {
  const navigation = [
    { name: "Home", href: "https://autoplant.in/home" },
    { name: "About Us", href: "https://autoplant.in/about-us" },
    { name: "Products", href: "#"},
    { name: "Careers", href: "https://autoplant.in/careers" },
    { name: "Contact Us", href: "https://autoplant.in/contact" },
  ];
  const productLinks = [
    { name: "Vendor Collaboration", href: "https://autoplant.in/vc" },
    { name: "In-Plant Logistics", href: "https://autoplant.in/inplant" },
    { name: "Enroute", href: "https://autoplant.in/enroute" },
    { name: "Freight Settlement", href: "https://autoplant.in/freight" },
    { name: "Auction", href: "https://autoplant.in/auction" },
  ];

  
  const router = useRouter();

  async function handleLogout() {
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      console.error(error);
    }
  }

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky inset-x-0 top-0 lg:top-0 z-40">
      <nav
        aria-label="Global"
        className="flex items-center justify-between p-4 lg:px-6 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
      >
        <div className="flex lg:flex-1">
          <span><Logo title="PM" href="#" /></span>
          
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 dark:text-gray-200"
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon aria-hidden="true" className="h-6 w-6" />
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-14">
          {navigation.map((item) => (
            item.name === "Products" ? (
              <div
                key={item.name}
                className="relative flex items-center space-x-1 cursor-pointer group"
                onMouseEnter={() => setDropdownOpen(true)}
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <span className="text-lg font-semibold leading-6 text-gray-900 dark:text-gray-100 group-hover:text-gray-700 dark:group-hover:text-gray-300">
                  {item.name}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-900 dark:text-gray-100 group-hover:text-gray-700 dark:group-hover:text-gray-300" />
                {dropdownOpen && (
                  <div className="absolute top-full left-0 mt-0 hidden group-hover:block w-48 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
                    {productLinks.map((link) => (
                      <Link
                        key={link.name}
                        href={link.href}
                        className="block px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {link.name}
                      </Link>
                    ))}
                  </div>
                  )}
                  </div>
                ) : (
            <Link
              key={item.name}
              href={item.href}
              className="text-lg font-semibold leading-6 text-gray-900 dark:text-gray-100 hover:text-gray-700 dark:hover:text-gray-300"
            >
              {item.name}
            </Link>
          )))}
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end space-x-2">
          <ModeToggle />
          {session ? (
            <AuthenticatedAvatar session={session} />
          ) : (
            <Button asChild variant={"outline"}>
              <Link href="/login">Log in</Link>
            </Button>
          )}
        </div>
      </nav>

      <Dialog
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
        className="lg:hidden"
      >
        <div className="fixed inset-0 z-50" />
        <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white dark:bg-gray-900 px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10 dark:sm:ring-gray-700/10">
          <div className="flex items-center justify-between">
          <div className="text-gray-900 dark:text-white">
            <Logo href="/" title="Project Manager " />
          </div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="-m-2.5 rounded-md p-2.5 text-gray-700 dark:text-gray-200"
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon aria-hidden="true" className="h-6 w-6" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10 dark:divide-gray-700/10">
              <div className="space-y-2 py-6">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
              <div className="py-6">
                {session ? (
                  <Button asChild variant={"ghost"}>
                    <Link href="/dashboard">
                      <Avatar>
                        <AvatarImage
                          src={session?.user?.image ?? ""}
                          alt={session?.user?.name ?? ""}
                        />
                        <AvatarFallback>
                          {getInitials(session?.user?.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="ml-3">Dashboard</span>
                    </Link>
                  </Button>
                ) : (
                  <Button asChild variant={"outline"}>
                    <Link href="/login">Log in</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  );
}
