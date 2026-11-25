import { useState } from 'react';
import {
  Box,
  Button,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { PageContainer } from '@/presentation/components/layout/PageContainer';
import { SurveyDashboardPanel } from '@/presentation/components/dashboard/SurveyDashboardPanel';
import { useAuth } from '@/application/contexts/AuthContext';
import { agenciesSurvey, travelersSurvey } from '@/data/surveys';

export const DashboardPage = () => {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState(0);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <PageContainer maxWidth="lg" animate={false}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
        sx={{ mb: 4 }}
      >
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Panel administrador
          </Typography>
          <Typography variant="h2">Investigación turística 2026</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Resultados de ambas encuestas en un solo panel
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<LogoutIcon />} onClick={() => void handleLogout()}>
          Salir
        </Button>
      </Stack>

      <Tabs
        value={activeTab}
        onChange={(_, value: number) => setActiveTab(value)}
        sx={{ mb: 4, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label={agenciesSurvey.adminTabLabel} />
        <Tab label={travelersSurvey.adminTabLabel} />
      </Tabs>

      <Box role="tabpanel" hidden={activeTab !== 0}>
        {activeTab === 0 && <SurveyDashboardPanel definition={agenciesSurvey} />}
      </Box>

      <Box role="tabpanel" hidden={activeTab !== 1}>
        {activeTab === 1 && <SurveyDashboardPanel definition={travelersSurvey} />}
      </Box>
    </PageContainer>
  );
};
