import React from "react";
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Avatar,
  IconButton,
  Box,
  Tooltip,
  CircularProgress,
  useTheme,
  useMediaQuery,
  alpha,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
} from "@mui/icons-material";

const CustomerTable = ({ customers, isLoading, onEdit, onDelete }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.down("lg"));

  const getCustomerTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case "business":
        return "warning";
      case "individual":
        return "primary";
      default:
        return "default";
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <Card sx={{ borderRadius: 2, p: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Loading customers...
        </Typography>
      </Card>
    );
  }

  if (!customers || customers.length === 0) {
    return (
      <Card sx={{ borderRadius: 2, p: 4, textAlign: "center" }}>
        <Typography variant="h6" color="text.secondary">
          No customers found
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Try adjusting your search or filter criteria
        </Typography>
      </Card>
    );
  }

  return (
    <Card sx={{ borderRadius: 2 }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>Customer</TableCell>
              {!isMobile && <TableCell sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>Contact</TableCell>}
              <TableCell sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>Type</TableCell>
              {!isTablet && <TableCell sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>Location</TableCell>}
              {!isMobile && <TableCell sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>Orders</TableCell>}
              {!isMobile && <TableCell sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>Total Spent</TableCell>}
              <TableCell align="center" sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id} hover>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ bgcolor: "primary.main" }}>
                      {getInitials(customer.name)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {customer.name}
                      </Typography>
                      {isMobile && (
                        <Typography variant="body2" color="text.secondary">
                          {customer.email}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </TableCell>
                {!isMobile && (
                  <TableCell>
                    <Box>
                      <Typography
                        variant="body2"
                        display="flex"
                        alignItems="center"
                        gap={1}
                      >
                        <EmailIcon fontSize="small" />
                        {customer.email}
                      </Typography>
                      <Typography
                        variant="body2"
                        display="flex"
                        alignItems="center"
                        gap={1}
                        color="text.secondary"
                      >
                        <PhoneIcon fontSize="small" />
                        {customer.phone}
                      </Typography>
                    </Box>
                  </TableCell>
                )}
                <TableCell>
                  <Chip
                    label={customer.customer_type}
                    size="small"
                    color={getCustomerTypeColor(customer.customer_type)}
                    variant="outlined"
                  />
                </TableCell>
                {!isTablet && (
                  <TableCell>
                    <Typography variant="body2">
                      {customer.address}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {[customer.city, customer.state, customer.postal_code]
                        .filter(Boolean)
                        .join(", ")}
                    </Typography>
                  </TableCell>
                )}
                {!isMobile && (
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {customer?.orders_count || 0}
                    </Typography>
                  </TableCell>
                )}
                {!isMobile && (
                  <TableCell>
                    <Typography
                      variant="subtitle2"
                      fontWeight="bold"
                      color="success.main"
                    >
                      ₹{customer?.total_spent || 0}
                    </Typography>
                  </TableCell>
                )}
                <TableCell align="center">
                  <Box display="flex" justifyContent="center" gap={1}>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => onEdit(customer)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => onDelete(customer.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
};

export default CustomerTable;