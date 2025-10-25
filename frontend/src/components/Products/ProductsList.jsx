import React from "react";
import { Grid } from "@mui/material";
import { Inventory2 } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import ProductCard from "./ProductCard";
import ProductsTable from "./ProductsTable";
import LoadingSkeleton from "../LoadingSkeleton";
import EmptyState from "../EmptyState";

const ProductsList = ({
  products,
  isLoading,
  currentPage,
  handleDeleteClick,
  debouncedSearchQuery,
  categoryFilter,
  onClearFilters,
  viewMode = "grid", // Passed from parent
}) => {
  const navigate = useNavigate();
  const hasFilter = Boolean(debouncedSearchQuery || categoryFilter !== "all");

  // Empty state
  if (isLoading && currentPage === 1) {
    return <LoadingSkeleton />;
  }

  if (products.length === 0) {
    return (
      <EmptyState
        icon={<Inventory2 sx={{ fontSize: 40, color: "rgba(0,0,0,0.3)" }} />}
        title={
          hasFilter ? "No products match your criteria" : "No products found"
        }
        description={
          hasFilter
            ? "Try adjusting your search terms or filters"
            : "Start by adding your first product to inventory"
        }
        primaryAction={() => navigate("/products/new")}
        primaryLabel={hasFilter ? "Add Product" : "Add First Product"}
        secondaryAction={hasFilter ? onClearFilters : undefined}
        secondaryLabel="Clear Filters"
      />
    );
  }

  // Table View
  if (viewMode === "table") {
    return (
      <ProductsTable products={products} handleDeleteClick={handleDeleteClick} />
    );
  }

  // Grid View (Default)
  return (
    <Grid container spacing={3}>
      {products.map((product, index) => (
        <Grid size={{ xs: 12, md: 6, lg: 4 }} key={product.id}>
          <ProductCard
            product={product}
            index={index}
            onDelete={handleDeleteClick}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default ProductsList;
