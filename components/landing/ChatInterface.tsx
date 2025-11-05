import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Bot, User, Sparkles, FileText, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import PricingTable from "./PricingTable";
import LocationPicker from "./LocationPicker";

interface ChatInterfaceProps {
  messages: any[];
  inputValue: string;
  setInputValue: (value: string) => void;
  isTyping: boolean;
  onSendMessage: (customQuery?: string) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  onViewQuote: (quote: any) => void;
  onLocationSelect?: (fromCode: string | null, toCode: string | null, originalQuery: string) => void;
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
  onLocationSelect
}: ChatInterfaceProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="chat-container rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden mx-2 sm:mx-0"
    >
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-blue-600/90 to-cyan-600/90 backdrop-blur-md border-b border-white/10 p-4 sm:p-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
            <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-white truncate">PacketFabric AI Assistant</h2>
            <p className="text-slate-100 text-xs sm:text-sm">Ready to help with your networking needs</p>
          </div>
          <div className="ml-auto">
            <div className="flex items-center gap-2 px-2 sm:px-3 py-1 bg-green-400/30 rounded-full">
              <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
              <span className="text-white text-xs font-medium">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="h-80 sm:h-96 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 bg-slate-900/95 backdrop-blur-sm">
        <AnimatePresence>
          {messages.length === 0 && !isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-cyan-400" />
              </div>
              <p className="text-slate-300">Ask me anything about PacketFabric's networking services!</p>
            </motion.div>
          )}

          {messages.map((message, index) => (
            <ChatMessage
              key={index}
              message={message}
              onViewQuote={message.metadata?.quote ? () => onViewQuote(message.metadata.quote) : null}
              onLocationSelect={onLocationSelect}
            />
          ))}

          {isTyping && <TypingIndicator />}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-white/10 p-4 sm:p-6 bg-slate-800/95 backdrop-blur-md">
        <div className="flex gap-3 sm:gap-4 items-end">
          <div className="flex-1">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={onKeyPress}
              placeholder="Ask about pricing, services, technical specs..."
              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-cyan-400 focus:ring-cyan-400/30 rounded-lg sm:rounded-xl h-10 sm:h-12 text-sm sm:text-base"
              disabled={isTyping}
            />
          </div>
          <Button
            onClick={() => onSendMessage()}
            disabled={!inputValue.trim() || isTyping}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 h-10 sm:h-12 px-4 sm:px-6 rounded-lg sm:rounded-xl shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function ChatMessage({
  message,
  onViewQuote,
  onLocationSelect
}: {
  message: any;
  onViewQuote: (() => void) | null;
  onLocationSelect?: (fromCode: string | null, toCode: string | null, originalQuery: string) => void;
}) {
  const isUser = message.role === "user";

  const processContent = (content: string): { hasTables: boolean; parts: Array<{ type: 'text' | 'table'; content: string }> } => {
    const tableBlockRegex = /^\|(?:[^|\n]+\|)+\n\|(?:\s*[-:]+\s*\|)+\n(?:\|(?:[^|\n]+\|)+\n*)+/gm;

    const parts: Array<{ type: 'text' | 'table'; content: string }> = [];
    let lastIndex = 0;
    let hasTables = false;

    const matches = Array.from(content.matchAll(tableBlockRegex));

    matches.forEach(match => {
      hasTables = true;
      if (match.index !== undefined && match.index > lastIndex) {
        const textContent = content.substring(lastIndex, match.index);
        if (textContent.trim() !== '') {
          parts.push({ type: 'text', content: textContent });
        }
      }

      parts.push({ type: 'table', content: match[0] });
      lastIndex = (match.index || 0) + match[0].length;
    });

    if (lastIndex < content.length) {
      const textContent = content.substring(lastIndex);
      if (textContent.trim() !== '') {
        parts.push({ type: 'text', content: textContent });
      }
    }

    if (!hasTables) {
      return { hasTables: false, parts: [{ type: 'text', content }] };
    }

    return { hasTables: true, parts };
  };

  const processedContent = processContent(message.content);
  const hasLivePricing = message.metadata?.includes_live_pricing && processedContent.hasTables;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 sm:gap-4 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUser
          ? 'bg-gradient-to-br from-slate-500 to-slate-600'
          : 'bg-gradient-to-br from-blue-500 to-blue-600'
      } shadow-md`}>
        {isUser ? <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" /> : <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />}
      </div>

      <Card className={`max-w-xs sm:max-w-2xl p-4 sm:p-5 shadow-lg border-0 ${
        isUser
          ? 'bg-slate-700'
          : 'bg-slate-800'
      }`}>
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className={`text-xs font-semibold ${isUser ? 'text-slate-300' : 'text-cyan-400'}`}>
            {isUser ? 'You' : 'PacketFabric AI'}
          </span>
          <span className="text-xs text-slate-500">
            {format(new Date(message.timestamp), "HH:mm")}
          </span>
          {!isUser && hasLivePricing && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-300 text-xs font-semibold rounded-full border border-green-500/30">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
              Live Pricing Data
            </span>
          )}
        </div>

        {processedContent.hasTables ? (
          <div>
            {processedContent.parts.map((part, index) => (
              part.type === 'table' ? (
                <PricingTable key={index} tableData={part.content} />
              ) : (
                <div key={index} className="prose prose-sm prose-invert max-w-none">
                  <ReactMarkdown
                    components={{
                      p: ({node, ...props}) => (
                        <p className="text-slate-100 leading-relaxed mb-4 last:mb-0 text-[15px]" {...props} />
                      ),
                      h2: ({node, ...props}) => (
                        <h2 className="text-xl font-bold text-cyan-300 mb-3 mt-5 first:mt-0" {...props} />
                      ),
                      ul: ({node, ...props}) => (
                        <ul className="list-disc list-outside ml-5 space-y-2 mb-4 text-slate-100" {...props} />
                      ),
                      strong: ({node, ...props}) => (
                        <strong className="font-bold text-white" {...props} />
                      ),
                    }}
                  >
                    {part.content}
                  </ReactMarkdown>
                </div>
              )
            ))}
          </div>
        ) : (
          <div className="prose prose-sm prose-invert max-w-none">
            <ReactMarkdown
              components={{
                p: ({node, ...props}) => (
                  <p className="text-slate-100 leading-relaxed mb-4 last:mb-0 text-[15px]" {...props} />
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}

        {message.metadata?.sources && message.metadata.sources.length > 0 && (
          <div className="mt-6 pt-4 border-t border-slate-700">
            <p className="text-xs font-semibold text-cyan-400 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Sources:
            </p>
            <div className="space-y-2">
              {message.metadata.sources.slice(0, 3).map((source: any, idx: number) => (
                <a
                  key={idx}
                  href={source.source_url && source.source_url.startsWith('http') ? source.source_url : `https://docs.packetfabric.com${source.source_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-slate-700 hover:bg-slate-600 rounded-lg p-3 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-cyan-300 font-medium mb-1 group-hover:text-cyan-200 flex items-center gap-2">
                        <span className="truncate">{source.title}</span>
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </div>
                      <div className="text-xs text-slate-400">
                        Relevance: {source.relevance}
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {!isUser && message.metadata?.locations && (message.metadata.locations.from?.alternatives || message.metadata.locations.to?.alternatives) && onLocationSelect && (
          <LocationPicker
            fromAlternatives={message.metadata.locations.from?.alternatives}
            toAlternatives={message.metadata.locations.to?.alternatives}
            onSelect={(fromCode, toCode) => {
              onLocationSelect(fromCode, toCode, message.metadata.originalQuery || message.content);
            }}
          />
        )}

        {onViewQuote && (
          <div className="mt-4">
            <Button
              onClick={onViewQuote}
              className="bg-cyan-600 hover:bg-cyan-500 text-white w-full text-xs sm:text-sm h-8 sm:h-10"
            >
              <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              View Generated Quote
            </Button>
          </div>
        )}
      </Card>
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3 sm:gap-4"
    >
      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg">
        <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
      </div>

      <Card className="p-4 sm:p-5 shadow-xl bg-slate-800 border-slate-700">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold text-cyan-400">PacketFabric AI</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <span className="text-sm text-slate-300 ml-2">Thinking...</span>
        </div>
      </Card>
    </motion.div>
  );
}
