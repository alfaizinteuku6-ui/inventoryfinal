import React from 'react';
import {
  Box,
  Pagination,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  useTheme,
  useMediaQuery,
} from '@mui/material';

const PaginationComponent = ({
  currentPage = 1,
  totalPages = 1,
  totalCount = 0,
  itemsPerPage = 20,
  onPageChange,
  onItemsPerPageChange,
  showItemsPerPage = true,
  showInfo = true,
  itemsPerPageOptions = [10, 20, 50, 100],
  size = 'medium',
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalCount);

  const handlePageChange = (event, page) => {
    if (onPageChange) {
      onPageChange(page);
    }
  };

  const handleItemsPerPageChange = (event) => {
    if (onItemsPerPageChange) {
      onItemsPerPageChange(event.target.value);
    }
  };

  if (totalCount === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        py: 2,
        px: 1,
      }}
    >
      {/* Items info and per page selector */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        alignItems="center"
        sx={{ order: { xs: 2, sm: 1 } }}
      >
        {showInfo && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              whiteSpace: 'nowrap',
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
            }}
          >
            Showing {startItem}-{endItem} of {totalCount.toLocaleString()} results
          </Typography>
        )}

        {showItemsPerPage && (
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="items-per-page-label">Per page</InputLabel>
            <Select
              labelId="items-per-page-label"
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              label="Per page"
              sx={{
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(0,0,0,0.12)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(0,0,0,0.23)',
                },
              }}
            >
              {itemsPerPageOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Stack>

      {/* Pagination */}
      <Box sx={{ order: { xs: 1, sm: 2 } }}>
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
          size={isMobile ? 'small' : size}
          showFirstButton
          showLastButton
          sx={{
            '& .MuiPaginationItem-root': {
              borderRadius: 2,
              fontWeight: 500,
              '&.Mui-selected': {
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                },
              },
              '&:hover': {
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
              },
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default PaginationComponent;