function checkAuth() {

    const token = localStorage.getItem('jwt');

    const userStr = localStorage.getItem('loggedInUser');

    

    try {

        const user = userStr ? JSON.parse(userStr) : null;

        if (!token || !user || !user.id) {

            throw new Error('No auth');

        }

        return { user, token };

    } catch (e) {

        localStorage.removeItem('jwt');

        localStorage.removeItem('loggedInUser');

        localStorage.removeItem('adminToken');

        return null;

    }

}



function redirectIfAuthenticated() {

    const auth = checkAuth();

    if (auth) {

        window.location.replace('dash.html');

        return true;

    }

    return false;

}



function redirectIfNotAuthenticated() {

    const auth = checkAuth();

    if (!auth) {

        window.location.replace('login.html');

        return true;

    }

    return false;

}