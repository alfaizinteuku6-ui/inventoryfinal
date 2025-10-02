import { useState, useMemo } from "react";
import { useCustomers } from "./useSWR";
import { customers } from "../services/api";

const useCustomersState = () => {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  // Dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Build search params
  const searchParams = useMemo(
    () => ({
      page: currentPage,
      page_size: itemsPerPage,
      ...(searchTerm && { search: searchTerm }),
      ...(filterType !== "all" && { customer_type: filterType }),
    }),
    [currentPage, itemsPerPage, searchTerm, filterType]
  );

  // Fetch customers with search params
  const { data: customersData, mutate, error, isLoading } = useCustomers(searchParams);

  // Calculate pagination values
  const totalCount = customersData?.count || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const customersList = customersData?.results || [];

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Filter handlers
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (value) => {
    setFilterType(value);
    setCurrentPage(1);
  };

  // Customer action handlers
  const handleAddCustomer = () => {
    setEditingCustomer(null);
    setDialogOpen(true);
  };

  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCustomer(null);
  };

  // Delete handlers
  const handleDeleteClick = (id) => {
    setCustomerToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setCustomerToDelete(null);
  };

  const handleConfirmDelete = async () => {
    try {
      await customers.delete(customerToDelete);
      mutate();
      handleCloseDeleteDialog();
    } catch (error) {
      console.error("Error deleting customer:", error);
      // You could add error toast notification here
    }
  };

  return {
    // Data
    customersList,
    isLoading,
    error,
    
    // Pagination
    currentPage,
    totalPages,
    totalCount,
    itemsPerPage,
    handlePageChange,
    handleItemsPerPageChange,

    // Filters
    searchTerm,
    filterType,
    handleSearchChange,
    handleFilterChange,

    // Customer actions
    handleAddCustomer,
    handleEditCustomer,
    
    // Dialog state
    dialogOpen,
    editingCustomer,
    handleCloseDialog,
    
    // Delete dialog
    deleteDialogOpen,
    handleDeleteClick,
    handleCloseDeleteDialog,
    handleConfirmDelete,
    
    // Mutate function for refresh
    mutate,
  };
};

export default useCustomersState;