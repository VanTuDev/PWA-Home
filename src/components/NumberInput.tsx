import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface Props {
  value: string | number;
  onChange: (val: string) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  className?: string;
}

export const NumberInput: React.FC<Props> = ({
  value, onChange, min, max, step = 1, placeholder, className = '',
}) => {
  const num = parseFloat(String(value)) || 0;

  const change = (delta: number) => {
    let next = parseFloat((num + delta).toFixed(10));
    if (min !== undefined) next = Math.max(min, next);
    if (max !== undefined) next = Math.min(max, next);
    onChange(String(next));
  };

  return (
    <div className={`flex items-center border border-outline-variant rounded-xl overflow-hidden bg-white ${className}`}>
      <button
        type="button"
        onClick={() => change(-step)}
        className="px-3 py-2.5 text-on-surface-variant hover:bg-surface-container-high active:bg-surface-container-highest transition-colors flex-shrink-0"
      >
        <Minus className="w-4 h-4" />
      </button>
      <input
        type="number"
        value={value}
        min={min} max={max} step={step}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        className="flex-1 text-center text-sm font-bold outline-none py-2.5 bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button
        type="button"
        onClick={() => change(step)}
        className="px-3 py-2.5 text-on-surface-variant hover:bg-surface-container-high active:bg-surface-container-highest transition-colors flex-shrink-0"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
};
