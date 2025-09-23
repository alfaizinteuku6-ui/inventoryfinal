// Sales/components/PaymentModal.js
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Stack,
  Typography,
  Avatar,
  IconButton,
  Paper,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  Fade,
  Slide,
} from "@mui/material";
import { Payment, Close } from "@mui/icons-material";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const PaymentModal = ({
  open,
  selectedSale,
  paymentOption,
  customAmount,
  onClose,
  onPaymentOptionChange,
  onCustomAmountChange,
  onSubmit,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          boxShadow: "0 24px 48px rgba(0,0,0,0.15)",
        },
      }}
    >
      <DialogTitle
        sx={{
          p: 3,
          pb: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            sx={{
              bgcolor: "success.main",
              width: 40,
              height: 40,
            }}
          >
            <Payment />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight="700">
              Record Payment
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedSale?.sale_number} - {selectedSale?.customer_name}
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            bgcolor: "rgba(0,0,0,0.04)",
            "&:hover": { bgcolor: "rgba(0,0,0,0.08)" },
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* Balance Due Display */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              bgcolor: "rgba(25, 118, 210, 0.05)",
              borderRadius: 3,
              border: "1px solid rgba(25, 118, 210, 0.2)",
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Outstanding Balance
            </Typography>
            <Typography variant="h4" fontWeight="700" color="primary.main">
              ₹
              {parseFloat(selectedSale?.balance_due || 0).toLocaleString(
                "en-IN",
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              )}
            </Typography>
          </Paper>

          {/* Payment Options */}
          <FormControl component="fieldset">
            <FormLabel
              component="legend"
              sx={{
                fontWeight: 600,
                color: "text.primary",
                mb: 2,
              }}
            >
              Choose Payment Amount
            </FormLabel>
            <RadioGroup
              value={paymentOption}
              onChange={(e) => onPaymentOptionChange(e.target.value)}
            >
              <FormControlLabel
                value="full"
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="body1" fontWeight="600">
                      Pay Full Amount
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ₹
                      {parseFloat(
                        selectedSale?.balance_due || 0
                      ).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Typography>
                  </Box>
                }
                sx={{
                  p: 2,
                  m: 0,
                  border: "1px solid rgba(0,0,0,0.1)",
                  borderRadius: 2,
                  mb: 1,
                  "&:hover": {
                    bgcolor: "rgba(0,0,0,0.02)",
                  },
                  ...(paymentOption === "full" && {
                    bgcolor: "rgba(25, 118, 210, 0.05)",
                    borderColor: "primary.main",
                  }),
                }}
              />
              <FormControlLabel
                value="partial"
                control={<Radio />}
                label={
                  <Typography variant="body1" fontWeight="600">
                    Pay Custom Amount
                  </Typography>
                }
                sx={{
                  p: 2,
                  m: 0,
                  border: "1px solid rgba(0,0,0,0.1)",
                  borderRadius: 2,
                  "&:hover": {
                    bgcolor: "rgba(0,0,0,0.02)",
                  },
                  ...(paymentOption === "partial" && {
                    bgcolor: "rgba(25, 118, 210, 0.05)",
                    borderColor: "primary.main",
                  }),
                }}
              />
            </RadioGroup>
          </FormControl>

          {/* Custom Amount Input */}
          {paymentOption === "partial" && (
            <Fade in>
              <FormControl fullWidth>
                <InputLabel htmlFor="custom-amount">Custom Amount</InputLabel>
                <OutlinedInput
                  id="custom-amount"
                  value={customAmount}
                  onChange={(e) => onCustomAmountChange(e.target.value)}
                  startAdornment={
                    <InputAdornment position="start">₹</InputAdornment>
                  }
                  label="Custom Amount"
                  type="number"
                  inputProps={{
                    min: 0.01,
                    max: selectedSale?.balance_due,
                    step: 0.01,
                  }}
                  sx={{
                    borderRadius: 2,
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(0,0,0,0.1)",
                    },
                  }}
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1, ml: 1 }}
                >
                  Maximum: ₹
                  {parseFloat(selectedSale?.balance_due || 0).toLocaleString(
                    "en-IN",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}
                </Typography>
              </FormControl>
            </Fade>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderRadius: 2,
            textTransform: "none",
            px: 3,
            fontWeight: 600,
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          startIcon={<Payment />}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            px: 3,
            fontWeight: 600,
            minWidth: 140,
          }}
        >
          Record Payment
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentModal;