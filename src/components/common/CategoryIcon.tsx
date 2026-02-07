import {
  Camera,
  Focus,
  Lightbulb,
  Mic,
  Plane,
  Backpack,
  Package,
  LucideIcon,
} from 'lucide-react'
import { Category } from '../../types/listing'

interface CategoryIconProps {
  category: Category | string
  size?: number
  className?: string
}

const iconMap: Record<string, LucideIcon> = {
  CAMERA_BODY: Camera,
  LENS: Focus,
  LIGHTING: Lightbulb,
  AUDIO: Mic,
  DRONE: Plane,
  ACCESSORY: Backpack,
}

export default function CategoryIcon({ category, size = 24, className = '' }: CategoryIconProps) {
  const Icon = iconMap[category] || Package
  return <Icon size={size} className={className} />
}

export const categoryColors: Record<string, string> = {
  CAMERA_BODY: 'bg-violet-100 text-violet-600',
  LENS: 'bg-blue-100 text-blue-600',
  LIGHTING: 'bg-amber-100 text-amber-600',
  AUDIO: 'bg-rose-100 text-rose-600',
  DRONE: 'bg-emerald-100 text-emerald-600',
  ACCESSORY: 'bg-orange-100 text-orange-600',
}

export { iconMap as categoryIcons }
