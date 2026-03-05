"use client";

import Link from "next/link";
import { useAuth } from "./auth-provider";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut, Shield } from "lucide-react";
import { useState } from "react";

export function Navigation() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Startseite" },
    { href: "/gallery", label: "Galerie" },
    { href: "/consultation", label: "Beratung" },
    { href: "/faq", label: "FAQ" },
  ];

  return (
    <header className="sticky top-0 z-40 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-light tracking-wider text-[#fcefd1]">
              Danielas Dream
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-[#fcefd1]/80 hover:text-[#fcefd1] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                {user.role === "admin" && (
                  <Link href="/admin">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[#fcefd1]/80 hover:text-[#fcefd1] hover:bg-[#fcefd1]/10"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Admin
                    </Button>
                  </Link>
                )}
                <Link href="/dashboard">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[#fcefd1]/80 hover:text-[#fcefd1] hover:bg-[#fcefd1]/10"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Mein Bereich
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-[#fcefd1]/60 hover:text-[#fcefd1] hover:bg-[#fcefd1]/10"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[#fcefd1]/80 hover:text-[#fcefd1] hover:bg-[#fcefd1]/10"
                  >
                    Anmelden
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    size="sm"
                    className="bg-[#44362c] hover:bg-[#5a4a3c] text-[#fcefd1]"
                  >
                    Registrieren
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#fcefd1]"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#fcefd1]/10">
          <div className="px-4 py-3 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-[#fcefd1]/80 hover:text-[#fcefd1] py-2"
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-[#fcefd1]/10 pt-3">
              {user ? (
                <div className="space-y-2">
                  {user.role === "admin" && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center text-[#fcefd1]/80 py-2"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Admin Dashboard
                    </Link>
                  )}
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center text-[#fcefd1]/80 py-2"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Mein Bereich
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center text-[#fcefd1]/60 py-2 w-full"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Abmelden
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-[#fcefd1]/80 py-2"
                  >
                    Anmelden
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-[#fcefd1]/80 py-2"
                  >
                    Registrieren
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
