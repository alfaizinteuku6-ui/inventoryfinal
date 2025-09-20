import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Paper,
  useTheme,
} from "@mui/material";
import { RemoveShoppingCart, CreditCard } from "@mui/icons-material"; // optional icons

const CancelSaleModal = ({
  open,
  onClose,
  onChoose, // (choice) => void, choice = "refund" | "credit"
  isPartialPaid = false,
}) => {
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: theme.shadows[8],
        },
      }}
    >
      <DialogTitle sx={{ textAlign: "center", fontWeight: 600 }}>
        Cancel Sale
      </DialogTitle>

      <DialogContent>
        <Typography
          variant="body1"
          sx={{ textAlign: "center", mb: 2, color: "text.secondary" }}
        >
          {isPartialPaid
            ? "This sale is partially paid. Please choose how to handle the paid amount."
            : "Are you sure you want to cancel this sale?"}
        </Typography>

        {isPartialPaid && (
          <Grid container spacing={2} justifyContent="center">
            <Grid item xs={12} sm={6}>
              <Paper
                onClick={() => onChoose("refund")}
                sx={{
                  p: 2,
                  textAlign: "center",
                  cursor: "pointer",
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  "&:hover": {
                    backgroundColor: theme.palette.action.hover,
                  },
                }}
                elevation={0}
              >
                <RemoveShoppingCart sx={{ fontSize: 32, color: theme.palette.primary.main }} />
                <Typography variant="subtitle1" sx={{ mt: 1 }}>
                  Refund
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Paper
                onClick={() => onChoose("credit")}
                sx={{
                  p: 2,
                  textAlign: "center",
                  cursor: "pointer",
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  "&:hover": {
                    backgroundColor: theme.palette.action.hover,
                  },
                }}
                elevation={0}
              >
                <CreditCard
                  sx={{ fontSize: 32, color: theme.palette.secondary.main }}
                />
                <Typography variant="subtitle1" sx={{ mt: 1 }}>
                  Store Credit
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        )}
      </DialogContent>

      {!isPartialPaid && (
        <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
          <Button variant="outlined" onClick={onClose}>
            No, keep sale
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => onChoose("cancel")}
          >
            Yes, cancel sale
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default CancelSaleModal;
