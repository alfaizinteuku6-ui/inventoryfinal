import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
} from "@mui/material";
import {
  ArrowUpward,
  ArrowDownward,
} from "@mui/icons-material";

// Enhanced MetricCard Component
const MetricCard = ({
  title,
  value,
  change,
  icon: Icon,
  color = "primary",
  subtitle,
  trend,
}) => {
  const isPositive = change && change >= 0;

  return (
    <Card sx={{ height: "100%", position: "relative", overflow: "visible" }}>
      <CardContent>
        <Box
          display="flex"
          alignItems="flex-start"
          justifyContent="space-between"
        >
          <Box flex={1}>
            <Typography color="text.secondary" variant="body2" gutterBottom>
              {title}
            </Typography>
            <Typography
              variant="h4"
              component="div"
              fontWeight="bold"
              color="text.primary"
            >
              {value}
            </Typography>
            {subtitle && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {subtitle}
              </Typography>
            )}
            {change !== null && change !== undefined && (
              <Box display="flex" alignItems="center" mt={1}>
                {isPositive ? (
                  <ArrowUpward
                    sx={{ fontSize: 16, color: "success.main", mr: 0.5 }}
                  />
                ) : (
                  <ArrowDownward
                    sx={{ fontSize: 16, color: "error.main", mr: 0.5 }}
                  />
                )}
                <Typography
                  variant="body2"
                  color={isPositive ? "success.main" : "error.main"}
                  fontWeight="medium"
                >
                  {change === 100
                    ? "New"
                    : `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`}
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar
            sx={{
              bgcolor: `${color}.main`,
              width: 56,
              height: 56,
              boxShadow: (theme) => `0 8px 24px ${theme.palette[color].main}25`,
            }}
          >
            <Icon />
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};

export default MetricCard;