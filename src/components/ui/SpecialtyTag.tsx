import type { Specialty } from '../../types';
import {
  Heart,
  Brain,
  Wind,
  Pill,
  Bug,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const specialtyConfig: Record<Specialty, { color: string; bg: string; icon: LucideIcon }> = {
  Cardiology: { color: 'text-cardiology', bg: 'bg-cardiology/15', icon: Heart },
  Neurology: { color: 'text-neurology', bg: 'bg-neurology/15', icon: Brain },
  Pulmonology: { color: 'text-pulmonology', bg: 'bg-pulmonology/15', icon: Wind },
  Gastroenterology: { color: 'text-gastroenterology', bg: 'bg-gastroenterology/15', icon: Pill },
  'Infectious Disease': { color: 'text-infectious', bg: 'bg-infectious/15', icon: Bug },
};

interface SpecialtyTagProps {
  specialty: Specialty;
  showIcon?: boolean;
  size?: 'sm' | 'md';
}

export function SpecialtyTag({ specialty, showIcon = true, size = 'md' }: SpecialtyTagProps) {
  const config = specialtyConfig[specialty];
  const Icon = config.icon;
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5 gap-1' : 'text-sm px-3 py-1 gap-1.5';

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${config.color} ${config.bg} ${sizeClasses}`}
    >
      {showIcon && <Icon size={size === 'sm' ? 12 : 14} />}
      {specialty}
    </span>
  );
}

export function getSpecialtyColor(specialty: Specialty): string {
  return specialtyConfig[specialty].color;
}

export function getSpecialtyBgColor(specialty: Specialty): string {
  return specialtyConfig[specialty].bg;
}
