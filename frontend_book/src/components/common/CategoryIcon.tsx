import {
  Baby,
  BookOpen,
  BookText,
  Briefcase,
  Church,
  Cpu,
  FlaskConical,
  GraduationCap,
  Languages,
  Library,
  Palette,
  Plane,
  School,
  Scroll,
  Stethoscope,
  User,
  type LucideIcon,
} from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  medical: Stethoscope,
  health: Stethoscope,
  education: GraduationCap,
  school: School,
  fiction: BookOpen,
  novels: BookText,
  novel: BookText,
  language: Languages,
  languages: Languages,
  business: Briefcase,
  economics: Briefcase,
  technology: Cpu,
  tech: Cpu,
  computers: Cpu,
  children: Baby,
  kids: Baby,
  biography: User,
  biographies: User,
  science: FlaskConical,
  history: Scroll,
  religion: Church,
  art: Palette,
  arts: Palette,
  travel: Plane,
};

export function categoryIcon(name: string | null | undefined): LucideIcon {
  if (!name) return Library;
  return ICONS[name.trim().toLowerCase()] ?? Library;
}

export default function CategoryIcon({
  name,
  className,
}: {
  name: string | null | undefined;
  className?: string;
}) {
  const Icon = categoryIcon(name);
  return <Icon className={className} aria-hidden="true" />;
}
