import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Collapse,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useLocation, useNavigate } from 'react-router-dom';
import { PageContainer } from '@/presentation/components/layout/PageContainer';
import { useAuth } from '@/application/contexts/AuthContext';
import { isFirebaseConfigured } from '@/infrastructure/firebase/config';
import { getFirebaseAuthErrorMessage } from '@/presentation/utils/firebaseAuthErrors';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/admin';
  const firebaseReady = isFirebaseConfigured();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!firebaseReady) {
      setError('Firebase no está configurado en esta versión de la app.');
      return;
    }

    setLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(getFirebaseAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer maxWidth="xs">
      <Paper sx={{ p: { xs: 3, md: 4 }, border: '1px solid #F3F4F6' }}>
        <Typography variant="h2" gutterBottom>
          Panel administrador
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Acceso restringido para visualizar resultados de la investigación.
        </Typography>

        {!firebaseReady && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            Firebase no está configurado. Contactá a quien publicó la encuesta para recompilar la app
            con las credenciales correctas.
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2.5}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              autoComplete="email"
              disabled={!firebaseReady}
            />
            <TextField
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              autoComplete="current-password"
              disabled={!firebaseReady}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading || !firebaseReady}
              sx={{ mt: 1 }}
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </Button>
          </Stack>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Button
            size="small"
            startIcon={<HelpOutlineIcon />}
            onClick={() => setShowHelp((open) => !open)}
            sx={{ textTransform: 'none', px: 0 }}
          >
            {showHelp ? 'Ocultar ayuda' : '¿Primera vez? Cómo crear el acceso admin'}
          </Button>
          <Collapse in={showHelp}>
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2" component="div" sx={{ mb: 1 }}>
                1. Entrá a{' '}
                <Link
                  href="https://console.firebase.google.com/project/investigacion-turismo/authentication/users"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Firebase Console → Authentication → Usuarios
                </Link>
              </Typography>
              <Typography variant="body2" component="div" sx={{ mb: 1 }}>
                2. Activá el método <strong>Correo electrónico/Contraseña</strong> si no está activo.
              </Typography>
              <Typography variant="body2" component="div" sx={{ mb: 1 }}>
                3. Creá un usuario con email y contraseña. Esos datos son los que usás acá.
              </Typography>
              <Typography variant="body2">
                4. Ingresá desde{' '}
                <Link href="/admin/login">investigacion-turismo.web.app/admin/login</Link>
              </Typography>
            </Alert>
          </Collapse>
        </Box>
      </Paper>
    </PageContainer>
  );
};
