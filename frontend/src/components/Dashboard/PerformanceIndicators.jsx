import React from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Alert,
} from "@mui/material";
import { Warning } from "@mui/icons-material";
// Performance Indicators Component
const PerformanceIndicators = ({ performanceData, alerts }) => {
  const indicators = [
    {
      key: "completion_rate",
      label: "Completion Rate",
      suffix: "%",
      target: 80,
      color: "primary",
    },
    {
      key: "tax_rate",
      label: "Tax Rate",
      suffix: "%",
      target: 90,
      color: "success",
    },
    {
      key: "refund_rate",
      label: "Refund Rate",
      suffix: "%",
      target: 5,
      color: "error",
      inverse: true,
    },
    {
      key: "discount_rate",
      label: "Discount Rate",
      suffix: "%",
      target: 10,
      color: "warning",
      inverse: true,
    },
  ];

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Performance Indicators
        </Typography>

        {/* Alerts */}
        {alerts && alerts.length > 0 && (
          <Box sx={{ mb: 3 }}>
            {alerts.map((alert, index) => (
              <Alert
                key={index}
                severity={alert.type}
                sx={{ mb: 1 }}
                icon={<Warning />}
              >
                <Typography variant="body2" fontWeight="medium">
                  {alert.message}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {alert.recommendation}
                </Typography>
              </Alert>
            ))}
          </Box>
        )}

        {/* Performance Metrics */}
        <Grid container spacing={3}>
          {indicators.map((indicator) => {
            const value = performanceData?.[indicator.key] || 0;
            const isGood = indicator.inverse
              ? value <= indicator.target
              : value >= indicator.target;

            return (
              <Grid size={{ xs: 12, sm: 6 }} key={indicator.key}>
                <Box>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={1}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {indicator.label}
                    </Typography>
                    <Typography
                      variant="body1"
                      fontWeight="bold"
                      color={isGood ? "success.main" : "warning.main"}
                    >
                      {value.toFixed(1)}
                      {indicator.suffix}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(value, 100)}
                    color={isGood ? "success" : "warning"}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 0.5, display: "block" }}
                  >
                    Target: {indicator.target}
                    {indicator.suffix}
                  </Typography>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default PerformanceIndicators;
