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
import { AreaSplineSeries } from "@highcharts/react/series/AreaSpline";
import { SplineSeries } from "@highcharts/react/series/Spline";
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

export default memo(function RevenueChart({ data }: RevenueChartProps) {
  const categories = useMemo(
    () =>
      data.map((d) =>
        new Date(d.date).toLocaleDateString("en-US", { weekday: "short" })
      ),
    [data]
  );
  const revenue = useMemo(
    () => data.map((d) => Number(d.revenue.toFixed(2))),
    [data]
  );
  const sales = useMemo(() => data.map((d) => d.sales), [data]);

  return (
    <Card className="border-none shadow-sm h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Revenue Overview</CardTitle>
        <CardDescription>
          Daily revenue and sales for the last 7 days
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Chart
          title=""
          height={340}
          backgroundColor="transparent"
          options={{
            chart: {
              style: { fontFamily: "Inter, sans-serif" },
              spacing: [10, 10, 15, 10],
            },
          }}
        >
          <Credits enabled={false} />
          <Tooltip
            shared
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
          <Legend
            verticalAlign="top"
            align="right"
            itemStyle={{
              color: "var(--color-muted-foreground)",
              fontSize: "13px",
              fontWeight: "500",
            }}
            itemHoverStyle={{ color: "var(--color-foreground)" }}
            symbolRadius={3}
            symbolWidth={12}
            symbolHeight={12}
          />
          <XAxis
            categories={categories}
            crosshair={{
              color: "var(--color-border)",
              width: 1,
              dashStyle: "Dash",
            }}
            lineColor="transparent"
            tickColor="transparent"
            labels={{
              style: {
                color: "var(--color-muted-foreground)",
                fontSize: "12px",
              },
            }}
          />
          <YAxis
            title={{ text: "" }}
            gridLineColor="var(--color-border)"
            gridLineWidth={1}
            lineColor="transparent"
            tickColor="transparent"
            labels={{
              style: {
                color: "var(--color-muted-foreground)",
                fontSize: "12px",
              },
            }}
          />
          <YAxis
            title={{ text: "" }}
            opposite
            gridLineWidth={0}
            lineColor="transparent"
            tickColor="transparent"
            labels={{
              style: {
                color: "var(--color-muted-foreground)",
                fontSize: "12px",
              },
            }}
          />
          <PlotOptions
            areaspline={{
              fillOpacity: 0.08,
              marker: { radius: 0, states: { hover: { radius: 4 } } },
              lineWidth: 2.5,
              states: { hover: { lineWidthPlus: 0 } },
            }}
            spline={{
              marker: { radius: 0, states: { hover: { radius: 4 } } },
              lineWidth: 2.5,
              states: { hover: { lineWidthPlus: 0 } },
            }}
          />
          <AreaSplineSeries
            name="Revenue"
            data={revenue}
            color="var(--color-chart-1)"
            options={{
              fillColor: {
                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                stops: [
                  [0, "hsla(174, 72%, 42%, 0.15)"],
                  [1, "hsla(174, 72%, 42%, 0.01)"],
                ],
              },
              zIndex: 2,
            }}
          />
          <SplineSeries
            name="Sales"
            data={sales}
            color="var(--color-chart-3)"
            options={{
              yAxis: 1,
              dashStyle: "Dash",
              zIndex: 1,
            }}
          />
        </Chart>
      </CardContent>
    </Card>
  );
});
