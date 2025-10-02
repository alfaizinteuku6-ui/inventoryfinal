import React, { useState } from "react";
import {
  Menu,
  Box,
  Typography,
  MenuItem,
  IconButton,
  Divider,
  Chip,
  CircularProgress,
  Button,
  alpha,
  useTheme,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Error as ErrorIcon,
  Inventory as InventoryIcon,
  Receipt as ReceiptIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { useNotifications } from "../../hooks/useSWR";
import { notifications as notificationsApi } from "../../services/api";
import { mutate } from "swr";

const NotificationMenu = ({ anchorEl, onClose }) => {
  const theme = useTheme();
  const [filter, setFilter] = useState("all");
  const { data: notificationsData, error, isLoading } = useNotifications({
    is_read: filter === "unread" ? false : undefined,
  });

  const handleMarkAsRead = async (id) => {
    try {
      await notificationsApi.markAsRead(id);
      mutate(["notifications", { is_read: filter === "unread" ? false : undefined }]);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      mutate(["notifications", { is_read: filter === "unread" ? false : undefined }]);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const handleDismiss = async (id) => {
    try {
      await notificationsApi.dismiss(id);
      mutate(["notifications", { is_read: filter === "unread" ? false : undefined }]);
    } catch (error) {
      console.error("Error dismissing notification:", error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "error";
      case "medium":
        return "warning";
      case "low":
        return "info";
      default:
        return "default";
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "high":
        return <ErrorIcon fontSize="small" />;
      case "medium":
        return <WarningIcon fontSize="small" />;
      case "low":
        return <InfoIcon fontSize="small" />;
      default:
        return <InfoIcon fontSize="small" />;
    }
  };

  const getAlertTypeIcon = (alertType) => {
    switch (alertType) {
      case "low_stock":
        return <InventoryIcon fontSize="small" />;
      case "sale":
        return <ReceiptIcon fontSize="small" />;
      case "customer":
        return <PersonIcon fontSize="small" />;
      default:
        return <InfoIcon fontSize="small" />;
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const notifications = notificationsData?.results || [];
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 420,
          maxHeight: 600,
          mt: 1,
        },
      }}
      transformOrigin={{ horizontal: "right", vertical: "top" }}
      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          position: "sticky",
          top: 0,
          backgroundColor: theme.palette.background.paper,
          zIndex: 1,
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
          <Typography variant="h6" fontWeight="600">
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Chip
              label={`${unreadCount} new`}
              size="small"
              color="primary"
              sx={{ fontSize: "0.75rem", height: 24 }}
            />
          )}
        </Box>

        {/* Filter Chips */}
        <Box sx={{ display: "flex", gap: 1 }}>
          <Chip
            label="All"
            size="small"
            onClick={() => setFilter("all")}
            color={filter === "all" ? "primary" : "default"}
            variant={filter === "all" ? "filled" : "outlined"}
          />
          <Chip
            label="Unread"
            size="small"
            onClick={() => setFilter("unread")}
            color={filter === "unread" ? "primary" : "default"}
            variant={filter === "unread" ? "filled" : "outlined"}
          />
        </Box>

        {unreadCount > 0 && (
          <Button
            size="small"
            onClick={handleMarkAllRead}
            sx={{ mt: 1, fontSize: "0.75rem" }}
          >
            Mark all as read
          </Button>
        )}
      </Box>

      {/* Notifications List */}
      <Box sx={{ maxHeight: 400, overflow: "auto" }}>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress size={30} />
          </Box>
        ) : error ? (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography color="error">Failed to load notifications</Typography>
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography color="text.secondary">No notifications</Typography>
          </Box>
        ) : (
          notifications.map((notification, index) => (
            <Box key={notification.id || index}>
              <MenuItem
                sx={{
                  py: 1.5,
                  px: 2,
                  backgroundColor: !notification.is_read
                    ? alpha(theme.palette.primary.main, 0.05)
                    : "transparent",
                  borderLeft: !notification.is_read
                    ? `3px solid ${theme.palette.primary.main}`
                    : "3px solid transparent",
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  },
                  display: "block",
                }}
                onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        color: theme.palette[getPriorityColor(notification.priority)]?.main,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {getPriorityIcon(notification.priority)}
                    </Box>
                    <Box sx={{ color: theme.palette.action.active }}>
                      {getAlertTypeIcon(notification.alert_type)}
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      {formatTimeAgo(notification.created_at)}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDismiss(notification.id);
                      }}
                      sx={{ ml: 1 }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                <Typography
                  variant="body2"
                  fontWeight={!notification.is_read ? 600 : 500}
                  sx={{ mb: 0.5 }}
                >
                  {notification.title}
                </Typography>

                <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                  {notification.message}
                </Typography>

                {/* Additional Info */}
                {notification.product && (
                  <Box
                    sx={{
                      mt: 1,
                      p: 1,
                      backgroundColor: alpha(theme.palette.warning.main, 0.1),
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="caption" fontWeight="600">
                      {notification.product.name}
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary">
                      Stock: {notification.product.stock_quantity} / Min: {notification.product.min_stock_level}
                    </Typography>
                  </Box>
                )}

                {notification.sale && (
                  <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
                    <Chip
                      label={`₹${notification.sale.total_amount}`}
                      size="small"
                      sx={{ fontSize: "0.7rem", height: 20 }}
                    />
                    <Chip
                      label={notification.sale.payment_status}
                      size="small"
                      color={notification.sale.payment_status === "paid" ? "success" : "warning"}
                      sx={{ fontSize: "0.7rem", height: 20 }}
                    />
                  </Box>
                )}

                {notification.customer && (
                  <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                    Customer: {notification.customer.name}
                  </Typography>
                )}
              </MenuItem>
              {index < notifications.length - 1 && <Divider />}
            </Box>
          ))
        )}
      </Box>

      {/* Footer */}
      {notifications.length > 0 && (
        <Box
          sx={{
            p: 1.5,
            borderTop: `1px solid ${theme.palette.divider}`,
            textAlign: "center",
          }}
        >
          <Button size="small" fullWidth onClick={onClose}>
            View All Notifications
          </Button>
        </Box>
      )}
    </Menu>
  );
};

export default NotificationMenu;