"use client";

import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
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

export type GenericBarChartPoint = {
  label: string;
  value: number;
};

type GenericBarChartProps = {
  title: string;
  data?: GenericBarChartPoint[];
  description?: string;
  className?: string;
};

const DUMMY_BAR_DATA: GenericBarChartPoint[] = [
  { label: "Lahore", value: 36 },
  { label: "Karachi", value: 52 },
  { label: "Islamabad", value: 28 },
  { label: "Faisalabad", value: 24 },
  { label: "Multan", value: 18 },
];

export function BarChartWidget({
  title,
  data,
  description = "Category distribution",
  className,
}: GenericBarChartProps) {
  const isClient = useIsClient();
  const chartData = data?.length ? data : DUMMY_BAR_DATA;

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
              <RechartsBarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 8 }}>
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
                  cursor={{ fill: "hsl(var(--secondary) / 0.35)" }}
                />
                <Bar
                  dataKey="value"
                  fill="hsl(var(--primary))"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={48}
                />
              </RechartsBarChart>
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