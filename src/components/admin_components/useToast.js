import React from 'react';

export function useToast() {
    const [toast, setToast] = React.useState(null);

    const showToast = React.useCallback((message, type = 'success') => {
        setToast({ message, type });
    }, []);

    const clearToast = React.useCallback(() => setToast(null), []);

    return { toast, showToast, clearToast };
}
