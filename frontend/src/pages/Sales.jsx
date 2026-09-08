import React from "react";
import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import CustomSnackbar from "../components/CustomSnackbar";
import CancelSaleModal from "../components/Sale/CancelSaleModal";
import PaginationComponent from "../components/Pagination";
import SalesHeader from "../components/Sale/SalesHeader";
import SalesFilters from "../components/Sale/SalesFilters";
import SalesGrid from "../components/Sale/SalesGrid";
import SalesTable from "../components/Sale/SalesTable";
import PaymentModal from "../components/Sale/PaymentModal";
import EmptyState from "../components/EmptyState";

import { useSalesState } from "../hooks/useSalesState";
import { ReceiptLong } from "@mui/icons-material";

const Sales = () => {
  const navigate = useNavigate();
  const salesState = useSalesState();

  React.useEffect(() => {
    const savedViewMode = localStorage.getItem("salesViewMode");
    console.log("Saved View Mode:", savedViewMode);
    
    if (
      savedViewMode &&
      (savedViewMode === "grid" || savedViewMode === "table")
    ) {
      salesState.setViewMode(savedViewMode);
    }
  }, []);

  return (
    <Box sx={{ width: "100%", minHeight: "100vh", p: { xs: 2, sm: 3 } }}>
      <CustomSnackbar
        open={salesState.snackbar.open}
        severity={salesState.snackbar.severity}
        message={salesState.snackbar.message}
        onClose={() =>
          salesState.setSnackbar({ ...salesState.snackbar, open: false })
        }
      />

      <CancelSaleModal
        open={salesState.cancelOpen}
        onClose={() => salesState.setCancelOpen(false)}
        onChoose={salesState.handleChoice}
        sale={salesState.selectedSale}
      />

      <SalesHeader navigate={navigate} />

      <SalesFilters
        searchTerm={salesState.searchTerm}
        onSearchChange={salesState.handleSearchChange}
        viewMode={salesState.viewMode}
        onViewModeChange={salesState.handleViewModeChange}
      />

      {salesState.salesResults.length ? (
        <>
          {salesState.viewMode === "grid" ? (
            <SalesGrid
              sales={salesState.salesResults}
              loading={salesState.loading}
              itemsPerPage={salesState.itemsPerPage}
              companyInfo={salesState.companyInfo}
              navigate={navigate}
              onAddPayment={salesState.handleAddPayment}
              onCancelSale={(sale) => {
                salesState.setSelectedSale(sale);
                salesState.setCancelOpen(true);
              }}
              onDeleteSale={salesState.handleDeleteSale}
            />
          ) : (
            <SalesTable
              sales={salesState.salesResults}
              loading={salesState.loading}
              itemsPerPage={salesState.itemsPerPage}
              companyInfo={salesState.companyInfo}
              navigate={navigate}
              onAddPayment={salesState.handleAddPayment}
              onCancelSale={(sale) => {
                salesState.setSelectedSale(sale);
                salesState.setCancelOpen(true);
              }}
              onDeleteSale={salesState.handleDeleteSale}
            />
          )}

          <PaginationComponent
            currentPage={salesState.currentPage}
            totalPages={salesState.totalPages}
            totalCount={salesState.totalCount}
            itemsPerPage={salesState.itemsPerPage}
            onPageChange={salesState.handlePageChange}
            onItemsPerPageChange={salesState.handleItemsPerPageChange}
            itemsPerPageOptions={[9, 18, 27, 50]}
            size="medium"
            showItemsPerPage={true}
            showInfo={true}
          />
        </>
      ) : (
        <EmptyState
          icon={<ReceiptLong sx={{ fontSize: 40 }} />}
          title="No Sales Found"
          description={
            salesState.searchTerm
              ? "Try adjusting your search terms"
              : "Start by creating your first sale"
          }
          primaryAction={() => navigate("/sales/new")}
          primaryLabel="Create First Sale"
        />
      )}

      <PaymentModal
        open={salesState.paymentModalOpen}
        selectedSale={salesState.selectedSale}
        paymentOption={salesState.paymentOption}
        customAmount={salesState.customAmount}
        onClose={salesState.handleClosePaymentModal}
        onPaymentOptionChange={salesState.setPaymentOption}
        onCustomAmountChange={salesState.setCustomAmount}
        onSubmit={salesState.handlePaymentSubmit}
      />
    </Box>
  );
};

export default Sales;
