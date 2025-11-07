// Maintenance mode check and redirect
(() => {
    // Get the current domain and construct API URL
    const currentDomain = window.location.hostname;
    const apiDomain = currentDomain.startsWith('api.') ? currentDomain : 'api.' + currentDomain;

    // Function to check if user is admin
    const isUserAdmin = () => {
        const token = localStorage.getItem('adminToken') || localStorage.getItem('jwt');
        if (!token) return false;

        try {
            const parts = token.split('.');
            if (parts.length < 2) return false;

            const base64Url = parts[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            const payload = JSON.parse(jsonPayload);
            return payload && payload.role === 'admin';
        } catch {
            return false;
        }
    };

    // Function to check maintenance status
    const checkMaintenance = async () => {
        try {
            // Ensure we're using HTTPS
            const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
            const maintenanceUrl = `${protocol}//${apiDomain}/public/maintenance`;

            console.log('Checking maintenance status at:', maintenanceUrl);

            const response = await fetch(maintenanceUrl, {
                method: 'GET',
                mode: 'cors'
            });

            if (!response.ok) {
                console.warn('Maintenance check failed:', response.status);
                return;
            }

            const data = await response.json();

            // If site is in maintenance and user is not admin, redirect
            if (data && data.active && !isUserAdmin()) {
                const message = data.message ? `?message=${encodeURIComponent(data.message)}` : '';
                window.location.replace('/maintenance.html' + message);
            }
        } catch (error) {
            console.warn('Maintenance check error:', error);
        }
    };

    // Run the maintenance check
    checkMaintenance();
})();
