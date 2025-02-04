import React, { useState, useRef, useEffect } from "react"; // Importa useRef y useEffect
import { useForm } from "react-hook-form";
import { BsArrowLeft } from "react-icons/bs";
import Title from "../../../components/Title/Title";
import { useNavigate } from "react-router";
import { Form, Row, Col, Spinner } from "react-bootstrap";
import ImageUploader from "../../../components/ImagenUploager/ImagenUploadre";
import useGetCategorias from "../../../hooks/categorias/UseGetCategorias";
import { handleIngresarProductoSubmit, resetForm } from "./IngresarProductosUtils";
import SuccessPopup from "../../../components/Popup/SuccessPopup";
import ErrorPopup from "../../../components/Popup/ErrorPopUp";

function IngresarProductos() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isPopupErrorOpen, setIsPopupErrorOpen] = useState(false);
  const [errorPopupMessage, setErrorPopupMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isResetImageInput, setIsResetImageInput] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: { idCategoria: "" } });
  const { categorias, loadingCategorias } = useGetCategorias();

  // Referencia para el contenedor de la imagen
  const imagePreviewRef = useRef(null);

  // Efecto para hacer scroll cuando la imagen se carga
  useEffect(() => {
    if (imagePreview && imagePreviewRef.current) {
      imagePreviewRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [imagePreview]);

  // Función para cargar la imagen
  const handleImageChange = (file, imageUrl) => {
    setIsResetImageInput(false);
    setSelectedImage(file);
    setImagePreview(imageUrl);
  };

  // Función para enviar el formulario
  const onSubmit = (data) => {
    handleIngresarProductoSubmit(
      data,
      setSelectedImage,
      selectedImage,
      setImagePreview,
      setIsResetImageInput,
      setIsPopupOpen,
      setErrorPopupMessage,
      setIsPopupErrorOpen,
      setIsLoading,
      reset
    );
  };

  return (
    <div className="container justify-content-center">
      <div className="text-center mb-3">
        <div className="row">
          <div className="col-2">
            <button
              className="btn bt-return rounded-circle d-flex align-items-center justify-content-center shadow"
              style={{ width: "40px", height: "40px" }}
              onClick={() => navigate("/productos")}
            >
              <BsArrowLeft size={20} />
            </button>
          </div>
          <div className="col-8">
            <Title title="Productos" description="Ingreso de productos existentes" />
          </div>
        </div>
      </div>

      <Form onSubmit={handleSubmit(onSubmit)} className="row justify-content-center">
        <div className="col-lg-6 col-md-8 col-sm-10">
          {/* Categoría del producto */}
          <Form.Group className="mb-3">
            <Form.Label className="label-title">Categoría del Producto</Form.Label>
            {loadingCategorias ? (
              <div className="d-flex align-items-center">
                <Spinner animation="border" size="sm" className="me-2" />
                <span>Cargando categorías...</span>
              </div>
            ) : (
              <Form.Select
                {...register("idCategoria", { required: "Debe seleccionar una categoría." })}
                className={`input-data ${errors.idCategoria ? "is-invalid" : ""}`}
                disabled={isLoading}
              >
                <option value="">Selecciona una categoría...</option>
                {categorias.map((categoria) => (
                  <option key={categoria.idCategoria} value={categoria.idCategoria}>
                    {categoria.nombreCategoria}
                  </option>
                ))}
              </Form.Select>
            )}
            {errors.idCategoria && <div className="text-danger">{errors.idCategoria.message}</div>}
          </Form.Group>

          {/* Nombre del producto */}
          <Form.Group className="mb-3">
            <Form.Label className="label-title">Nombre del Producto</Form.Label>
            <div className="position-relative">
              <Form.Control
                id="nombreProducto"
                className="input-data"
                type="text"
                placeholder="Ingrese el nombre del producto"
                {...register("nombreProducto", { required: "El nombre del producto es obligatorio." })}
                isInvalid={!!errors.nombreProducto}
                disabled={isLoading}
              />
              {isLoading && (
                <div
                  className="position-absolute"
                  style={{ top: "50%", right: "10px", transform: "translateY(-50%)" }}
                >
                  <Spinner animation="border" size="sm" />
                </div>
              )}
              <Form.Control.Feedback type="invalid">
                {errors.nombreProducto?.message}
              </Form.Control.Feedback>
            </div>
          </Form.Group>

          {/* Cantidad y precio */}
          <Row className="mb-3">
            <Col xs={6}>
              <Form.Group>
                <Form.Label className="label-title">Cantidad Por Quetzal</Form.Label>
                <Form.Control
                  className="input-data truncate-placeholder"
                  type="number"
                  placeholder="Ingrese la cantidad"
                  {...register("cantidad", {
                    required: "La cantidad es obligatoria.",
                    min: { value: 1, message: "La cantidad debe ser mayor a 0." },
                  })}
                  isInvalid={!!errors.cantidad}
                  disabled={isLoading}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.cantidad?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col xs={6}>
              <Form.Group>
                <Form.Label className="label-title">Precio Q.</Form.Label>
                <Form.Control
                  className="input-data truncate-placeholder"
                  type="number"
                  placeholder="Ingrese el precio"
                  step="0.01"
                  {...register("precio", {
                    required: "El precio es obligatorio.",
                    min: { value: 0.01, message: "El precio debe ser mayor a 0." },
                  })}
                  isInvalid={!!errors.precio}
                  disabled={isLoading}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.precio?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {/* Subida de imagen */}
          <ImageUploader
            onImageChange={handleImageChange}
            imagePreview={imagePreview}
            labelName={"Imagen del producto"}
            isReset={isResetImageInput}
          />

          {/* Botón de enviar */}
          <div className="text-center">
            <button type="submit" className="btn bt-general" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Procesando...
                </>
              ) : (
                "Ingresar Producto"
              )}
            </button>
          </div>
        </div>
      </Form>

      {/* Popups de éxito y error */}
      <SuccessPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        title="¡Éxito!"
        message="El producto ha sido creado con éxito."
        nombreBotonVolver="Ver Productos"
        nombreBotonNuevo="Ingresar Producto"
        onViewRoles={() => navigate("/productos")}
        onNewRole={() => {
          setIsPopupOpen(false);
          resetForm(reset, setSelectedImage, setImagePreview, setIsResetImageInput);
        }}
      />

      <ErrorPopup
        isOpen={isPopupErrorOpen}
        onClose={() => setIsPopupErrorOpen(false)}
        title="¡Error!"
        message={errorPopupMessage}
      />
    </div>
  );
}

export default IngresarProductos;