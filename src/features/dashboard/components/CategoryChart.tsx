import { useMemo } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import type { CategoryRevenue } from "@/types";

interface CategoryChartProps {
  data: CategoryRevenue[];
}

export default function CategoryChart({ data }: CategoryChartProps) {
  const options = useMemo<Highcharts.Options>(() => {
    return {
      chart: {
        type: "pie",
        backgroundColor: "transparent",
        height: 300,
        style: { fontFamily: "Inter, sans-serif" },
      },
      title: { text: "" },
      credits: { enabled: false },
      tooltip: {
        pointFormat: "{series.name}: <b>${point.y:.2f}</b>",
        backgroundColor: "hsl(var(--popover))",
        borderColor: "hsl(var(--border))",
        style: { color: "hsl(var(--popover-foreground))" },
      },
      legend: {
        itemStyle: { color: "hsl(var(--foreground))" },
      },
      plotOptions: {
        pie: {
          innerSize: "60%",
          borderRadius: 6,
          dataLabels: { enabled: false },
          showInLegend: true,
        },
      },
      series: [
        {
          name: "Revenue",
          type: "pie",
          data: data.map((item) => ({
            name: item.category,
            y: Number(item.revenue.toFixed(2)),
          })),
          colors: [
            "hsl(174 72% 35%)",
            "hsl(200 85% 45%)",
            "hsl(150 60% 45%)",
            "hsl(38 90% 50%)",
            "hsl(340 75% 55%)",
          ],
        },
      ],
    };
  }, [data]);

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-lg font-semibold mb-1">Top Products</h3>
      <p className="text-sm text-muted-foreground mb-4">Revenue by product</p>
      <div className="flex-1 min-h-[300px]">
        <HighchartsReact highcharts={Highcharts} options={options} />
      </div>
    </div>
  );
}
