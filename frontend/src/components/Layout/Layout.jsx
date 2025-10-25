import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Chip,
  useTheme,
  alpha,
  Tooltip,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  AccountCircle,
  Logout,
  Notifications as NotificationsIcon,
  Store as StoreIcon,
  Receipt as ReceiptIcon,
} from "@mui/icons-material";
import { useAuth } from "../../hooks/useAuth";
import { ThemeToggleButton } from "../ThemeToggleButton";
import { useVendors, useNotificationStats } from "../../hooks/useSWR";
import NotificationMenu from "./NotificationMenu";
import CustomSnackbar from "../CustomSnackbar";
import VendorCreateDialog from "../VendorCreateDialog";

const drawerWidth = 280;

const menuItems = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/", color: "#1976d2" },
  {
    text: "Products",
    icon: <InventoryIcon />,
    path: "/products",
    color: "#ed6c02",
  },
  {
    text: "Sales",
    icon: <ReceiptIcon />,
    path: "/sales",
    color: "#5e35b1",
  },
  {
    text: "Customers",
    icon: <PeopleIcon />,
    path: "/customers",
    color: "#5e35b1",
  },
];

const Layout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [vendorDialogOpen, setVendorDialogOpen] = useState(false);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const {
    data: vendorData,
    isLoading,
    error: vendorError,
    mutate: vendorRefresh,
  } = useVendors();
  const {
    data: notificationStats,
    mutate: statsMutate,
    error: notificationError,
  } = useNotificationStats();
  const { user, logout } = useAuth();

  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const canManageVendor = user?.role === "owner" || user?.role === "admin";

  useEffect(() => {
    const errors = [];
    if (vendorError?.response?.data?.error)
      errors.push(vendorError?.response?.data?.error);
    if (
      vendorError?.response?.data?.error ===
      "No vendor associated with this user"
    ) {
      setVendorDialogOpen(true);
    }
    if (notificationError?.response?.data?.error)
      errors.push(notificationError?.response?.data?.error);

    if (errors.length > 0) {
      setError(errors.join("\n"));
    } else {
      setError(null);
    }
  }, [vendorError, notificationError]);

  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationOpen = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
    handleMenuClose();
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const unreadCount = notificationStats?.unread || 0;

  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CustomSnackbar
        open={Boolean(error)}
        severity="error"
        message={error}
        onClose={() => setError(null)}
      />
      <VendorCreateDialog
        open={vendorDialogOpen}
        onClose={() => setVendorDialogOpen(false)}
        canManageVendor={canManageVendor}
        vendorDetails={vendorData}
        mutate={vendorRefresh}
        setSnackbar={setSnackbar}
      />
      <Box
        sx={{
          p: 3,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: "white",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            right: 0,
            width: "150px",
            height: "150px",
            background: "rgba(255, 255, 255, 0.05)",
            borderRadius: "50%",
            transform: "translate(30%, -30%)",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 1.5,
            position: "relative",
            zIndex: 1,
          }}
        >
          {vendorData?.logo ? (
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                overflow: "hidden",
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(10px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid rgba(255, 255, 255, 0.2)",
              }}
            >
              <img
                src={vendorData.logo}
                alt={vendorData.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.parentElement.innerHTML = `<svg style="width: 28px; height: 28px; color: white;"><use href="#store-icon" /></svg>`;
                }}
              />
            </Box>
          ) : (
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(10px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid rgba(255, 255, 255, 0.2)",
              }}
            >
              <StoreIcon sx={{ fontSize: 28 }} />
            </Box>
          )}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h5"
              fontWeight="700"
              sx={{
                letterSpacing: "-0.5px",
                textShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              {vendorData?.name || "Your Business"}
            </Typography>
            {vendorData?.tagline && (
              <Typography
                variant="body2"
                sx={{
                  opacity: 0.9,
                  mt: 0.5,
                  fontWeight: 400,
                }}
              >
                {vendorData?.tagline || "Manage your store efficiently"}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

      <Box sx={{ flex: 1, overflow: "auto", px: 1 }}>
        <List sx={{ pl: 1 }}>
          {menuItems.map((item) => {
            const isActive = isActiveRoute(item.path);
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => {
                    navigate(item.path);
                    setMobileOpen(false);
                  }}
                  sx={{
                    borderRadius: 2,
                    minHeight: 48,
                    backgroundColor: isActive
                      ? alpha(theme.palette.primary.main, 0.12)
                      : "transparent",
                    borderLeft: isActive
                      ? `3px solid ${theme.palette.primary.main}`
                      : "3px solid transparent",
                    "&:hover": {
                      backgroundColor: isActive
                        ? alpha(theme.palette.primary.main, 0.16)
                        : alpha(theme.palette.action.hover, 0.04),
                    },
                    transition: "all 0.2s ease-in-out",
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive ? theme.palette.primary.main : item.color,
                      minWidth: 40,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? theme.palette.primary.main : "inherit",
                    }}
                  />
                  {item.badge && (
                    <Chip
                      label={item.badge}
                      size="small"
                      color="success"
                      variant="outlined"
                      sx={{ fontSize: "0.75rem", height: 20 }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      <Divider />
      <Box sx={{ p: 2 }}>
        <ListItemButton
          onClick={() => navigate("/profile")}
          sx={{
            borderRadius: 2,
            backgroundColor: isActiveRoute("/profile")
              ? alpha(theme.palette.primary.main, 0.12)
              : "transparent",
          }}
        >
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          color: theme.palette.text.primary,
          background: theme.palette.background.paper,
          backdropFilter: "blur(8px)",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ display: { sm: "none" } }}
            >
              <MenuIcon />
            </IconButton>
            <Box>
              <Typography variant="h6" fontWeight="600">
                Welcome back, {user?.username || "User"}!
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {/* Quick Actions */}
            <Tooltip title="Toggle Theme">
              <ThemeToggleButton />
            </Tooltip>

            {/* Notifications */}
            <Tooltip title="Notifications">
              <IconButton onClick={handleNotificationOpen}>
                <Badge badgeContent={unreadCount} color="error" max={99}>
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* User Menu */}
            <IconButton
              onClick={handleMenuOpen}
              sx={{
                border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                },
              }}
            >
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  backgroundColor: theme.palette.primary.main,
                  fontSize: "1rem",
                  fontWeight: 600,
                }}
              >
                {user?.name?.charAt(0)?.toUpperCase() ||
                  user?.email?.charAt(0)?.toUpperCase() ||
                  "U"}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Notification Menu Component */}
      <NotificationMenu
        anchorEl={notificationAnchor}
        onClose={handleNotificationClose}
        mutateStats={statsMutate}
      />

      {/* User Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { width: 200 },
        }}
      >
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="body2" fontWeight="600">
            {user?.name || user?.email}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Store Manager
          </Typography>
        </Box>
        <MenuItem
          onClick={() => {
            navigate("/profile");
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          Profile Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
          <ListItemIcon>
            <Logout fontSize="small" color="error" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              border: "none",
              boxShadow: theme.shadows[8],
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              border: "none",
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: `calc(100vw - ${drawerWidth + 19}px)`,
          minHeight: "100vh",
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Toolbar />
        <Box sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
