import { useState } from "react";
import { useSales, useVendors } from "./useSWR";
import { sales as SalesApi } from "../services/api";

export const useSalesState = () => {
  // Local UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedSale, setSelectedSale] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentOption, setPaymentOption] = useState("full");
  const [customAmount, setCustomAmount] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    severity: "success",
    message: "",
  });

  // API hooks
  const {
    data: sales,
    isLoading: loading,
    mutate,
  } = useSales({
    include_cancelled: true,
    page: currentPage,
    page_size: itemsPerPage,
    search: searchTerm,
  });
  const { data: companyInfo } = useVendors();

  // Derived values
  const totalCount = sales?.count || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const salesResults = sales?.results || [];
  const salesSummary = sales?.summary || {};

  // Utility
  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  // Handlers
  const handlePageChange = (page) => setCurrentPage(page);

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleViewModeChange = () =>
    setViewMode(viewMode === "grid" ? "list" : "grid");

  const handleChoice = (choice) => {
    handleCancelSale(selectedSale.id, choice);
    setCancelOpen(false);
  };

  const handleCancelSale = async (id, choice) => {
    try {
      let query = "";
      if (choice === "refund") query = "?refund=true";
      else if (choice === "credit") query = "?credit=true";
      await SalesApi.cancelSale(id, query);
      showSnackbar("Sale canceled successfully!");
      mutate();
      setSelectedSale(null);
    } catch (error) {
      showSnackbar(
        error.response?.data?.error || "Failed to cancel sale",
        "error"
      );
    }
  };

  const handleDeleteSale = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this sale? This action cannot be undone."
      )
    ) {
      try {
        await SalesApi.delete(id);
        mutate();
        showSnackbar("Sale deleted successfully!");
      } catch (error) {
        alert(error.response?.data?.error || "Failed to delete sale", "error");
      }
    }
  };

  const handleAddPayment = (sale) => {
    setPaymentOption("full");
    setCustomAmount("");
    setPaymentModalOpen(true);
    setSelectedSale(sale);
  };

  const handlePaymentSubmit = async () => {
    let amount;
    if (paymentOption === "full") {
      amount = selectedSale.balance_due;
    } else {
      amount = parseFloat(customAmount);
      if (!amount || amount <= 0) {
        showSnackbar("Please enter a valid payment amount");
        return;
      }
      if (amount > selectedSale.balance_due) {
        showSnackbar("Payment amount cannot exceed the balance due", "error");
        return;
      }
    }

    try {
      await SalesApi.addPayment(selectedSale.id, { amount });
      showSnackbar("Payment recorded successfully!");
      mutate();
      setPaymentModalOpen(false);
      setSelectedSale(null);
    } catch (error) {
      showSnackbar(
        error.response?.data?.error || "Failed to add payment",
        "error"
      );
    }
  };

  const handleClosePaymentModal = () => {
    setPaymentModalOpen(false);
    setSelectedSale(null);
    setPaymentOption("full");
    setCustomAmount("");
  };

  return {
    // state
    searchTerm,
    viewMode,
    selectedSale,
    paymentModalOpen,
    paymentOption,
    customAmount,
    currentPage,
    itemsPerPage,
    cancelOpen,
    snackbar,
    salesResults,
    salesSummary,
    loading,
    totalCount,
    totalPages,
    companyInfo,

    // setters
    setCancelOpen,
    setSelectedSale,
    setPaymentOption,
    setCustomAmount,
    setSnackbar,

    // handlers
    handlePageChange,
    handleItemsPerPageChange,
    handleSearchChange,
    handleViewModeChange,
    handleChoice,
    handleCancelSale,
    handleDeleteSale,
    handleAddPayment,
    handlePaymentSubmit,
    handleClosePaymentModal,
  };
};
