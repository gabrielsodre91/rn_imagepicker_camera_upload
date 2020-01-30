import axios from 'axios';

const api = axios.create({
    baseURL: 'http://softfenix.com.br:3000'
});

export default api;