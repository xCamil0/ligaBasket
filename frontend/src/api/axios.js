import axios from 'axios';

const clienteBack = axios.create({
    baseURL: 'http://localhost:5000/api' // La URL base de tu backend
});

export default clienteBack;