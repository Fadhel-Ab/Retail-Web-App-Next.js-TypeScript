"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { PcCase } from "lucide-react";

 type Props = {
   month: string;
   totalSales: number;
 };

const chartConfig = {
  desktop: {
    label: "Sales",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;


const SalesChart = ({data, locale}: { data: Props[]; locale:string }) => {
    console.log(data);
  return (
    <div>
      <ChartContainer config={chartConfig}>
        <BarChart
          accessibilityLayer
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
          style={locale === "en" ? { direction: "ltr" } : { direction: "rtl" }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="month"
            stroke="var(--foreground)"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) => value.slice(0, 5)}
            reversed={locale === "ar"}
          />
          <YAxis
            stroke="var(--foreground)"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) => `$${value}`}
            orientation={locale === "ar" ? "right" : "left"}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Bar dataKey="totalSales" fill="var(--color-desktop)" radius={8} />
        </BarChart>
      </ChartContainer>
    </div>
  );
};

export default SalesChart;
