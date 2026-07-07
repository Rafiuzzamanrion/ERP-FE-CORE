import { memo, useMemo } from "react";
import {
  Chart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Credits,
  PlotOptions,
  Title,
  Subtitle,
} from "@highcharts/react";
import { ColumnSeries } from "@highcharts/react/series/Column";
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

  const columnData = useMemo(
    () => sortedData.map((item) => Number(item.revenue.toFixed(2))),
    [sortedData]
  );

  const totalRevenue = useMemo(
    () => sortedData.reduce((sum, item) => sum + item.revenue, 0),
    [sortedData]
  );

  const maxValue = useMemo(
    () => (columnData.length ? Math.max(...columnData) : 0),
    [columnData]
  );

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-lg font-semibold mb-1">Top Products</h3>
      <p className="text-sm text-muted-foreground mb-4">Revenue by product</p>
      <div className="flex-1 min-h-[320px]">
        <Chart
          title=""
          height={340}
          backgroundColor="transparent"
          options={{
            chart: {
              polar: true,
              inverted: true,
              style: { fontFamily: "Inter, sans-serif" },
              spacing: [10, 10, 10, 10],
            },
            pane: {
              size: "85%",
              innerSize: "25%",
              background: { backgroundColor: "transparent", borderWidth: 0 },
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
          <Title
            text={`$${(totalRevenue / 1000).toFixed(1)}k`}
            align="center"
            verticalAlign="middle"
            floating
            y={8}
            style={{
              color: "var(--color-foreground)",
              fontSize: "22px",
              fontWeight: "700",
            }}
          />
          <Subtitle
            text="Total"
            align="center"
            verticalAlign="middle"
            floating
            y={30}
            style={{
              color: "var(--color-muted-foreground)",
              fontSize: "12px",
              fontWeight: "500",
            }}
          />
          <XAxis
            categories={categories}
            lineColor="transparent"
            tickColor="transparent"
            labels={{
              style: {
                color: "var(--color-foreground)",
                fontSize: "12px",
                fontWeight: "500",
              },
            }}
          />
          <YAxis
            visible={false}
            min={0}
            max={maxValue * 1.15}
            endOnTick={false}
            lineColor="transparent"
            tickColor="transparent"
            gridLineWidth={0}
          />
          <PlotOptions
            column={{
              pointPadding: 0.05,
              groupPadding: 0,
              borderWidth: 0,
              borderRadius: 6,
              colorByPoint: true,
              dataLabels: {
                enabled: false,
              },
              states: {
                hover: { brightness: 0.05 },
                inactive: { opacity: 0.3 },
              },
            }}
          />
          <ColumnSeries
            name="Revenue"
            data={columnData}
            options={{
              colors: [
                "hsl(174 72% 42%)",
                "hsl(185 80% 48%)",
                "hsl(195 85% 55%)",
                "hsl(210 75% 58%)",
                "hsl(260 65% 60%)",
                "hsl(320 60% 58%)",
              ],
            }}
          />
        </Chart>
      </div>
    </div>
  );
});
