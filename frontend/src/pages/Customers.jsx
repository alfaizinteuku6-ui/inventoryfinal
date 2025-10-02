import React from "react";
import { Box, Fab, useTheme, useMediaQuery } from "@mui/material";
import { Add as AddIcon, Person as PersonIcon } from "@mui/icons-material";
import CustomerDialog from "../components/Customers/CustomerDailog";
import HeaderCard from "../components/HeaderCard";
import CustomerFilters from "../components/Customers/CustomerFilters";
import CustomerTable from "../components/Customers/CustomerTable";
import DeleteConfirmDialog from "../components/Customers/DeleteConfirmDialog";
import PaginationComponent from "../components/Pagination";
import useCustomersState from "../hooks/useCustomersState";

const Customers = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Use custom hook for all state management
  const {
    customersList,
    isLoading,
    currentPage,
    totalPages,
    totalCount,
    itemsPerPage,
    handlePageChange,
    handleItemsPerPageChange,
    searchTerm,
    filterType,
    handleSearchChange,
    handleFilterChange,
    handleAddCustomer,
    handleEditCustomer,
    dialogOpen,
    editingCustomer,
    handleCloseDialog,
    deleteDialogOpen,
    handleDeleteClick,
    handleCloseDeleteDialog,
    handleConfirmDelete,
    mutate,
  } = useCustomersState();

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <HeaderCard
        icon={<PersonIcon fontSize="large" />}
        title="Customer Management"
        subtitle="Manage your customer relationships"
        actionButton={
          !isMobile && (
            <button
              onClick={handleAddCustomer}
              style={{
                background: "rgba(255,255,255,0.2)",
                border: "none",
                borderRadius: "8px",
                padding: "10px 20px",
                color: "white",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <AddIcon /> Add Customer
            </button>
          )
        }
      />

      {/* Filters */}
      <CustomerFilters
        searchTerm={searchTerm}
        filterType={filterType}
        onSearchChange={handleSearchChange}
        onFilterChange={handleFilterChange}
      />

      {/* Table */}
      <CustomerTable
        customers={customersList}
        isLoading={isLoading}
        onEdit={handleEditCustomer}
        onDelete={handleDeleteClick}
      />

      {/* Pagination */}
      {customersList.length > 0 && (
        <Box sx={{ mt: 3, mb: 2 }}>
          <PaginationComponent
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            showItemsPerPage={true}
            showInfo={true}
            itemsPerPageOptions={[10, 20, 50, 100]}
          />
        </Box>
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
          onClick={handleAddCustomer}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Dialogs */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Confirm Delete"
        message="Are you sure you want to delete this customer? This action cannot be undone."
      />

      <CustomerDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        editingCustomer={editingCustomer}
        mutate={mutate}
      />
    </Box>
  );
};

export default Customers;