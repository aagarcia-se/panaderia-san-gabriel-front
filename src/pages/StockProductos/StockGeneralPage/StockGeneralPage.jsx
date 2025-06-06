import { useNavigate, useParams } from "react-router";
import { BsArrowLeft, BsX, BsArrowUp } from "react-icons/bs";
import Title from "../../../components/Title/Title";
import { Container, Spinner, Alert, Form, Table, Dropdown, Button } from "react-bootstrap";
import { FaBoxOpen, FaSearch, FaPlus } from "react-icons/fa";
import DotsMove from "../../../components/Spinners/DotsMove";
import { useState, useMemo, useEffect } from "react";
import { useMediaQuery } from "react-responsive";
import { getInitials, getUniqueColor } from "../IngresarStock/IngresarStock.utils";
import useGetStockGeneral from "../../../hooks/stock/useGetStockGeneral";
import "./StockGeneralPage.styles.css";
import useGetSucursales from "../../../hooks/sucursales/useGetSucursales";
import { decryptId } from "../../../utils/CryptoParams";

const StockGeneralPage = () => {
  const { idSucursal } = useParams();
  const { stockGeneral, loadingStockGeneral } = useGetStockGeneral(idSucursal);
  const { sucursales, loadingSucursales } = useGetSucursales();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [categoriaActiva, setCategoriaActiva] = useState("Todas");

  const decryptedIdSucursal = decryptId(decodeURIComponent(idSucursal));
  const sucursal = sucursales?.find(item => 
    Number(item.idSucursal) === Number(decryptedIdSucursal)
  );

  const handleIngresarStock = () => {
    navigate(`/stock-productos/ingresar-stock/${encodeURIComponent(idSucursal)}`);
  };

  // Detectar dispositivos
  const isMobile = useMediaQuery({ maxWidth: 767 });

  // Obtener categorías únicas con manejo seguro
  const categorias = useMemo(() => {
    try {
      if (!stockGeneral || !Array.isArray(stockGeneral)) return ['Todas'];
      const categoriasUnicas = [...new Set(
        stockGeneral
          .map(item => item?.nombreCategoria)
          .filter(Boolean)
      )];
      return ['Todas', ...categoriasUnicas];
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      return ['Todas'];
    }
  }, [stockGeneral]);

  // Efecto para mostrar/ocultar el botón de scroll
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollButton(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Función para volver al inicio
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Función para ordenar la tabla
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const isArray = Array.isArray(stockGeneral);
  const isEmptyStock = useMemo(() => {
    return !isArray || stockGeneral.length === 0;
  }, [isArray, stockGeneral]);

  // Filtrar y ordenar productos
  const filteredProducts = useMemo(() => {
    if (!isArray) return [];
    
    let filtered = stockGeneral.filter((producto) => {
      const matchesSearch = producto.nombreProducto.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoriaActiva === "Todas" || producto.nombreCategoria === categoriaActiva;
      return matchesSearch && matchesCategory;
    });

    // Ordenar si hay configuración de ordenamiento
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [stockGeneral, searchTerm, isArray, sortConfig, categoriaActiva]);

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  if (loadingStockGeneral || loadingSucursales) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "70vh" }}
      >
        <DotsMove />
      </Container>
    );
  }

  return (
    <Container className="stock-general-container">
      {/* ---------------- Titulo ----------------- */}
      <div className="text-center mb-3">
        <div className="row">
          <div className="col-2">
            <button
              className="btn bt-return rounded-circle d-flex align-items-center justify-content-center shadow"
              style={{ width: "40px", height: "40px" }}
              onClick={() => navigate("/stock-productos")}
            >
              <BsArrowLeft size={20} />
            </button>
          </div>
          <div className="col-8">
            <Title
              title={`Stock General ${sucursal?.nombreSucursal}`}
              description="Todos los productos disponibles en inventario"
            />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mb-4">
        {/* Botón Ingresar Stock */}
        <Button 
          variant="success" 
          onClick={handleIngresarStock}
          className="d-flex align-items-center gap-2 me-md-3"
        >
          <FaPlus /> Ingresar Stock
        </Button>

        {/* Barra de búsqueda */}
        <div className="flex-grow-1" style={{ minWidth: "300px", maxWidth: "500px" }}>
          <div className="position-relative">
            <Form.Control
              type="text"
              placeholder="Buscar producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="stock-general-search-input"
              style={{ paddingRight: "2.5rem" }}
            />
            <FaSearch className="stock-general-search-icon" />
            {searchTerm && (
              <BsX
                className="stock-general-clear-icon"
                onClick={handleClearSearch}
              />
            )}
          </div>
        </div>

        {/* Dropdown de categorías */}
        <div style={{ minWidth: "250px" }}>
          <Dropdown>
            <Dropdown.Toggle 
              variant="primary" 
              id="dropdown-categorias" 
              className="stock-general-category-dropdown w-100"
            >
              {categoriaActiva === "Todas" ? "Todas las categorías" : categoriaActiva}
            </Dropdown.Toggle>
            <Dropdown.Menu className="stock-general-category-dropdown-menu w-100">
              {categorias.map((categoria) => (
                <Dropdown.Item
                  key={categoria}
                  active={categoriaActiva === categoria}
                  onClick={() => setCategoriaActiva(categoria)}
                  className="stock-general-category-dropdown-item"
                >
                  {categoria}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>

      {/* Contenido condicional */}
      {isEmptyStock ? (
        <div className="row justify-content-center">
          <div className="col-md-8">
            <Alert variant="info" className="stock-general-empty-alert">
              <FaBoxOpen className="me-2" />
              No hay productos en el stock.
            </Alert>
          </div>
        </div>
      ) : (
        <div className="table-responsive excel-like-table-container">
          <Table striped bordered hover className="excel-like-table">
            <thead>
              <tr>
                <th
                  onClick={() => requestSort("nombreProducto")}
                  className="sortable-header dark-header text-center align-middle"
                >
                  <div className="header-content">
                    Producto
                    {sortConfig.key === "nombreProducto" && (
                      <BsArrowUp
                        className={`sort-icon ${
                          sortConfig.direction === "descending"
                            ? "descending"
                            : ""
                        }`}
                      />
                    )}
                  </div>
                </th>
                <th
                  onClick={() => requestSort("cantidadExistente")}
                  className="sortable-header dark-header text-center align-middle"
                >
                  <div className="header-content">
                    Cantidad
                    {sortConfig.key === "cantidadExistente" && (
                      <BsArrowUp
                        className={`sort-icon ${
                          sortConfig.direction === "descending"
                            ? "descending"
                            : ""
                        }`}
                      />
                    )}
                  </div>
                </th>
                <th className="dark-header text-center align-middle">
                  Unidad
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((producto) => (
                  <tr key={producto.idProducto}>
                    <td className="product-cell">
                      <div className="product-info">
                        <div
                          className="product-badge-general"
                          style={{
                            backgroundColor: getUniqueColor(
                              producto.nombreProducto
                            ),
                          }}
                        >
                          {getInitials(producto.nombreProducto)}
                        </div>
                        <span className="product-name">
                          {producto.nombreProducto}
                        </span>
                      </div>
                    </td>
                    <td className="quantity-cell-general text-center align-middle fw-bold">
                      {producto.cantidadExistente}
                    </td>
                    <td className="text-center align-middle">
                      {producto.nombreProducto === "Frances" ? "Filas" : "Unidades"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center py-4 align-middle">
                    No se encontraron productos con ese nombre en esta categoría.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      )}

      {/* Botón de scroll para móviles */}
      {isMobile && showScrollButton && (
        <button
          onClick={scrollToTop}
          className="scroll-to-top-btn"
          aria-label="Volver arriba"
        >
          <BsArrowUp size={24} />
        </button>
      )}
    </Container>
  );
};

export default StockGeneralPage;