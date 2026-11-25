import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { SurveyLandingPage } from '@/presentation/pages/SurveyLandingPage';
import { SurveySectionPage } from '@/presentation/pages/SurveySectionPage';
import { SurveyFilterPage } from '@/presentation/pages/SurveyFilterPage';
import { SurveyCompletePage } from '@/presentation/pages/SurveyCompletePage';
import { SurveyScreenoutPage } from '@/presentation/pages/SurveyScreenoutPage';
import { LoginPage } from '@/presentation/pages/LoginPage';
import { DashboardPage } from '@/presentation/pages/DashboardPage';
import { ProtectedRoute } from '@/presentation/components/common/ProtectedRoute';
import { SurveyShell } from '@/presentation/components/layout/SurveyShell';
import { agenciesSurvey, travelersSurvey } from '@/data/surveys';

export const AppRoutes = () => (
  <Routes>
    <Route
      path="/"
      element={
        <SurveyShell definition={agenciesSurvey}>
          <Outlet />
        </SurveyShell>
      }
    >
      <Route index element={<SurveyLandingPage />} />
      <Route path="encuesta/filtro" element={<SurveyFilterPage />} />
      <Route path="encuesta/seccion/:sectionNumber" element={<SurveySectionPage />} />
      <Route path="encuesta/completada" element={<SurveyCompletePage />} />
      <Route path="encuesta/finalizada" element={<SurveyScreenoutPage />} />
    </Route>

    <Route
      path="/viajeros"
      element={
        <SurveyShell definition={travelersSurvey}>
          <Outlet />
        </SurveyShell>
      }
    >
      <Route index element={<SurveyLandingPage />} />
      <Route path="encuesta/filtro" element={<SurveyFilterPage />} />
      <Route path="encuesta/seccion/:sectionNumber" element={<SurveySectionPage />} />
      <Route path="encuesta/completada" element={<SurveyCompletePage />} />
      <Route path="encuesta/finalizada" element={<SurveyScreenoutPage />} />
    </Route>

    <Route path="/admin/login" element={<LoginPage />} />
    <Route
      path="/admin"
      element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      }
    />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);
