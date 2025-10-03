import React from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
} from "@mui/material";
import {
  CheckCircle,
  Cancel,
  Pending,
  TrendingDown,
  Info,
} from "@mui/icons-material";

// Payment Status Component
const PaymentStatusCard = ({ paymentData }) => {
    console.log("Payment Data:", paymentData);
    const getStatusIcon = (status) => {
      const icons = {
        paid: CheckCircle,
        pending: Pending,
        cancelled: Cancel,
        partial: Info,
        refunded: TrendingDown,
      };
      return icons[status] || Info;
    };
  
    const getStatusColor = (status) => {
      const colors = {
        paid: "success",
        pending: "warning",
        cancelled: "error",
        partial: "info",
        refunded: "secondary",
      };
      return colors[status] || "default";
    };
  
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Payment Status Breakdown
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(paymentData?.payment_status_breakdown || {}).map(
              ([status, data]) => {
                const StatusIcon = getStatusIcon(status);
                return (
                  <Grid size={{ xs: 12, md: 4, sm: 6 }} key={status}>
                    <Paper sx={{ p: 2, textAlign: "center", bgcolor: "grey.50" }}>
                      <StatusIcon
                        sx={{
                          fontSize: 32,
                          color: `${getStatusColor(status)}.main`,
                          mb: 1,
                        }}
                      />
                      <Typography variant="h6" fontWeight="bold">
                        {data.count}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        ₹{data.paid_amount?.toLocaleString() || 0}
                      </Typography>
                    </Paper>
                  </Grid>
                );
              }
            )}
          </Grid>
        </CardContent>
      </Card>
    );
  };

  export default PaymentStatusCard;
  