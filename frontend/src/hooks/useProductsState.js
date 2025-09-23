import { useState, useMemo, useEffect, useCallback, useRef } from "react";

/**
 * Custom hook for managing Products page state and logic
 * Handles pagination, search, filtering, sorting, and UI state
 */
export const useProductsState = (initialConfig = {}) => {
  // Default configuration
  const defaultConfig = {
    initialPage: 1,
    initialItemsPerPage: 20,
    initialSortBy: "name",
    initialSortOrder: "asc",
    debounceDelay: 300,
    ...initialConfig,
  };

  // Pagination and search state
  const [currentPage, setCurrentPage] = useState(defaultConfig.initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(defaultConfig.initialItemsPerPage);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState(defaultConfig.initialSortBy);
  const [sortOrder, setSortOrder] = useState(defaultConfig.initialSortOrder);

  // UI state
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Loading states
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [bulkActions, setBulkActions] = useState({
    selectedIds: [],
    isSelectAll: false,
  });

  // Refs for cleanup
  const debounceTimerRef = useRef(null);
  const isInitialMount = useRef(true);

  // Debounce search query with cleanup
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      if (!isInitialMount.current) {
        setCurrentPage(1); // Only reset page after initial mount
      }
    }, defaultConfig.debounceDelay);

    if (searchQuery) {
      console.log("Search Query:", searchQuery);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery, defaultConfig.debounceDelay]);

  // Track initial mount
  useEffect(() => {
    isInitialMount.current = false;
  }, []);

  // Build API params with memoization
  const apiParams = useMemo(() => {
    const params = {
      page: currentPage,
      page_size: itemsPerPage,
    };

    // Search
    if (debouncedSearchQuery.trim()) {
      params.search = debouncedSearchQuery.trim();
    }

    // Category filter
    if (categoryFilter !== "all") {
      params.category = categoryFilter;
    }

    // Ordering
    const orderField = sortOrder === "desc" ? `-${sortBy}` : sortBy;
    params.ordering = orderField;

    return params;
  }, [
    currentPage,
    itemsPerPage,
    debouncedSearchQuery,
    categoryFilter,
    sortBy,
    sortOrder,
  ]);

  // Pagination handlers with useCallback for performance
  const handlePageChange = useCallback((page) => {
    if (page !== currentPage) {
      setCurrentPage(page);
      // Scroll to top when page changes
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentPage]);

  const handleItemsPerPageChange = useCallback((newItemsPerPage) => {
    if (newItemsPerPage !== itemsPerPage) {
      setItemsPerPage(newItemsPerPage);
      setCurrentPage(1);
    }
  }, [itemsPerPage]);

  // Search handlers
  const handleSearchChange = useCallback((event) => {
    const value = event.target.value;
    setSearchQuery(value);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    setDebouncedSearchQuery("");
    setCurrentPage(1);
  }, []);

  // Filter handlers
  const handleCategoryChange = useCallback((event) => {
    const value = event.target.value;
    if (value !== categoryFilter) {
      setCategoryFilter(value);
      setCurrentPage(1);
    }
  }, [categoryFilter]);

  // Sort handlers
  const handleSortChange = useCallback((event) => {
    const value = event.target.value;
    if (value !== sortBy) {
      setSortBy(value);
      setCurrentPage(1);
    }
  }, [sortBy]);

  const handleSortOrderToggle = useCallback(() => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    setCurrentPage(1);
  }, []);

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    const hasChanges = 
      searchQuery !== "" || 
      debouncedSearchQuery !== "" || 
      categoryFilter !== "all" ||
      currentPage !== 1;

    if (hasChanges) {
      setSearchQuery("");
      setDebouncedSearchQuery("");
      setCategoryFilter("all");
      setCurrentPage(1);
    }
  }, [searchQuery, debouncedSearchQuery, categoryFilter, currentPage]);

  // Menu handlers
  const handleMenuOpen = useCallback((event, product) => {
    setAnchorEl(event.currentTarget);
    setSelectedProduct(product);
  }, []);

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
    setSelectedProduct(null);
  }, []);

  // Delete handlers
  const handleDeleteClick = useCallback(() => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  }, [handleMenuClose]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialogOpen(false);
    setSelectedProduct(null);
  }, []);

  // Bulk actions handlers
  const handleBulkSelect = useCallback((productId, isSelected) => {
    setBulkActions(prev => {
      const newSelectedIds = isSelected
        ? [...prev.selectedIds, productId]
        : prev.selectedIds.filter(id => id !== productId);
      
      return {
        ...prev,
        selectedIds: newSelectedIds,
        isSelectAll: false,
      };
    });
  }, []);

  const handleSelectAll = useCallback((productIds, isSelectAll) => {
    setBulkActions({
      selectedIds: isSelectAll ? [...productIds] : [],
      isSelectAll,
    });
  }, []);

  const handleClearBulkSelection = useCallback(() => {
    setBulkActions({
      selectedIds: [],
      isSelectAll: false,
    });
  }, []);

  // Snackbar handlers
  const showSnackbar = useCallback((message, severity = "success") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  }, []);

  const hideSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  // Refresh handler
  const handleRefresh = useCallback(async (refreshFn) => {
    if (typeof refreshFn === 'function' && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await refreshFn();
        showSnackbar("Products refreshed successfully");
      } catch (error) {
        showSnackbar("Failed to refresh products", "error");
      } finally {
        setIsRefreshing(false);
      }
    }
  }, [isRefreshing, showSnackbar]);

  // Reset all state
  const handleResetState = useCallback(() => {
    setCurrentPage(defaultConfig.initialPage);
    setItemsPerPage(defaultConfig.initialItemsPerPage);
    setSearchQuery("");
    setDebouncedSearchQuery("");
    setCategoryFilter("all");
    setSortBy(defaultConfig.initialSortBy);
    setSortOrder(defaultConfig.initialSortOrder);
    setAnchorEl(null);
    setSelectedProduct(null);
    setDeleteDialogOpen(false);
    setBulkActions({ selectedIds: [], isSelectAll: false });
    hideSnackbar();
  }, [defaultConfig, hideSnackbar]);

  // Computed values
  const hasActiveFilters = useMemo(() => {
    return debouncedSearchQuery.trim() !== "" || categoryFilter !== "all";
  }, [debouncedSearchQuery, categoryFilter]);

  const hasActiveSearch = useMemo(() => {
    return debouncedSearchQuery.trim() !== "";
  }, [debouncedSearchQuery]);

  const isFirstPage = currentPage === 1;
  const hasCategoryFilter = categoryFilter !== "all";
  const hasSelectedItems = bulkActions.selectedIds.length > 0;
  const isMenuOpen = Boolean(anchorEl);

  // URL state management helpers
  const getUrlParams = useCallback(() => {
    const params = new URLSearchParams();
    
    if (currentPage > 1) params.set('page', currentPage.toString());
    if (itemsPerPage !== defaultConfig.initialItemsPerPage) {
      params.set('pageSize', itemsPerPage.toString());
    }
    if (debouncedSearchQuery.trim()) params.set('search', debouncedSearchQuery.trim());
    if (categoryFilter !== "all") params.set('category', categoryFilter);
    if (sortBy !== defaultConfig.initialSortBy) params.set('sortBy', sortBy);
    if (sortOrder !== defaultConfig.initialSortOrder) params.set('sortOrder', sortOrder);
    
    return params.toString();
  }, [currentPage, itemsPerPage, debouncedSearchQuery, categoryFilter, sortBy, sortOrder, defaultConfig]);

  const setStateFromUrl = useCallback((searchParams) => {
    const page = parseInt(searchParams.get('page') || defaultConfig.initialPage.toString());
    const pageSize = parseInt(searchParams.get('pageSize') || defaultConfig.initialItemsPerPage.toString());
    const search = searchParams.get('search') || "";
    const category = searchParams.get('category') || "all";
    const sort = searchParams.get('sortBy') || defaultConfig.initialSortBy;
    const order = searchParams.get('sortOrder') || defaultConfig.initialSortOrder;

    setCurrentPage(page);
    setItemsPerPage(pageSize);
    setSearchQuery(search);
    setDebouncedSearchQuery(search);
    setCategoryFilter(category);
    setSortBy(sort);
    setSortOrder(order);
  }, [defaultConfig]);

  return {
    // State values
    currentPage,
    itemsPerPage,
    searchQuery,
    debouncedSearchQuery,
    categoryFilter,
    sortBy,
    sortOrder,
    anchorEl,
    selectedProduct,
    deleteDialogOpen,
    snackbar,
    apiParams,
    isRefreshing,
    bulkActions,

    // Computed values
    hasActiveFilters,
    hasActiveSearch,
    isFirstPage,
    hasCategoryFilter,
    hasSelectedItems,
    isMenuOpen,

    // Pagination handlers
    handlePageChange,
    handleItemsPerPageChange,

    // Search handlers
    handleSearchChange,
    handleClearSearch,

    // Filter handlers
    handleCategoryChange,
    handleClearFilters,

    // Sort handlers
    handleSortChange,
    handleSortOrderToggle,

    // Menu handlers
    handleMenuOpen,
    handleMenuClose,

    // Delete handlers
    handleDeleteClick,
    handleDeleteCancel,

    // Bulk action handlers
    handleBulkSelect,
    handleSelectAll,
    handleClearBulkSelection,

    // Snackbar handlers
    showSnackbar,
    hideSnackbar,

    // Utility handlers
    handleRefresh,
    handleResetState,

    // URL state helpers
    getUrlParams,
    setStateFromUrl,

    // Direct setters (use sparingly, prefer handlers above)
    setCurrentPage,
    setItemsPerPage,
    setSearchQuery,
    setDebouncedSearchQuery,
    setCategoryFilter,
    setSortBy,
    setSortOrder,
    setDeleteDialogOpen,
    setSelectedProduct,
    setAnchorEl,
    setIsRefreshing,
  };
};