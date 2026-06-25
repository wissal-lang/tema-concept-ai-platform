import { Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface PendingCheck {
  id: string;
  client: string;
  service: string;
  date: string;
  priority: "high" | "medium" | "low";
}

interface PendingChecksProps {
  items?: PendingCheck[];
}

const defaultItems: PendingCheck[] = [
  {
    id: "REQ-1042",
    client: "Société Atlas",
    service: "Installation solaire",
    date: "18 juin 2026",
    priority: "high",
  },
  {
    id: "REQ-1041",
    client: "Résidence Palmier",
    service: "Audit énergétique",
    date: "17 juin 2026",
    priority: "medium",
  },
  {
    id: "REQ-1039",
    client: "Hôtel Miramar",
    service: "Maintenance climatisation",
    date: "16 juin 2026",
    priority: "low",
  },
];

const priorityLabels = {
  high: "Urgent",
  medium: "Normal",
  low: "Faible",
} as const;

const priorityVariants = {
  high: "destructive",
  medium: "secondary",
  low: "outline",
} as const;

export function PendingChecks({ items = defaultItems }: PendingChecksProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="size-4" />
          Demandes en attente
        </CardTitle>
        <CardDescription>
          Devis et demandes nécessitant une validation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-start justify-between gap-4 rounded-lg border p-4"
          >
            <div className="space-y-1">
              <p className="font-medium">{item.client}</p>
              <p className="text-sm text-muted-foreground">{item.service}</p>
              <p className="text-xs text-muted-foreground">
                {item.id} · {item.date}
              </p>
            </div>
            <Badge variant={priorityVariants[item.priority]}>
              {priorityLabels[item.priority]}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
