import React from "react";
import {
  SpeedDial,
  SpeedDialIcon,
  SpeedDialAction,
} from "@mui/material";
import {
  Add,
  Refresh,
  Analytics,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const ProductsSpeedDial = ({ onRefresh }) => {
  const navigate = useNavigate();

  const speedDialActions = [
    {
      icon: <Add />,
      name: "Add Product",
      onClick: () => navigate("/products/new"),
    },
    {
      icon: <Refresh />,
      name: "Refresh",
      onClick: onRefresh,
    },
    {
      icon: <Analytics />,
      name: "Analytics",
      onClick: () => console.log("Analytics"),
    },
  ];

  return (
    <SpeedDial
      ariaLabel="Product actions"
      sx={{
        position: "fixed",
        bottom: 32,
        right: 32,
        "& .MuiFab-primary": {
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          "&:hover": {
            background: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
          },
        },
      }}
      icon={<SpeedDialIcon />}
    >
      {speedDialActions.map((action) => (
        <SpeedDialAction
          key={action.name}
          icon={action.icon}
          tooltipTitle={action.name}
          onClick={action.onClick}
          sx={{
            "& .MuiFab-primary": {
              bgcolor: "white",
              color: "primary.main",
              "&:hover": {
                bgcolor: "primary.50",
              },
            },
          }}
        />
      ))}
    </SpeedDial>
  );
};

export default ProductsSpeedDial;