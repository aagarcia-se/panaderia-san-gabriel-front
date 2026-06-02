import { useEffect, useState } from "react";
import { currentDate } from "../../utils/dateUtils";
import { consultarNotificacionesActivasService } from "../../services/notificaciones/notificacones.service";

/* Consulta a BD los permisoso */
export const useGetUsuariosNotiActivos = () => {
    const [usuariosNotiActivos, setUsuariosNotiActivos] = useState([]);
    const [loadingUsuariosNotiActivos, setLoadingUsuariosNotiActivos] = useState(true);
    const [showErrorUsuariosNotiActivos, setShowErrorUsuariosNotiActivos] = useState(false);

    const fechaHoy = currentDate();

    useEffect(() => {
      const fetchUsuariosNotiActivos = async () => {
        try {
          const response = await consultarNotificacionesActivasService();
          if (response.status === 200) {
            setUsuariosNotiActivos(response.usuariosNoti);
          } 
        } catch (error) {
            setShowErrorUsuariosNotiActivos(true);
        } finally {
            setLoadingUsuariosNotiActivos(false);
        }
      };

      fetchUsuariosNotiActivos();
    }, []);
  
    return { usuariosNotiActivos, loadingUsuariosNotiActivos, showErrorUsuariosNotiActivos, setUsuariosNotiActivos };
  };
  
  export default useGetUsuariosNotiActivos;
  