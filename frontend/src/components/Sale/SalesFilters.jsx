// Sales/components/SalesFilters.js
import React from "react";
import {
  Paper,
  Stack,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import { Search, FilterList, GridView, ViewList } from "@mui/icons-material";

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
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, newView) => {
              if (newView !== null) {
                onViewModeChange(newView);
              }
            }}
            size="small"
            sx={{
              height: 40,
              "& .MuiToggleButton-root": {
                borderRadius: 2,
                border: "1px solid rgba(0,0,0,0.12)",
                "&.Mui-selected": {
                  bgcolor: "primary.main",
                  color: "white",
                  "&:hover": {
                    bgcolor: "primary.dark",
                  },
                },
              },
            }}
          >
            <ToggleButton sx={{width: 50}} value="grid" aria-label="Grid View">
              <GridView fontSize="small" />
            </ToggleButton>
            <ToggleButton sx={{width: 50}} value="table" aria-label="List View">
              <ViewList fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Stack>
    </Paper>
  );
};

export default SalesFilters;
