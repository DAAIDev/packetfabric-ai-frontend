'use client';

import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Zap, DollarSign, MapPin, Settings } from "lucide-react";

const quickActions = [
  {
    title: "Get Pricing",
    description: "Calculate costs for your network needs",
    icon: DollarSign,
    message: "I need pricing information for a dedicated connection between New York and Los Angeles with 10 Gbps bandwidth."
  },
  {
    title: "Service Locations",
    description: "Find available data centers",
    icon: MapPin,
    message: "What PacketFabric locations are available in the West Coast region?"
  },
  {
    title: "Technical Specs",
    description: "Learn about our network capabilities",
    icon: Zap,
    message: "What are the technical specifications and SLA for PacketFabric's cloud routing service?"
  },
  {
    title: "Setup Help",
    description: "Get assistance with configuration",
    icon: Settings,
    message: "I need help setting up a new connection. Can you walk me through the process?"
  }
];

interface QuickActionsProps {
  onAction: (action: string) => void;
}

export default function QuickActions({ onAction }: QuickActionsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
      {quickActions.map((action, index) => (
        <Card
          key={index}
          className="p-4 cursor-pointer hover:shadow-lg transition-all duration-200 border-slate-200 hover:border-blue-300 group"
          onClick={() => onAction(action.message)}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-200">
              <action.icon className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 mb-1">{action.title}</h3>
              <p className="text-sm text-slate-600">{action.description}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
