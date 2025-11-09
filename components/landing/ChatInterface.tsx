'use client';

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Loader2, Send, Search, MapPin, Sparkles, FileText, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import PricingTable from "./PricingTable";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  metadata?: {
    sources?: any[];
    includes_live_pricing?: boolean;
    locations?: any;
    originalQuery?: string;
  };
}

interface ChatInterfaceProps {
  messages: Message[];
  inputValue: string;
  setInputValue: (value: string) => void;
  isTyping: boolean;
  onSendMessage: (customQuery?: string) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  onViewQuote: (quote: any) => void;
  onLocationSelect: (fromCode: string | null, toCode: string | null, originalQuery: string) => void;
  onProvision?: (rowData: {
    term: string;
    monthlyPrice: string;
    listPrice: string;
    discount: string;
    discountPercent: string;
  }) => void;
  isUpdatingPricing?: boolean;
}

export default function ChatInterface({
  messages,
  inputValue,
  setInputValue,
  isTyping,
  onSendMessage,
  onKeyPress,
  messagesEndRef,
  onViewQuote,
  onLocationSelect,
  onProvision,
  isUpdatingPricing = false
}: ChatInterfaceProps) {
  const [showAlternatives, setShowAlternatives] = useState({ from: false, to: false, sources: false });

  // Get the last assistant message for card display
  const lastAssistantMessage = messages && messages.length > 0 
    ? messages.filter(m => m.role === 'assistant').pop() 
    : undefined;
  const hasResponse = lastAssistantMessage !== undefined;

  // Track location changes
  const [selectedLocations, setSelectedLocations] = useState<{
    from: string | null;
    to: string | null;
  }>({ from: null, to: null });

  const [lastQueriedLocations, setLastQueriedLocations] = useState<{
    from: string | null;
    to: string | null;
  }>({ from: null, to: null });

  // Store original alternatives so they persist
  const [originalAlternatives, setOriginalAlternatives] = useState<{
    from: any[];
    to: any[];
  }>({ from: [], to: [] });

  // Update selected locations when message changes
  useEffect(() => {
    if (lastAssistantMessage?.metadata?.locations) {
      const fromResolved = lastAssistantMessage.metadata.locations.from?.resolved;
      const toResolved = lastAssistantMessage.metadata.locations.to?.resolved;
      const fromAlts = lastAssistantMessage.metadata.locations.from?.alternatives || [];
      const toAlts = lastAssistantMessage.metadata.locations.to?.alternatives || [];
      
      setSelectedLocations({
        from: fromResolved || null,
        to: toResolved || null
      });
      
      setLastQueriedLocations({
        from: fromResolved || null,
        to: toResolved || null
      });
      
      // Always update alternatives when we get new location data
      if (fromAlts.length > 0 || toAlts.length > 0) {
        setOriginalAlternatives({
          from: fromAlts,
          to: toAlts
        });
      }
    }
  }, [lastAssistantMessage?.metadata?.locations]);

  // Check if locations have changed
  const locationsChanged = 
    selectedLocations.from !== lastQueriedLocations.from ||
    selectedLocations.to !== lastQueriedLocations.to;

  // Extract pricing table from the content
  const extractPricingTable = (content: string) => {
    const tableRegex = /\|[^\n]+\|\n\|[-:\s|]+\|\n(\|[^\n]+\|\n)+/g;
    const match = content.match(tableRegex);
    return match ? match[0] : null;
  };

  // Remove table from content for display
  const getContentWithoutTable = (content: string) => {
    const tableRegex = /\|[^\n]+\|\n\|[-:\s|]+\|\n(\|[^\n]+\|\n)+/g;
    return content.replace(tableRegex, '').trim();
  };

  const pricingTable = lastAssistantMessage ? extractPricingTable(lastAssistantMessage.content) : null;
  const contentWithoutTable = lastAssistantMessage ? getContentWithoutTable(lastAssistantMessage.content) : '';

  const quickPrompts = [
    "Price a 100G wavelength from New York to Los Angeles",
    "What is the difference between wavelength and cloud router?",
    "Show me colocation options in Denver"
  ];

  const handleLocationClick = (fromCode: string | null, toCode: string | null) => {
    // Update selected locations without auto-querying
    setSelectedLocations({
      from: fromCode || selectedLocations.from,
      to: toCode || selectedLocations.to
    });
    
    // Close the alternatives dropdown
    setShowAlternatives(prev => ({ ...prev, from: false, to: false }));
  };

  const handleUpdatePricing = () => {
    if (!lastAssistantMessage?.metadata?.originalQuery) return;
    
    console.log('Updating pricing with new locations:', {
      from: selectedLocations.from,
      to: selectedLocations.to,
      originalQuery: lastAssistantMessage.metadata.originalQuery
    });
    
    // Call the parent's location select handler with new locations
    onLocationSelect(
      selectedLocations.from,
      selectedLocations.to,
      lastAssistantMessage.metadata.originalQuery
    );
    
    // Update last queried locations
    setLastQueriedLocations({
      from: selectedLocations.from,
      to: selectedLocations.to
    });
  };

  return (
    <div className="w-full">
      {/* Large Search Bar - Sticky */}
      <div className="sticky top-6 z-40 mb-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-morphism rounded-3xl shadow-2xl border border-white/20 p-8 backdrop-blur-xl"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4dd486] to-[#20c6b5] flex items-center justify-center shadow-lg flex-shrink-0">
              <Search className="w-6 h-6 text-white" />
            </div>
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={onKeyPress}
              placeholder="Ask about pricing, services, or technical questions..."
              className="flex-1 text-xl outline-none text-white placeholder-white/60 bg-transparent resize-none font-medium"
              rows={1}
              disabled={isTyping}
              style={{ minHeight: '32px', maxHeight: '120px' }}
            />
            <Button
              onClick={() => onSendMessage()}
              disabled={isTyping || !inputValue || !inputValue.trim()}
              className="bg-gradient-to-r from-[#4dd486] to-[#20c6b5] hover:from-[#3bc274] hover:to-[#1ab4a3] text-white px-8 py-4 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105"
            >
              {isTyping ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Thinking...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Ask
                </>
              )}
            </Button>
          </div>

          {/* Quick Prompts - Show only when no response */}
          {!hasResponse && (
            <div className="mt-8 pt-8 border-t border-white/20">
              <p className="text-sm text-white/80 mb-4 flex items-center gap-2 font-semibold">
                <Sparkles className="w-4 h-4 text-[#4dd486]" />
                Try asking:
              </p>
              <div className="flex flex-wrap gap-3">
                {quickPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => setInputValue(prompt)}
                    className="text-sm px-5 py-3 bg-white/10 hover:bg-[#4dd486]/20 text-white rounded-xl transition-all backdrop-blur-sm border border-white/20 hover:border-[#4dd486]/50 font-medium"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Response Cards */}
      {hasResponse && (
        <div className="space-y-8">
          
          {/* Location Selection Card */}
          {lastAssistantMessage.metadata?.locations && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-morphism rounded-3xl shadow-2xl border border-white/20 overflow-hidden backdrop-blur-xl"
            >
              {/* Card Header with PacketFabric Gradient */}
              <div 
                className="backdrop-blur-md p-6"
                style={{
                  background: 'linear-gradient(135deg, #2877f3 0%, #20c6b5 100%)'
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Selected Locations</h3>
                    <p className="text-white/90 text-sm">Click to see alternative connection points</p>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-8 bg-slate-900/40">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* From Location */}
                  {lastAssistantMessage.metadata.locations.from && (
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10 backdrop-blur-sm">
                      <p className="text-xs text-[#4dd486] mb-2 font-bold uppercase tracking-wider">Origin</p>
                      <p className="text-xl font-bold text-white mb-4">
                        {selectedLocations.from || lastAssistantMessage.metadata.locations.from.resolved}
                      </p>
                      
                      {originalAlternatives.from.length > 0 && (
                        <>
                          <button
                            onClick={() => setShowAlternatives(prev => ({ ...prev, from: !prev.from }))}
                            className="flex items-center gap-2 text-[#4dd486] hover:text-[#3bc274] font-semibold text-sm transition-colors"
                          >
                            {showAlternatives.from ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            {originalAlternatives.from.length} alternative locations
                          </button>

                          {showAlternatives.from && (
                            <div className="mt-4 space-y-2">
                              {originalAlternatives.from.map((alt: any, i: number) => (
                                <button
                                  key={i}
                                  onClick={() => handleLocationClick(alt.code, null)}
                                  className={`w-full text-left px-4 py-3 rounded-xl transition-all border ${
                                    selectedLocations.from === alt.code
                                      ? 'bg-[#4dd486]/20 border-[#4dd486]/50'
                                      : 'bg-white/5 border-white/10 hover:bg-[#4dd486]/10 hover:border-[#4dd486]/30'
                                  } text-white`}
                                >
                                  <span className="font-bold text-[#4dd486]">{alt.code}</span> <span className="text-white/80">- {alt.name}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {/* To Location */}
                  {lastAssistantMessage.metadata.locations.to && (
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10 backdrop-blur-sm">
                      <p className="text-xs text-[#4dd486] mb-2 font-bold uppercase tracking-wider">Destination</p>
                      <p className="text-xl font-bold text-white mb-4">
                        {selectedLocations.to || lastAssistantMessage.metadata.locations.to.resolved}
                      </p>
                      
                      {originalAlternatives.to.length > 0 && (
                        <>
                          <button
                            onClick={() => setShowAlternatives(prev => ({ ...prev, to: !prev.to }))}
                            className="flex items-center gap-2 text-[#4dd486] hover:text-[#3bc274] font-semibold text-sm transition-colors"
                          >
                            {showAlternatives.to ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            {originalAlternatives.to.length} alternative locations
                          </button>

                          {showAlternatives.to && (
                            <div className="mt-4 space-y-2">
                              {originalAlternatives.to.map((alt: any, i: number) => (
                                <button
                                  key={i}
                                  onClick={() => handleLocationClick(null, alt.code)}
                                  className={`w-full text-left px-4 py-3 rounded-xl transition-all border ${
                                    selectedLocations.to === alt.code
                                      ? 'bg-[#4dd486]/20 border-[#4dd486]/50'
                                      : 'bg-white/5 border-white/10 hover:bg-[#4dd486]/10 hover:border-[#4dd486]/30'
                                  } text-white`}
                                >
                                  <span className="font-bold text-[#4dd486]">{alt.code}</span> <span className="text-white/80">- {alt.name}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Locations Changed Warning + Update Button */}
                {locationsChanged && !isUpdatingPricing && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-6 bg-gradient-to-r from-[#2877f3]/10 to-[#4dd486]/10 rounded-xl p-4 border border-[#2877f3]/30"
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <AlertCircle className="w-5 h-5 text-[#2877f3] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-white font-semibold">Locations Changed</p>
                        <p className="text-white/70 text-sm">
                          Route updated to: <span className="text-[#4dd486] font-bold">{selectedLocations.from} → {selectedLocations.to}</span>
                        </p>
                        <p className="text-white/70 text-sm mt-1">Pricing may differ for this route.</p>
                      </div>
                    </div>
                    <Button
                      onClick={handleUpdatePricing}
                      className="w-full bg-gradient-to-r from-[#2877f3] to-[#4dd486] hover:from-[#1e5fd9] hover:to-[#3bc274] text-white px-6 py-3 rounded-xl font-bold shadow-xl hover:shadow-2xl hover:scale-105"
                    >
                      Update Pricing
                    </Button>
                  </motion.div>
                )}

                {/* Updating Pricing Loader */}
                {isUpdatingPricing && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-6 bg-gradient-to-r from-[#2877f3]/10 to-[#4dd486]/10 rounded-xl p-4 border border-[#2877f3]/30"
                  >
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-5 h-5 text-[#4dd486] animate-spin flex-shrink-0" />
                      <div>
                        <p className="text-white font-semibold">Updating Pricing...</p>
                        <p className="text-white/70 text-sm">
                          Fetching pricing for: <span className="text-[#4dd486] font-bold">{selectedLocations.from} → {selectedLocations.to}</span>
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* AI Answer Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-morphism rounded-3xl shadow-2xl border border-white/20 overflow-hidden backdrop-blur-xl"
          >
            {/* Card Header with PacketFabric Gradient */}
            <div 
              className="backdrop-blur-md p-6"
              style={{
                background: 'linear-gradient(135deg, #693cf3 0%, #2877f3 100%)'
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Answer</h3>
                  </div>
                </div>
                {lastAssistantMessage.metadata?.includes_live_pricing && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-[#4dd486]/20 backdrop-blur-sm rounded-full border border-[#4dd486]/30">
                    <div className="w-2 h-2 rounded-full bg-[#4dd486] animate-pulse" />
                    <span className="text-sm font-bold text-white">Live Pricing Data</span>
                  </div>
                )}
              </div>
            </div>

            {/* Card Body */}
            <div className="p-8 bg-slate-900/40">
              <div className="space-y-6">
                {contentWithoutTable.split('\n\n').map((paragraph, idx) => {
                  // Check if it's a heading (starts with ### or ##)
                  if (paragraph.startsWith('###') || paragraph.startsWith('##')) {
                    const headingText = paragraph.replace(/^#{2,3}\s+/, '');
                    return (
                      <div key={idx} className="pt-4 pb-2">
                        <h3 className="text-2xl font-bold text-[#4dd486] border-b-2 border-[#4dd486]/30 pb-3 mb-4">
                          {headingText}
                        </h3>
                      </div>
                    );
                  }
                  
                  // Check if it's a bullet point section
                  if (paragraph.includes('* ') || paragraph.includes('- ')) {
                    const items = paragraph.split(/\n[\*\-]\s+/).filter(Boolean);
                    return (
                      <div key={idx} className="bg-white/5 rounded-xl p-6 border border-white/10 space-y-3">
                        {items.map((item, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <span className="text-[#4dd486] text-xl font-bold mt-0.5 flex-shrink-0">+</span>
                            <p 
                              className="text-white/90 leading-relaxed flex-1"
                              dangerouslySetInnerHTML={{ 
                                __html: item
                                  .replace(/\*\*(.+?)\*\*/g, '<strong class="text-[#4dd486] font-bold">$1</strong>')
                                  .replace(/`(.+?)`/g, '<code class="bg-[#4dd486]/10 border border-[#4dd486]/20 px-2 py-0.5 rounded text-[#4dd486] text-sm">$1</code>')
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    );
                  }
                  
                  // Regular paragraph
                  if (paragraph.trim()) {
                    return (
                      <p 
                        key={idx}
                        className="text-white/90 leading-relaxed text-lg"
                        dangerouslySetInnerHTML={{ 
                          __html: paragraph
                            .replace(/\*\*(.+?)\*\*/g, '<strong class="text-[#4dd486] font-bold">$1</strong>')
                            .replace(/`(.+?)`/g, '<code class="bg-[#4dd486]/10 border border-[#4dd486]/20 px-2 py-1 rounded text-[#4dd486]">$1</code>')
                        }}
                      />
                    );
                  }
                  return null;
                })}
              </div>
              
              {/* Pricing Table with Loading Spinners */}
              {pricingTable && (
                <div className="mt-8">
                  {isUpdatingPricing ? (
                    // Loading state - same style as provisioning flow
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Loader2 className="w-5 h-5 text-[#4dd486] animate-spin" />
                        <p className="text-white/90">Fetching pricing data...</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Loader2 className="w-5 h-5 text-[#4dd486] animate-spin" />
                        <p className="text-white/90">Calculating rates for {selectedLocations.from} → {selectedLocations.to}...</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Loader2 className="w-5 h-5 text-[#4dd486] animate-spin" />
                        <p className="text-white/90">Applying discounts and contract terms...</p>
                      </div>
                    </div>
                  ) : (
                    <PricingTable tableData={pricingTable} onProvision={onProvision} />
                  )}
                </div>
              )}
            </div>
          </motion.div>

          {/* Sources Card - Collapsible */}
          {lastAssistantMessage.metadata?.sources && lastAssistantMessage.metadata.sources.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-morphism rounded-3xl shadow-2xl border border-white/20 overflow-hidden backdrop-blur-xl"
            >
              {/* Card Header with PacketFabric Gradient - Clickable */}
              <div 
                className="backdrop-blur-md p-6"
                style={{
                  background: 'linear-gradient(135deg, #2877f3 0%, #693cf3 100%)'
                }}
              >
                <button
                  onClick={() => setShowAlternatives(prev => ({ ...prev, sources: !prev.sources }))}
                  className="w-full flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-2xl font-bold text-white">Sources & Citations</h3>
                      <p className="text-white/90 text-sm">
                        {lastAssistantMessage.metadata.sources.length} documentation sources
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white/80 text-sm font-semibold">
                      {showAlternatives.sources ? 'Hide' : 'View'}
                    </span>
                    {showAlternatives.sources ? (
                      <ChevronUp className="w-5 h-5 text-white" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-white" />
                    )}
                  </div>
                </button>
              </div>

              {/* Card Body - Collapsible */}
              {showAlternatives.sources && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-8 bg-slate-900/40">
                    <div className="grid md:grid-cols-2 gap-4">
                      {lastAssistantMessage.metadata.sources.map((source: any, i: number) => (
                        <div
                          key={i}
                          className="flex items-start gap-4 p-5 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all"
                        >
                          <div className="flex-1">
                            <div className="font-bold text-white mb-1">
                              {source.title || `Source ${i + 1}`}
                            </div>
                            {source.category && (
                              <div className="text-sm text-white/60">{source.category}</div>
                            )}
                          </div>
                          {source.similarity && (
                            <div className="text-sm font-bold text-[#4dd486] bg-[#4dd486]/10 px-3 py-1 rounded-full">
                              {source.similarity}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}