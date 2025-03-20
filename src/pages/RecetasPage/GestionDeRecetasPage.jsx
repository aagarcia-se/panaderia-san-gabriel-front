import React, { useState } from "react";
import { Container, Row, Col, Accordion, Button, Modal, Form } from "react-bootstrap";
import useGetRecetas from "../../hooks/recetas/useGetRecetas";
import DotsMove from "../../components/Spinners/DotsMove";
import Alert from "../../components/Alerts/Alert";
import { BsExclamationTriangleFill, BsPencil, BsTrash, BsPlus, BsBook, BsClipboardData, BsCalculator, BsFlower1 } from "react-icons/bs";
import "./GestionDeRecetasPage.css"; // Importa el archivo CSS

const GestionDeRecetasPage = () => {
  const { recetas, loadingRecetas, showErrorRecetas, showInfoRecetas, setRecetas } = useGetRecetas();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedReceta, setSelectedReceta] = useState(null);

  const handleAddReceta = () => {
    setShowAddModal(true);
  };

  const handleEditReceta = (receta) => {
    setSelectedReceta(receta);
    setShowEditModal(true);
  };

  const handleDeleteReceta = (receta) => {
    setSelectedReceta(receta);
    setShowDeleteModal(true);
  };

  const handleSaveReceta = (newReceta) => {
    setRecetas([...recetas, newReceta]);
    setShowAddModal(false);
  };

  const handleUpdateReceta = (updatedReceta) => {
    const updatedRecetas = recetas.map(receta =>
      receta.idReceta === updatedReceta.idReceta ? updatedReceta : receta
    );
    setRecetas(updatedRecetas);
    setShowEditModal(false);
  };

  const handleConfirmDelete = () => {
    const filteredRecetas = recetas.filter(receta => receta.idReceta !== selectedReceta.idReceta);
    setRecetas(filteredRecetas);
    setShowDeleteModal(false);
  };

  if (loadingRecetas) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "70vh" }}>
        <DotsMove />
      </Container>
    );
  }

  if (showErrorRecetas) {
    return (
      <Container className="justify-content-center align-items-center my-5">
        <Row className="justify-content-center">
          <Col md={8} className="text-center">
            <Alert
              type="danger"
              message="Hubo un error al consultar los productos y sus ingredientes."
              icon={<BsExclamationTriangleFill />}
            />
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <Row className="mb-4">
        <Col>
          <Button variant="primary" onClick={handleAddReceta} className="d-flex align-items-center">
            <BsPlus className="me-2" /> Agregar Nueva Receta
          </Button>
        </Col>
      </Row>

      <Row>
  <Col>
    <Accordion>
      {/* Mapear las recetas en dos columnas */}
      <Row>
        {recetas.map((receta, index) => (
          <Col key={receta.idReceta} xs={12} md={6} className="mb-3">
            <Accordion.Item eventKey={index.toString()} className="shadow-sm custom-accordion-item">
              <Accordion.Header className="custom-accordion-header">
                <div className="d-flex justify-content-between w-100 align-items-center">
                  <span className="fw-bold d-flex align-items-center">
                    {receta.nombreProducto}
                  </span>
                </div>
              </Accordion.Header>
              <Accordion.Body className="custom-accordion-body">
                <Row>
                  <Col>
                    <p className="d-flex align-items-center">
                      <BsClipboardData className="me-2" style={{ color: "#198754" }} />
                      <strong>Ingrediente:</strong> {receta.nombreIngrediente}
                    </p>
                    <p className="d-flex align-items-center">
                      <BsCalculator className="me-2" style={{ color: "#ffc107" }} />
                      <strong>Cantidad:</strong> {receta.cantidadNecesaria} {receta.unidadMedida}
                    </p>
                  </Col>
                  <Col className="d-flex justify-content-end align-items-center">
                    <Button variant="outline-primary" onClick={() => handleEditReceta(receta)} className="me-2 d-flex align-items-center custom-button">
                      <BsPencil className="me-2" /> Editar
                    </Button>
                    <Button variant="danger" onClick={() => handleDeleteReceta(receta)} className="d-flex align-items-center custom-button-cancel">
                      <BsTrash className="me-2" /> Eliminar
                    </Button>
                  </Col>
                </Row>
              </Accordion.Body>
            </Accordion.Item>
          </Col>
        ))}
      </Row>
    </Accordion>
  </Col>
</Row>

      {/* Modal para agregar nueva receta */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title className="modal-title-center">Nueva Receta</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Producto</Form.Label>
              <Form.Control as="select" className="custom-input">
                <option>Producto 1</option>
                <option>Producto 2</option>
              </Form.Control>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Ingrediente</Form.Label>
              <Form.Control as="select" className="custom-input">
                <option>Ingrediente 1</option>
                <option>Ingrediente 2</option>
              </Form.Control>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Cantidad</Form.Label>
              <Form.Control type="number" placeholder="Cantidad" className="custom-input" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Unidad de Medida</Form.Label>
              <Form.Control type="text" placeholder="Unidad de Medida" className="custom-input" />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)} className="custom-button">
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSaveReceta} className="custom-button">
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para editar receta */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} className="my-2">
        <Modal.Header closeButton>
          <Modal.Title className="modal-title-center">Editar Receta</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {/* Campo de Producto (deshabilitado) */}
            <Form.Group className="mb-3">
              <Form.Label>Producto</Form.Label>
              <Form.Control
                as="select"
                value={selectedReceta?.nombreProducto || ""}
                disabled
                className="custom-input"
              >
                <option>{selectedReceta?.nombreProducto}</option>
              </Form.Control>
            </Form.Group>

            {/* Campo de Ingrediente (deshabilitado) */}
            <Form.Group className="mb-3">
              <Form.Label>Ingrediente</Form.Label>
              <Form.Control
                as="select"
                value={selectedReceta?.nombreIngrediente || ""}
                disabled
                className="custom-input"
              >
                <option>{selectedReceta?.nombreIngrediente}</option>
              </Form.Control>
            </Form.Group>

            {/* Campo de Cantidad (editable) */}
            <Form.Group className="mb-3">
              <Form.Label>Cantidad</Form.Label>
              <Form.Control
                type="number"
                defaultValue={selectedReceta?.cantidadNecesaria || ""}
                onChange={(e) =>
                  setSelectedReceta({
                    ...selectedReceta,
                    cantidadNecesaria: e.target.value,
                  })
                }
                className="custom-input"
              />
            </Form.Group>

            {/* Campo de Unidad de Medida (deshabilitado) */}
            <Form.Group className="mb-3">
              <Form.Label>Unidad de Medida</Form.Label>
              <Form.Control
                type="text"
                value={selectedReceta?.unidadMedida || ""}
                disabled
                className="custom-input"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={() => setShowEditModal(false)} className="custom-button">
            Cancelar
          </Button>
          <Button variant="primary" onClick={() => handleUpdateReceta(selectedReceta)} className="custom-button">
            Guardar Cambios
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para confirmar eliminación */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro de que deseas eliminar la receta de {selectedReceta?.nombreProducto}?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)} className="custom-button">
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete} className="custom-button-cancel">
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default GestionDeRecetasPage;