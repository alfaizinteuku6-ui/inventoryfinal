import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Paper,
  Grid,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
} from "@mui/material";
import {
  CloudUpload as UploadIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import * as XLSX from "xlsx";
import { products } from "../services/api";

const BulkImportProducts = () => {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError(null);
    setSuccess(false);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      if (jsonData.length === 0) {
        setError("Excel sheet is empty");
        return;
      }

      setRows(jsonData);
    } catch (err) {
      console.error(err);
      setError("Error parsing Excel file");
    }
  };

  const handleSave = async () => {
    if (rows.length === 0) {
      setError("No data to import");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // backend should support bulk API or loop individually
      await Promise.all(
        rows.map((row) => {
          const formData = new FormData();

          // expected columns in excel: name, sku, description, stock_quantity, selling_price, cost_price, weight, category
          formData.append("name", row.name || "");
          formData.append("sku", row.sku || "");
          formData.append("description", row.description || "");
          formData.append("stock_quantity", parseInt(row.stock_quantity) || 0);
          formData.append("selling_price", parseFloat(row.selling_price) || 0);
          formData.append("cost_price", parseFloat(row.cost_price) || 0);
          formData.append("weight", parseFloat(row.weight) || 0);
          formData.append("category", row.category || "");

          return products.create(formData);
        })
      );

      setSuccess(true);
      setRows([]);
    } catch (err) {
      console.error(err);
      setError("Error saving products");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 3, backgroundColor: "#f8fafc" }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          borderRadius: 2,
        }}
      >
        <Typography variant="h4" fontWeight="bold">
          Bulk Import Products
        </Typography>
        <Typography variant="subtitle1">
          Upload Excel sheet to add multiple products at once
        </Typography>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
          Products imported successfully!
        </Alert>
      )}

      <Card sx={{ borderRadius: 2, mb: 3 }}>
        <CardContent>
          <Button
            variant="contained"
            component="label"
            startIcon={<UploadIcon />}
            sx={{
              borderRadius: 2,
              background:
                "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          >
            Upload Excel File
            <input
              type="file"
              hidden
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
            />
          </Button>
        </CardContent>
      </Card>

      {/* Preview Table */}
      {rows.length > 0 && (
        <>
          <TableContainer component={Paper} sx={{ borderRadius: 2, mb: 3 }}>
            <Table>
              <TableHead sx={{ backgroundColor: "#f1f5f9" }}>
                <TableRow>
                  {Object.keys(rows[0]).map((col, index) => (
                    <TableCell key={index} sx={{ fontWeight: "bold" }}>
                      {col}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, i) => (
                  <TableRow key={i}>
                    {Object.values(row).map((val, j) => (
                      <TableCell key={j}>{val}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={() => setRows([])}
              sx={{ borderRadius: 2 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
              onClick={handleSave}
              disabled={loading}
              sx={{
                borderRadius: 2,
                background:
                  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              }}
            >
              {loading ? "Saving..." : "Save All"}
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default BulkImportProducts;
