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
      {/* Login/Logout button - positioned in top-right corner */}
      <div className="absolute top-6 right-6 z-20 flex gap-3">
        {isAuthenticated && (
          <Link href="/profile">
            <Button
              variant="outline"
              className="bg-transparent border border-white/40 text-white hover:bg-[#2877f3]/20 hover:border-[#2877f3]/60 px-5 py-2 text-sm rounded-lg font-medium transition-all duration-200 backdrop-blur-sm"
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

        {/* Logo Animation - PacketFabric Official Logo */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
          className="mb-6 sm:mb-8"
        >
          <div className="relative inline-block">
            <img 
              src="/packetfabric-logo.webp" 
              alt="PacketFabric Logo" 
              className="h-24 sm:h-32 md:h-40 lg:h-48 w-auto mx-auto drop-shadow-2xl"
              style={{
                filter: 'drop-shadow(0 0 40px rgba(77, 212, 134, 0.3))'
              }}
            />
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3"
            >
              <Sparkles className="w-5 h-5 sm:w-6 md:w-7 sm:h-6 md:h-7 text-[#4dd486] drop-shadow-2xl" />
            </motion.div>
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
            textShadow: '0 0 40px rgba(0, 0, 0, 0.9), 0 0 80px rgba(77, 212, 134, 0.4), 0 8px 32px rgba(0, 0, 0, 0.8)',
            WebkitTextStroke: '1px rgba(255, 255, 255, 0.1)'
          }}>
            PacketFabric
            <span 
              className="block sm:inline"
              style={{
                background: 'linear-gradient(135deg, #4dd486 0%, #20c6b5 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: 'none'
              }}
            >
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

        {/* Search Box - Embedded on Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="max-w-4xl mx-auto mb-8 sm:mb-12 px-2"
        >
          <div
            className="glass-morphism rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8 backdrop-blur-xl"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#4dd486] to-[#20c6b5] flex items-center justify-center shadow-lg flex-shrink-0">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <input
                type="text"
                placeholder="Ask about pricing, services, or technical questions..."
                className="flex-1 text-lg sm:text-xl outline-none text-white placeholder-white/60 bg-transparent font-medium"
                onFocus={onGetStarted}
                readOnly
                style={{ cursor: 'pointer' }}
              />
              <Button
                onClick={onGetStarted}
                className="bg-gradient-to-r from-[#4dd486] to-[#20c6b5] hover:from-[#3bc274] hover:to-[#1ab4a3] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl transition-all flex items-center gap-2 sm:gap-3 font-bold text-base sm:text-lg shadow-xl hover:shadow-2xl hover:scale-105"
              >
                <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Ask</span>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Secondary CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mb-12 sm:mb-16"
        >
          <Button
            variant="outline"
            size="lg"
            className="bg-transparent border-2 border-white/60 text-white hover:border-[#4dd486] hover:bg-[#4dd486]/10 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg rounded-full font-bold transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-2xl"
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
          <p className="text-slate-300 mb-4 sm:mb-6 text-xs sm:text-sm uppercase tracking-widest font-bold flex items-center justify-center gap-2" style={{
            textShadow: '0 0 20px rgba(0, 0, 0, 0.9), 0 2px 10px rgba(0, 0, 0, 0.8)'
          }}>
            <span className="text-[#4dd486]">+</span> Try asking:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {quickStartOptions.map((option, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                onClick={() => onQuickStart(option)}
                className="p-3 sm:p-4 text-left border border-white/30 hover:border-[#4dd486]/50 hover:bg-[#4dd486]/10 rounded-lg sm:rounded-xl transition-all duration-300 group backdrop-blur-md hover:backdrop-blur-lg"
                style={{
                  background: 'rgba(0, 0, 0, 0.6)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}
              >
                <p className="text-slate-100 group-hover:text-white transition-colors font-medium text-sm sm:text-base flex items-start gap-2" style={{
                  textShadow: '0 2px 8px rgba(0, 0, 0, 0.9), 0 0 20px rgba(0, 0, 0, 0.7)'
                }}>
                  <span className="text-[#4dd486] mt-0.5">+</span>
                  <span>"{option}"</span>
                </p>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}