import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, DollarSign, Calendar, Zap } from "lucide-react";

interface PricingTableProps {
  tableData: string;
}

export default function PricingTable({ tableData }: PricingTableProps) {
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
                <th key={i} className="px-4 py-3 text-left text-xs font-semibold text-cyan-300 uppercase tracking-wider">
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
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border-b border-slate-600 p-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white">Pricing Breakdown</h3>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-700/30 border-b border-slate-600">
                {headers.map((header, i) => (
                  <th key={i} className="px-4 py-3 text-left text-xs font-bold text-cyan-300 uppercase tracking-wider">
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
                      hasDiscount ? 'bg-green-500/5' : ''
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
                              <Calendar className="w-4 h-4 text-blue-400" />
                              <span className="font-semibold text-white">{cell}</span>
                            </div>
                          ) : isMonthlyPrice ? (
                            <div className="font-bold text-xl text-cyan-400">
                              {cell}
                            </div>
                          ) : isDiscount && parseFloat(cell) > 0 ? (
                            <Badge className="bg-green-500/20 text-green-300 border-green-500/30 font-bold">
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

        {/* Best Value Badge */}
        {dataRows.length > 1 && (
          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-t border-green-500/20 p-4">
            <div className="flex items-center gap-2 text-sm">
              <Zap className="w-4 h-4 text-green-400" />
              <span className="text-green-300 font-semibold">
                Best Value: {dataRows[dataRows.length - 1][0]} saves you {dataRows[dataRows.length - 1][dataRows[dataRows.length - 1].length - 2]}
              </span>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
