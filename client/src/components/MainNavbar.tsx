import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Menu, X, Calculator, FileText, Users, Phone, BookOpen, Cpu, Brain, Shield, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LanguageSelector } from "@/components/LanguageSelector";
import NotificationBell from "@/components/NotificationBell";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function MainNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { t } = useTranslation();
  const { user } = useAuth();

  const navItems = [
    { href: "/ciencia", label: t('nav.science'), icon: Brain },
    { href: "/matematica", label: t('nav.math'), icon: Calculator },
    { href: "/tecnologia", label: t('nav.technology'), icon: Cpu },
    { href: "/whitepaper", label: "Whitepaper", icon: FileText },
    { href: "/cases", label: t('nav.cases'), icon: Users },
    { href: "/calculadora", label: t('calculator.title'), icon: Calculator },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg gradient-orange flex items-center justify-center">
              <span className="text-white font-bold text-xl">7</span>
            </div>
            <span className="font-bold text-xl hidden sm:block">IMPACT7</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "text-sm font-medium",
                    location === item.href && "bg-primary/10 text-primary"
                  )}
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>

          {/* CTA Button + Language Selector + Theme Toggle + User Menu */}
          <div className="hidden lg:flex items-center gap-2">
            {user && <NotificationBell />}
            <ThemeToggle />
            <LanguageSelector variant="default" />
            <Link href="/contato">
              <Button variant="outline" size="sm">
                <Phone className="w-4 h-4 mr-2" />
                {t('nav.contact')}
              </Button>
            </Link>
            <Link href="/calculadora">
              <Button size="sm" className="gradient-orange text-white border-0">
                <Calculator className="w-4 h-4 mr-2" />
                {t('calculator.calculate')}
              </Button>
            </Link>
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <Link href="/perfil">
                    <DropdownMenuItem className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Meu Perfil
                    </DropdownMenuItem>
                  </Link>
                  {user.role === 'admin' && (
                    <Link href="/admin">
                      <DropdownMenuItem className="cursor-pointer">
                        <Shield className="mr-2 h-4 w-4" />
                        Painel Admin
                      </DropdownMenuItem>
                    </Link>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="cursor-pointer text-destructive focus:text-destructive"
                    onClick={() => window.location.href = '/api/oauth/logout'}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Mobile Menu Button + Language */}
          <div className="flex lg:hidden items-center gap-2">
            <LanguageSelector variant="minimal" />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden py-4 border-t border-border max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "w-full justify-start text-sm truncate",
                      location === item.href && "bg-primary/10 text-primary"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.icon && <item.icon className="w-4 h-4 mr-2 flex-shrink-0" />}
                    <span className="truncate">{item.label}</span>
                  </Button>
                </Link>
              ))}
              <div className="pt-4 border-t border-border flex flex-col gap-2">
                <Link href="/contato">
                  <Button variant="outline" className="w-full" onClick={() => setIsOpen(false)}>
                    <Phone className="w-4 h-4 mr-2" />
                    {t('nav.contact')}
                  </Button>
                </Link>
                <Link href="/calculadora">
                  <Button className="w-full gradient-orange text-white border-0" onClick={() => setIsOpen(false)}>
                    <Calculator className="w-4 h-4 mr-2" />
                    {t('calculator.calculate')}
                  </Button>
                </Link>
                {user && (
                  <>
                    <div className="pt-4 border-t border-border" />
                    <Link href="/perfil">
                      <Button variant="ghost" className="w-full justify-start" onClick={() => setIsOpen(false)}>
                        <User className="w-4 h-4 mr-2" />
                        Meu Perfil
                      </Button>
                    </Link>
                    {user.role === 'admin' && (
                      <Link href="/admin">
                        <Button variant="ghost" className="w-full justify-start text-primary" onClick={() => setIsOpen(false)}>
                          <Shield className="w-4 h-4 mr-2" />
                          Painel Admin
                        </Button>
                      </Link>
                    )}
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-destructive hover:text-destructive" 
                      onClick={() => {
                        setIsOpen(false);
                        window.location.href = '/api/oauth/logout';
                      }}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sair
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

export default MainNavbar;
