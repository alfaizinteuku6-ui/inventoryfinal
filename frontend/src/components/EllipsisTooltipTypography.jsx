import React, { useRef, useState, useEffect } from "react";
import { Tooltip, Typography } from "@mui/material";

const EllipsisTooltipTypography = ({ children, variant, sx, ...props }) => {
  const textRef = useRef(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const el = textRef.current;
    if (el) {
      setIsTruncated(el.scrollWidth > el.clientWidth);
    }
  }, [children]);

  const text = (
    <Typography
      ref={textRef}
      variant={variant}
      sx={{
        overflow: "hidden",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        display: "block",
        ...sx,
      }}
      {...props}
    >
      {children}
    </Typography>
  );

  return isTruncated ? <Tooltip title={children}>{text}</Tooltip> : text;
};

export default EllipsisTooltipTypography;
