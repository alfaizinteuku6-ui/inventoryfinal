import React from "react";
import {
  Box,
  Button,
  Grid,
  IconButton,
  Typography,
  Chip,
  Stack,
  TextField,
  InputAdornment,
  Paper,
  CircularProgress,
} from "@mui/material";
import { Search, Clear } from "@mui/icons-material";

const ProductFilters = ({
  searchQuery,
  onSearchChange,
  onClearSearch,
  categoryFilter,
  onCategoryChange,
  categories,
  sortBy,
  onSortChange,
  sortOrder,
  onSortOrderToggle,
  totalCount,
  debouncedSearchQuery,
  isLoading,
  currentPage,
  onClearFilters,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 4,
        borderRadius: 3,
        border: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <Grid
        container
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
      >
        {/* Search Field */}
        <Grid size={{ xs: 12, md: 5 }}>
          <TextField
            fullWidth
            placeholder="Search products by name, SKU, or description..."
            value={searchQuery}
            onChange={onSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton onClick={onClearSearch} size="small">
                    <Clear />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                "& fieldset": { borderColor: "rgba(0,0,0,0.1)" },
              },
            }}
          />
        </Grid>

        {/* Category Filter */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            select
            label="Category"
            value={categoryFilter}
            onChange={onCategoryChange}
            fullWidth
            size="small"
            SelectProps={{ native: true }}
          >
            <option value="all">All Categories</option>
            {categories?.map((category) => (
              <option key={category?.id} value={category?.id}>
                {category?.name}
              </option>
            ))}
          </TextField>
        </Grid>

        {/* Sort By */}
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <TextField
            select
            label="Sort By"
            value={sortBy}
            onChange={onSortChange}
            fullWidth
            size="small"
            SelectProps={{ native: true }}
          >
            <option value="name">Name</option>
            <option value="selling_price">Price</option>
            <option value="stock_quantity">Stock</option>
            <option value="created_at">Date Created</option>
          </TextField>
        </Grid>

        {/* Sort Order Toggle */}
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <Button
            variant="outlined"
            onClick={onSortOrderToggle}
            fullWidth
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            {sortOrder === "asc" ? "A-Z" : "Z-A"}
          </Button>
        </Grid>
      </Grid>

      {/* Results Info */}
      <Box mt={2}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ whiteSpace: "nowrap" }}
        >
          {isLoading && currentPage > 1 ? (
            <CircularProgress size={16} sx={{ mr: 1 }} />
          ) : null}
          {totalCount > 0 && `${totalCount.toLocaleString()} results`}
          {debouncedSearchQuery && ` for "${debouncedSearchQuery}"`}
        </Typography>
      </Box>

      {/* Active Filters */}
      {(debouncedSearchQuery || categoryFilter !== "all") && (
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          flexWrap="wrap"
          mt={2}
        >
          <Typography variant="body2" color="text.secondary">
            Active filters:
          </Typography>
          {debouncedSearchQuery && (
            <Chip
              label={`Search: ${debouncedSearchQuery}`}
              onDelete={onClearSearch}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
          {categoryFilter !== "all" && (
            <Chip
              label={`Category: ${categoryFilter}`}
              onDelete={() => onCategoryChange({ target: { value: "all" } })}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
          <Button
            size="small"
            onClick={onClearFilters}
            sx={{ ml: 1, textTransform: "none" }}
          >
            Clear all
          </Button>
        </Stack>
      )}
    </Paper>
  );
};

export default ProductFilters;