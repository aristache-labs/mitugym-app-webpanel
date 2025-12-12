"use client";

import { Label } from "@/components/ui/label";

interface ToggleSwitchProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  onLabel?: string;
  offLabel?: string;
}

export function ToggleSwitch({ 
  id, 
  checked, 
  onChange, 
  label,
  onLabel = "ON",
  offLabel = "OFF"
}: ToggleSwitchProps) {
  return (
    <div className="flex items-center space-x-3">
      <div className="relative inline-block">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        
        {/* Toggle Button Container */}
        <div 
          className="relative w-[74px] h-9 cursor-pointer"
          onClick={() => onChange(!checked)}
        >
          {/* Background Layer */}
          <div 
            className={`absolute inset-0 rounded-full transition-all duration-300 ${
              checked 
                ? 'bg-primary/20' 
                : 'bg-error/20'
            }`}
          />
          
          {/* Knob/Circle with Text */}
          <div 
            className={`absolute top-1 h-7 rounded-full transition-all duration-300 ease-out flex items-center justify-center text-[10px] font-bold text-white ${
              checked 
                ? 'left-1 w-7 bg-primary' 
                : 'left-[42px] w-7 bg-error'
            }`}
          >
            {checked ? onLabel : offLabel}
          </div>
        </div>
      </div>
      
      <Label 
        htmlFor={id}
        className="cursor-pointer text-sm whitespace-nowrap"
        onClick={() => onChange(!checked)}
      >
        {label}
      </Label>
    </div>
  );
}
