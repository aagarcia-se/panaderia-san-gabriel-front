import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import useGetUsuariosNotiActivos from "../../../hooks/notificaciones/useGetUsuariosNotiActivos";
import { activarNotificacionService, desactivarNotificacionService } from "../../../services/notificaciones/notificacones.service";
import "./NotificacionesEspeciales.styles.css";

const getInitials = (nombre, apellido) =>
  ((nombre?.[0] ?? "") + (apellido?.[0] ?? "")).toUpperCase();

const NotificacionesEspeciales = () => {
  const navigate = useNavigate();
  const { usuariosNotiActivos, loadingUsuariosNotiActivos } = useGetUsuariosNotiActivos();

  const [usuarios, setUsuarios] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalUsuarios, setOriginalUsuarios] = useState([]);

  useEffect(() => {
    if (usuariosNotiActivos?.length) {
      setUsuarios(usuariosNotiActivos);
      setOriginalUsuarios(usuariosNotiActivos);
      setHasChanges(false);
    }
  }, [usuariosNotiActivos]);

  const handleToggle = (idUsuario) => {
    setUsuarios((prev) =>
      prev.map((u) =>
        u.idUsuario === idUsuario
          ? { ...u, activo: u.activo === 1 ? 0 : 1 }
          : u
      )
    );
    setHasChanges(true);
    setSaveStatus(null);
  };

  const handleGuardar = async () => {
    setSaving(true);
    setSaveStatus(null);

    const fechaConHora = dayjs().format("YYYY-MM-DD HH:mm:ss");

    const cambiados = usuarios.filter((u) => {
      const original = originalUsuarios.find((o) => o.idUsuario === u.idUsuario);
      return original?.activo !== u.activo;
    });

    // activo === null en original → nunca se insertó → INSERT
    const aInsertar = cambiados.filter((u) => {
      const original = originalUsuarios.find((o) => o.idUsuario === u.idUsuario);
      return original?.activo === null;
    });

    // activo !== null en original → ya existe registro → UPDATE
    const aActualizar = cambiados.filter((u) => {
      const original = originalUsuarios.find((o) => o.idUsuario === u.idUsuario);
      return original?.activo !== null;
    });

    try {
      const promesas = [];

      if (aInsertar.length > 0) {
        const payload = aInsertar.map((u) => ({
          idUsuario: u.idUsuario,
          tipoEvento: "orden_especial",
          activo: 1,
          fechaCreacion: fechaConHora,
        }));
        promesas.push(activarNotificacionService(payload));
      }

      if (aActualizar.length > 0) {
        const payload = aActualizar.map((u) => ({
          idUsuario: u.idUsuario,
          tipoEvento: "orden_especial",
          activo: u.activo,
          fechaActualizacion: fechaConHora,
        }));
        promesas.push(desactivarNotificacionService(payload));
      }

      await Promise.all(promesas);

      setOriginalUsuarios(usuarios);
      setHasChanges(false);
      setSaveStatus("success");
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  };

  const activosCount = usuarios.filter((u) => u.activo === 1).length;

  return (
    <div className="ne-page">

      <div className="ne-topbar">
        <button
          className="ne-back-btn"
          onClick={() => navigate("/config")}
          aria-label="Volver a configuración"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
        </button>
        <div className="ne-topbar-text">
          <p className="ne-topbar-title">Notificaciones especiales</p>
          <p className="ne-topbar-sub">Activa o desactiva por usuario</p>
        </div>
      </div>

      <div className="ne-body">

        <div className="ne-summary">
          <p className="ne-summary-label">Usuarios con notificaciones activas</p>
          <span className="ne-summary-count">{activosCount}</span>
        </div>

        {saveStatus === "success" && (
          <div className="ne-feedback ne-feedback-success">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            Cambios guardados correctamente
          </div>
        )}

        {saveStatus === "error" && (
          <div className="ne-feedback ne-feedback-error">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            Error al guardar. Intenta de nuevo.
          </div>
        )}

        <p className="ne-section-label">Usuarios</p>

        {loadingUsuariosNotiActivos ? (
          <div className="ne-loading">
            <div className="spinner-border spinner-border-sm text-primary" role="status" />
            <span>Cargando usuarios...</span>
          </div>
        ) : usuarios.length === 0 ? (
          <div className="ne-empty">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
              style={{ display: "block", margin: "0 auto 8px" }}>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            Sin usuarios disponibles
          </div>
        ) : (
          usuarios.map((usuario) => {
            const original = originalUsuarios.find((o) => o.idUsuario === usuario.idUsuario);
            const changed = original?.activo !== usuario.activo;

            return (
              <div
                key={usuario.idUsuario}
                className={`ne-card ${usuario.activo === 1 ? "active" : ""} ${changed ? "changed" : ""}`}
              >
                <div className={`ne-avatar ${usuario.activo === 1 ? "active" : ""}`}>
                  {getInitials(usuario.nombreUsuario, usuario.apellidoUsuario)}
                </div>

                <div className="ne-info">
                  <p className="ne-name">
                    {usuario.nombreUsuario} {usuario.apellidoUsuario}
                    {changed && <span className="ne-changed-dot" title="Cambio pendiente" />}
                  </p>
                  <p className="ne-email">{usuario.correoUsuario}</p>
                </div>

                <div className="ne-toggle-wrap">
                  <button
                    className={`ne-toggle ${usuario.activo === 1 ? "on" : ""}`}
                    onClick={() => handleToggle(usuario.idUsuario)}
                    role="switch"
                    aria-checked={usuario.activo === 1}
                    aria-label={`Notificaciones de ${usuario.nombreUsuario}`}
                    disabled={saving}
                  />
                  <span className={`ne-toggle-label ${usuario.activo === 1 ? "active" : ""}`}>
                    {usuario.activo === 1 ? "Activo" : "Inactivo"}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {hasChanges && (
        <div className="ne-footer">
          <button
            className="ne-btn-cancel"
            onClick={() => {
              setUsuarios(originalUsuarios);
              setHasChanges(false);
              setSaveStatus(null);
            }}
            disabled={saving}
          >
            Descartar
          </button>
          <button
            className="ne-btn-save"
            onClick={handleGuardar}
            disabled={saving}
          >
            {saving ? (
              <>
                <div className="ne-spinner" />
                Guardando...
              </>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
                Guardar cambios
              </>
            )}
          </button>
        </div>
      )}

    </div>
  );
};

export default NotificacionesEspeciales;