// Sales/components/SalesGrid.js
import React from "react";
import { Grid, Skeleton } from "@mui/material";
import SaleCard from "./SaleCard";

const SalesGrid = ({
  sales,
  loading,
  itemsPerPage,
  companyInfo,
  navigate,
  onAddPayment,
  onCancelSale,
  onDeleteSale,
}) => {
  if (loading) {
    return (
      <Grid container spacing={3}>
        {[...Array(itemsPerPage)].map((_, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
            <Skeleton
              variant="rectangular"
              height={300}
              sx={{ borderRadius: 4 }}
            />
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {sales.map((sale, index) => (
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }} key={sale.id}>
          <SaleCard
            sale={sale}
            index={index}
            companyInfo={companyInfo}
            navigate={navigate}
            onAddPayment={onAddPayment}
            onCancelSale={onCancelSale}
            onDeleteSale={onDeleteSale}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default SalesGrid;