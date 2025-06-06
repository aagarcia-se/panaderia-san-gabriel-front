import React, { useState, useEffect } from "react";
import { Badge, Card, Button, Dropdown, Modal, Table } from "react-bootstrap";
import { formatDateToDisplay } from "../../../utils/dateUtils";
import { 
  BsCash, 
  BsWallet, 
  BsDashCircle, 
  BsArrowUp, 
  BsDownload, 
  BsFileEarmarkPdf, 
  BsFileEarmarkExcel, 
  BsCalendar, 
  BsShop, 
  BsPerson, 
  BsClock, 
  BsClipboardCheck, 
  BsBox,
  BsCashStack,
  BsPlusCircle,
  BsListUl
} from "react-icons/bs";
import { useMediaQuery } from "react-responsive";

const MobileVentaDetalle = ({ venta, onDownloadXLS, onDownloadPDF }) => {
  const encabezadoVenta = venta?.encabezadoVenta;
  const detallesVenta = venta?.detalleVenta;
  const detalleIngresos = venta?.detalleIngresos;
  const detallesGastos = venta?.detalleGastos;

  const formatCurrency = (value) => {
    return `Q ${parseFloat(value).toFixed(2)}`;
  };

  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showGastosModal, setShowGastosModal] = useState(false);
  const [isIconPulsing, setIsIconPulsing] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsIconPulsing(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const isSmallScreen = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1024 });

  // Cálculos financieros
  const ventaReal = (detalleIngresos?.montoTotalIngresado || 0) + (detalleIngresos?.montoTotalGastos || 0);
  const diferencia = ventaReal - (detalleIngresos?.montoEsperado || 0);
  const diferenciaColor = diferencia >= 0 ? "success" : "danger";

  return (
    <>
      <Card
        className="p-3 border-0 rounded-4"
        style={{ backgroundColor: "#FFFFFF", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)", fontFamily: "'Consolas', monospace" }}
      >
        <Card.Body className="px-2">
          {/* Encabezado */}
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div>
              <Card.Title className="h4 mb-1 text-dark">
                <BsBox size={24} className="me-2" style={{ color: "#FF6B6B" }} />
                Venta #{encabezadoVenta?.idVenta}
              </Card.Title>
              <small className="text-secondary">Detalles de la venta</small>
            </div>
            <Dropdown>
              <Dropdown.Toggle
                variant="outline-dark"
                className="rounded-circle p-2"
                id="dropdown-download"
              >
                <BsDownload size={20} />
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item onClick={onDownloadPDF}>
                  <div className="d-flex align-items-center gap-2">
                    <BsFileEarmarkPdf size={16} className="text-danger" />
                    <span>Descargar PDF</span>
                  </div>
                </Dropdown.Item>
                <Dropdown.Item onClick={onDownloadXLS}>
                  <div className="d-flex align-items-center gap-2">
                    <BsFileEarmarkExcel size={16} className="text-success" />
                    <span>Descargar Excel</span>
                  </div>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>

          {/* Información de la Venta */}
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
              <span className="text-secondary d-flex align-items-center gap-2">
                <BsCalendar size={16} style={{ color: "#4ECDC4" }} />
                Fecha de Venta:
              </span>
              <span className="fw-medium text-dark fw-bold">
                {formatDateToDisplay(encabezadoVenta?.fechaVenta)}
              </span>
            </div>
            <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
              <span className="text-secondary d-flex align-items-center gap-2">
                <BsShop size={16} style={{ color: "#4ECDC4" }} />
                Sucursal:
              </span>
              <span className="fw-medium text-dark text-end fw-bold" style={{ maxWidth: "60%" }}>
                {encabezadoVenta?.nombreSucursal}
              </span>
            </div>
            <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
              <span className="text-secondary d-flex align-items-center gap-2">
                <BsPerson size={16} style={{ color: "#4ECDC4" }} />
                Vendido por:
              </span>
              <span className="fw-medium text-dark fw-bold">{`${encabezadoVenta?.nombreUsuario}`}</span>
            </div>
            <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
              <span className="text-secondary d-flex align-items-center gap-2">
                <BsClock size={16} style={{ color: "#4ECDC4" }} />
                Turno:
              </span>
              <span className="fw-medium text-dark fw-bold">
                {encabezadoVenta?.ventaTurno || "N/A"}
              </span>
            </div>
            <div className="d-flex justify-content-between align-items-center py-2">
              <span className="text-secondary d-flex align-items-center gap-2">
                <BsClipboardCheck size={16} style={{ color: "#4ECDC4" }} />
                Estado:
              </span>
              <Badge
                bg={encabezadoVenta?.estadoVenta === "C" ? "success" : "danger"}
                className="px-2 py-1"
                style={{ backgroundColor: encabezadoVenta?.estadoVenta === "C" ? "#4ECDC4" : "#FF6B6B" }}
              >
                {encabezadoVenta?.estadoVenta === "C" ? "Cerrada" : "Pendiente"}
              </Badge>
            </div>
            <div className="d-flex justify-content-between align-items-center py-2">
              <span className="text-secondary d-flex align-items-center gap-2">
                <BsCash size={16} style={{ color: "#4ECDC4" }} />
                Venta Ingresada:
              </span>
              <span className="fw-medium text-dark fw-bold">
                {formatCurrency(encabezadoVenta?.totalVenta)}
              </span>
            </div>
          </div>

          {/* Productos Vendidos */}
          <h6 className="mb-3 text-uppercase text-secondary">Productos Vendidos</h6>
          {detallesVenta?.map((prod, index) => (
            <ProductCardMobile key={prod.idDetalleVenta} product={prod} index={index} />
          ))}

          {/* Balance */}
          <h6 className="mb-3 text-uppercase text-secondary mt-4">Balance Financiero</h6>
          <Card
            className="mb-3 border-0 rounded-3"
            style={{ backgroundColor: "#FFF3B0" }}
          >
            <Card.Body className="py-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-secondary d-flex align-items-center gap-2">
                  <BsWallet size={16} style={{ color: "#4ECDC4" }} /> 
                  Dinero Ingresado:
                </span>
                <span className="fw-bold text-dark" style={{ fontSize: isSmallScreen ? "0.875rem" : "1rem" }}>
                  {formatCurrency(detalleIngresos?.montoTotalIngresado)}
                </span>
              </div>
              
              <div 
                className="d-flex justify-content-between align-items-center mb-2 cursor-pointer"
                onClick={() => setShowGastosModal(true)}
                style={{ cursor: 'pointer' }}
              >
                <span className="text-secondary d-flex align-items-center gap-2">
                  <div className="position-relative">
                    <BsCashStack 
                      size={16} 
                      style={{ 
                        color: "#FF6B6B",
                        animation: isIconPulsing ? 'pulse 2s infinite' : 'none'
                      }} 
                    />
                    {detallesGastos?.length > 0 && (
                      <Badge 
                        pill 
                        bg="danger" 
                        className="position-absolute top-0 start-100 translate-middle"
                        style={{ fontSize: '0.6em' }}
                      >
                        {detallesGastos.length}
                      </Badge>
                    )}
                  </div>
                  Gastos del Turno:
                </span>
                <div className="d-flex align-items-center gap-1">
                  <span className="fw-bold text-danger" style={{ fontSize: isSmallScreen ? "0.875rem" : "1rem" }}>
                    {formatCurrency(detalleIngresos?.montoTotalGastos)}
                  </span>
                  <BsListUl 
                    size={14} 
                    style={{ 
                      color: "#6c757d",
                      animation: isIconPulsing ? 'pulse 2s infinite' : 'none'
                    }} 
                  />
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center mb-2 bg-light p-2 rounded">
                <span className="fw-semibold d-flex align-items-center gap-2">
                  <BsPlusCircle size={16} style={{ color: "#4ECDC4" }} />
                  Venta Real:
                </span>
                <span className="fw-bold text-primary">
                  {formatCurrency(ventaReal)}
                </span>
              </div>

              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-secondary d-flex align-items-center gap-2">
                  <BsCash size={16} style={{ color: "#4ECDC4" }} />
                  Venta Esperada:
                </span>
                <span className="fw-bold text-dark">
                  {formatCurrency(detalleIngresos?.montoEsperado)}
                </span>
              </div>

              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-semibold d-flex align-items-center gap-2">
                  <BsDashCircle size={16} style={{ color: diferenciaColor }} />
                  Diferencia:
                </span>
                <Badge bg={diferenciaColor} className="px-2 py-1">
                  {formatCurrency(diferencia)}
                </Badge>
              </div>
            </Card.Body>
          </Card>
        </Card.Body>
      </Card>

      {/* Modal de Detalles de Gastos */}
      <Modal 
        show={showGastosModal} 
        onHide={() => setShowGastosModal(false)} 
        centered
        size={isTablet ? "lg" : "md"}
      >
        <Modal.Header closeButton className="border-0 pb-2">
          <Modal.Title className="w-100 text-center">
            <div className="d-flex align-items-center justify-content-center gap-2">
              <BsCashStack size={24} style={{ color: "#FF6B6B" }} />
              <h5 className="mb-0">Detalle de Gastos</h5>
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-0">
          {detallesGastos?.length > 0 ? (
            <div className="table-responsive">
              <Table striped bordered hover className="mb-0">
                <thead>
                  <tr>
                    <th style={{ width: '15%' }}>#</th>
                    <th style={{ width: '55%' }}>Descripción</th>
                    <th style={{ width: '30%' }} className="text-end">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {detallesGastos.map((gasto, index) => (
                    <tr key={gasto.idGastoDiarioDetalle}>
                      <td>{index + 1}</td>
                      <td className="text-truncate" style={{ maxWidth: isSmallScreen ? '150px' : 'none' }}>
                        {gasto.detalleGasto}
                      </td>
                      <td className="text-end text-danger fw-bold">
                        {formatCurrency(gasto.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={2} className="text-end fw-bold">Total:</td>
                    <td className="text-end text-danger fw-bold">
                      {formatCurrency(detalleIngresos?.montoTotalGastos)}
                    </td>
                  </tr>
                </tfoot>
              </Table>
            </div>
          ) : (
            <div className="text-center py-4">
              <BsCashStack size={48} className="text-muted mb-3" />
              <h5>No hay gastos registrados</h5>
              <p className="text-muted">No se encontraron gastos para este turno</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button 
            variant="outline-secondary" 
            onClick={() => setShowGastosModal(false)}
            className="rounded-pill px-4"
          >
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Botón de flecha para volver arriba */}
      {showScrollButton && (
        <button
          onClick={scrollToTop}
          className="btn btn-dark rounded-circle shadow"
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            width: "50px",
            height: "50px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
          }}
        >
          <BsArrowUp size={20} />
        </button>
      )}

      {/* Estilos CSS para las animaciones */}
      <style jsx global>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.6; }
          100% { opacity: 1; }
        }
        .cursor-pointer {
          cursor: pointer;
        }
        .cursor-pointer:hover {
          background-color: rgba(0, 0, 0, 0.03);
          border-radius: 4px;
        }
      `}</style>
    </>
  );
};

const ProductCardMobile = ({ product, index }) => {
  return (
    <Card
      className="mb-3 border-0 rounded-3"
      style={{ backgroundColor: "rgba(230, 230, 250, 0.7)" }}
    >
      <Card.Body className="py-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="badge rounded-pill" style={{ backgroundColor: "#4ECDC4", color: "#FFFFFF" }}>
            # {index + 1}
          </span>
          <span className="h6 mb-0 text-dark">{product.nombreProducto}</span>
        </div>

        <div className="d-flex justify-content-between small">
          <div className="text-center">
            <div className="text-secondary">U/Vendida</div>
            <div className="fw-bold text-dark">{product.cantidadVendida}</div>
          </div>
          <div className="text-center">
            <div className="text-secondary">P/Unitario</div>
            <div className="fw-bold text-dark">{`Q ${product.precioUnitario.toFixed(2)}`}</div>
          </div>
          <div className="text-center">
            <div className="text-secondary text-nowrap">Total</div>
            <div className="fw-bold text-success">
              {`Q ${(product.cantidadVendida * product.precioUnitario).toFixed(2)}`}
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default MobileVentaDetalle;