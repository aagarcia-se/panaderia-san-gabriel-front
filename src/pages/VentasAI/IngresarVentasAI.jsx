import React, { useState, useRef } from "react";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { BsArrowLeft, BsCamera, BsUpload, BsCheckCircle, BsTrash } from "react-icons/bs";
import useGetSucursales from "../../hooks/sucursales/useGetSucursales";
import { getUserData } from "../../utils/Auth/decodedata";
import { ingresarVentaAIService } from "../../services/vetnasAI/ventasAI.service";
import "./IngresarVentas.styles.css";


const IngresarVentasAI = () => {
  const { sucursales, loadingSucursales } = useGetSucursales();
  const usuario = getUserData();
  const navigate = useNavigate();
  const today = dayjs().format("DD/MM/YYYY");

  // --- Estados del formulario ---
  const [turno, setTurno] = useState("");
  const [sucursal, setSucursal] = useState("");
  const [imagen, setImagen] = useState(null);
  const [preview, setPreview] = useState(null);
  const [ventaReal, setVentaReal] = useState(""); 
  const [gastos, setGastos] = useState([]);
  const [nuevoGasto, setNuevoGasto] = useState({ detalle: "", subtotal: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const inputCamaraRef = useRef(null);
  const inputGaleriaRef = useRef(null);

  // --- Validación para habilitar el botón enviar ---
  const formularioCompleto =
    turno && sucursal && imagen && ventaReal;

  // --- Manejo de imagen ---
  const handleImagen = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImagen(file);
    setPreview(URL.createObjectURL(file));
  };

  // --- Gastos ---
  const agregarGasto = () => {
    if (!nuevoGasto.detalle.trim() || !nuevoGasto.subtotal) return;
    setGastos((prev) => [
      ...prev,
      {
        detalleGasto: nuevoGasto.detalle.trim(),
        subtotal: parseFloat(nuevoGasto.subtotal),
      },
    ]);
    setNuevoGasto({ detalle: "", subtotal: "" });
  };

  const eliminarGasto = (index) => {
    setGastos((prev) => prev.filter((_, i) => i !== index));
  };

  const totalGastos = gastos.reduce((a, g) => a + g.subtotal, 0);

  // --- Enviar ---
  const handleEnviar = async () => {
    if (!formularioCompleto) return;
    setIsLoading(true);
    setError(null);

    try {
      const ventaHeader = {
        turno,
        idSucursal: sucursal,
        idUsuario: usuario.idUsuario,
        fecha: dayjs().format("YYYY-MM-DD"),
        ventaReal: parseFloat(ventaReal),
        gastos,
      };

      const formData = new FormData();
      formData.append("image", imagen);
      formData.append("ventaHeader", JSON.stringify(ventaHeader));

      const response = await ingresarVentaAIService(formData);

      if (!response.ok) throw new Error(response.message || "Error al procesar");

      setSuccess(true);
    } catch (err) {
      console.error("Error al enviar la venta:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="ai-page">
        <div className="ai-success">
          <BsCheckCircle size={52} className="ai-success-icon" />
          <h2 className="ai-success-title">Venta registrada</h2>
          <p className="ai-success-sub">Los datos fueron procesados correctamente.</p>
          <button className="ai-btn-primary" onClick={() => navigate("/ventas")}>
            Ver ventas
          </button>
          <button className="ai-btn-ghost" onClick={() => { setSuccess(false); setImagen(null); setPreview(null); setVentaReal(""); setGastos([]); setTurno(""); setSucursal(""); }}>
            Ingresar otra venta
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-page">

      {/* HEADER */}
      <div className="ai-header">
        <button className="ai-back-btn" onClick={() => navigate("/ventas")}>
          <BsArrowLeft size={18} />
        </button>
        <div>
          <h1 className="ai-header-title">Venta por foto</h1>
          <p className="ai-header-date">{today}</p>
        </div>
      </div>

      {/* PASO 1 — TURNO Y SUCURSAL */}
      <section className="ai-section">
        <span className="ai-step-label">1 · Turno y sucursal</span>

        <div className="ai-toggle-group">
          {["AM", "PM"].map((t) => (
            <button
              key={t}
              className={`ai-toggle-btn ${turno === t ? "active" : ""}`}
              onClick={() => setTurno(t)}
            >
              {t}
            </button>
          ))}
        </div>

        <select
          className="ai-select"
          value={sucursal}
          onChange={(e) => setSucursal(e.target.value)}
          disabled={loadingSucursales}
        >
          <option value="">
            {loadingSucursales ? "Cargando..." : "Seleccionar sucursal"}
          </option>
          {sucursales.map((s) => (
            <option key={s.idSucursal} value={s.idSucursal}>
              {s.nombreSucursal}
            </option>
          ))}
        </select>

        {/* Chip usuario */}
        <div className="ai-user-chip">
          <span className="ai-user-avatar">
            {usuario?.usuario?.charAt(0).toUpperCase()}
          </span>
          <span className="ai-user-name">{usuario?.usuario}</span>
        </div>
      </section>

      {/* PASO 2 — FOTO */}
      <section className="ai-section">
        <span className="ai-step-label">2 · Foto de la hoja</span>

        {!preview ? (
          <div className="ai-drop-zone">
            <BsCamera size={36} className="ai-drop-icon" />
            <p className="ai-drop-text">Toma o carga una foto de la hoja de producción</p>
            <div className="ai-drop-actions">
              <button
                className="ai-btn-primary"
                onClick={() => inputCamaraRef.current.click()}
              >
                <BsCamera size={15} className="me-1" /> Tomar foto
              </button>
              <button
                className="ai-btn-outline"
                onClick={() => inputGaleriaRef.current.click()}
              >
                <BsUpload size={15} className="me-1" /> Galería
              </button>
            </div>
          </div>
        ) : (
          <div className="ai-preview-wrap">
            <img src={preview} alt="Vista previa" className="ai-preview-img" />
            <button
              className="ai-preview-remove"
              onClick={() => { setImagen(null); setPreview(null); }}
            >
              <BsTrash size={14} /> Quitar foto
            </button>
          </div>
        )}

        <input ref={inputCamaraRef} type="file" accept="image/*" capture="environment" onChange={handleImagen} style={{ display: "none" }} />
        <input ref={inputGaleriaRef} type="file" accept="image/*" onChange={handleImagen} style={{ display: "none" }} />
      </section>

      {/* PASO 3 — MONTO VENTA */}
      <section className="ai-section">
        <span className="ai-step-label">3 · Monto de la venta</span>
        <div className="ai-amount-display">
          Q {ventaReal && !isNaN(parseFloat(ventaReal))
            ? parseFloat(ventaReal).toFixed(2)
            : "0.00"}
        </div>
        <input
          type="number"
          className="ai-input"
          placeholder="0.00"
          value={ventaReal}
          onChange={(e) => setVentaReal(e.target.value)}
          step="0.01"
        />
      </section>

      {/* PASO 4 — GASTOS */}
      <section className="ai-section">
        <span className="ai-step-label">4 · Gastos del turno <span className="ai-optional">(opcional)</span></span>

        <div className="ai-gasto-row">
          <input
            type="text"
            className="ai-input ai-input-flex"
            placeholder="Detalle"
            value={nuevoGasto.detalle}
            onChange={(e) => setNuevoGasto((p) => ({ ...p, detalle: e.target.value }))}
          />
          <input
            type="number"
            className="ai-input ai-input-amount"
            placeholder="Q"
            value={nuevoGasto.subtotal}
            onChange={(e) => setNuevoGasto((p) => ({ ...p, subtotal: e.target.value }))}
            step="0.01"
          />
          <button
            className="ai-add-btn"
            onClick={agregarGasto}
            disabled={!nuevoGasto.detalle || !nuevoGasto.subtotal}
          >
            +
          </button>
        </div>

        {gastos.length > 0 && (
          <div className="ai-gastos-list">
            {gastos.map((g, i) => (
              <div className="ai-gasto-item" key={i}>
                <span className="ai-gasto-detalle">{g.detalleGasto}</span>
                <div className="ai-gasto-right">
                  <span className="ai-gasto-amount">Q {g.subtotal.toFixed(2)}</span>
                  <button className="ai-del-btn" onClick={() => eliminarGasto(i)}>
                    <BsTrash size={13} />
                  </button>
                </div>
              </div>
            ))}
            <div className="ai-gastos-total">
              <span>Total gastos</span>
              <span>Q {totalGastos.toFixed(2)}</span>
            </div>
          </div>
        )}
      </section>

      {/* ERROR */}
      {error && (
        <div className="ai-error">{error}</div>
      )}

      {/* BOTÓN ENVIAR */}
      <div className="ai-footer">
        <button
          className={`ai-btn-send ${!formularioCompleto ? "disabled" : ""}`}
          onClick={handleEnviar}
          disabled={!formularioCompleto || isLoading}
        >
          {isLoading ? "Procesando..." : "Enviar venta"}
        </button>
        {!formularioCompleto && (
          <p className="ai-footer-hint">
            Completa turno, sucursal, foto y monto para continuar.
          </p>
        )}
      </div>

    </div>
  );
};

export default IngresarVentasAI;