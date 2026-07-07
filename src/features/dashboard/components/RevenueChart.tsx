import { useMemo } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import type { DailyRevenue } from "@/types";

interface RevenueChartProps {
  data: DailyRevenue[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
  const options = useMemo(() => {
    const categories = data.map((d) =>
      new Date(d.date).toLocaleDateString("en-US", { weekday: "short" })
    );
    const revenue = data.map((d) => Number(d.revenue.toFixed(2)));
    const sales = data.map((d) => d.sales);

    return {
      chart: {
        type: "areaspline",
        backgroundColor: "transparent",
        height: 320,
        style: { fontFamily: "Inter, sans-serif" },
      },
      title: { text: "" },
      credits: { enabled: false },
      xAxis: {
        categories,
        crosshair: true,
        lineColor: "hsl(var(--border))",
        labels: { style: { color: "hsl(var(--muted-foreground))" } },
      },
      yAxis: [
        {
          title: { text: "" },
          gridLineColor: "hsl(var(--border))",
          labels: {
            style: { color: "hsl(var(--muted-foreground))" },
            formatter: function () {
              return "$" + (this.value as number);
            },
          },
        },
        {
          title: { text: "" },
          opposite: true,
          gridLineWidth: 0,
          labels: { style: { color: "hsl(var(--muted-foreground))" } },
        },
      ],
      tooltip: {
        shared: true,
        backgroundColor: "hsl(var(--popover))",
        borderColor: "hsl(var(--border))",
        style: { color: "hsl(var(--popover-foreground))" },
        formatter: function () {
          const points = (this as any).points as Array<{
            series: { name: string };
            y: number;
          }>;
          return points.reduce(
            (acc, point) =>
              acc +
              `<br/><span style="color:${point.series.color}">●</span> ${point.series.name}: <b>${
                point.series.name === "Revenue" ? "$" + point.y : point.y
              }</b>`,
            `<b>${(this as any).x}</b>`
          );
        },
      },
      legend: {
        itemStyle: { color: "hsl(var(--foreground))" },
      },
      plotOptions: {
        areaspline: {
          fillOpacity: 0.15,
          marker: { radius: 4 },
          lineWidth: 2,
        },
      },
      series: [
        {
          name: "Revenue",
          data: revenue,
          color: "hsl(174 72% 35%)",
          fillColor: {
            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
            stops: [
              [0, "rgba(13, 148, 136, 0.25)"],
              [1, "rgba(13, 148, 136, 0.02)"],
            ],
          },
        } as Highcharts.SeriesOptionsType,
        {
          name: "Sales",
          data: sales,
          type: "spline",
          color: "hsl(200 90% 50%)",
          yAxis: 1,
          marker: { radius: 3 },
        } as Highcharts.SeriesOptionsType,
      ],
    };
  }, [data]);

  return (
    <Card className="border-none shadow-sm h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Revenue Overview</CardTitle>
        <CardDescription>
          Daily revenue and sales for the last 7 days
        </CardDescription>
      </CardHeader>
      <CardContent>
        <HighchartsReact highcharts={Highcharts} options={options} />
      </CardContent>
    </Card>
  );
}
