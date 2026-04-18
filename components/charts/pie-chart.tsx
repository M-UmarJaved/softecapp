"use client";

import {
  Cell,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useIsClient } from "@/lib/use-is-client";
import { cn } from "@/lib/utils";

export type GenericPieChartPoint = {
  name: string;
  value: number;
};

type GenericPieChartProps = {
  title: string;
  data?: GenericPieChartPoint[];
  description?: string;
  className?: string;
};

const DUMMY_PIE_DATA: GenericPieChartPoint[] = [
  { name: "High Confidence", value: 58 },
  { name: "Medium Confidence", value: 29 },
  { name: "Low Confidence", value: 13 },
];

const PIE_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(var(--secondary-foreground))",
  "hsl(var(--muted-foreground))",
];

export function PieChartWidget({
  title,
  data,
  description = "Share breakdown",
  className,
}: GenericPieChartProps) {
  const isClient = useIsClient();
  const chartData = data?.length ? data : DUMMY_PIE_DATA;

  return (
    <Card className={cn("surface-glass border-border/70", className)}>
      <CardHeader>
        <CardTitle className="font-heading text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="h-72 w-full min-w-0">
          {isClient ? (
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={1}>
              <RechartsPieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={100}
                  paddingAngle={3}
                  label
                  labelLine={false}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`${entry.name}-${entry.value}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid hsl(var(--border))",
                    background: "hsl(var(--card) / 0.95)",
                    color: "hsl(var(--card-foreground))",
                  }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-1 text-xs text-muted-foreground sm:grid-cols-2">
          {chartData.map((item, index) => (
            <div key={item.name} className="flex items-center gap-2">
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
              />
              <span>{item.name}</span>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          Replace data prop with actual AI analysis results.
        </p>
      </CardContent>
    </Card>
  );
}