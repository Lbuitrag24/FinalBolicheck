const fetchWithAuth = async (url, options = {}) => {
    let token = localStorage.getItem("token");
    
    const fetchOptions = {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
        },
    };

    const response = await fetch(url, fetchOptions);

    if (response.status === 401) {
        const refreshResponse = await fetch('http://localhost:8080/api/token/refresh/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh: localStorage.getItem("refresh_token") }),
        });
        if (refreshResponse.ok) {
            const data = await refreshResponse.json();
            localStorage.setItem("token", data.access);
            token = data.access;
            const retryOptions = {
                ...options,
                headers: {
                    ...options.headers,
                    'Authorization': `Bearer ${token}`
                },
            };
            return fetch(url, retryOptions);
        } else {
            localStorage.clear()
            window.location.href = "/login";
            localStorage.setItem("logoutMessage", "Tu sesión expiró, vuelve a iniciar sesión.");
        }
    }
    return response;
};
export default fetchWithAuth;