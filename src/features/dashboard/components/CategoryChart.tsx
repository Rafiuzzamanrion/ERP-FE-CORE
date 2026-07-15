import { memo, useMemo } from "react";
import {
  Chart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Credits,
  PlotOptions,
} from "@highcharts/react";
import { BarSeries } from "@highcharts/react/series/Bar";
import type { CategoryRevenue } from "@/types";

interface CategoryChartProps {
  data: CategoryRevenue[];
}

export default memo(function CategoryChart({ data }: CategoryChartProps) {
  const sortedData = useMemo(
    () => [...data].sort((a, b) => b.revenue - a.revenue).slice(0, 8),
    [data]
  );

  const categories = useMemo(
    () => sortedData.map((item) => item.category),
    [sortedData]
  );

  const barData = useMemo(
    () => sortedData.map((item) => Number(item.revenue.toFixed(2))),
    [sortedData]
  );

  const totalRevenue = useMemo(
    () => sortedData.reduce((sum, item) => sum + item.revenue, 0),
    [sortedData]
  );

  const chartHeight = useMemo(
    () => Math.max(280, sortedData.length * 42 + 80),
    [sortedData.length]
  );

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between gap-4 mb-1">
        <div>
          <h3 className="text-lg font-semibold">Top Products</h3>
          <p className="text-sm text-muted-foreground">Revenue by product</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xl font-bold leading-none">
            ${(totalRevenue / 1000).toFixed(1)}k
          </p>
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide mt-0.5">
            Total
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-[280px] w-full">
        <Chart
          title=""
          height={chartHeight}
          backgroundColor="transparent"
          options={{
            chart: {
              type: "bar",
              inverted: true,
              style: { fontFamily: "Inter, sans-serif" },
              spacing: [0, 0, 0, 0],
              marginLeft: 100,
              marginRight: 20,
            },
            responsive: {
              rules: [
                {
                  condition: { maxWidth: 300 },
                  chartOptions: {
                    chart: { marginLeft: 80 },
                    xAxis: {
                      labels: { style: { fontSize: "10px" } },
                    },
                  },
                },
              ],
            },
          }}
        >
          <Credits enabled={false} />
          <Tooltip
            useHTML
            backgroundColor="var(--color-popover)"
            borderColor="var(--color-border)"
            borderWidth={1}
            borderRadius={8}
            shadow={false}
            style={{
              color: "var(--color-popover-foreground)",
              fontSize: "13px",
            }}
            valuePrefix="$"
            valueDecimals={2}
          />
          <Legend enabled={false} />
          <XAxis
            categories={categories}
            lineColor="transparent"
            tickColor="transparent"
            labels={{
              align: "right",
              x: -8,
              style: {
                color: "var(--color-foreground)",
                fontSize: "12px",
                fontWeight: "500",
                textOverflow: "ellipsis",
              },
            }}
          />
          <YAxis
            visible={false}
            gridLineWidth={0}
            labels={{ enabled: false }}
          />
          <PlotOptions
            bar={{
              borderWidth: 0,
              borderRadius: 5,
              colorByPoint: true,
              dataLabels: { enabled: false },
              states: {
                hover: { brightness: 0.05 },
                inactive: { opacity: 0.3 },
              },
            }}
          />
          <BarSeries
            name="Revenue"
            data={barData}
            options={{
              colors: [
                "var(--color-chart-1)",
                "var(--color-chart-2)",
                "var(--color-chart-3)",
                "var(--color-chart-4)",
                "var(--color-chart-5)",
                "var(--color-chart-6)",
                "var(--color-chart-7)",
                "var(--color-chart-8)",
              ],
            }}
          />
        </Chart>
      </div>
    </div>
  );
});
