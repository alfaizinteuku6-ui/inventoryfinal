import React from "react";
import {
  Box,
  Button,
  Alert,
  Snackbar,
  Backdrop,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Add, Inventory } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useCategories, useProducts } from "../hooks/useSWR";
import { products as productsApi } from "../services/api";

// Component imports
import HeaderCard from "../components/HeaderCard";
import PaginationComponent from "../components/Pagination";
import ProductFilters from "../components/Products/ProductFilters";
import ProductsList from "../components/Products/ProductsList";
import DeleteProductDialog from "../components/Products/DeleteProductDialog";
import ProductsSpeedDial from "../components/Products/ProductsSpeedDial";

// Custom hook
import { useProductsState } from "../hooks/useProductsState";

const Products = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Use custom hook for state management
  const {
    currentPage,
    itemsPerPage,
    searchQuery,
    debouncedSearchQuery,
    categoryFilter,
    sortBy,
    sortOrder,
    selectedProduct,
    deleteDialogOpen,
    snackbar,
    apiParams,
    handlePageChange,
    handleItemsPerPageChange,
    handleSearchChange,
    handleClearSearch,
    handleCategoryChange,
    handleSortChange,
    handleSortOrderToggle,
    handleClearFilters,
    handleDeleteClick,
    handleDeleteCancel,
    showSnackbar,
    hideSnackbar,
    setDeleteDialogOpen,
    setSelectedProduct,
  } = useProductsState();

  // API calls
  const { data: CategoriesData } = useCategories();
  const {
    data: productsData,
    mutate,
    isLoading,
    error,
  } = useProducts(apiParams);

  // Extract data from API response
  const products = productsData?.results || [];
  const totalCount = productsData?.count || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // Delete handler
  const handleDeleteConfirm = async () => {
    try {
      await productsApi.delete(selectedProduct.id);
      mutate(); // Refresh data
      showSnackbar("Product deleted successfully", "success");
    } catch (error) {
      showSnackbar("Failed to delete product", "error");
    } finally {
      setDeleteDialogOpen(false);
      setSelectedProduct(null);
    }
  };

  if (error) {
    return (
      <Box width="100%">
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load products. Please refresh the page or try again later.
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        p: { xs: 2, sm: 3 },
      }}
    >
      {/* Loading Backdrop */}
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isLoading && currentPage === 1}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      {/* Header Section */}
      <HeaderCard
        icon={<Inventory fontSize="large" />}
        title="Products Management"
        subtitle={`Manage your Products (${totalCount.toLocaleString()} total)`}
        actionButton={
          !isMobile && (
            <Button
              variant="contained"
              size="large"
              startIcon={<Add />}
              onClick={() => navigate("/products/new")}
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                borderRadius: 2,
              }}
            >
              Add Product
            </Button>
          )
        }
      />

      {/* Search, Filter and View Controls */}
      <ProductFilters
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onClearSearch={handleClearSearch}
        categoryFilter={categoryFilter}
        onCategoryChange={handleCategoryChange}
        categories={CategoriesData?.results}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        sortOrder={sortOrder}
        onSortOrderToggle={handleSortOrderToggle}
        totalCount={totalCount}
        debouncedSearchQuery={debouncedSearchQuery}
        isLoading={isLoading}
        currentPage={currentPage}
        onClearFilters={handleClearFilters}
      />

      {/* Products Grid/List */}
      <ProductsList
        products={products}
        isLoading={isLoading}
        currentPage={currentPage}
        handleDeleteClick={handleDeleteClick}
        debouncedSearchQuery={debouncedSearchQuery}
        categoryFilter={categoryFilter}
        onClearFilters={handleClearFilters}
      />

      {/* Pagination */}
      {products.length > 0 && (
        <Box sx={{ mt: 4, mb: 2 }}>
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

      {/* Delete Confirmation Dialog */}
      <DeleteProductDialog
        open={deleteDialogOpen}
        selectedProduct={selectedProduct}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={hideSnackbar}
      >
        <Alert
          onClose={hideSnackbar}
          severity={snackbar.severity}
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Floating Speed Dial */}
      <ProductsSpeedDial onRefresh={() => mutate()} />
    </Box>
  );
};

export default Products;