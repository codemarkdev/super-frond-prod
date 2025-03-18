const createView = (label, href, children = []) => ({ label, href, children });

const rolesConfig = {
    'Admin': {
        views: [
            createView("Inicio", "/"),
            createView("Inventario", "/inventario"),
            createView("Proveedores, Marcas y Categorías", "/proveedores-marcas-y-categorias"),
            createView("Reportes", "/reportes", [
                createView("Ventas", "/reporte-ventas"),
                // createView("Pagos", "/Pagos")
            ]),
            createView("Usuarios", "/usuarios"),
            createView("Empleados", "/empleados"),
            createView("Clientes", "/clientes")
        ]
    },
    'Cassier': {
        views: [
            createView("Inicio", "/"),
            createView("Clientes", "/clientes"),
            createView("Inventario", "/inventario")
        ]
    }
};

export default rolesConfig;
