import React, { useState } from "react";
import { Table, Button, Badge, Container, Pagination } from "react-bootstrap";
import { formatDateToDisplay } from "../../utils/dateUtils";
import { FaFileAlt, FaTrashAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; // Importar useNavigate para redireccionar
import "./OrderTable.css";

const ITEMS_PER_PAGE = 5;

const OrderTable = ({ orders, onViewDetails, onDelete }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate(); // Hook para redireccionar

  const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedOrders = orders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Función para manejar el clic en una fila
  const handleRowClick = (idOrdenProduccion) => {
    navigate(`/pedidos-produccion/detalles/${idOrdenProduccion}`); // Redirigir a la vista de detalles
  };

  return (
    <Container className="p-3">
      <Table striped hover responsive bordered className="modern-table shadow-lg">
        <thead style={{ backgroundColor: '#292A2D' }}>
          <tr>
            <th className="text-center p-3">#</th>
            <th className="text-center p-3">Número de Orden</th>
            <th className="text-center p-3">Fecha a Producir</th>
            <th className="text-center p-3">Total Productos</th>
            <th className="text-center p-3">Estado</th>
            <th className="text-center p-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {paginatedOrders.map((order, index) => (
            <tr
              key={order.idOrdenProduccion}
              className="align-middle"
              onClick={() => handleRowClick(order.idOrdenProduccion)} // Evento onClick en la fila
              style={{ cursor: "pointer" }} // Cambiar el cursor a pointer para indicar que es clickeable
            >
              <td className="text-center p-3">{startIndex + index + 1}</td>
              <td className="text-center p-3">{`ORD-${order.idOrdenProduccion}`}</td>
              <td className="text-center p-3">
                {formatDateToDisplay(order.fechaAProducir)}
              </td>
              <td className="text-center p-3">{order.cantidadProductos}</td>
              <td className="text-center p-3">
                <Badge
                  pill
                  bg={order.estadoOrden === "C" ? "success" : "warning"}
                  className="px-1 py-1"
                >
                  {order.estadoOrden === "C" ? "Completado" : "Pendiente"}
                </Badge>
              </td>
              <td className="text-center p-3">
                {/* <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation(); // Evitar que el evento de la fila se dispare
                    onViewDetails(order);
                  }}
                  className="me-2"
                >
                  <FaFileAlt /> Ver Detalles
                </Button> */}
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation(); // Evitar que el evento de la fila se dispare
                    onDelete(order.idOrdenProduccion);
                  }}
                >
                  <FaTrashAlt /> Eliminar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Paginación */}
      <Pagination className="d-flex justify-content-center mt-3">
        <Pagination.Prev
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
        />

        {[...Array(totalPages)].map((_, index) => (
          <Pagination.Item
            key={index + 1}
            active={index + 1 === currentPage}
            onClick={() => handlePageChange(index + 1)}
          >
            {index + 1}
          </Pagination.Item>
        ))}

        <Pagination.Next
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
        />
      </Pagination>
    </Container>
  );
};

export default OrderTable;