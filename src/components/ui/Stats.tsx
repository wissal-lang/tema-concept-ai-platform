import { FileText, MessageSquare, TrendingUp, Users } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface StatItem {
  label: string;
  value: string;
  change?: string;
  icon: "requests" | "clients" | "chatbot" | "revenue";
}

interface StatsProps {
  items?: StatItem[];
}

const iconMap = {
  requests: FileText,
  clients: Users,
  chatbot: MessageSquare,
  revenue: TrendingUp,
};

const defaultItems: StatItem[] = [
  {
    label: "Demandes totales",
    value: "128",
    change: "+12% ce mois",
    icon: "requests",
  },
  {
    label: "Clients actifs",
    value: "46",
    change: "+5 nouveaux",
    icon: "clients",
  },
  {
    label: "Conversations chatbot",
    value: "312",
    change: "+28% cette semaine",
    icon: "chatbot",
  },
  {
    label: "Taux de conversion",
    value: "34%",
    change: "+3 pts",
    icon: "revenue",
  },
];

export function Stats({ items = defaultItems }: StatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = iconMap[item.icon];
        return (
          <Card key={item.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {item.label}
              </CardTitle>
              <Icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
              {item.change && (
                <p className="text-xs text-muted-foreground">{item.change}</p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
