import { Badge } from "@/components/ui/badge";
import { CURRICULUM_COLORS } from "@/lib/colors";
import { curriculumLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Curriculum } from "@/generated/prisma/client";

export function CurriculumBadge({
  curriculum,
  className,
}: {
  curriculum: Curriculum;
  className?: string;
}) {
  return (
    <Badge className={cn(CURRICULUM_COLORS[curriculum].badge, className)}>
      {curriculumLabel(curriculum)}
    </Badge>
  );
}
