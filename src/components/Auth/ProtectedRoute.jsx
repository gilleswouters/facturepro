import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !user) {
            navigate('/', { replace: true });
        }
    }, [user, loading, navigate]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-surface">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent"></div>
            </div>
        );
    }

    return user ? children : null;
};

export default ProtectedRoute;
