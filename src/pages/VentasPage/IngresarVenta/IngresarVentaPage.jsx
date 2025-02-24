import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import useGetSucursales from "../../../hooks/sucursales/useGetSucursales";
import { Modal, Button, Form, Spinner, Container, Row, Col, Card, InputGroup } from "react-bootstrap";
import { FaTimes, FaCalendarAlt, FaClock, FaStore, FaUser, FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./IngresarVentaPage.css";
import { useForm } from "react-hook-form";
import { getUserData } from "../../../utils/Auth/decodedata";
import { handleBuscarVentas, handleCloseModal } from "./IngresarVenta.Utils";
import DotsMove from "../../../components/Spinners/DotsMove";

// Función para obtener las iniciales de un nombre
const getInitials = (name) => {
  const words = name.split(" ");
  return words.map((word) => word[0]).join("").toUpperCase();
};

// Función para generar un color único basado en el nombre del producto
const getUniqueColor = (name) => {
  const colors = [
    "#FF6B6B", "#4ECDC4", "#45B7D5", "#A4D555", "#D4A5A5",
    "#FFD166", "#06D6A0", "#118AB2", "#EF476F", "#073B4C"
  ];
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

const IngresarVentaPage = () => {
  const [isPopupErrorOpen, setIsPopupErrorOpen] = useState(false);
  const [errorPopupMessage, setErrorPopupMessage] = useState("");
  const usuario = getUserData();
  const [orden, setOrden] = useState([]);
  const [productos, setProductos] = useState([]);
  const [ordenYProductos, setOrdenYProductos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(true);
  const { sucursales, loadingSucursales } = useGetSucursales();
  const navigate = useNavigate();

  const { register, watch, setValue, formState: { errors } } = useForm({ defaultValues: { turno: "AM", sucursal: "" } });
  const turnoValue = watch("turno");
  const sucursalValue = watch("sucursal");

  const [activeCategory, setActiveCategory] = useState("");
  const [trayQuantities, setTrayQuantities] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (turnoValue && sucursalValue) {
      handleBuscarVentas(setIsLoading, turnoValue, sucursalValue, setOrden, setProductos, setOrdenYProductos, setShowModal, setErrorPopupMessage, setIsPopupErrorOpen);
    }
  }, [turnoValue, sucursalValue]);

  // Obtener categorías únicas de ordenYProductos
  const categorias = [...new Set(ordenYProductos.map((p) => p.nombreCategoria))];

  // Establecer la primera categoría como activa si no hay una seleccionada
  useEffect(() => {
    if (categorias.length > 0 && !activeCategory) {
      setActiveCategory(categorias[0]);
    }
  }, [categorias, activeCategory]);

  // Filtrar productos por nombre
  const filterProductsByName = (products, searchTerm) => {
    if (!searchTerm) return products;
    return products.filter((producto) =>
      producto.nombreProducto.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Filtrar productos por categoría y búsqueda
  const filteredProducts = filterProductsByName(ordenYProductos, searchTerm);
  const productsToShow = searchTerm
    ? filteredProducts
    : filteredProducts.filter((p) => p.nombreCategoria === activeCategory);

  // Función para limpiar datos y abrir el modal
  const handleModificarDatos = () => {
    setValue("sucursal", ""); // Limpiar sucursal
    setValue("turno", "AM"); // Reiniciar turno a "AM"
    setShowModal(true); // Abrir el modal
  };

  return (
    <Container>
      <Modal
        show={showModal}
        onHide={handleCloseModal}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        fullscreen
        className="ingresar-venta-modal"
      >
        <Modal.Header className="bg-purple text-white">
          <Modal.Title className="w-100 text-center">
            Selecciona turno y sucursal
          </Modal.Title>
          <Button
            variant="link"
            onClick={() => handleCloseModal(navigate)}
            className="text-white"
          >
            <FaTimes />
          </Button>
        </Modal.Header>
        <Modal.Body className="bg-light d-flex justify-content-center align-items-center">
          <Container>
            <Row className="justify-content-center">
              <Col xs={12} md={6} className="text-center">
                <Form>
                  <Form.Group className="mb-4">
                    <label className="form-label small text-uppercase text-muted fw-bold mb-2">
                      Turno
                    </label>
                    <div className="d-flex flex-column flex-md-row justify-content-center gap-3 ingresar-venta-shift-selector">
                      <Button
                        variant={turnoValue === "AM" ? "primary" : "outline-primary"}
                        className="ingresar-venta-shift-btn shadow w-100 w-md-auto"
                        onClick={() => setValue("turno", "AM")}
                      >
                        🌅 AM
                      </Button>
                      <Button
                        variant={turnoValue === "PM" ? "primary" : "outline-primary"}
                        className="ingresar-venta-shift-btn shadow w-100 w-md-auto"
                        onClick={() => setValue("turno", "PM")}
                      >
                        🌇 PM
                      </Button>
                    </div>
                    {errors.turno && (
                      <span className="ingresar-venta-text-danger small">
                        Selecciona un turno
                      </span>
                    )}
                  </Form.Group>

                  <Form.Group controlId="formSucursal" className="mb-4">
                    <label className="form-label small text-uppercase text-muted fw-bold mb-2">
                      Sucursal
                    </label>
                    {loadingSucursales ? (
                      <div className="loading-spinner">
                        <div className="spinner-border text-primary" role="status" />
                      </div>
                    ) : (
                      <Form.Select
                        {...register("sucursal", { required: true })}
                        className={`ingresar-venta-custom-select shadow w-100 ${errors.sucursal ? "is-invalid" : ""}`}
                      >
                        <option value="">Selecciona una sucursal</option>
                        {sucursales.map((sucursal) => (
                          <option key={sucursal.idSucursal} value={sucursal.idSucursal}>
                            {sucursal.nombreSucursal}
                          </option>
                        ))}
                      </Form.Select>
                    )}
                    {errors.sucursal && (
                      <span className="ingresar-venta-text-danger small">
                        No se pudieron cargar las sucursales. Intente más tarde.
                      </span>
                    )}
                  </Form.Group>
                  {isLoading && (
                    <div className="d-flex justify-content-center mt-3">
                      <DotsMove />
                    </div>
                  )}
                </Form>
              </Col>
            </Row>
          </Container>
        </Modal.Body>
        <Modal.Footer className="bg-purple">
          <Button
            variant="light"
            onClick={() => handleCloseModal(navigate)}
            className="bt-cancelar shadow"
          >
            Cancelar
          </Button>
        </Modal.Footer>
      </Modal>

      {!showModal && !isLoading && (
        <Card className="ingresar-venta-order-header-card mt-1 shadow-lg">
          <Card.Body>
            {/* Botón para modificar datos en la esquina superior derecha */}
            <div className="d-flex justify-content-end">
              <Button
                variant="warning"
                className="modificar-btn"
                onClick={handleModificarDatos}
                style={{ fontSize: "1rem", padding: "0.3rem 0.5rem" }}
              >
                <FaEdit />
              </Button>
            </div>

            <Row className="text-center">
              <Col xs={12} md={3} className="mb-3 mb-md-0">
                <div className="ingresar-venta-order-header-item text-start">
                  <span className="ingresar-venta-order-header-label text-secondary">
                    <FaStore className="text-primary" /> Sucursal:
                  </span>
                  <span className="ingresar-venta-order-header-value">
                    {sucursales.find((s) => s.idSucursal == sucursalValue)?.nombreSucursal}
                  </span>
                </div>
              </Col>

              <Col xs={6} md={3} className="mb-3 mb-md-0">
                <div className="ingresar-venta-order-header-item">
                  <span className="ingresar-venta-order-header-label text-secondary">
                    <FaCalendarAlt className="text-primary" /> Fecha:
                  </span>
                  <span className="ingresar-venta-order-header-value">
                    {dayjs().format("DD/MM/YYYY")}
                  </span>
                </div>
              </Col>

              <Col xs={6} md={3} className="mb-3 mb-md-0">
                <div className="ingresar-venta-order-header-item">
                  <span className="ingresar-venta-order-header-label text-secondary">
                    <FaClock className="text-primary" /> Turno:
                  </span>
                  <span className="ingresar-venta-order-header-value">
                    {turnoValue}
                  </span>
                </div>
              </Col>

              <Col xs={12} md={3} className="mb-3 mb-md-0">
                <div className="ingresar-venta-order-header-item text-start">
                  <span className="ingresar-venta-order-header-label text-secondary">
                    <FaUser className="text-primary" /> Usuario:
                  </span>
                  <span className="ingresar-venta-order-header-value">
                    {usuario.usuario}
                  </span>
                </div>
              </Col>
            </Row>

            {/* Botón "Guardar Orden" */}
            <Row className="text-center justify-content-center mt-4">
              <Col xs={12} md={6} lg={3}>
                <div className="d-flex justify-content-center">
                  <Button
                    variant="primary"
                    className="submit-btn w-100"
                    type="submit"
                  >
                    {isLoading ? (
                      <span className="spinner-border spinner-border-sm" role="status" />
                    ) : (
                      <>
                        <span className="btn-icon">🚀</span>
                        Guardar Venta
                      </>
                    )}
                  </Button>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Sección de Productos */}
      {!showModal && !isLoading && (
        <div className="products-section mt-4">
          {/* Barra de búsqueda */}
          <div className="mb-4">
            <Form.Control
              type="text"
              placeholder="Buscar producto por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-data search-bar"
            />
          </div>

          {/* Selector de categoría */}
          <div className="category-selector mb-4">
            {categorias.map((categoria) => (
              <Button
                key={categoria}
                variant={activeCategory === categoria ? "primary" : "outline-primary"}
                onClick={() => setActiveCategory(categoria)}
                className="category-btn"
              >
                {categoria} (
                {filterProductsByName(ordenYProductos, searchTerm).filter(
                  (p) => p.nombreCategoria === categoria
                ).length}
                )
              </Button>
            ))}
          </div>

          {/* Lista de productos filtrados */}
          <Row className="g-4 product-grid">
            {productsToShow.map((producto) => (
              <Col key={producto.idProducto} xs={12} md={6} lg={4} xl={3}>
                <Card className="product-card">
                  <Card.Body className="product-card-body">
                    <div
                      className="product-badge"
                      style={{
                        backgroundColor: getUniqueColor(producto.nombreProducto),
                      }}
                    >
                      {getInitials(producto.nombreProducto)}
                    </div>
                    <h3 className="product-title">{producto.nombreProducto}</h3>
                    <p className="product-category">
                      {producto.nombreCategoria === "Panadería" ? "Unidades no vendidas" : "Unidades"}
                    </p>
                    <InputGroup className="product-input-group">
                      <Form.Control
                        type="number"
                        min="0"
                        value={trayQuantities[producto.idProducto] || ""}
                        onChange={(e) =>
                          setTrayQuantities({
                            ...trayQuantities,
                            [producto.idProducto]: parseInt(e.target.value) || 0,
                          })
                        }
                        className="product-input"
                      />
                    </InputGroup>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}
    </Container>
  );
};

export default IngresarVentaPage;