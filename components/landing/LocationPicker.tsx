import React from "react";
import { Card } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { motion } from "framer-motion";

interface LocationAlternative {
  code: string;
  name: string;
}

interface LocationPickerProps {
  fromAlternatives?: LocationAlternative[];
  toAlternatives?: LocationAlternative[];
  onSelect: (fromCode: string | null, toCode: string | null) => void;
}

export default function LocationPicker({
  fromAlternatives,
  toAlternatives,
  onSelect
}: LocationPickerProps) {
  const [selectedFrom, setSelectedFrom] = React.useState<string | null>(null);
  const [selectedTo, setSelectedTo] = React.useState<string | null>(null);
  const hasSubmittedRef = React.useRef(false);

  const handleFromSelect = (code: string) => {
    setSelectedFrom(code);
    // Auto-submit if only "from" alternatives exist
    if (!toAlternatives && !hasSubmittedRef.current) {
      hasSubmittedRef.current = true;
      onSelect(code, null);
    }
  };

  const handleToSelect = (code: string) => {
    setSelectedTo(code);
    // Auto-submit if only "to" alternatives exist
    if (!fromAlternatives && !hasSubmittedRef.current) {
      hasSubmittedRef.current = true;
      onSelect(null, code);
    }
  };

  // Auto-submit when both are selected
  React.useEffect(() => {
    if (fromAlternatives && toAlternatives && selectedFrom && selectedTo && !hasSubmittedRef.current) {
      hasSubmittedRef.current = true;
      onSelect(selectedFrom, selectedTo);
    }
  }, [selectedFrom, selectedTo, fromAlternatives, toAlternatives]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4 mt-4"
    >
      {fromAlternatives && fromAlternatives.length > 0 && (
        <div>
          <p className="text-sm text-[#4dd486] font-semibold mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Select Origin Location:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {fromAlternatives.map((location) => (
              <Card
                key={location.code}
                onClick={() => handleFromSelect(location.code)}
                className={`p-3 cursor-pointer transition-all duration-200 border ${
                  selectedFrom === location.code
                    ? 'bg-[#4dd486]/20 border-[#4dd486] shadow-lg shadow-[#4dd486]/25'
                    : 'bg-slate-700 border-slate-600 hover:bg-slate-600 hover:border-[#4dd486]/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-white">{location.code}</p>
                    <p className="text-xs text-slate-300">{location.name}</p>
                  </div>
                  {selectedFrom === location.code && (
                    <div className="w-2 h-2 bg-[#4dd486] rounded-full"></div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {toAlternatives && toAlternatives.length > 0 && (
        <div>
          <p className="text-sm text-[#4dd486] font-semibold mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Select Destination Location:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {toAlternatives.map((location) => (
              <Card
                key={location.code}
                onClick={() => handleToSelect(location.code)}
                className={`p-3 cursor-pointer transition-all duration-200 border ${
                  selectedTo === location.code
                    ? 'bg-[#4dd486]/20 border-[#4dd486] shadow-lg shadow-[#4dd486]/25'
                    : 'bg-slate-700 border-slate-600 hover:bg-slate-600 hover:border-[#4dd486]/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-white">{location.code}</p>
                    <p className="text-xs text-slate-300">{location.name}</p>
                  </div>
                  {selectedTo === location.code && (
                    <div className="w-2 h-2 bg-[#4dd486] rounded-full"></div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}