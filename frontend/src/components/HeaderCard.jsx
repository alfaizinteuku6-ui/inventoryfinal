import React from "react";
import { Paper, Box, Avatar, Typography, useTheme } from "@mui/material";

const HeaderCard = ({ icon, title, subtitle, body1, actionButton }) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 3,
        bgcolor: theme.palette.background.paper, // adapts to theme
        color: theme.palette.text.primary,
        borderRadius: 2,
      }}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        flexWrap="wrap"
        gap={2}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar
            sx={{
              bgcolor: theme.palette.primary.main, // theme primary color
              color: theme.palette.primary.contrastText,
              width: 56,
              height: 56,
            }}
          >
            {icon}
          </Avatar>
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="subtitle1" color="text.secondary">
                {subtitle}
              </Typography>
            )}
            {body1 && (
              <Typography variant="body1" color="text.secondary">
                {body1}
              </Typography>
            )}
          </Box>
        </Box>

        {actionButton && <Box>{actionButton}</Box>}
      </Box>
    </Paper>
  );
};

export default HeaderCard;
