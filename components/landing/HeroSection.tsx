import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Sparkles, Network, Zap, ArrowRight, LogOut, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const quickStartOptions = [
  "Get pricing for a 10Gbps connection between NYC and LA",
  "What PacketFabric services are available in the West Coast?",
  "Help me set up cloud routing for multi-cloud architecture",
  "Compare dedicated vs ethernet connectivity options"
];

interface HeroSectionProps {
  onGetStarted: () => void;
  onQuickStart: (message: string) => void;
}

export default function HeroSection({ onGetStarted, onQuickStart }: HeroSectionProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check');
        if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(data.isLoggedIn);
        }
      } catch (error) {
        // Not logged in
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        setIsAuthenticated(false);
        router.refresh();
      }
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center relative z-10 px-4 sm:px-6">
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/30 pointer-events-none" />

      {/* Login/Logout button - positioned in top-right corner */}
      <div className="absolute top-6 right-6 z-20 flex gap-3">
        {isAuthenticated && (
          <Link href="/profile">
            <Button
              variant="outline"
              className="bg-transparent border border-white/40 text-white hover:bg-blue-500/20 hover:border-blue-400/60 px-5 py-2 text-sm rounded-lg font-medium transition-all duration-200 backdrop-blur-sm"
              style={{
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)'
              }}
            >
              <User className="w-4 h-4 mr-2" />
              Profile
            </Button>
          </Link>
        )}
        {isAuthenticated ? (
          <Button
            onClick={handleLogout}
            disabled={isLoggingOut}
            variant="outline"
            className="bg-transparent border border-white/40 text-white hover:bg-red-500/20 hover:border-red-400/60 px-5 py-2 text-sm rounded-lg font-medium transition-all duration-200 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)'
            }}
          >
            <LogOut className="w-4 h-4 mr-2" />
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </Button>
        ) : (
          <Link href="/login">
            <Button
              variant="outline"
              className="bg-transparent border border-white/40 text-white hover:bg-white/10 hover:border-white/60 px-5 py-2 text-sm rounded-lg font-medium transition-all duration-200 backdrop-blur-sm"
              style={{
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)'
              }}
            >
              Login
            </Button>
          </Link>
        )}
      </div>

      <div className="text-center max-w-4xl mx-auto relative z-10">

        {/* Logo Animation */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 1, type: "spring", bounce: 0.3 }}
          className="mb-6 sm:mb-8"
        >
          <div className="w-16 h-16 sm:w-20 md:w-24 sm:h-20 md:h-24 mx-auto bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 rounded-full flex items-center justify-center shadow-2xl border-2 border-white/30">
            <div className="relative">
              <Network className="w-8 h-8 sm:w-10 md:w-12 sm:h-10 md:h-12 text-white drop-shadow-2xl" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2"
              >
                <Sparkles className="w-4 h-4 sm:w-5 md:w-6 sm:h-5 md:h-6 text-cyan-300 drop-shadow-2xl" />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Main Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-4 sm:mb-6"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black text-white mb-2 sm:mb-4" style={{
            textShadow: '0 0 40px rgba(0, 0, 0, 0.9), 0 0 80px rgba(0, 212, 255, 0.4), 0 8px 32px rgba(0, 0, 0, 0.8)',
            WebkitTextStroke: '1px rgba(255, 255, 255, 0.1)'
          }}>
            PacketFabric
            <span className="bg-gradient-to-r from-cyan-200 to-blue-200 bg-clip-text text-transparent block sm:inline" style={{
              textShadow: '0 0 40px rgba(0, 212, 255, 0.6)'
            }}>
              .ai
            </span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-slate-100 font-semibold" style={{
            textShadow: '0 0 30px rgba(0, 0, 0, 0.9), 0 4px 20px rgba(0, 0, 0, 0.7)',
            WebkitTextStroke: '0.5px rgba(255, 255, 255, 0.1)'
          }}>
            Your intelligent network architect
          </p>
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-8 sm:mb-12"
        >
          <p className="text-base sm:text-lg md:text-xl text-slate-200 max-w-2xl mx-auto leading-relaxed font-medium px-2" style={{
            textShadow: '0 0 20px rgba(0, 0, 0, 0.9), 0 2px 10px rgba(0, 0, 0, 0.8)',
            WebkitTextStroke: '0.5px rgba(255, 255, 255, 0.05)'
          }}>
            Get instant expert guidance on enterprise networking solutions,
            real-time pricing, and technical recommendations powered by AI.
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col gap-3 sm:gap-4 justify-center mb-12 sm:mb-16 px-2"
        >
          <Button
            onClick={onGetStarted}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-bold rounded-full shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300 transform hover:scale-105 border border-white/20 w-full sm:w-auto"
            style={{
              boxShadow: '0 0 30px rgba(0, 212, 255, 0.3), 0 10px 40px rgba(0, 0, 0, 0.4)'
            }}
          >
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Start Conversation
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="bg-transparent border-2 border-white/60 text-white hover:border-cyan-400 hover:shadow-cyan-500/20 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg rounded-full font-bold transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-2xl w-full sm:w-auto"
            onClick={() => window.open('https://packetfabric.com', '_blank')}
            style={{
              textShadow: '0 0 20px rgba(0, 0, 0, 0.9), 0 2px 10px rgba(0, 0, 0, 0.7)',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
            }}
          >
            Visit PacketFabric.com
          </Button>
        </motion.div>

        {/* Quick Start Options */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="max-w-3xl mx-auto px-2"
        >
          <p className="text-slate-300 mb-4 sm:mb-6 text-xs sm:text-sm uppercase tracking-widest font-bold" style={{
            textShadow: '0 0 20px rgba(0, 0, 0, 0.9), 0 2px 10px rgba(0, 0, 0, 0.8)'
          }}>
            Try asking:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {quickStartOptions.map((option, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                onClick={() => onQuickStart(option)}
                className="p-3 sm:p-4 text-left border border-white/30 hover:border-white/50 rounded-lg sm:rounded-xl transition-all duration-300 group backdrop-blur-md hover:backdrop-blur-lg"
                style={{
                  background: 'rgba(0, 0, 0, 0.6)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}
              >
                <p className="text-slate-100 group-hover:text-white transition-colors font-medium text-sm sm:text-base" style={{
                  textShadow: '0 2px 8px rgba(0, 0, 0, 0.9), 0 0 20px rgba(0, 0, 0, 0.7)'
                }}>
                  "{option}"
                </p>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
