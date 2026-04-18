"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
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

export type GenericLineChartPoint = {
  label: string;
  value: number;
  comparison?: number;
};

type GenericLineChartProps = {
  title: string;
  data?: GenericLineChartPoint[];
  description?: string;
  className?: string;
};

const DUMMY_LINE_DATA: GenericLineChartPoint[] = [
  { label: "Mon", value: 42, comparison: 35 },
  { label: "Tue", value: 54, comparison: 41 },
  { label: "Wed", value: 61, comparison: 49 },
  { label: "Thu", value: 58, comparison: 47 },
  { label: "Fri", value: 72, comparison: 59 },
  { label: "Sat", value: 84, comparison: 65 },
  { label: "Sun", value: 79, comparison: 63 },
];

export function LineChartWidget({
  title,
  data,
  description = "Trend overview",
  className,
}: GenericLineChartProps) {
  const isClient = useIsClient();
  const chartData = data?.length ? data : DUMMY_LINE_DATA;
  const hasComparison = chartData.some((entry) => typeof entry.comparison === "number");

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
              <RechartsLineChart data={chartData} margin={{ top: 12, right: 12, left: 0, bottom: 8 }}>
                <CartesianGrid stroke="hsl(var(--border) / 0.45)" strokeDasharray="3 3" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  axisLine={{ stroke: "hsl(var(--border) / 0.6)" }}
                  tickLine={{ stroke: "hsl(var(--border) / 0.6)" }}
                />
                <YAxis
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  axisLine={{ stroke: "hsl(var(--border) / 0.6)" }}
                  tickLine={{ stroke: "hsl(var(--border) / 0.6)" }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid hsl(var(--border))",
                    background: "hsl(var(--card) / 0.95)",
                    color: "hsl(var(--card-foreground))",
                  }}
                  cursor={{ stroke: "hsl(var(--ring) / 0.55)", strokeWidth: 1 }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  name="Primary"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 5, fill: "hsl(var(--primary))" }}
                />
                {hasComparison ? (
                  <Line
                    type="monotone"
                    dataKey="comparison"
                    name="Comparison"
                    stroke="hsl(var(--accent))"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    activeDot={{ r: 4, fill: "hsl(var(--accent))" }}
                  />
                ) : null}
              </RechartsLineChart>
            </ResponsiveContainer>
          ) : null}
        </div>

        <p className="text-xs text-muted-foreground">
          Replace data prop with actual AI analysis results.
        </p>
      </CardContent>
    </Card>
  );
}