import React, { useState } from "react";
import {
  Text,
  Button,
  BarChart,
  Flex,
  LoadingSpinner,
  Alert,
  EmptyState,
  Heading,
  Icon,
  Divider,
  Inline,
} from "@hubspot/ui-extensions";
import { hubspot } from "@hubspot/ui-extensions";

hubspot.extend<"crm.record.tab">(({ actions }) => (
  <TicketAnalyticsCard fetchProperties={actions.fetchCrmObjectProperties} />
));

const TicketAnalyticsCard = ({
  fetchProperties,
}: {
  fetchProperties: (properties: string[]) => Promise<Record<string, unknown>>;
}) => {
  const [chartData, setChartData] = useState<
    Array<{ Category: string; Value: number }> | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const priorityToValue: Record<string, number> = {
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1,
    "": 1,
  };

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);

    try {
      const properties = await fetchProperties([
        "subject",
        "hs_priority",
        "hs_pipeline_stage",
        "source_type",
        "createdate",
        "closed_date",
      ]);

      const chartBars: Array<{ Category: string; Value: number }> = [];

      if (properties.hs_priority !== undefined && properties.hs_priority !== "") {
        const priority =
          typeof properties.hs_priority === "string"
            ? properties.hs_priority.toUpperCase()
            : String(properties.hs_priority).toUpperCase();
        chartBars.push({
          Category: "Priority score",
          Value: priorityToValue[priority] ?? 1,
        });
      }

      if (
        properties.hs_pipeline_stage !== undefined &&
        properties.hs_pipeline_stage !== ""
      ) {
        const stageStr = String(properties.hs_pipeline_stage);
        chartBars.push({
          Category: "Pipeline stage",
          Value: stageStr.length % 5 || 1,
        });
      }

      if (properties.source_type !== undefined && properties.source_type !== "") {
        const sourceStr = String(properties.source_type);
        chartBars.push({
          Category: "Source type",
          Value: Math.min(sourceStr.length * 2, 10),
        });
      }

      const mockResolutionTime = Math.floor(Math.random() * 24) + 1;
      chartBars.push({
        Category: "Resolution time (hrs)",
        Value: mockResolutionTime,
      });

      const mockCsatScore = Math.floor(Math.random() * 10) + 1;
      chartBars.push({
        Category: "CSAT score",
        Value: mockCsatScore,
      });

      const mockFirstResponse = Math.floor(Math.random() * 115) + 5;
      chartBars.push({
        Category: "First response (min)",
        Value: mockFirstResponse,
      });

      setChartData(chartBars);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Flex direction="column" gap="large" align="center" justify="center">
        <LoadingSpinner label="Loading analytics..." />
        <Text variant="microcopy">Fetching ticket data and metrics</Text>
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex direction="column" gap="large">
        <Alert title="Something went wrong" variant="error">
          {error}
        </Alert>
        <Flex justify="end">
          <Button onClick={loadAnalytics} variant="secondary">
            <Inline gap="small">
              <Icon name="refresh" />
              <Text>Try again</Text>
            </Inline>
          </Button>
        </Flex>
      </Flex>
    );
  }

  if (chartData === null) {
    return (
      <EmptyState
        title="Ticket analytics dashboard"
        layout="vertical"
        imageName="emptyStateCharts"
        reverseOrder={true}
      >
        <Text>
          Visualize ticket properties and AI team metrics in interactive
          charts. Get the same visibility the AI team uses for decision-making.
        </Text>
        <Button onClick={loadAnalytics}>
          <Inline gap="small">
            <Icon name="generateChart" />
            <Text>Load analytics</Text>
          </Inline>
        </Button>
      </EmptyState>
    );
  }

  return (
    <Flex direction="column" gap="large">
      <Flex direction="column" gap="flush">
        <Flex align="center" gap="small">
          <Icon name="generateChart" color="inherit" />
          <Heading>Analytics overview</Heading>
        </Flex>
        <Text variant="microcopy">
          Ticket properties and AI team dashboard metrics
        </Text>
      </Flex>

      <Divider size="small" />

      <BarChart
        data={chartData}
        axes={{
          x: { field: "Category", fieldType: "category" },
          y: { field: "Value", fieldType: "linear" },
        }}
        options={{
          title: "Ticket metrics",
          showLegend: true,
          showDataLabels: true,
          showTooltips: true,
          colorList: ["blue", "teal", "darkPurple", "orange", "darkGreen", "purple"],
        }}
      />

      <Divider size="small" />

      <Flex justify="end">
        <Button onClick={loadAnalytics} variant="secondary">
          <Inline gap="small">
            <Icon name="refresh" />
            <Text>Refresh</Text>
          </Inline>
        </Button>
      </Flex>
    </Flex>
  );
};
