// Sales/components/SalesHeader.js
import React from "react";
import { Button, useTheme, useMediaQuery } from "@mui/material";
import { Add, Receipt } from "@mui/icons-material";
import HeaderCard from "../../components/HeaderCard";

const SalesHeader = ({ navigate }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <HeaderCard
      icon={<Receipt fontSize="large" />}
      title="Sales Dashboard"
      subtitle="Manage your sales and invoices efficiently"
      actionButton={
        !isMobile && (
          <Button
            variant="contained"
            size="large"
            startIcon={<Add />}
            onClick={() => navigate("/sales/new")}
            sx={{
              bgcolor: "rgba(255,255,255,0.2)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
              borderRadius: 2,
            }}
          >
            Create New Sale
          </Button>
        )
      }
    />
  );
};

export default SalesHeader;