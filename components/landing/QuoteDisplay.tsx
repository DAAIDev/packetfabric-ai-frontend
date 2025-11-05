'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Network, X, Download } from 'lucide-react';

interface QuoteDisplayProps {
  quote: any;
  onClose: () => void;
}

export default function QuoteDisplay({ quote, onClose }: QuoteDisplayProps) {

  const handleDownload = () => {
    // Note: Actual PDF generation requires a library not available in this environment.
    // This is a placeholder for the POC to demonstrate functionality.
    alert("PDF download functionality would be implemented here in a full production environment.");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-6 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Network className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Price Quote</h2>
              <p className="text-sm text-slate-500">
                Quote ID: {quote.quote_id || 'PF-AI-DEMO'}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5 text-slate-500" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto flex-1">
          {/* Service Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 text-center">
            <div>
              <p className="text-sm text-slate-500 uppercase tracking-wider">Service</p>
              <p className="text-lg font-semibold text-slate-800 capitalize">{quote.service_type?.replace(/_/g, ' ')}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 uppercase tracking-wider">Bandwidth</p>
              <p className="text-lg font-semibold text-slate-800">{quote.bandwidth}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 uppercase tracking-wider">Locations</p>
              <p className="text-lg font-semibold text-slate-800">{quote.locations?.join(', ') || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 uppercase tracking-wider">Term</p>
              <p className="text-lg font-semibold text-slate-800 capitalize">{quote.term_length?.replace(/_/g, ' ')}</p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="p-3 text-sm font-medium text-slate-600">Description</th>
                  <th className="p-3 text-sm font-medium text-slate-600 text-right">Monthly (MRC)</th>
                  <th className="p-3 text-sm font-medium text-slate-600 text-right">One-Time (NRC)</th>
                </tr>
              </thead>
              <tbody>
                {quote.line_items?.map((item: any, index: number) => (
                  <tr key={index} className="border-b">
                    <td className="p-3 text-slate-700">{item.description}</td>
                    <td className="p-3 text-slate-700 text-right font-mono">${item.mrc?.toFixed(2)}</td>
                    <td className="p-3 text-slate-700 text-right font-mono">${item.nrc?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="flex justify-end mt-8">
            <div className="w-full max-w-xs space-y-3">
              <div className="flex justify-between">
                <p className="text-slate-600">Total Monthly Recurring Charge (MRC):</p>
                <p className="font-semibold text-slate-800 font-mono">${quote.totals?.total_mrc?.toFixed(2)}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-slate-600">Total Non-Recurring Charge (NRC):</p>
                <p className="font-semibold text-slate-800 font-mono">${quote.totals?.total_nrc?.toFixed(2)}</p>
              </div>
              <div className="border-t pt-3 mt-3 flex justify-between text-lg">
                <p className="font-bold text-slate-900">First Month Total:</p>
                <p className="font-bold text-blue-600 font-mono">${quote.totals?.first_month_total?.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-400 mt-8 text-center">
            This is an estimated quote generated by PacketFabric.ai. Prices are subject to change and final validation by a sales representative.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t bg-slate-50 flex justify-end gap-4">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button
            className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
            onClick={handleDownload}
          >
            <Download className="w-4 h-4 mr-2" />
            Download as PDF
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
