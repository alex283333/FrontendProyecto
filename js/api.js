const API_BASE_URL = '/api';

async function safeFetch(endpoint, options = {}) {

    const url = `${API_BASE_URL}${endpoint}`;

    const token = localStorage.getItem('token');

    const defaultOptions = {

        headers: {

            'Content-Type': 'application/json',

            ...(token ? { 'Authorization': `Bearer ${token}` } : {})

        },

        credentials: 'include'

    };

    const fetchOptions = {

        ...defaultOptions,

        ...options,

        headers: {

            ...defaultOptions.headers,

            ...options.headers

        }

    };

    try {

        const response = await fetch(url, fetchOptions);

        if (!response.ok) {

            const error = await response.json();

            throw new Error(error.error || 'Error en la petición');

        }

        return await response.json();

    } catch (error) {

        console.error('Error en fetch:', error);

        throw error;

    }

}

window.safeFetch = safeFetch;

window.API_BASE_URL = API_BASE_URL;