import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download } from '@mui/icons-material';

const Reports = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [reportType, setReportType] = useState('sales');

  const generateReport = async () => {
    try {
      const response = await fetch('/api/reports/generate/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report_type: reportType,
          start_date: startDate?.toISOString(),
          end_date: endDate?.toISOString(),
        }),
      });
      
      if (response.ok) {
        // Handle report generation success
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportType}-report.xlsx`;
        a.click();
      }
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Reports & Analytics
      </Typography>

      <Grid container spacing={3}>
        {/* Report Filters */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" gap={2} alignItems="center">
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={setStartDate}
                  renderInput={(params) => <TextField {...params} />}
                />
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={setEndDate}
                  renderInput={(params) => <TextField {...params} />}
                />
                <TextField
                  select
                  label="Report Type"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  SelectProps={{ native: true }}
                >
                  <option value="sales">Sales Report</option>
                  <option value="inventory">Inventory Report</option>
                  <option value="customers">Customer Report</option>
                </TextField>
                <Button
                  variant="contained"
                  startIcon={<Download />}
                  onClick={generateReport}
                >
                  Generate Report
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Sales Trend Chart */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Sales Trend
              </Typography>
              <Box height={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[
                      { date: '2023-01', sales: 4000 },
                      { date: '2023-02', sales: 3000 },
                      { date: '2023-03', sales: 5000 },
                      { date: '2023-04', sales: 2780 },
                      { date: '2023-05', sales: 1890 },
                      { date: '2023-06', sales: 2390 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="sales" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Summary Stats */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Summary Statistics
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>Total Sales</TableCell>
                      <TableCell align="right">₹50,000</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Average Order Value</TableCell>
                      <TableCell align="right">₹1,200</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Total Orders</TableCell>
                      <TableCell align="right">42</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Products Sold</TableCell>
                      <TableCell align="right">156</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Reports;