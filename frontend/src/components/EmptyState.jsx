import React from "react";
import { Paper, Avatar, Typography, Button } from "@mui/material";
import { Add } from "@mui/icons-material";

/**
 * Generic EmptyState component
 *
 * @param {ReactNode} icon - The icon to show inside Avatar
 * @param {string} title - Title text
 * @param {string} description - Subtitle/description text
 * @param {function} primaryAction - function to call on main button click
 * @param {string} primaryLabel - text of the main button
 * @param {function} secondaryAction - function to call on secondary button click (optional)
 * @param {string} secondaryLabel - text of the secondary button (optional)
 */
const EmptyState = ({
  icon,
  title,
  description,
  primaryAction,
  primaryLabel,
  secondaryAction,
  secondaryLabel,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 8,
        textAlign: "center",
        borderRadius: 4,
      }}
    >
      <Avatar
        sx={{
          width: 80,
          height: 80,
          mx: "auto",
          mb: 3,
        }}
      >
        {icon}
      </Avatar>
      <Typography
        variant="h5"
        fontWeight="600"
        sx={{ mb: 1 }}
      >
        {title}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        {description}
      </Typography>
      {secondaryAction && (
        <Button
          variant="outlined"
          onClick={secondaryAction}
          sx={{
            borderRadius: 3,
            textTransform: "none",
            px: 4,
            py: 1.5,
            fontWeight: 600,
            mr: 2,
          }}
        >
          {secondaryLabel}
        </Button>
      )}
      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={primaryAction}
        sx={{
          borderRadius: 3,
          textTransform: "none",
          px: 4,
          py: 1.5,
          fontWeight: 600,
        }}
      >
        {primaryLabel}
      </Button>
    </Paper>
  );
};

export default EmptyState;
