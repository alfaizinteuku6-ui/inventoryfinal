import React from "react";
import { Paper, Box, Avatar, Typography } from "@mui/material";

const HeaderCard = ({
  icon,
  title,
  subtitle,
  body1,
  actionButton,
  gradient = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 3,
        background: gradient,
        color: "white",
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
            sx={{ bgcolor: "rgba(255,255,255,0.2)", width: 56, height: 56 }}
          >
            {icon}
          </Avatar>
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                {subtitle}
              </Typography>
            )}
            {body1 && (
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                {" "}
                {body1}{" "}
              </Typography>
            )}
          </Box>
        </Box>

        {/* If a button (or any JSX) is passed, display it */}
        {actionButton && <Box>{actionButton}</Box>}
      </Box>
    </Paper>
  );
};

export default HeaderCard;
