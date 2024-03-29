const PROXY_URL = 'http://localhost:5001';

let SERVER_ROUTES = {
    ROOMS: '/v1/rooms'
};

Object.keys(SERVER_ROUTES).forEach(key => SERVER_ROUTES[key] = PROXY_URL + SERVER_ROUTES[key]);

export { PROXY_URL };

export default SERVER_ROUTES;