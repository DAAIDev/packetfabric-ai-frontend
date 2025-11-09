import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Loader2, Settings, Zap, AlertCircle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProvisioningFlowProps {
  step: 'checking' | 'config' | 'billing' | 'configuring' | 'complete';
  onNextStep: () => void;
  availabilityData?: any;
  selectedPricing?: any;
  onConfigConfirm?: (config: any) => void;
  onBillingConfirm?: () => void;
  provisioningConfig?: any;
  onSpeedChange?: (newSpeed: string, originalQuery: string) => void;
  originalQuery?: string;
}

export default function ProvisioningFlow({ 
  step, 
  onNextStep, 
  availabilityData, 
  selectedPricing,
  onConfigConfirm,
  onBillingConfirm,
  provisioningConfig,
  onSpeedChange,
  originalQuery
}: ProvisioningFlowProps) {
  // Extract unique speeds and zones from availability data
  const getAvailableSpeeds = () => {
    if (!availabilityData) return [];
    const speeds = new Set<string>();
    availabilityData.from?.availability?.forEach((item: any) => speeds.add(item.speed));
    availabilityData.to?.availability?.forEach((item: any) => speeds.add(item.speed));
    return Array.from(speeds).sort((a, b) => {
      const aNum = parseInt(a);
      const bNum = parseInt(b);
      return bNum - aNum; // Sort descending
    });
  };

  // Get available media types for a specific speed at a location
  const getMediaTypesForSpeed = (location: 'from' | 'to', speed: string) => {
    if (!availabilityData) return [];
    const mediaTypes = new Set<string>();
    availabilityData[location]?.availability?.forEach((item: any) => {
      if (item.speed === speed) {
        mediaTypes.add(item.media);
      }
    });
    return Array.from(mediaTypes);
  };

  // Extract speed from pricing (e.g., "100Gbps" from term string or pricing metadata)
  const getSpeedFromPricing = () => {
    // Try to extract from term or default to first available speed
    return getAvailableSpeeds()[0] || '100Gbps';
  };

  const availableSpeeds = getAvailableSpeeds();
  const selectedSpeed = getSpeedFromPricing();
  const [originalSpeed, setOriginalSpeed] = useState(selectedSpeed);
  const [isUpdatingPricing, setIsUpdatingPricing] = useState(false);

  // Configuration state
  const [config, setConfig] = useState({
    speed: selectedSpeed,
    fromMedia: '',
    toMedia: '',
    fromZone: '',
    toZone: ''
  });

  // Initialize config with auto-selected values
  useEffect(() => {
    if (availabilityData && step === 'config') {
      const fromMediaTypes = getMediaTypesForSpeed('from', selectedSpeed);
      const toMediaTypes = getMediaTypesForSpeed('to', selectedSpeed);
      
      setConfig({
        speed: selectedSpeed,
        fromMedia: fromMediaTypes[0] || '',
        toMedia: toMediaTypes[0] || '',
        fromZone: availabilityData.from?.zones?.[0] || '',
        toZone: availabilityData.to?.zones?.[0] || ''
      });
      
      // Set original speed when entering config step
      setOriginalSpeed(selectedSpeed);
    }
  }, [availabilityData, step, selectedSpeed]);

  // Check if speed has changed
  const speedChanged = config.speed !== originalSpeed;

  const handleConfigChange = (field: string, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleConfirmConfig = () => {
    if (onConfigConfirm) {
      onConfigConfirm(config);
    }
  };

  const handleUpdatePricing = () => {
    if (onSpeedChange && originalQuery) {
      setIsUpdatingPricing(true);
      onSpeedChange(config.speed, originalQuery);
    }
  };

  // Clear updating state when new availability data arrives
  useEffect(() => {
    if (availabilityData) {
      setIsUpdatingPricing(false);
    }
  }, [availabilityData]);

  return (
    <div className="space-y-8 mt-8">
      {/* Step 1: Checking Availability */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-morphism rounded-3xl shadow-2xl border border-white/20 overflow-hidden backdrop-blur-xl"
      >
        <div
          className="backdrop-blur-md p-6"
          style={{
            background: 'linear-gradient(135deg, #4dd486 0%, #20c6b5 100%)'
          }}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              {(step === 'checking' && !availabilityData) ? (
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              ) : (
                <CheckCircle className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Checking Availability</h3>
              <p className="text-white/90 text-sm">Verifying service availability for your selected route</p>
            </div>
          </div>
        </div>

        <div className="p-8 bg-slate-900/40">
          {step === 'checking' && !availabilityData ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-[#4dd486] animate-spin" />
                <p className="text-white/90">Checking port availability...</p>
              </div>
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-[#4dd486] animate-spin" />
                <p className="text-white/90">Verifying speed and zone compatibility...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-[#4dd486]" />
                <p className="text-white/90">Service is available at both locations</p>
              </div>
              
              {/* Show real availability data */}
              {availabilityData && (
                <div className="mt-4 space-y-3">
                  {/* From Location */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-white font-semibold mb-2">
                      📍 {availabilityData.from?.pop || 'Source'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-white/70 text-sm">Zones:</span>
                      {availabilityData.from?.zones?.map((zone: string) => (
                        <span key={zone} className="px-2 py-1 bg-[#4dd486]/20 text-[#4dd486] rounded text-xs font-medium">
                          {zone}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* To Location */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-white font-semibold mb-2">
                      📍 {availabilityData.to?.pop || 'Destination'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-white/70 text-sm">Zones:</span>
                      {availabilityData.to?.zones?.map((zone: string) => (
                        <span key={zone} className="px-2 py-1 bg-[#4dd486]/20 text-[#4dd486] rounded text-xs font-medium">
                          {zone}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Available Speeds */}
                  {availableSpeeds.length > 0 && (
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <p className="text-white font-semibold mb-2">⚡ Available Speeds</p>
                      <div className="flex flex-wrap gap-2">
                        {availableSpeeds.map((speed) => (
                          <span key={speed} className="px-3 py-1 bg-[#20c6b5]/20 text-[#20c6b5] rounded-lg text-sm font-medium">
                            {speed}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Selected Pricing */}
                  {selectedPricing && (
                    <div className="bg-gradient-to-r from-[#4dd486]/10 to-[#20c6b5]/10 rounded-xl p-4 border border-[#4dd486]/30">
                      <p className="text-white font-semibold mb-2">💰 Selected Plan</p>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-white/70">Term:</p>
                          <p className="text-white font-bold">{selectedPricing.term}</p>
                        </div>
                        <div>
                          <p className="text-white/70">Monthly Price:</p>
                          <p className="text-[#4dd486] font-bold text-lg">{selectedPricing.monthlyPrice}</p>
                        </div>
                        {selectedPricing.discountPercent && selectedPricing.discountPercent !== '0%' && (
                          <>
                            <div>
                              <p className="text-white/70">Discount:</p>
                              <p className="text-[#4dd486] font-bold">{selectedPricing.discountPercent}</p>
                            </div>
                            <div>
                              <p className="text-white/70">You Save:</p>
                              <p className="text-[#4dd486] font-bold">{selectedPricing.discount}</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Continue Button - Only show on checking step after data loads */}
                  {step === 'checking' && (
                    <Button
                      onClick={onNextStep}
                      className="w-full mt-4 bg-gradient-to-r from-[#4dd486] to-[#20c6b5] hover:from-[#3bc274] hover:to-[#1ab4a3] text-white px-6 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105"
                    >
                      Continue to Configuration
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Step 2: Configuration Review */}
      {(step === 'config' || step === 'billing' || step === 'configuring' || step === 'complete') && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-morphism rounded-3xl shadow-2xl border border-white/20 overflow-hidden backdrop-blur-xl"
        >
          <div
            className="backdrop-blur-md p-6"
            style={{
              background: 'linear-gradient(135deg, #693cf3 0%, #2877f3 100%)'
            }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                {step === 'config' ? (
                  <Settings className="w-6 h-6 text-white" />
                ) : (
                  <CheckCircle className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Configuration Review</h3>
                <p className="text-white/90 text-sm">Review and customize your service configuration</p>
              </div>
            </div>
          </div>

          <div className="p-8 bg-slate-900/40">
            {step === 'config' ? (
              <div className="space-y-6">
                {/* Route Display */}
                <div className="bg-gradient-to-r from-[#693cf3]/10 to-[#2877f3]/10 rounded-2xl p-6 border border-[#693cf3]/30 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#693cf3] to-[#2877f3] flex items-center justify-center">
                      <span className="text-xl">🗺️</span>
                    </div>
                    <div>
                      <p className="text-xs text-[#693cf3] font-bold uppercase tracking-wider">Route</p>
                      <p className="text-white font-bold text-xl">
                        {availabilityData?.from?.pop} → {availabilityData?.to?.pop}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Speed Selection - Styled */}
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10 backdrop-blur-sm hover:border-[#4dd486]/30 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4dd486] to-[#20c6b5] flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">⚡</span>
                    </div>
                    <div>
                      <label className="text-xs text-[#4dd486] font-bold uppercase tracking-wider block">Speed</label>
                      <p className="text-white/70 text-xs">Select connection bandwidth</p>
                    </div>
                  </div>
                  <div className="relative">
                    <select
                      value={config.speed}
                      onChange={(e) => handleConfigChange('speed', e.target.value)}
                      className="w-full appearance-none bg-slate-800/80 text-white border-2 border-white/20 rounded-xl px-5 py-4 pr-12 focus:outline-none focus:border-[#4dd486] focus:ring-2 focus:ring-[#4dd486]/20 font-bold text-lg transition-all cursor-pointer hover:border-[#4dd486]/50"
                    >
                      {availableSpeeds.map((speed) => (
                        <option key={speed} value={speed} className="bg-slate-800 text-white font-bold py-2">
                          {speed}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4dd486] pointer-events-none" />
                  </div>
                  <p className="text-white/50 text-xs mt-3 flex items-center gap-2">
                    <AlertCircle className="w-3 h-3" />
                    Changing speed will affect pricing
                  </p>
                </div>

                {/* Speed Changed Warning + Update Button */}
                {speedChanged && !isUpdatingPricing && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-gradient-to-r from-[#2877f3]/20 to-[#4dd486]/20 rounded-2xl p-6 border-2 border-[#2877f3]/50 backdrop-blur-sm"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-[#2877f3]/20 flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-5 h-5 text-[#2877f3]" />
                      </div>
                      <div>
                        <p className="text-white font-bold text-lg">Speed Changed</p>
                        <p className="text-white/80 text-sm mt-1">
                          Speed updated to: <span className="text-[#4dd486] font-bold">{config.speed}</span>
                        </p>
                        <p className="text-white/70 text-sm mt-1">Pricing will differ for this speed. Update pricing to continue.</p>
                      </div>
                    </div>
                    <Button
                      onClick={handleUpdatePricing}
                      className="w-full bg-gradient-to-r from-[#2877f3] to-[#4dd486] hover:from-[#1e5fd9] hover:to-[#3bc274] text-white px-6 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105"
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
                    className="bg-gradient-to-r from-[#2877f3]/10 to-[#4dd486]/10 rounded-2xl p-6 border border-[#2877f3]/30"
                  >
                    <div className="flex items-center gap-4">
                      <Loader2 className="w-6 h-6 text-[#4dd486] animate-spin flex-shrink-0" />
                      <div>
                        <p className="text-white font-bold text-lg">Updating Pricing...</p>
                        <p className="text-white/70 text-sm">
                          Fetching pricing for: <span className="text-[#4dd486] font-bold">{config.speed}</span>
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Source Media - Styled */}
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10 backdrop-blur-sm hover:border-[#20c6b5]/30 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#20c6b5] to-[#4dd486] flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">📡</span>
                    </div>
                    <div>
                      <label className="text-xs text-[#20c6b5] font-bold uppercase tracking-wider block">
                        Media Type - {availabilityData?.from?.pop}
                      </label>
                      <p className="text-white/70 text-xs">Source connection media</p>
                    </div>
                  </div>
                  <div className="relative">
                    <select
                      value={config.fromMedia}
                      onChange={(e) => handleConfigChange('fromMedia', e.target.value)}
                      className="w-full appearance-none bg-slate-800/80 text-white border-2 border-white/20 rounded-xl px-5 py-4 pr-12 focus:outline-none focus:border-[#20c6b5] focus:ring-2 focus:ring-[#20c6b5]/20 font-semibold text-lg transition-all cursor-pointer hover:border-[#20c6b5]/50"
                    >
                      {getMediaTypesForSpeed('from', config.speed).map((media) => (
                        <option key={media} value={media} className="bg-slate-800 text-white font-semibold py-2">
                          {media}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#20c6b5] pointer-events-none" />
                  </div>
                </div>

                {/* Destination Media - Styled */}
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10 backdrop-blur-sm hover:border-[#20c6b5]/30 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#20c6b5] to-[#4dd486] flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">📡</span>
                    </div>
                    <div>
                      <label className="text-xs text-[#20c6b5] font-bold uppercase tracking-wider block">
                        Media Type - {availabilityData?.to?.pop}
                      </label>
                      <p className="text-white/70 text-xs">Destination connection media</p>
                    </div>
                  </div>
                  <div className="relative">
                    <select
                      value={config.toMedia}
                      onChange={(e) => handleConfigChange('toMedia', e.target.value)}
                      className="w-full appearance-none bg-slate-800/80 text-white border-2 border-white/20 rounded-xl px-5 py-4 pr-12 focus:outline-none focus:border-[#20c6b5] focus:ring-2 focus:ring-[#20c6b5]/20 font-semibold text-lg transition-all cursor-pointer hover:border-[#20c6b5]/50"
                    >
                      {getMediaTypesForSpeed('to', config.speed).map((media) => (
                        <option key={media} value={media} className="bg-slate-800 text-white font-semibold py-2">
                          {media}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#20c6b5] pointer-events-none" />
                  </div>
                </div>

                {/* Source Zone - Styled */}
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10 backdrop-blur-sm hover:border-[#693cf3]/30 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#693cf3] to-[#2877f3] flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">🏢</span>
                    </div>
                    <div>
                      <label className="text-xs text-[#693cf3] font-bold uppercase tracking-wider block">
                        Zone - {availabilityData?.from?.pop}
                      </label>
                      <p className="text-white/70 text-xs">Source datacenter zone</p>
                    </div>
                  </div>
                  <div className="relative">
                    <select
                      value={config.fromZone}
                      onChange={(e) => handleConfigChange('fromZone', e.target.value)}
                      className="w-full appearance-none bg-slate-800/80 text-white border-2 border-white/20 rounded-xl px-5 py-4 pr-12 focus:outline-none focus:border-[#693cf3] focus:ring-2 focus:ring-[#693cf3]/20 font-semibold text-lg transition-all cursor-pointer hover:border-[#693cf3]/50"
                    >
                      {availabilityData?.from?.zones?.map((zone: string) => (
                        <option key={zone} value={zone} className="bg-slate-800 text-white font-semibold py-2">
                          Zone {zone}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#693cf3] pointer-events-none" />
                  </div>
                </div>

                {/* Destination Zone - Styled */}
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10 backdrop-blur-sm hover:border-[#693cf3]/30 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#693cf3] to-[#2877f3] flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">🏢</span>
                    </div>
                    <div>
                      <label className="text-xs text-[#693cf3] font-bold uppercase tracking-wider block">
                        Zone - {availabilityData?.to?.pop}
                      </label>
                      <p className="text-white/70 text-xs">Destination datacenter zone</p>
                    </div>
                  </div>
                  <div className="relative">
                    <select
                      value={config.toZone}
                      onChange={(e) => handleConfigChange('toZone', e.target.value)}
                      className="w-full appearance-none bg-slate-800/80 text-white border-2 border-white/20 rounded-xl px-5 py-4 pr-12 focus:outline-none focus:border-[#693cf3] focus:ring-2 focus:ring-[#693cf3]/20 font-semibold text-lg transition-all cursor-pointer hover:border-[#693cf3]/50"
                    >
                      {availabilityData?.to?.zones?.map((zone: string) => (
                        <option key={zone} value={zone} className="bg-slate-800 text-white font-semibold py-2">
                          Zone {zone}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#693cf3] pointer-events-none" />
                  </div>
                </div>

                {/* Confirm Button - Only show if speed hasn't changed OR pricing has been updated */}
                {!speedChanged && (
                  <Button
                    onClick={handleConfirmConfig}
                    className="w-full bg-gradient-to-r from-[#4dd486] to-[#20c6b5] hover:from-[#3bc274] hover:to-[#1ab4a3] text-white px-6 py-5 rounded-2xl font-bold text-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
                  >
                    Continue to Billing
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[#4dd486]" />
                  <p className="text-white/90">Configuration confirmed</p>
                </div>
                
                {/* Show confirmed config */}
                {provisioningConfig && (
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/70">Speed:</span>
                      <span className="text-white font-bold">{provisioningConfig.speed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">{availabilityData?.from?.pop} Media:</span>
                      <span className="text-white font-bold">{provisioningConfig.fromMedia}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">{availabilityData?.to?.pop} Media:</span>
                      <span className="text-white font-bold">{provisioningConfig.toMedia}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">{availabilityData?.from?.pop} Zone:</span>
                      <span className="text-white font-bold">Zone {provisioningConfig.fromZone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">{availabilityData?.to?.pop} Zone:</span>
                      <span className="text-white font-bold">Zone {provisioningConfig.toZone}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Step 3: Billing Confirmation */}
      {(step === 'billing' || step === 'configuring' || step === 'complete') && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-morphism rounded-3xl shadow-2xl border border-white/20 overflow-hidden backdrop-blur-xl"
        >
          <div
            className="backdrop-blur-md p-6"
            style={{
              background: 'linear-gradient(135deg, #2877f3 0%, #693cf3 100%)'
            }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                {step === 'billing' ? (
                  <Loader2 className="w-6 h-6 text-white" />
                ) : (
                  <CheckCircle className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Billing Confirmation</h3>
                <p className="text-white/90 text-sm">Review final pricing and confirm billing</p>
              </div>
            </div>
          </div>

          <div className="p-8 bg-slate-900/40">
            {step === 'billing' ? (
              <div className="space-y-6">
                {/* Billing Account Status */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle className="w-5 h-5 text-[#4dd486]" />
                    <p className="text-white/90 font-semibold">Billing account verified</p>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="text-white/70">Account: ****-****-****-1234</p>
                    <p className="text-white/70">Status: Active</p>
                  </div>
                </div>

                {/* Final Pricing Confirmation */}
                {selectedPricing && (
                  <div className="bg-gradient-to-r from-[#2877f3]/10 to-[#693cf3]/10 rounded-xl p-6 border border-[#2877f3]/30">
                    <p className="text-white font-bold text-lg mb-4">Final Pricing Confirmation</p>
                    <div className="space-y-3">
                      <div className="flex justify-between text-lg">
                        <span className="text-white/70">Monthly Cost:</span>
                        <span className="text-white font-bold">{selectedPricing.monthlyPrice}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Contract Term:</span>
                        <span className="text-white font-bold">{selectedPricing.term}</span>
                      </div>
                      {selectedPricing.discountPercent && selectedPricing.discountPercent !== '0%' && (
                        <div className="flex justify-between border-t border-white/10 pt-3 mt-3">
                          <span className="text-[#4dd486] font-semibold">Total Savings:</span>
                          <span className="text-[#4dd486] font-bold">{selectedPricing.discount} ({selectedPricing.discountPercent})</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Configuration Summary */}
                {provisioningConfig && (
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-white font-semibold mb-3">Service Configuration</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-white/70">Route:</p>
                        <p className="text-white font-bold">{availabilityData?.from?.pop} → {availabilityData?.to?.pop}</p>
                      </div>
                      <div>
                        <p className="text-white/70">Speed:</p>
                        <p className="text-white font-bold">{provisioningConfig.speed}</p>
                      </div>
                      <div>
                        <p className="text-white/70">Media:</p>
                        <p className="text-white font-bold">{provisioningConfig.fromMedia} / {provisioningConfig.toMedia}</p>
                      </div>
                      <div>
                        <p className="text-white/70">Zones:</p>
                        <p className="text-white font-bold">{provisioningConfig.fromZone} / {provisioningConfig.toZone}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Confirm Button */}
                <Button
                  onClick={onBillingConfirm}
                  className="w-full bg-gradient-to-r from-[#2877f3] to-[#693cf3] hover:from-[#1e5fd9] hover:to-[#5a2fd9] text-white px-6 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105"
                >
                  Confirm & Provision Service
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[#4dd486]" />
                  <p className="text-white/90">Billing confirmed</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Step 4: Provisioning */}
      {(step === 'configuring' || step === 'complete') && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-morphism rounded-3xl shadow-2xl border border-white/20 overflow-hidden backdrop-blur-xl"
        >
          <div
            className="backdrop-blur-md p-6"
            style={{
              background: 'linear-gradient(135deg, #4dd486 0%, #20c6b5 100%)'
            }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                {step === 'configuring' ? (
                  <Settings className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <CheckCircle className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Provisioning Service</h3>
                <p className="text-white/90 text-sm">Configuring your connection</p>
              </div>
            </div>
          </div>

          <div className="p-8 bg-slate-900/40">
            {step === 'configuring' ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-[#4dd486] animate-spin" />
                  <p className="text-white/90">Allocating ports...</p>
                </div>
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-[#4dd486] animate-spin" />
                  <p className="text-white/90">Configuring routing...</p>
                </div>
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-[#4dd486] animate-spin" />
                  <p className="text-white/90">Establishing connection...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[#4dd486]" />
                  <p className="text-white/90">Service successfully provisioned!</p>
                </div>
                <div className="bg-gradient-to-r from-[#4dd486]/10 to-[#20c6b5]/10 rounded-xl p-6 border border-[#4dd486]/30">
                  <div className="flex items-center gap-3 mb-4">
                    <Zap className="w-6 h-6 text-[#4dd486]" />
                    <h4 className="text-lg font-bold text-white">Your service is ready!</h4>
                  </div>
                  <p className="text-white/80 mb-4">Your connection is now active and ready to use.</p>
                  <Button
                    className="bg-gradient-to-r from-[#4dd486] to-[#20c6b5] hover:from-[#3bc274] hover:to-[#1ab4a3] text-white px-6 py-2 rounded-lg font-bold"
                    onClick={() => window.open('https://portal.packetfabric.com', '_blank')}
                  >
                    View in Portal
                  </Button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}