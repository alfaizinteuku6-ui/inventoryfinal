import { Card, CardContent, Skeleton, Stack, Box } from "@mui/material";

const LoadingSkeleton = () => (
  <Card sx={{ borderRadius: 3, overflow: "hidden" }}>
    <Box>
      <Skeleton variant="rectangular" height={140} animation="wave" />
    </Box>
    <CardContent>
      <Stack spacing={1.5}>
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="text" width="40%" />
        <Stack direction="row" justifyContent="space-between">
          <Skeleton variant="text" width="30%" />
          <Skeleton variant="text" width="20%" />
        </Stack>
        <Stack direction="row" spacing={1}>
          <Skeleton variant="rectangular" width={80} height={30} />
          <Skeleton variant="rectangular" width={80} height={30} />
          <Skeleton variant="circular" width={30} height={30} />
        </Stack>
      </Stack>
    </CardContent>
  </Card>
);

export default LoadingSkeleton;
