'use client';

import React, { useState, useRef, useEffect } from "react";
import { ArrowDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import HeroSection from "@/components/landing/HeroSection";
import ChatInterface from "@/components/landing/ChatInterface";
import ThreeJSBackground from "@/components/landing/ThreeJSBackground";
import QuoteDisplay from "@/components/landing/QuoteDisplay";

export default function ChatPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}`);
  const [quoteData, setQuoteData] = useState<any>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatSectionRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToChat = () => {
    chatSectionRef.current?.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => setShowChat(true), 500);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (customQuery?: string) => {
    const queryText = customQuery || inputValue;
    if (!queryText.trim()) return;

    const userMessage = {
      role: "user",
      content: queryText,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      // Call Next.js API route (not external endpoint directly)
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: userMessage.content
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      setIsTyping(false);

      const assistantMessage = {
        role: "assistant",
        content: data.answer,
        timestamp: new Date().toISOString(),
        metadata: {
          sources: data.sources || [],
          includes_live_pricing: data.includes_live_pricing || false,
          locations: data.locations,
          originalQuery: queryText
        }
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error("API Error:", error);
      setIsTyping(false);

      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date().toISOString()
      }]);
    }
  };

  const handleLocationSelect = (fromCode: string | null, toCode: string | null, originalQuery: string) => {
    // Parse the original query and replace with specific POP codes
    let newQuery = originalQuery;

    // Replace location names with POP codes
    if (fromCode) {
      // Find common patterns like "from X" or "X to"
      const fromPatterns = [
        /from\s+[\w\s]+(?=\s+to)/i,
        /^[\w\s]+(?=\s+to)/i
      ];

      for (const pattern of fromPatterns) {
        if (pattern.test(newQuery)) {
          newQuery = newQuery.replace(pattern, `${fromCode}`);
          break;
        }
      }
    }

    if (toCode) {
      // Find patterns like "to X"
      const toPatterns = [
        /to\s+[\w\s]+$/i,
        /to\s+[\w\s]+(?=\s|$)/i
      ];

      for (const pattern of toPatterns) {
        if (pattern.test(newQuery)) {
          newQuery = newQuery.replace(pattern, `to ${toCode}`);
          break;
        }
      }
    }

    // Resubmit the query with specific codes
    handleSendMessage(newQuery);
  };

  const handleQuickStart = (message: string) => {
    setInputValue(message);
    scrollToChat();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <ThreeJSBackground />

      {/* Hero Section */}
      <HeroSection onGetStarted={scrollToChat} onQuickStart={handleQuickStart} />

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
      >
        <motion.button
          onClick={scrollToChat}
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="p-3 rounded-full glass-morphism hover:bg-white/20 transition-all duration-300"
        >
          <ArrowDown className="w-6 h-6 text-white/80" />
        </motion.button>
      </motion.div>

      {/* Chat Section */}
      <div ref={chatSectionRef} className="min-h-screen flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-4xl mx-auto">
          <AnimatePresence>
            {showChat && (
              <ChatInterface
                messages={messages}
                inputValue={inputValue}
                setInputValue={setInputValue}
                isTyping={isTyping}
                onSendMessage={handleSendMessage}
                onKeyPress={handleKeyPress}
                messagesEndRef={messagesEndRef}
                onViewQuote={(quote: any) => {
                  setQuoteData(quote);
                  setShowQuoteModal(true);
                }}
                onLocationSelect={handleLocationSelect}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Quote Modal */}
      <AnimatePresence>
        {showQuoteModal && quoteData && (
          <QuoteDisplay
            quote={quoteData}
            onClose={() => setShowQuoteModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
