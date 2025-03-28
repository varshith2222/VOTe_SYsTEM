import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface PrivateRouteProps {
  children: React.ReactNode;
  requiresAdmin?: boolean;
  requiresWallet?: boolean;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({
  children,
  requiresAdmin = false,
  requiresWallet = false,
}) => {
  const { isAuthenticated, userMetadata, walletAddress } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiresAdmin && userMetadata?.role !== 'admin') {
    return <Navigate to="/voter" replace />;
  }

  if (requiresWallet && !walletAddress) {
    return <Navigate to="/connect-wallet" replace />;
  }

  return <>{children}</>;
};
