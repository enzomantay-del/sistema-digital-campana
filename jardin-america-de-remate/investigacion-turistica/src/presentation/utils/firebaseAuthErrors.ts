import { FirebaseError } from 'firebase/app';

export const getFirebaseAuthErrorMessage = (error: unknown): string => {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
      case 'auth/invalid-email':
        return 'Email o contraseña incorrectos. Verificá tus datos e intentá de nuevo.';
      case 'auth/unauthorized-domain':
        return 'Este sitio no está autorizado para iniciar sesión. En Firebase Console → Authentication → Configuración → Dominios autorizados, agregá investigacion-turismo.web.app';
      case 'auth/operation-not-allowed':
        return 'El inicio de sesión con email y contraseña no está activado. Activá "Correo electrónico/Contraseña" en Firebase Authentication.';
      case 'auth/too-many-requests':
        return 'Demasiados intentos fallidos. Esperá unos minutos e intentá de nuevo.';
      case 'auth/network-request-failed':
        return 'Error de conexión. Verificá tu internet e intentá de nuevo.';
      default:
        return `No se pudo iniciar sesión (${error.code}). Verificá la configuración en Firebase Console.`;
    }
  }

  if (error instanceof Error && error.message.includes('Firebase Auth no está configurado')) {
    return 'Firebase no está configurado. La app debe compilarse con el archivo .env correcto.';
  }

  return 'No se pudo iniciar sesión. Verificá email y contraseña.';
};
