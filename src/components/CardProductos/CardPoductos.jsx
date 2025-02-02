import React, { useRef, useState, useEffect } from "react";
import "./CardProductos.css"; // Asegúrate de que este archivo CSS tenga los estilos necesarios
import { FaEllipsisH, FaTrash, FaEdit } from "react-icons/fa";

const CardProductos = ({
  id,
  nombreProducto,
  cantidad,
  precio,
  image,
  showOptions,
  onOptionsClick,
  onModify,
  onDelete,
}) => {
  const modalRef = useRef(null);
  const buttonRef = useRef(null);
  const [position, setPosition] = useState("bottom");
  const [isOptionsVisible, setIsOptionsVisible] = useState(showOptions);

  useEffect(() => {
    setIsOptionsVisible(showOptions);
  }, [showOptions]);

  useEffect(() => {
    if (isOptionsVisible && modalRef.current && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      if (buttonRect.bottom + 200 > viewportHeight) {
        setPosition("top");
      } else {
        setPosition("bottom");
      }
    }
  }, [isOptionsVisible]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        isOptionsVisible &&
        modalRef.current &&
        !modalRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOptionsVisible(false);
      }
    };

    document.addEventListener("click", handleOutsideClick);

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [isOptionsVisible]);

  const getInitial = (name) => {
    const words = name.split(" "); // Divide el nombre en palabras
    const initials = words.slice(0, 1).map(word => word.charAt(0).toUpperCase()); // Toma la inicial de la primera palabra
  
    // Si hay más de dos palabras, agrega la inicial de la tercera palabra
    if (words.length > 2) {
      initials.push(words[2].charAt(0).toUpperCase());
    } else if (words.length > 1) {
      initials.push(words[1].charAt(0).toUpperCase()); // Si hay solo dos palabras, toma la inicial de la segunda
    }
  
    return initials.join(""); // Une las iniciales
  };

  const getRandomColor = (name) => {
    const colors = [
        "#F44336", "#2196F3", "#4CAF50", "#FF9800", "#9C27B0", "#3F51B5",
        "#E91E63", "#00BCD4", "#8BC34A", "#FFC107", "#673AB7", "#607D8B",
        "#FFEB3B", "#795548", "#CDDC39", "#FF5722", "#9E9E9E", "#000000",
        "#1B5E20", "#B71C1C", "#4A148C", "#1A237E", "#004D40", "#880E4F",
        "#3E2723", "#212121", "#FFD600", "#00C853", "#C51162", "#AA00FF",
        "#6200EA", "#304FFE", "#2962FF", "#00BFA5", "#64DD17", "#AEEA00",
        "#FF6D00", "#DD2C00", "#37474F", "#455A64", "#546E7A", "#1DE9B6",
        "#00E5FF", "#18FFFF", "#84FFFF", "#A7FFEB", "#B9F6CA", "#CCFF90",
        "#F4FF81", "#FFFF8D", "#FFE57F", "#FFD740", "#FFAB40", "#FF6E40"
      ];
    const index = name.length % colors.length;
    return colors[index];
  };

  const AvatarContent = () => {
    const avatarSize = 80;

    if (image) {
      return (
        <img
          src={image}
          alt={nombreProducto}
          className="rounded-circle flex-shrink-0 me-3"
          style={{
            width: `${avatarSize}px`,
            height: `${avatarSize}px`,
            objectFit: "cover",
          }}
        />
      );
    }

    return (
      <div
        className="me-3 d-flex align-items-center justify-content-center flex-shrink-0"
        style={{
          width: `${avatarSize}px`,
          height: `${avatarSize}px`,
          backgroundColor: getRandomColor(nombreProducto),
          color: "white",
          fontSize: "1.5rem",
          fontWeight: "bold",
          borderRadius: "10px",
        }}
      >
        {getInitial(nombreProducto)}
      </div>
    );
  };

  const handleOptionClick = (action, event) => {
    event.stopPropagation();

    switch (action) {
      case "modify":
        if (onModify) onModify(id);
        break;
      case "delete":
        if (onDelete) onDelete(id);
        break;
      default:
        break;
    }

    // Cierra el modal después de realizar una acción
    setIsOptionsVisible(false);
  };

  return (
    <div className="card-users friend-card d-flex justify-content-between align-items-center p-3 mb-2">
      <div className="d-flex align-items-center flex-grow-1">
        <AvatarContent />
        <div>
          <h6 className="mb-0">{nombreProducto}</h6>
          <small className="text-muted d-block fw-bold">{``}</small>
          <span
            className="d-block mt-1 fw-bold"
            style={{
              color: "#1463C2",
              fontSize: "0.85rem",
              fontWeight: "500",
            }}
          >
            {`${cantidad} X Q.${parseFloat(precio).toFixed(2)}`}
          </span>
        </div>
      </div>
      <div className="position-relative ms-4 options-container">
        <button
          ref={buttonRef}
          className="btn-modal btn rounded-circle p-2"
          onClick={() => setIsOptionsVisible(!isOptionsVisible)}
        >
          <FaEllipsisH />
        </button>
        {isOptionsVisible && (
          <div
            ref={modalRef}
            className="options-modal position-absolute bg-white shadow rounded p-2"
            style={{
              zIndex: 1000,
              minWidth: "200px",
              [position === "top" ? "bottom" : "top"]: "100%",
              right: 0,
              transform:
                position === "top" ? "translateY(-10px)" : "translateY(10px)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="btn btn-light w-100 text-start mb-1"
              onClick={(e) => handleOptionClick("modify", e)}
            >
              <FaEdit className="me-2" />
              Modificar
            </button>
            <button
              className="btn btn-light w-100 text-start"
              onClick={(e) => handleOptionClick("delete", e)}
              style={{ color: "#dc3545" }}
            >
              <FaTrash className="me-2" />
              Eliminar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CardProductos;