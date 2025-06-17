const createView = (label, href, children = []) => ({ label, href, children });

const rolesConfig = {
    'Admin': {
        views: [
            createView("Inicio", "/"),
            createView("Inventario", "/inventario"),
            createView("Catálogo PMC", "/proveedores-marcas-y-categorias"),
            createView("Reportes", "/reportes", [
                createView("Ventas", "/reporte-ventas"),
                // createView("Pagos", "/Pagos")
            ]),
            createView("Ordenes", "/Details", [
                createView("Detalles de orden", "/Details")
           
            ]),
         
            createView("Usuarios", "/usuarios"),
            createView("Empleados", "/empleados"),
            createView("Clientes", "/clientes")
        ],
        access: [
            '/agregar-producto',
            '/editar-producto/:id',
            '/proveedores-marcas-y-categorias',
            '/realizar-venta',
            '/agregar-cliente',
            '/editar-cliente/:id',
            '/agregar-usuario', 
            '/editar-usuario/:id', 
            '/cambiar-password/:id',
            '/perfil'
        ],
       
    },
    'Cassier': {
        views: [
            createView("Inicio", "/"),
            createView("Clientes", "/clientes"),
            createView("Inventario", "/inventario"),
            createView("Proveedores, Marcas y Categorías", "/proveedores-marcas-y-categorias"),
            createView("Ordenes", "/Details", [
                createView("Detalles de orden", "/Details"),
            ]),
            createView("Reportes", "/reportes", [
                createView("Ventas", "/reporte-ventas"),
                // createView("Pagos", "/Pagos")
            ]),
         
        ],
        access: [
            '/agregar-producto',
            '/editar-producto/:id',
            '/proveedores-marcas-y-categorias',
            '/realizar-venta',
            '/agregar-cliente',
            '/editar-cliente/:id',
            '/perfil',
        ],
    
    }
};

export default rolesConfig;
