// Sales/components/SalesFilters.js
import React from "react";
import {
  Paper,
  Stack,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Search,
  FilterList,
  GridView,
  ViewList,
} from "@mui/icons-material";

const SalesFilters = ({
  searchTerm,
  onSearchChange,
  viewMode,
  onViewModeChange,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 4,
        borderRadius: 3,
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
      >
        <TextField
          placeholder="Search by customer name or invoice number..."
          value={searchTerm}
          onChange={onSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search color="action" />
              </InputAdornment>
            ),
          }}
          sx={{
            minWidth: { xs: "100%", sm: 400 },
            "& .MuiOutlinedInput-root": {
              borderRadius: 3,
              "& fieldset": { borderColor: "rgba(0,0,0,0.1)" },
            },
          }}
        />
        <Stack direction="row" spacing={1}>
          <Tooltip title="Filter">
            <IconButton
              sx={{
                bgcolor: "rgba(0,0,0,0.04)",
                borderRadius: 2,
                "&:hover": { bgcolor: "rgba(0,0,0,0.08)" },
              }}
            >
              <FilterList />
            </IconButton>
          </Tooltip>
          <Tooltip title={viewMode === "grid" ? "List View" : "Grid View"}>
            <IconButton
              onClick={onViewModeChange}
              sx={{
                bgcolor: "rgba(0,0,0,0.04)",
                borderRadius: 2,
                "&:hover": { bgcolor: "rgba(0,0,0,0.08)" },
              }}
            >
              {viewMode === "grid" ? <ViewList /> : <GridView />}
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
    </Paper>
  );
};

export default SalesFilters;