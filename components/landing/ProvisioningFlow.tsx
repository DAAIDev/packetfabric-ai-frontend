import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, Loader2, CreditCard, Settings, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProvisioningFlowProps {
  step: 'checking' | 'billing' | 'configuring' | 'complete';
  onNextStep: () => void;
}

export default function ProvisioningFlow({ step, onNextStep }: ProvisioningFlowProps) {
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
              {step === 'checking' ? (
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
          {step === 'checking' ? (
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
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-[#4dd486]" />
                <p className="text-white/90">Speed and zone requirements verified</p>
              </div>
              {step === 'checking' && (
                <Button
                  onClick={onNextStep}
                  className="mt-4 bg-gradient-to-r from-[#4dd486] to-[#20c6b5] hover:from-[#3bc274] hover:to-[#1ab4a3] text-white px-6 py-2 rounded-lg font-bold"
                >
                  Continue
                </Button>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Step 2: Billing Account Check */}
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
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <CheckCircle className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Billing Account</h3>
                <p className="text-white/90 text-sm">Verifying your billing information</p>
              </div>
            </div>
          </div>

          <div className="p-8 bg-slate-900/40">
            {step === 'billing' ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-[#4dd486] animate-spin" />
                  <p className="text-white/90">Checking billing account status...</p>
                </div>
                <p className="text-white/60 text-sm">This will only take a moment</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[#4dd486]" />
                  <p className="text-white/90">Billing account verified</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-white/70 text-sm">Account: ****-****-****-1234</p>
                  <p className="text-white/70 text-sm">Status: Active</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Step 3: Configuration */}
      {(step === 'configuring' || step === 'complete') && (
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
                  <p className="text-white/80 mb-4">Your 100G wavelength connection is now active and ready to use.</p>
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
