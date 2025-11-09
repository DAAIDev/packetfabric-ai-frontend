'use client';

import React, { useState, useRef, useEffect } from "react";
import { ArrowDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

import HeroSection from "@/components/landing/HeroSection";
import ChatInterface from "@/components/landing/ChatInterface";
import ThreeJSBackground from "@/components/landing/ThreeJSBackground";
import QuoteDisplay from "@/components/landing/QuoteDisplay";
import ProvisioningFlow from "@/components/landing/ProvisioningFlow";

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}`);
  const [quoteData, setQuoteData] = useState<any>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showProvisioningFlow, setShowProvisioningFlow] = useState(false);
  const [provisioningStep, setProvisioningStep] = useState<'checking' | 'billing' | 'configuring' | 'complete'>('checking');
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

  // Check if user is logged in
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(true);
          setUserInfo(data.user);
        }
      } catch (error) {
        // Not logged in
      }
    };

    checkAuth();
  }, []);

  const handleSendMessage = async (customQuery?: string) => {
    const queryText = customQuery || inputValue;
    if (typeof queryText !== 'string' || !queryText.trim()) return;

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

      // Debug: Log the full API response to check for sources
      console.log('Full API response:', data);
      console.log('Sources:', data.sources);
      console.log('Sources length:', data.sources?.length);

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

      // Debug: Log the assistant message to see what's being added
      console.log('Assistant message with metadata:', assistantMessage);

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
    // Parse the original query and replace location names with specific POP codes
    // Preserve query context (e.g., "price from X to Y" becomes "price from DA1 to LHR")
    let newQuery = originalQuery;

    // Replace the source location with POP code, preserving "from"
    if (fromCode) {
      // Match patterns like "from New York" or "from chicago" and replace the location part only
      newQuery = newQuery.replace(/from\s+[\w\s,]+(?=\s+to)/i, `from ${fromCode}`);
    }

    // Replace the destination location with POP code, preserving "to"
    if (toCode) {
      // Match patterns like "to London" or "to LAX?" - capture everything after "to " until end
      newQuery = newQuery.replace(/to\s+[^?]+/i, `to ${toCode}`);
    }

    console.log('[Location Select] Original query:', originalQuery);
    console.log('[Location Select] Modified query:', newQuery);
    console.log('[Location Select] From code:', fromCode, 'To code:', toCode);

    // Resubmit the query with specific POP codes
    handleSendMessage(newQuery);
  };

  const handleProvision = async () => {
    console.log('Provision button clicked!');
    
    // Check if user is authenticated
    try {
      const response = await fetch('/api/auth/check');
      const data = await response.json();
      
      if (!data.isLoggedIn) {
        // Not logged in - redirect to login with return URL
        console.log('User not logged in, redirecting to login...');
        const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
        router.push(`/login?returnUrl=${returnUrl}`);
        return;
      }
      
      // User is logged in - start provisioning flow
      console.log('User is logged in, starting provisioning flow...');
      setShowProvisioningFlow(true);
      setProvisioningStep('checking');
      
      // Simulate checking availability (2 seconds)
      setTimeout(() => {
        setProvisioningStep('billing');
        
        // Simulate billing check (2 seconds)
        setTimeout(() => {
          setProvisioningStep('configuring');
          
          // Simulate provisioning (3 seconds)
          setTimeout(() => {
            setProvisioningStep('complete');
          }, 3000);
        }, 2000);
      }, 2000);
      
      // Scroll to show the provisioning cards
      setTimeout(() => {
        scrollToBottom();
      }, 100);
      
    } catch (error) {
      console.error('Error checking auth:', error);
      const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
      router.push(`/login?returnUrl=${returnUrl}`);
    }
  };

  const handleNextProvisioningStep = () => {
    // This can be used for manual step progression if needed
    if (provisioningStep === 'checking') {
      setProvisioningStep('billing');
    } else if (provisioningStep === 'billing') {
      setProvisioningStep('configuring');
    }
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
                onProvision={handleProvision}
              />
            )}
          </AnimatePresence>
          
          {/* Provisioning Flow Cards */}
          {showProvisioningFlow && (
            <ProvisioningFlow 
              step={provisioningStep}
              onNextStep={handleNextProvisioningStep}
            />
          )}
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