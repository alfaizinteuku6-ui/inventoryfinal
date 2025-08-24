import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Grid,
  Chip,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { useVendors } from '../hooks/useSWR';
import { vendors } from '../services/api';

const Vendors = () => {
    const { data, mutate } = useVendors();
    const [open, setOpen] = useState(false);
    const [editingVendor, setEditingVendor] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        contact_person: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'India',
        tax_number: '',
        payment_terms: 'Net 30',
        credit_limit: '0.00'
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingVendor) {
                await vendors.update(editingVendor.id, formData);
            } else {
                await vendors.create(formData);
            }
            setOpen(false);
            setFormData({
                name: '',
                contact_person: '',
                email: '',
                phone: '',
                address: '',
                tax_number: '',
                payment_terms: 'Net 30'
            });
            mutate();
        } catch (error) {
            console.error('Error saving vendor:', error);
        }
    };

    const handleEdit = (vendor) => {
        setEditingVendor(vendor);
        setFormData({
            name: vendor.name,
            contact_person: vendor.contact_person,
            email: vendor.email,
            phone: vendor.phone,
            address: vendor.address || '',
            city: vendor.city || '',
            state: vendor.state || '',
            postal_code: vendor.postal_code || '',
            country: vendor.country || 'India',
            tax_number: vendor.tax_number || '',
            payment_terms: vendor.payment_terms || 'Net 30',
            credit_limit: vendor.credit_limit || '0.00'
        });
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditingVendor(null);
        setFormData({
            name: '',
            contact_person: '',
            email: '',
            phone: '',
            address: '',
            tax_number: '',
            payment_terms: 'Net 30'
        });
    };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Vendors
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setEditingVendor(null);
            setOpen(true);
          }}
        >
          Add Vendor
        </Button>
      </Box>

      <Card>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Contact Person</TableCell>
                                <TableCell>Contact Info</TableCell>
                                <TableCell>Location</TableCell>
                                <TableCell>Business Details</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data?.results?.map((vendor) => (
                                <TableRow key={vendor.id}>
                                    <TableCell>{vendor.name}</TableCell>
                                    <TableCell>{vendor.contact_person}</TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{vendor.email}</Typography>
                                        <Typography variant="body2">{vendor.phone}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{vendor.address}</Typography>
                                        <Typography variant="body2">
                                            {[vendor.city, vendor.state, vendor.postal_code]
                                                .filter(Boolean)
                                                .join(', ')}
                                        </Typography>
                                        <Typography variant="body2">{vendor.country}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Box display="flex" flexDirection="column" gap={1}>
                                            <Chip 
                                                label={`GST: ${vendor.tax_number}`} 
                                                size="small" 
                                                variant="outlined"
                                            />
                                            <Chip 
                                                label={`Terms: ${vendor.payment_terms}`} 
                                                size="small" 
                                                variant="outlined"
                                            />
                                            <Chip 
                                                label={`Credit: ₹${vendor.credit_limit}`} 
                                                size="small" 
                                                variant="outlined"
                                            />
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <IconButton size="small" onClick={() => handleEdit(vendor)}>
                                            <Edit />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => handleDelete(vendor.id)}
                                        >
                                            <Delete />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>

            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle>
                    {editingVendor ? 'Edit Vendor' : 'New Vendor'}
                </DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                            <TextField
                label="Name"
                fullWidth
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <TextField
                label="Contact Person"
                fullWidth
                value={formData.contact_person}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
              />
              <TextField
                label="Email"
                type="email"
                fullWidth
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <TextField
                label="Phone"
                fullWidth
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
              <TextField
                label="Address"
                fullWidth
                multiline
                rows={3}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
              <TextField
                label="Tax Number"
                fullWidth
                value={formData.tax_number}
                onChange={(e) => setFormData({ ...formData, tax_number: e.target.value })}
              />
              <TextField
                label="Payment Terms"
                fullWidth
                value={formData.payment_terms}
                onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
              />
                            </Grid>
                            {/* Add remaining form fields following the same pattern */}
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button type="submit" variant="contained">
                            Save
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
  );
};

export default Vendors;