import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, DollarSign, Calendar, Zap } from "lucide-react";

interface PricingTableProps {
  tableData: string;
  onProvision?: () => void;
}

export default function PricingTable({ tableData, onProvision }: PricingTableProps) {
  // Parse the markdown table into structured data
  const parseTable = () => {
    const rows = tableData.trim().split('\n').filter(row => row.trim() && !row.includes('---'));
    const headers = rows[0].split('|').map(h => h.trim()).filter(Boolean);
    const dataRows = rows.slice(1).map(row =>
      row.split('|').map(cell => cell.trim()).filter(Boolean)
    );

    return { headers, dataRows };
  };

  const { headers, dataRows } = parseTable();

  // Check if this is a pricing table
  const isPricingTable = headers.some(h =>
    h.toLowerCase().includes('price') ||
    h.toLowerCase().includes('term') ||
    h.toLowerCase().includes('discount')
  );

  if (!isPricingTable) {
    // Return basic table for non-pricing tables
    return (
      <div className="overflow-x-auto my-4 rounded-lg border border-slate-600">
        <table className="w-full text-sm">
          <thead className="bg-slate-700/50">
            <tr>
              {headers.map((header, i) => (
                <th key={i} className="px-4 py-3 text-left text-xs font-semibold text-[#4dd486] uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-600">
            {dataRows.map((row, i) => (
              <tr key={i} className="hover:bg-slate-700/30 transition-colors">
                {row.map((cell, j) => (
                  <td key={j} className="px-4 py-3 text-slate-100">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Enhanced pricing table
  return (
    <div className="my-6">
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 overflow-hidden">
        {/* Header - PacketFabric Branded */}
        <div 
          className="border-b border-slate-600 p-4"
          style={{
            background: 'linear-gradient(135deg, #2877f3 0%, #4dd486 100%)'
          }}
        >
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-white" />
            <h3 className="text-lg font-bold text-white">Pricing Breakdown</h3>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-700/30 border-b border-slate-600">
                {headers.map((header, i) => (
                  <th key={i} className="px-4 py-3 text-left text-xs font-bold text-[#4dd486] uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataRows.map((row, rowIndex) => {
                const hasDiscount = row.some(cell => cell.includes('%') && parseFloat(cell) > 0);

                return (
                  <tr
                    key={rowIndex}
                    className={`border-b border-slate-700/50 hover:bg-slate-700/20 transition-all duration-200 ${
                      hasDiscount ? 'bg-[#4dd486]/5' : ''
                    }`}
                  >
                    {row.map((cell, cellIndex) => {
                      const isMonthlyPrice = headers[cellIndex]?.toLowerCase().includes('monthly') && cell.includes('$');
                      const isDiscount = headers[cellIndex]?.toLowerCase().includes('discount') && cell.includes('%');
                      const isTerm = cellIndex === 0;

                      return (
                        <td key={cellIndex} className="px-4 py-4">
                          {isTerm ? (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-[#2877f3]" />
                              <span className="font-semibold text-white">{cell}</span>
                            </div>
                          ) : isMonthlyPrice ? (
                            <div className="font-bold text-xl text-[#4dd486]">
                              {cell}
                            </div>
                          ) : isDiscount && parseFloat(cell) > 0 ? (
                            <Badge className="bg-[#4dd486]/20 text-[#4dd486] border-[#4dd486]/30 font-bold">
                              <TrendingDown className="w-3 h-3 mr-1" />
                              {cell}
                            </Badge>
                          ) : (
                            <span className="text-slate-200">{cell}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Best Value Badge - PacketFabric Branded */}
        {dataRows.length > 1 && (
          <div 
            className="border-t border-[#4dd486]/20 p-4"
            style={{
              background: 'linear-gradient(135deg, rgba(77, 212, 134, 0.1) 0%, rgba(32, 198, 181, 0.1) 100%)'
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Zap className="w-4 h-4 text-[#4dd486]" />
                <span className="text-[#4dd486] font-semibold">
                  Best Value: {dataRows[dataRows.length - 1][0]} saves you {dataRows[dataRows.length - 1][dataRows[dataRows.length - 1].length - 2]}
                </span>
              </div>
              <button
                onClick={onProvision}
                className="bg-gradient-to-r from-[#4dd486] to-[#20c6b5] hover:from-[#3bc274] hover:to-[#1ab4a3] text-white px-6 py-2 rounded-lg transition-all font-bold text-sm shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Provision Service
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}