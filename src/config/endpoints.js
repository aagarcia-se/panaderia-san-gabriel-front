const getEndpoints = {
    ALL_ROLES: "/consultarRoles",
    ALL_PERMISOS: "/consultarPermisos",
    ROL_PERMISOS: "/consultarRolesPermisosId",
    ALL_USERS: "/consultarUsuarios",
    ALL_PRODUCTOSYPRECIOS: "/consultarPrecios"
};

const postEndpoints = {
    INGRESAR_ROL: "/ingresarRol",
    INGRESAR_PERMISOSROLES: "/ingresarPermisosBatch",
    CREAR_USUARIO: "/crearUsuario",
    INICIAR_SESION: "/login",
    INGRESAR_PRODUCTO: "/ingresarProducto",
    INGRESAR_PRECIOPRODUCTO: "/ingresarPrecio",
    INGRESAR_IMAGEN_PRODUCTO: "/ingresar-img-producto"
};

const putEndpoints = {
    ACTUALIZAR_ROL: "/actualizarRol",
    DESBLOQUEAR_USAURIO: "/desbloquearUsuario",
    BLOQUEAR_USUARIO: "/bloquearUsuario",
};

const deleteEndpoints = {
    ELIMINAR_ROL: "/eliminarRol",
    ELINAR_PERMISOS: "eliminarRolPermisosBatch",
    ELMINAR_USUARIOS: "eliminarUsuario",
    DESACTIVAR_PRODUCTOS: "desactivarProducto"
};


export { getEndpoints, postEndpoints, putEndpoints, deleteEndpoints};
export default getEndpoints; // Exportación por defecto

