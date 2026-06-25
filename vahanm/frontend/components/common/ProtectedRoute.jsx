import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export const ProtectedRoute = ({ children, allowedRole }) => {
    const { isAuthenticated, user, userRole } = useAuthStore();
    const [isChecking, setIsChecking] = useState(true);
    const location = useLocation();

    // Check localStorage directly for immediate decision during hydration
    const token = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('user');

    useEffect(() => {
        // Small delay to allow store rehydration if any async logic exists
        const timer = setTimeout(() => setIsChecking(false), 50);
        return () => clearTimeout(timer);
    }, []);

    const hasAuth = isAuthenticated || !!token;

    console.log('[ProtectedRoute] Check:', { 
        isAuthenticated, 
        hasToken: !!token, 
        hasAuth, 
        isChecking,
        path: location.pathname 
    });

    if (isChecking && !isAuthenticated && !!token) {
        // We have a token but store isn't ready. Show nothing or a loader to prevent jump.
        return <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>;
    }

    if (!hasAuth) {
        console.warn('[ProtectedRoute] Redirecting to /login - No Auth Found');
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Determine role from Zustand store or fallback to localStorage
    let effectiveRole = userRole;
    if (!effectiveRole && userStr) {
        try {
            const parsed = JSON.parse(userStr);
            effectiveRole = parsed?.role || parsed?.user?.role;
        } catch (e) {
            console.error('[ProtectedRoute] Parse error:', e);
        }
    }

    const normalizedAllowedRole = allowedRole?.toLowerCase();
    const normalizedEffectiveRole = effectiveRole?.toLowerCase();

    if (allowedRole && normalizedEffectiveRole !== normalizedAllowedRole) {
        console.warn(`[ProtectedRoute] Role mismatch! Required: ${normalizedAllowedRole}, Got: ${normalizedEffectiveRole}. Sending to /`);
        return <Navigate to="/" replace />;
    }

    console.log(`[ProtectedRoute] Access Granted: ${normalizedEffectiveRole}`);
    return children;
};
