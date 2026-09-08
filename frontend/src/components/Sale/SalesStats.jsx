// Sales/components/SalesStats.js
import React from "react";
import { Grid } from "@mui/material";
import {
  TrendingUp,
  Analytics,
  Payment,
  ReceiptLong,
} from "@mui/icons-material";
import StatsCard from "../../components/StatsCard";

const SalesStats = ({ summary }) => {  
  const statsData = [
    {
      title: "Total Sales",
      value: summary?.total_sales_count || 0,
      icon: <TrendingUp />,
      color: "primary",
    },
    {
      title: "Gross Revenue",
      value: `Rp ${
        summary?.revenue_metrics?.gross_revenue?.toLocaleString("id-ID") || 0
      }`,
      icon: <Analytics />,
      color: "success",
    },
    {
      title: "Paid Amount",
      value: `Rp ${
        summary?.payment_metrics?.total_paid?.toLocaleString("id-ID") || 0
      }`,
      icon: <Payment />,
      color: "warning",
    },
    {
      title: "Pending Payments",
      value: `Rp ${
        summary?.payment_metrics?.total_outstanding?.toLocaleString("id-ID") ||
        0
      }`,
      icon: <ReceiptLong />,
      color: "error",
    },
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {statsData.map((stat, index) => (
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
          <StatsCard
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default SalesStats;
