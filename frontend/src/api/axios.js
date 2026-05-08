/** axios.js — Instancia de Axios preconfigurada con la URL base del backend. */
import axios from 'axios';

const clienteBack = axios.create({
    baseURL: 'http://localhost:5000/api'
});

export default clienteBack;