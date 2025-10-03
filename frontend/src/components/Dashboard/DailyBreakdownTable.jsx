import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

// Daily Breakdown Table Component
const DailyBreakdownTable = ({ dailyData }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Daily Sales Breakdown
        </Typography>
        <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell align="right">Sales Count</TableCell>
                <TableCell align="right">Gross Revenue</TableCell>
                <TableCell align="right">Effective Revenue</TableCell>
                <TableCell align="right">Items Sold</TableCell>
                <TableCell align="right">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dailyData?.map((day, index) => (
                <TableRow key={index} hover>
                  <TableCell>
                    {new Date(day.day).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell align="right">{day.sales_count}</TableCell>
                  <TableCell align="right">
                    ₹{day.gross_revenue?.toLocaleString()}
                  </TableCell>
                  <TableCell align="right">
                    ₹{day.effective_revenue?.toLocaleString()}
                  </TableCell>
                  <TableCell align="right">{day.items_sold}</TableCell>
                  <TableCell align="right">
                    <Stack
                      direction="row"
                      spacing={0.5}
                      justifyContent="flex-end"
                    >
                      {day.paid_count > 0 && (
                        <Chip
                          label={`${day.paid_count}P`}
                          size="small"
                          color="success"
                        />
                      )}
                      {day.cancelled_count > 0 && (
                        <Chip
                          label={`${day.cancelled_count}C`}
                          size="small"
                          color="error"
                        />
                      )}
                      {day.pending_count > 0 && (
                        <Chip
                          label={`${day.pending_count}Pe`}
                          size="small"
                          color="warning"
                        />
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default DailyBreakdownTable;
