import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form"; // Importa useForm
import { useGetProductosYPrecios } from "../../../hooks/productosprecios/useGetProductosYprecios";
import {
  useCategoriasYFiltrado,
  useSerchPrductos,
} from "./ManageProductsUtils";
import CreateButton from "../../../components/CreateButton/CreateButton";
import SearchInput from "../../../components/SerchInput/SerchInput";
import Title from "../../../components/Title/Title";
import CardProductos from "../../../components/CardProductos/CardPoductos";
import { useNavigate } from "react-router";
import Alert from "../../../components/Alerts/Alert";
import {
  BsChevronBarDown,
  BsChevronDown,
  BsExclamationTriangleFill,
  BsFillInfoCircleFill,
  BsX,
} from "react-icons/bs";
import {
  handleConfirmDeletePreoducto,
  handleDeleleProducto,
} from "../IngresarProductos/IngresarProductosUtils";
import ConfirmPopUp from "../../../components/Popup/ConfirmPopup";
import ErrorPopup from "../../../components/Popup/ErrorPopUp";
import ModalIngreso from "../../../components/ModalGenerico/Modal"; // Importa el modal
import { Form, InputGroup } from "react-bootstrap"; // Para los inputs del modal
import useGetCategorias from "../../../hooks/categorias/UseGetCategorias";
import "./ManageProducts.css";

const ManageProducts = () => {
  const {
    productos,
    loadigProducts,
    showErrorProductos,
    showInfoProductos,
    setProductos,
  } = useGetProductosYPrecios(); // Consultar productos
  const { filteredProductos, searchQuery, showNoResults, handleSearch } =
    useSerchPrductos(productos); // Búsqueda local
  const {
    categorias,
    filteredByCategory,
    selectedCategory,
    setSelectedCategory,
  } = useCategoriasYFiltrado(productos, filteredProductos); // Filtrar por categorías
  const [productoToDelete, setProductoToDelete] = useState(null); // Setea el id a eliminar
  const [isPopupOpen, setIsPopupOpen] = useState(false); // Estado para el popup de confirmación
  const [errorPopupMessage, setErrorPopupMessage] = useState(false); // Setea el mensaje a mostrar
  const [isPopupErrorOpen, setIsPopupErrorOpen] = useState(false); // Estado para el popup de errores
  const [showModifyModal, setShowModifyModal] = useState(false); // Estado para mostrar el modal de modificación
  const [selectedProduct, setSelectedProduct] = useState(null); // Estado para almacenar el producto seleccionado
  const [initialProductValues, setInitialProductValues] = useState(null); // Estado para almacenar los valores iniciales
  const [hasChanges, setHasChanges] = useState(false); // Estado para detectar cambios
  const navigate = useNavigate();
  const {
    categorias: categoriasModify,
    loadingCategorias,
    showErrorCategorias,
    showInfoCategorias,
  } = useGetCategorias();

  const [loadingModificar, setLoadingModificar] = useState(false);

  // React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  // Función para manejar el clic en el botón "Modificar"
  const handleModifyClick = (producto) => {
    setSelectedProduct(producto); // Guarda el producto seleccionado
    setInitialProductValues({ ...producto }); // Guarda los valores iniciales
    setShowModifyModal(true); // Abre el modal de modificación
    reset(producto); // Resetea el formulario con los valores del producto seleccionado
    setHasChanges(false); // Reinicia el estado de cambios
  };

  // Función para verificar cambios en los campos
  const checkForChanges = () => {
    if (!selectedProduct || !initialProductValues) return;

    const currentValues = watch(); // Obtiene los valores actuales del formulario
    const hasChangesDetected =
      currentValues.nombreProducto !== initialProductValues.nombreProducto ||
      Number(currentValues.idCategoria) !==
        Number(initialProductValues.idCategoria) ||
      Number(currentValues.cantidad) !==
        Number(initialProductValues.cantidad) ||
      Number(currentValues.precio) !== Number(initialProductValues.precio);

    setHasChanges(hasChangesDetected);
  };

  // Efecto para verificar cambios cada vez que se modifica el formulario
  useEffect(() => {
    checkForChanges();
  }, [watch()]); // Observa los cambios en los campos del formulario

  // Función para guardar los cambios del producto
  const onSubmit = async (data) => {
    if (!hasChanges) return;

    setLoadingModificar(true);

    try {
      // Aquí iría la lógica para actualizar el producto en el backend
      const response = await fetch(
        `http://localhost:300/api/productos/${selectedProduct.idProducto}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error("Error al actualizar el producto.");
      }

      // Actualiza la lista de productos localmente
      const updatedProductos = productos.map((p) =>
        p.idProducto === selectedProduct.idProducto ? { ...p, ...data } : p
      );
      setProductos(updatedProductos);

      // Cierra el modal
      setShowModifyModal(false);
    } catch (error) {
      console.error("Error al actualizar el producto:", error);
      setErrorPopupMessage(
        "No se pudo actualizar el producto. Inténtalo de nuevo."
      );
      setIsPopupErrorOpen(true);
    } finally {
      setLoadingModificar(false);
    }
  };

  if (loadigProducts) {
    return <div className="loading">Cargando productos...</div>;
  }

  return (
    <div className="container">
      <Title
        title="Productos"
        description="Administración de productos existentes"
      />
      <div className="row mb-4">
        <div className="col-12 col-md-3 mb-2 mb-md-0">
          <CreateButton
            onClick={() => navigate("/productos/ingresar-producto")}
          />
        </div>
        <div className="col-12 col-md-6">
          <SearchInput
            searchQuery={searchQuery}
            handleSearch={handleSearch}
            placeholder={
              showErrorProductos || showInfoProductos
                ? "No se pueden realizar búsquedas"
                : "Buscar Producto"
            }
            readOnly={showErrorProductos || showInfoProductos}
          />
        </div>
        <div className="col-12 col-md-3">
          <select
            className="form-control input-data"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categorias.map((categoria) => (
              <option key={categoria} value={categoria}>
                {categoria}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="container mt-4">
        <div className="row">
          {filteredByCategory.map((producto) => (
            <div
              key={producto.idProducto}
              className="col-xs-12 col-12 col-lg-6 mb-4"
            >
              <CardProductos
                id={producto.idProducto}
                nombreProducto={producto.nombreProducto}
                cantidad={producto.cantidad}
                precio={producto.precio}
                image={producto.imagenB64}
                onDelete={() =>
                  handleDeleleProducto(
                    producto.idProducto,
                    setProductoToDelete,
                    setIsPopupOpen
                  )
                }
                onModify={() => handleModifyClick(producto)} // Pasa la función para modificar
              />
            </div>
          ))}
        </div>
      </div>
      {/* Modal para modificación de productos */}
      <ModalIngreso
        show={showModifyModal}
        onHide={() => setShowModifyModal(false)}
        title="Modificar Producto"
        onConfirm={handleSubmit(onSubmit)}
        confirmText="Modificar"
        confirmDisabled={!hasChanges}
        isLoading={loadingModificar}
      >
        {selectedProduct && (
          <Form>
            {/* Campo: Nombre del Producto */}
            <Form.Group className="mb-3">
              <Form.Label>Nombre del Producto</Form.Label>
              <div className="input-wrapper">
                <Form.Control
                  type="text"
                  placeholder="Ingrese el nombre"
                  {...register("nombreProducto", {
                    required: "El nombre del producto es obligatorio.",
                  })}
                  isInvalid={!!errors.nombreProducto}
                  className="input-field"
                />
                <BsX
                  className="input-icon"
                  onClick={() => setValue("nombreProducto", "")}
                />
              </div>
              {errors.nombreProducto && (
                <Form.Control.Feedback type="invalid">
                  {errors.nombreProducto.message}
                </Form.Control.Feedback>
              )}
            </Form.Group>

            {/* Campo: Categoría */}
            <Form.Group className="mb-3">
              <Form.Label>Categoría</Form.Label>
              <div className="input-wrapper">
                <Form.Select
                  {...register("idCategoria", {
                    required: "La categoría es obligatoria.",
                  })}
                  isInvalid={!!errors.idCategoria}
                  className="input-field"
                >
                  <option value="">Selecciona una categoría...</option>
                  {loadingCategorias ? (
                    <option>Cargando categorías...</option>
                  ) : showErrorCategorias ? (
                    <option>Error al cargar categorías</option>
                  ) : (
                    categoriasModify.map((categoria) => (
                      <option
                        key={categoria.idCategoria}
                        value={categoria.idCategoria}
                      >
                        {categoria.nombreCategoria}
                      </option>
                    ))
                  )}
                </Form.Select>
                <BsChevronDown className="input-icon dropdown-icon" />
              </div>
              {errors.idCategoria && (
                <Form.Control.Feedback type="invalid">
                  {errors.idCategoria.message}
                </Form.Control.Feedback>
              )}
            </Form.Group>

            {/* Campos: Cantidad y Precio */}
            <div className="row gx-2"> {/* Espaciado horizontal entre columnas */}
  <div className="col-6 mb-3">
    <Form.Group>
      <Form.Label>Cantidad</Form.Label>
      <div className="input-wrapper">
        <Form.Control
          type="number"
          placeholder="Ingrese la cantidad"
          {...register("cantidad", {
            required: "La cantidad es obligatoria.",
            min: {
              value: 1,
              message: "La cantidad debe ser mayor a 0.",
            },
          })}
          isInvalid={!!errors.cantidad}
          className="input-field"
        />
        <BsX
          className="input-icon"
          onClick={() => setValue("cantidad", "")}
        />
      </div>
      {errors.cantidad && (
        <Form.Control.Feedback type="invalid">
          {errors.cantidad.message}
        </Form.Control.Feedback>
      )}
    </Form.Group>
  </div>

  <div className="col-6 mb-3">
    <Form.Group>
      <Form.Label>Precio</Form.Label>
      <div className="input-wrapper">
        <Form.Control
          type="number"
          step="0.01"
          placeholder="Ingrese el precio"
          {...register("precio", {
            required: "El precio es obligatorio.",
            min: {
              value: 0.01,
              message: "El precio debe ser mayor a 0.",
            },
          })}
          isInvalid={!!errors.precio}
          className="input-field"
        />
        <BsX
          className="input-icon"
          onClick={() => setValue("precio", "")}
        />
      </div>
      {errors.precio && (
        <Form.Control.Feedback type="invalid">
          {errors.precio.message}
        </Form.Control.Feedback>
      )}
    </Form.Group>
  </div>
</div>

          </Form>
        )}
      </ModalIngreso>


      ;{/* Resto del código (alertas, popups, etc.) */}
      {filteredProductos.length === 0 &&
        !loadigProducts &&
        !showErrorProductos &&
        showInfoProductos && (
          <div className="row justify-content-center">
            <div className="col-md-6 text-center">
              <Alert
                type="primary"
                message="No hay productos ingresados."
                icon={<BsFillInfoCircleFill />}
              />
            </div>
          </div>
        )}
      {showNoResults && (
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <Alert
              type="primary"
              message="No se encontraron productos que coincidan con la búsqueda."
              icon={<BsFillInfoCircleFill />}
            />
          </div>
        </div>
      )}
      {showErrorProductos && !showInfoProductos && (
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <Alert
              type="danger"
              message="Hubo un error al consultar los productos. Intenta más tarde..."
              icon={<BsExclamationTriangleFill />}
            />
          </div>
        </div>
      )}
      <ConfirmPopUp
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        title="Confirmar Eliminación"
        message="Al eliminar el producto no se volverá a mostrar en ninguna parte"
        onConfirm={() =>
          handleConfirmDeletePreoducto(
            productoToDelete,
            setProductos,
            setIsPopupOpen,
            setErrorPopupMessage,
            setIsPopupErrorOpen
          )
        }
        onCancel={() => setIsPopupOpen(false)}
      />
      <ErrorPopup
        isOpen={isPopupErrorOpen}
        onClose={() => setIsPopupErrorOpen(false)}
        title="¡Error!"
        message={errorPopupMessage}
      />
    </div>
  );
};

export default ManageProducts;
