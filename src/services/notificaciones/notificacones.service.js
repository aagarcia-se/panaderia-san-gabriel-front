import api from "../../config/api";
import { deleteEndpoints, getEndpoints, postEndpoints, putEndpoints, } from "../../config/endpoints";

export const consultarNotificacionesActivasService = async () => {
    try {
        const response = await api.get(`${getEndpoints.GET_NOTIFICACIONES_ACTIVAS}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const activarNotificacionService = async (usuarioNotificacion) => {
    try {
        const response = await api.post(`${postEndpoints.ACTIVAR_NOTIFICACION}`, usuarioNotificacion);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const desactivarNotificacionService = async (usuarioNotificacion) => {
    try {
        const response = await api.put(`${putEndpoints.DESACTIVAR_NOTIFICACION}`, usuarioNotificacion);
        return response.data;
    } catch (error) {
        throw error;
    }
}

