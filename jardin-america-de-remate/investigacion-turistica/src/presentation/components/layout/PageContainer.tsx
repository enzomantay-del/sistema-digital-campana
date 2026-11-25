import { Box, Container, type ContainerProps } from '@mui/material';
import { motion } from 'framer-motion';

interface PageContainerProps extends ContainerProps {
  animate?: boolean;
}

export const PageContainer = ({
  children,
  animate = true,
  maxWidth = 'md',
  ...props
}: PageContainerProps) => {
  const content = (
    <Container maxWidth={maxWidth} sx={{ py: { xs: 4, md: 8 }, px: { xs: 2, sm: 3 } }} {...props}>
      {children}
    </Container>
  );

  if (!animate) {
    return content;
  }

  return (
    <Box component={motion.div} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      {content}
    </Box>
  );
};
