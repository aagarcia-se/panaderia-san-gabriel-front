import { useState } from "react";
import { Container } from "react-bootstrap";
import Title from "../../../components/Title/Title";
import AddButton from "../../../components/AddButton/AddButton";
import { useNavigate } from "react-router";
import useGetVentas from "../../../hooks/ventas/useGetVentas";
import { useMediaQuery } from "react-responsive";
import "./GestionarVentasPage.css";
import VentasTable from "../../../components/ventas/VentasTable/VentasTable";
import VentasCard from "../../../components/ventas/VentasCard/VentasCard";
import PaginationComponent from "../../../components/PaginationComponent/PaginationComponent";
import { getCurrentItems, handleConfirmDeleteVenta, handleDeleteVenta } from "./GestionVentas.utils";
import OrderCardSkeleton from "../../../components/OrderCardSkeleton/OrderCardSkeleton";
import FilterBarVentas from "../../../components/ventas/FilterBar/FilterBarVentas";
import useFilterVentas from "../../../hooks/ventas/useFilterVentas";
import { BsFillInfoCircleFill, BsExclamationTriangleFill, } from "react-icons/bs";
import Alert from "../../../components/Alerts/Alert";
import ConfirmPopUp from "../../../components/Popup/ConfirmPopup";
import ErrorPopup from "../../../components/Popup/ErrorPopUp";
import { handleViewDetalleVenta } from "../DetalleVenta/DetalleVenta.utils";
import useGetEliminacionesTracking from "../../../hooks/EliminacionesTracking/useGetEliminacionesTracking";
import { getUserData } from "../../../utils/Auth/decodedata";

const GestionVentasPage = () => {
  const navigate = useNavigate();
  const { ventas, loadingVentas, showErrorVentas, showInfoVentas, setVentas } = useGetVentas();
  const [filters, setFilters] = useState({ search: "", date: "", sucursal: "", });
  const filteredVentas = useFilterVentas(ventas, filters);
  const { eliminacionesTracking, loadingEliminacionesTracking, showErrorEliminacionesTracking, setEliminacionesTracking } = useGetEliminacionesTracking("VENTA");
  const userData = getUserData();
  
  /* Variables para la paginacion */
  const [currentPage, setCurrentPage] = useState(1);
  const ventasPerPage = 5;
  const currentSales = getCurrentItems( filteredVentas, currentPage, ventasPerPage );
  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [ventaToDelete, setVentaToDelete] = useState(null);
  const [errorPopupMessage, setErrorPopupMessage] = useState(false);
  const [isPopupErrorOpen, setIsPopupErrorOpen] = useState(false);
  const [isLoading, setIsloading] = useState(false);

  // Usamos useMediaQuery para detectar si es un dispositivo móvil
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });


  const handleDelete = (idVenta) => {
    // Lógica para eliminar una venta
    setVentas(ventas.filter((venta) => venta.idVenta !== idVenta));
  };

  const handleViewPdf = (idVenta) => {
    // Lógica para generar un PDF
    console.log("Generar PDF para la venta:", idVenta);
  };

  const handleViewDetails = (venta) => {
    // Lógica para ver detalles de la venta
    navigate(`detalle-venta/${venta.idVenta}`);
  };

  return (
    <Container>
      <Title
        title="Ventas"
        description="Gestiona las ventas realizadas en el día"
      />
      <AddButton
        buttonText="Ingresar venta"
        onRedirect={() => navigate("ingresar-venta")}
      />

      <FilterBarVentas
        filters={filters}
        onFilterChange={setFilters}
        ventas={ventas}
      />

      {isMobile ? (
        // Vista para móviles con SaleCard
        loadingVentas ? (
          [...Array(5)].map((_, index) => <OrderCardSkeleton key={index} />)
        ) : (
          <>
            {currentSales.map((venta) => (
              <VentasCard
                key={venta.idVenta}
                sale={venta}
                onViewDetails={() => {
                  handleViewDetalleVenta(venta.idVenta, navigate);
                }}
                onDeleteSale={() =>
                  handleConfirmDeleteVenta(
                    venta.idVenta,
                    setVentaToDelete,
                    setIsPopupOpen
                  )
                }
                eliminacionesTracking={eliminacionesTracking}
                userData={userData}
              />
            ))}

            <PaginationComponent
              totalItems={filteredVentas.length}
              itemsPerPage={ventasPerPage}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          </>
        )
      ) : loadingVentas ? (
        <div className="d-flex justify-content-center my-5">
          <div className="spinner-border text-primary my-5" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      ) : (
        // Usar el componente VentasTable para la vista de PC
        <VentasTable
          sales={filteredVentas}
          onDelete={(idVenta) =>
            handleConfirmDeleteVenta(idVenta, setVentaToDelete, setIsPopupOpen)
          }
          onViewPdf={handleViewPdf}
          loadingViewPdf={null} // Puedes manejar el estado de carga aquí
          eliminacionesTracking={eliminacionesTracking}
          userData={userData}
        />
      )}

      {/* Alertas mostrar error y notificacion de informacion */}
      {filteredVentas.length === 0 &&
        (filters.search || filters.date || filters.sucursal) && (
          <div className="row justify-content-center my-3">
            <div className="col-md-6 text-center">
              <Alert
                type="primary"
                message="No se encontraron ventas que coincidan con la búsqueda."
                icon={<BsFillInfoCircleFill />}
              />
            </div>
          </div>
        )}

      {/* Mensaje cuando no hay ventas */}
      {filteredVentas.length === 0 &&
        !loadingVentas &&
        !showErrorVentas &&
        showInfoVentas && (
          <div className="row justify-content-center my-3">
            <div className="col-md-6 text-center">
              <Alert
                type="primary"
                message="No se han ingresado Ventas."
                icon={<BsFillInfoCircleFill />}
              />
            </div>
          </div>
        )}

      {showErrorVentas && (
        <div className="row justify-content-center my-2">
          <div className="col-md-6 text-center">
            <Alert
              type="danger"
              message="Hubo un error al consultar las ventas. Intenta más tarde..."
              icon={<BsExclamationTriangleFill />}
            />
          </div>
        </div>
      )}

      {/* Popup confirmacion de eliminación */}
      <ConfirmPopUp
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        title="Confirmar Eliminación"
        message="¿Está seguro de eliminar la orden?"
        isLoading={isLoading}
        onConfirm={() => {
          handleDeleteVenta(
            ventaToDelete,
            setVentas,
            setIsPopupOpen,
            setErrorPopupMessage,
            setIsPopupErrorOpen,
            setIsloading
          );
        }}
        onCancel={() => setIsPopupOpen(false)}
      />

      {/* Error popup */}
      <ErrorPopup
        isOpen={isPopupErrorOpen}
        onClose={() => setIsPopupErrorOpen(false)}
        title="¡Error!"
        message={errorPopupMessage}
      />
    </Container>
  );
};

export default GestionVentasPage;
