import React from "react";
import { Grid } from "@mui/material";
import {
  Inventory2,
  AttachMoney,
  Warning,
  LocalOffer,
} from "@mui/icons-material";
import StatsCard from "../StatsCard";

const ProductsStats = ({ dashboardStats }) => {
  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <StatsCard
          title="Total Products"
          value={dashboardStats.total_products || 0}
          icon={<Inventory2 />}
          color="primary"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <StatsCard
          title="Inventory Value"
          value={`₹${
            dashboardStats.total_inventory_value?.toLocaleString("en-IN") || 0
          }`}
          icon={<AttachMoney />}
          color="success"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <StatsCard
          title="Low Stock Alert"
          value={dashboardStats.low_stock_alert || 0}
          icon={<Warning />}
          color="warning"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <StatsCard
          title="Out of Stock"
          value={dashboardStats.out_of_stock || 0}
          icon={<LocalOffer />}
          color="error"
        />
      </Grid>
    </Grid>
  );
};

export default ProductsStats;