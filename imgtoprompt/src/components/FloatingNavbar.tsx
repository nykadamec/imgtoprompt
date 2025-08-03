"use client"

import { useState, useEffect } from "react"
import { Menu, X, Upload, Sparkles, Download, Settings, Home, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface FloatingNavbarProps {
  onPreloaderOpen?: () => void
  onScrollToSection?: (section: string) => void
}

export function FloatingNavbar({ onPreloaderOpen, onScrollToSection }: FloatingNavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    {
      label: "Domů",
      icon: Home,
      action: () => onScrollToSection?.('top')
    },
    {
      label: "Upload",
      icon: Upload,
      action: () => onScrollToSection?.('upload')
    },
    {
      label: "Modely",
      icon: Settings,
      action: onPreloaderOpen
    },
    {
      label: "Funkce",
      icon: Info,
      action: () => onScrollToSection?.('features')
    }
  ]

  const handleNavClick = (action?: () => void) => {
    action?.()
    setIsMenuOpen(false)
  }

  return (
    <>
      {/* Desktop Navbar */}
      <nav className={cn(
        "fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ease-out hidden md:flex",
        isScrolled 
          ? "bg-black/95 backdrop-blur-lg border border-gray-600/60 shadow-2xl scale-105" 
          : "bg-gray-900/60 backdrop-blur-md border border-gray-500/40 shadow-lg scale-100"
      )}>
        <div className="flex items-center space-x-1 px-6 py-3 rounded-full">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-2 mr-6 group">
            <div className="w-8 h-8 bg-gradient-to-br from-gray-700 to-black rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-semibold text-sm group-hover:text-gray-300 transition-colors duration-200">ImgToPrompt</span>
          </div>

          {/* Navigation Items */}
          {navItems.map((item, index) => (
            <button
              key={index}
              onClick={() => handleNavClick(item.action)}
              className="flex items-center space-x-2 px-4 py-2 rounded-full text-gray-300 hover:text-white hover:bg-gray-700/60 transition-all duration-300 text-sm hover:scale-105 active:scale-95 group"
            >
              <item.icon className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Mobile Navbar */}
      <nav className={cn(
        "fixed top-4 right-4 z-50 md:hidden transition-all duration-500 ease-out",
        isScrolled 
          ? "bg-black/95 backdrop-blur-lg border border-gray-600/60 shadow-2xl scale-105" 
          : "bg-gray-900/60 backdrop-blur-md border border-gray-500/40 shadow-lg scale-100"
      )}>
        <div className="rounded-full p-3">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white hover:text-gray-300 transition-all duration-300 hover:scale-110 active:scale-95"
          >
            <div className={cn(
              "transition-transform duration-300",
              isMenuOpen ? "rotate-180" : "rotate-0"
            )}>
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </div>
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className={cn(
            "absolute top-full right-0 mt-2 w-48 bg-black/95 backdrop-blur-lg border border-gray-600/60 rounded-xl shadow-2xl overflow-hidden",
            "animate-in slide-in-from-top-2 fade-in-0 duration-300"
          )}>
            {/* Brand Header */}
            <div className="px-4 py-3 border-b border-gray-600/50">
              <div className="flex items-center space-x-2 group">
                <div className="w-6 h-6 bg-gradient-to-br from-gray-700 to-black rounded-md flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
                <span className="text-white font-medium text-sm group-hover:text-gray-300 transition-colors duration-200">ImgToPrompt</span>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              {navItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleNavClick(item.action)}
                  className="flex items-center space-x-3 w-full px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800/60 transition-all duration-300 text-sm hover:scale-105 active:scale-95 group"
                  style={{ 
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  <item.icon className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </>
  )
}