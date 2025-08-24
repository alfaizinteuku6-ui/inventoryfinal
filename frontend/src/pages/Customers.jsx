import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Paper,
  Grid,
  Fab,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  useTheme,
  useMediaQuery,
  Stack,
  Divider,
  Badge,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  MoreVert as MoreVertIcon,
  ViewList as TableViewIcon,
  ViewModule as GridViewIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";
import { useCustomers } from "../hooks/useSWR";
import CustomerDailog from "../components/CustomerDailog";
import { customers } from "../services/api";
import HeaderCard from "../components/HeaderCard";
const Customers = () => {
  const theme = useTheme();
  const { data: customersData, mutate, error, isLoading } = useCustomers();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.down("lg"));

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [viewMode, setViewMode] = useState("table");
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredCustomers =
    customersData?.results?.filter((customer) => {
      const matchesSearch =
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm);
      const matchesFilter =
        filterType === "all" ||
        customer.customer_type.toLowerCase() === filterType.toLowerCase();
      return matchesSearch && matchesFilter;
    }) || [];

  const handleDelete = async (id) => {
    setCustomerToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await customers.delete(customerToDelete);
      mutate();
      setDeleteDialogOpen(false);
      setCustomerToDelete(null);
    } catch (error) {
      console.error("Error deleting customer:", error);
    }
  };

  const getCustomerTypeColor = (type) => {
    switch (type.toLowerCase()) {
      case "business":
        return "warning";
      case "individual":
        return "primary";
      default:
        return "individual";
    }
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const CustomerCard = ({ customer }) => (
    <Card
      sx={{
        height: "100%",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": { transform: "translateY(-4px)", boxShadow: 6 },
      }}
    >
      <CardContent>
        <Box
          display="flex"
          alignItems="flex-start"
          justifyContent="space-between"
          mb={2}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: "primary.main", width: 50, height: 50 }}>
              {getInitials(customer.name)}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {customer.name}
              </Typography>
              <Chip
                label={customer.customer_type}
                size="small"
                color={getCustomerTypeColor(customer.customer_type)}
                variant="outlined"
              />
            </Box>
          </Box>
          <IconButton
            size="small"
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            <MoreVertIcon />
          </IconButton>
        </Box>

        <Stack spacing={1}>
          <Box display="flex" alignItems="center" gap={1}>
            <EmailIcon fontSize="small" color="action" />
            <Typography variant="body2" noWrap>
              {customer.email}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <PhoneIcon fontSize="small" color="action" />
            <Typography variant="body2">{customer.phone}</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <LocationIcon fontSize="small" color="action" />
            <Typography variant="body2" noWrap>
              {customer.city}, {customer.state}
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          <Grid size={{ xs: 6 }}>
            <Typography variant="body2" color="text.secondary">
              Orders
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              {customer.total_orders}
            </Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography variant="body2" color="text.secondary">
              Total Spent
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              ₹{customer.total_spent?.toFixed(2)}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <HeaderCard
        icon={<PersonIcon fontSize="large" />}
        title="Customer Management"
        subtitle="Manage your customer relationships"
        actionButton={
          !isMobile && (
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={() => {
                setEditingCustomer(null);
                setDialogOpen(true);
              }}
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                borderRadius: 2,
              }}
            >
              Add Customer
            </Button>
          )
        }
      />

      {/* Controls */}
      <Card sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Filter by Type</InputLabel>
                <Select
                  value={filterType}
                  label="Filter by Type"
                  onChange={(e) => setFilterType(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="individual">Individual</MenuItem>
                  <MenuItem value="business">Business</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 5 }}>
              <Box display="flex" justifyContent="flex-end" gap={1}>
                <Tooltip title="Table View">
                  <IconButton
                    onClick={() => setViewMode("table")}
                    color={viewMode === "table" ? "primary" : "default"}
                  >
                    <TableViewIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Grid View">
                  <IconButton
                    onClick={() => setViewMode("grid")}
                    color={viewMode === "grid" ? "primary" : "default"}
                  >
                    <GridViewIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Export">
                  <IconButton>
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Content */}
      {viewMode === "table" ? (
        <Card sx={{ borderRadius: 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox />
                  </TableCell>
                  <TableCell>Customer</TableCell>
                  {!isMobile && <TableCell>Contact</TableCell>}
                  <TableCell>Type</TableCell>
                  {!isTablet && <TableCell>Location</TableCell>}
                  {!isMobile && <TableCell>Orders</TableCell>}
                  {!isMobile && <TableCell>Total Spent</TableCell>}
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id} hover>
                    <TableCell padding="checkbox">
                      <Checkbox />
                    </TableCell>
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
                          {customer?.total_orders}
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
                          ₹{customer?.total_spent?.toFixed(2)}
                        </Typography>
                      </TableCell>
                    )}
                    <TableCell align="center">
                      <Box display="flex" justifyContent="center" gap={1}>
                        <Tooltip title="View Details">
                          <IconButton size="small" color="primary">
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => {
                              setEditingCustomer(customer);
                              setDialogOpen(true);
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(customer.id)}
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
      ) : (
        <Grid container spacing={3}>
          {filteredCustomers.map((customer) => (
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={customer.id}>
              <CustomerCard customer={customer} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Mobile FAB */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="add"
          sx={{
            position: "fixed",
            bottom: 16,
            right: 16,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          }}
          onClick={() => {
            setEditingCustomer(null);
            setDialogOpen(true);
          }}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this customer? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => setAnchorEl(null)}>
          <ViewIcon fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => setAnchorEl(null)}
          sx={{ color: "error.main" }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
      <CustomerDailog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        editingCustomer={editingCustomer}
        mutate={mutate}
      />
    </Box>
  );
};

export default Customers;
