import React, { useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider,
  Card,
  CardContent,
  Avatar,
  IconButton
} from '@mui/material';
import {
  Download as DownloadIcon,
  Receipt as ReceiptIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Payment as PaymentIcon,
  Inventory as InventoryIcon
} from '@mui/icons-material';

const HtmlInvoice = () => {
  const invoiceRef = useRef();
  
  // Sample data - replace with your dynamic data
  const invoiceData = {
    "id": "8b388fa8-1f05-46a5-9a65-fa35cded65be",
    "sale_number": "SL202508220005",
    "customer_details": {
      "id": "5d469230-e76d-4ba5-aebc-fac2397aa0dd",
      "name": "Puneeth",
      "customer_type": "individual",
      "email": "puneethreddy951@gmail.com",
      "phone": "09535688928",
      "address": "Bangalore\nKumbalagodu\nKarnataka",
      "city": "",
      "state": "",
      "postal_code": "",
      "tax_number": "",
      "credit_limit": "0.00",
      "created_at": "2025-08-22T11:53:28.013911Z",
      "updated_at": "2025-08-22T11:53:28.014182Z"
    },
    "sale_date": "2025-08-22T15:57:03.973590Z",
    "due_date": null,
    "items": [
      {
        "id": "3d8bc019-fbf3-4802-8bf6-17c686f0190b",
        "product": "32cda881-f79c-4ddb-92b1-1a8350c918ea",
        "product_name": "Test Product",
        "product_sku": "SKU-001",
        "quantity": 1,
        "unit_price": "80.00",
        "discount_percent": "0.00",
        "tax_rate": "0.00",
        "line_total": "80.00"
      }
    ],
    "subtotal": "80.00",
    "tax_amount": "0.00",
    "discount_amount": "0.00",
    "total_amount": "80.00",
    "paid_amount": "0.00",
    "balance_due": "80.00",
    "payment_status": "pending",
    "payment_method": "cash",
    "notes": "Test Sale - Thank you for your business!",
    "salesperson": 1,
    "salesperson_name": "Puneeth Reddy",
    "created_at": "2025-08-22T15:57:03.961516Z",
    "updated_at": "2025-08-22T15:57:04.058926Z"
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'overdue': return 'error';
      default: return 'default';
    }
  };

  const handleDownloadPDF = async () => {
    try {
      // Import jsPDF and html2canvas dynamically
      const jsPDF = (await import('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js')).jsPDF;
      const html2canvas = (await import('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js')).default;
      
      const element = invoiceRef.current;
      
      // Create canvas from the invoice element
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Download the PDF
      pdf.save(`Invoice_${invoiceData.sale_number}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Fallback to print
      window.print();
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5', p: 2 }}>
      {/* Action Bar */}
      <Box sx={{ maxWidth: '1200px', mx: 'auto', mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="bold" color="primary">
          Invoice Preview
        </Typography>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleDownloadPDF}
          size="large"
          sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
        >
          Download PDF
        </Button>
      </Box>

      {/* Invoice Container */}
      <Paper
        ref={invoiceRef}
        elevation={3}
        sx={{ 
          maxWidth: '1200px', 
          mx: 'auto',
          backgroundColor: 'white',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <Box sx={{ 
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          color: 'white',
          p: 4
        }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2, width: 56, height: 56 }}>
                  <ReceiptIcon sx={{ fontSize: 32 }} />
                </Avatar>
                <Box>
                  <Typography variant="h3" fontWeight="bold">
                    INVOICE
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    Your Company Name
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Professional Services & Solutions
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                #{invoiceData.sale_number}
              </Typography>
              <Chip 
                label={invoiceData.payment_status.toUpperCase()}
                color={getStatusColor(invoiceData.payment_status)}
                variant="filled"
                sx={{ color: 'white', fontWeight: 'bold' }}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Company & Customer Info */}
        <Box sx={{ p: 4 }}>
          <Grid container spacing={4}>
            {/* From */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="overline" color="textSecondary" fontWeight="bold">
                    FROM
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" sx={{ mt: 1, mb: 2 }}>
                    Your Company Name
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                    <LocationIcon sx={{ mr: 1, mt: 0.5, color: 'text.secondary', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        123 Business Street<br />
                        Business District, City 560001<br />
                        Karnataka, India
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <EmailIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary">
                      contact@yourcompany.com
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PhoneIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary">
                      +91 12345 67890
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* To */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="overline" color="textSecondary" fontWeight="bold">
                    BILL TO
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 2 }}>
                    <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="h6" fontWeight="bold">
                      {invoiceData.customer_details.name}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                    <LocationIcon sx={{ mr: 1, mt: 0.5, color: 'text.secondary', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {invoiceData.customer_details.address.split('\n').map((line, index) => (
                          <span key={index}>{line}<br /></span>
                        ))}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <EmailIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary">
                      {invoiceData.customer_details.email}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PhoneIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary">
                      {invoiceData.customer_details.phone}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Invoice Details */}
        <Box sx={{ bgcolor: '#f8f9fa', p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Box>
                  <Typography variant="overline" color="textSecondary">
                    Invoice Date
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {formatDate(invoiceData.sale_date)}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PaymentIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Box>
                  <Typography variant="overline" color="textSecondary">
                    Payment Method
                  </Typography>
                  <Typography variant="body1" fontWeight="bold" sx={{ textTransform: 'capitalize' }}>
                    {invoiceData.payment_method}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Box>
                  <Typography variant="overline" color="textSecondary">
                    Salesperson
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {invoiceData.salesperson_name}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Items Table */}
        <Box sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <InventoryIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" fontWeight="bold">
              Items
            </Typography>
          </Box>
          
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>SKU</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Qty</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Unit Price</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoiceData.items.map((item, index) => (
                  <TableRow key={item.id} sx={{ '&:nth-of-type(even)': { bgcolor: '#fafafa' } }}>
                    <TableCell>
                      <Typography variant="body1" fontWeight="medium">
                        {item.product_name}
                      </Typography>
                      {parseFloat(item.discount_percent) > 0 && (
                        <Typography variant="caption" color="success.main">
                          Discount: {item.discount_percent}%
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">{item.product_sku}</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'medium' }}>
                      {item.quantity}
                    </TableCell>
                    <TableCell align="right">{formatCurrency(item.unit_price)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(item.line_total)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Summary */}
        <Box sx={{ bgcolor: '#f8f9fa', p: 4 }}>
          <Grid container justifyContent="flex-end">
            <Grid item xs={12} sm={6} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1">Subtotal</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {formatCurrency(invoiceData.subtotal)}
                    </Typography>
                  </Box>
                  
                  {parseFloat(invoiceData.discount_amount) > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, color: 'success.main' }}>
                      <Typography variant="body1">Discount</Typography>
                      <Typography variant="body1" fontWeight="bold">
                        -{formatCurrency(invoiceData.discount_amount)}
                      </Typography>
                    </Box>
                  )}
                  
                  {parseFloat(invoiceData.tax_amount) > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1">Tax</Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {formatCurrency(invoiceData.tax_amount)}
                      </Typography>
                    </Box>
                  )}
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold">Total</Typography>
                    <Typography variant="h6" fontWeight="bold" color="primary.main">
                      {formatCurrency(invoiceData.total_amount)}
                    </Typography>
                  </Box>
                  
                  {parseFloat(invoiceData.balance_due) > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'error.main' }}>
                      <Typography variant="body1" fontWeight="bold">Balance Due</Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {formatCurrency(invoiceData.balance_due)}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Notes */}
        {invoiceData.notes && (
          <Box sx={{ p: 4, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="overline" color="textSecondary" fontWeight="bold">
              Notes
            </Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>
              {invoiceData.notes}
            </Typography>
          </Box>
        )}

        {/* Footer */}
        <Box sx={{ 
          bgcolor: '#1a1a1a', 
          color: 'white', 
          p: 4 
        }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Payment Information
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Please make payment within 30 days of invoice date.
                Late payments may incur additional charges.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Thank You!
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                For any questions, contact us at<br />
                support@yourcompany.com
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default HtmlInvoice;