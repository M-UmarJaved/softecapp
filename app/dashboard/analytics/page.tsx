"use client";

import { useState } from "react";

import {
  type GenericBarChartPoint,
  BarChartWidget,
} from "@/components/charts/bar-chart";
import {
  type GenericLineChartPoint,
  LineChartWidget,
} from "@/components/charts/line-chart";
import {
  type GenericPieChartPoint,
  PieChartWidget,
} from "@/components/charts/pie-chart";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type DataMode = "sample" | "real";

const SAMPLE_LINE_DATA: GenericLineChartPoint[] = [
  { label: "Week 1", value: 34, comparison: 20 },
  { label: "Week 2", value: 46, comparison: 29 },
  { label: "Week 3", value: 59, comparison: 37 },
  { label: "Week 4", value: 76, comparison: 49 },
  { label: "Week 5", value: 88, comparison: 62 },
];

const SAMPLE_BAR_DATA: GenericBarChartPoint[] = [
  { label: "Emails", value: 128 },
  { label: "Shortlisted", value: 63 },
  { label: "Urgent", value: 41 },
  { label: "Completed", value: 30 },
];

const SAMPLE_PIE_DATA: GenericPieChartPoint[] = [
  { name: "Strong Fit", value: 61 },
  { name: "Partial Fit", value: 28 },
  { name: "Low Fit", value: 11 },
];

const REAL_LINE_DATA: GenericLineChartPoint[] = [
  { label: "Week 1", value: 22, comparison: 19 },
  { label: "Week 2", value: 31, comparison: 24 },
  { label: "Week 3", value: 44, comparison: 32 },
  { label: "Week 4", value: 52, comparison: 40 },
  { label: "Week 5", value: 67, comparison: 51 },
];

const REAL_BAR_DATA: GenericBarChartPoint[] = [
  { label: "Emails", value: 91 },
  { label: "Shortlisted", value: 48 },
  { label: "Urgent", value: 26 },
  { label: "Completed", value: 17 },
];

const REAL_PIE_DATA: GenericPieChartPoint[] = [
  { name: "Strong Fit", value: 49 },
  { name: "Partial Fit", value: 34 },
  { name: "Low Fit", value: 17 },
];

export default function DashboardAnalyticsPage() {
  const [mode, setMode] = useState<DataMode>("sample");

  const lineData = mode === "sample" ? SAMPLE_LINE_DATA : REAL_LINE_DATA;
  const barData = mode === "sample" ? SAMPLE_BAR_DATA : REAL_BAR_DATA;
  const pieData = mode === "sample" ? SAMPLE_PIE_DATA : REAL_PIE_DATA;

  return (
    <div className="space-y-6">
      <Card className="surface-glass border-border/70">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="font-heading text-2xl">Analytics Visuals</CardTitle>
            <CardDescription>
              Opportunity pipeline visuals for your event-day narrative.
            </CardDescription>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant={mode === "sample" ? "default" : "outline"}
              onClick={() => setMode("sample")}
            >
              Sample Data
            </Button>
            <Button
              type="button"
              variant={mode === "real" ? "default" : "outline"}
              onClick={() => setMode("real")}
            >
              Real Data
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Toggle between polished sample data and your live ranked-opportunity feed.
          </p>
        </CardContent>
      </Card>

      <section className="grid gap-4 xl:grid-cols-2">
        <LineChartWidget
          title="Opportunity Throughput"
          description="Incoming emails vs qualified opportunities"
          data={lineData}
        />

        <BarChartWidget
          title="Pipeline Breakdown"
          description="Batch processing output"
          data={barData}
        />
      </section>

      <section>
        <PieChartWidget
          title="Fit Distribution"
          description="How extracted opportunities align with student profile"
          data={pieData}
        />
      </section>
    </div>
  );
}