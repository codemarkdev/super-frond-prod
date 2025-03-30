<template>
  <div class="order-details">
  <div class="page-header">
    <i class="fas fa-boxes header-icon"></i>
    <h2>Detalles de Orden</h2>
  </div>
  
  <!-- Implementando tabs de Bulma -->
  <div class="tabs is-boxed mb-4">
    <ul>

      <li :class="{ 'is-active': activeTab === 'crear' }">
        <a @click="cambiarTab('crear')">
          <span class="icon is-small"><i class="fas fa-plus-circle"></i></span>
          <span>Crear Orden</span>
        </a>
      </li>
      <li :class="{ 'is-active': activeTab === 'activos' }">
        <a @click="cambiarTab('activos')">
          <span class="icon is-small"><i class="fas fa-file-invoice"></i></span>
          <span>Registrar Orden</span>
        </a>
      </li>
     
      <li :class="{ 'is-active': activeTab === 'ordenes' }">
        <a @click="cambiarTab('ordenes')">
          <span class="icon is-small"><i class="fas fa-list-alt"></i></span>
          <span>Órdenes Registradas</span>
        </a>
      </li>
      <li :class="{ 'is-active': activeTab === 'ordenesLista' }">
        <a @click="cambiarTab('ordenesLista')">
          <span class="icon is-small"><i class="fas fa-clipboard-list"></i></span>
          <span>Lista de Órdenes</span>
        </a>
      </li>
      <li :class="{ 'is-active': activeTab === 'buscar' }">
        <a @click="cambiarTab('buscar')">
          <span class="icon is-small"><i class="fas fa-search"></i></span>
          <span>Buscar Orden</span>
        </a>
      </li>
      <!-- Solo mostrar la pestaña de Órdenes Eliminadas si el usuario es admin -->
      <li v-if="esAdmin" :class="{ 'is-active': activeTab === 'eliminados' }">
        <a @click="cambiarTab('eliminados')">
          <span class="icon is-small"><i class="fas fa-archive"></i></span>
          <span>Órdenes Eliminadas</span>
        </a>
      </li>
      <!-- Solo mostrar la pestaña de Pedidos Eliminados si el usuario es admin -->
      <li v-if="esAdmin" :class="{ 'is-active': activeTab === 'pedidosEliminados' }">
        <a @click="cambiarTab('pedidosEliminados')">
          <span class="icon is-small"><i class="fas fa-trash-restore"></i></span>
          <span>Pedidos Eliminados</span>
        </a>
      </li>
    </ul>
  </div>
  
  <!-- Contenido de la pestaña activa -->
  <div v-if="activeTab === 'activos'">
    <div class="layout-container">
      <!-- Columna única: Formulario de Registro -->
      <div class="full-column">
        <div class="section">
          <div class="section-header">
            <div class="header-left">
              <i class="fas fa-plus-circle section-icon"></i>
              <h3>Registrar Detalle de Orden</h3>
            </div>
          </div>
  
          <div class="section-content">
            <form @submit.prevent="registrarDetalle" class="form">
              <!-- Número de factura -->
              <div class="form-group">
                <label for="invoiceNumber">
                  <i class="fas fa-file-invoice label-icon"></i> Número de factura:
                </label>
                <div class="input-wrapper">
                  <input type="text" id="invoiceNumber" v-model="ordenActual.invoiceNumber"
                    class="form-control" placeholder="Ej: INV-2514" required />
                </div>
              </div>
  
              <!-- Lista de productos en la orden -->
              <div class="products-list-section">
                <div class="section-subheader">
                  <h4><i class="fas fa-list"></i> Productos en esta orden</h4>
                  <button type="button" @click="agregarProductoALista" class="btn btn-add">
                    <i class="fas fa-plus"></i> Agregar producto
                  </button>
                </div>
  
                <!-- Mensaje si no hay productos -->
                <div v-if="ordenActual.products.length === 0" class="message">
                  <i class="fas fa-info-circle message-icon"></i>
                  <span>No hay productos agregados a esta orden. Haga clic en "Agregar producto" para
                    comenzar.</span>
                </div>
  
                <!-- Lista de productos agregados -->
                <div v-else class="products-list">
                  <div v-for="(producto, index) in ordenActual.products" :key="index"
                    class="product-item">
                    <div class="product-item-header">
                      <h5>
                        <i class="fas fa-box"></i>
                        {{ producto.name || (producto.productId ? `Producto ID:
                        ${producto.productId}` : `Producto #${index + 1}`) }}
                      </h5>
                      <button type="button" @click="eliminarProducto(index)" class="btn-remove">
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
  
                    <div class="product-item-body">
                      <!-- Si es producto existente o nuevo -->
                      <div class="form-group checkbox-group">
                        <label class="switch-label">Tipo de producto:</label>
                        <div class="switch-options">
                          <label class="switch-option"
                            :class="{ 'active': producto.esExistente }">
                            <input type="radio" :name="`tipoProducto_${index}`"
                              :value="true" v-model="producto.esExistente">
                            <i class="fas fa-database"></i> Existente
                          </label>
                          <label class="switch-option"
                            :class="{ 'active': !producto.esExistente }">
                            <input type="radio" :name="`tipoProducto_${index}`"
                              :value="false" v-model="producto.esExistente">
                            <i class="fas fa-plus-circle"></i> Nuevo
                          </label>
                        </div>
                      </div>
  
                      <!-- Si es producto existente -->
                      <div v-if="producto.esExistente" class="form-row">
                        <div class="form-group product-id-group">
                          <label :for="`productId_${index}`">
                            <i class="fas fa-hashtag label-icon"></i> ID del producto:
                          </label>
                          <div class="input-wrapper product-id-wrapper">
                            <input type="number" :id="`productId_${index}`"
                              v-model="producto.productId" class="form-control"
                              placeholder="Ej: 1" required />
                            <button type="button" @click="buscarProducto(index)"
                              class="btn btn-search"
                              :disabled="!producto.productId || producto.cargando">
                              <i class="fas"
                                :class="producto.cargando ? 'fa-spinner fa-spin' : 'fa-search'"></i>
                              {{ producto.cargando ? 'Buscando...' : 'Buscar' }}
                            </button>
                          </div>
                        </div>
                      </div>
  
                      <!-- Mensaje de error si no se encuentra el producto -->
                      <div v-if="producto.error" class="message error product-error">
                        <i class="fas fa-exclamation-circle message-icon"></i>
                        <span>{{ producto.error }}</span>
                      </div>
  
                      <!-- Si es producto nuevo o si se encontró el producto existente -->
                      <div
                        v-if="!producto.esExistente || (producto.esExistente && producto.encontrado)">
                        <!-- Información del producto encontrado -->
                        <div v-if="producto.esExistente && producto.encontrado"
                          class="product-found-info">
                          <div class="product-info-header">
                            <i class="fas fa-info-circle"></i> Información del producto
                            encontrado
                          </div>
                          <div class="product-info-content">
                            <div class="info-row">
                              <span class="info-label">Código:</span>
                              <span class="info-value">{{ producto.code }}</span>
                            </div>
                            <div class="info-row">
                              <span class="info-label">Nombre:</span>
                              <span class="info-value">{{ producto.name }}</span>
                            </div>
                            <div class="info-row">
                              <span class="info-label">Categoría:</span>
                              <span class="info-value">
                                {{ producto.category ? producto.category.categoryName : 'No especificada' }}
                              </span>
                            </div>
                            <div class="info-row">
                              <span class="info-label">Marca:</span>
                              <span class="info-value">
                                {{ producto.brand ? producto.brand.brandName : 'No especificada' }}
                              </span>
                            </div>
                            <div class="info-row">
                              <span class="info-label">Stock actual:</span>
                              <span class="info-value">{{ producto.stock }}
                                unidades</span>
                            </div>
                            <div class="info-row">
                              <span class="info-label">Precio de venta:</span>
                              <span class="info-value">{{
                                formatearMoneda(producto.salePrice) }}</span>
                            </div>
                          </div>
                        </div>
  
                        <!-- Tabs para organizar la información del producto -->
                        <div class="product-tabs">
                          <div class="tab-headers">
                            <div class="tab-header"
                              :class="{ 'active': producto.activeTab === 'info' }"
                              @click="producto.activeTab = 'info'">
                              <i class="fas fa-info-circle"></i> Información
                            </div>
                            <div class="tab-header"
                              :class="{ 'active': producto.activeTab === 'prices' }"
                              @click="producto.activeTab = 'prices'">
                              <i class="fas fa-tag"></i> Precios
                            </div>
                            <div class="tab-header"
                              :class="{ 'active': producto.activeTab === 'wholesale' }"
                              @click="producto.activeTab = 'wholesale'">
                              <i class="fas fa-truck"></i> Mayoreo
                            </div>
                            <div class="tab-header"
                              :class="{ 'active': producto.activeTab === 'tax' }"
                              @click="producto.activeTab = 'tax'">
                              <i class="fas fa-percentage"></i> Impuestos
                            </div>
                          </div>
  
                          <div class="tab-content">
                            <!-- Tab: Información Básica -->
                            <div v-show="producto.activeTab === 'info'" class="tab-pane">
                              <div v-if="!producto.esExistente" class="form-row">
                                <div class="form-group half">
                                  <label :for="`code_${index}`">
                                    <i class="fas fa-barcode label-icon"></i>
                                    Código:
                                  </label>
                                  <div class="input-wrapper">
                                    <input type="text" :id="`code_${index}`"
                                      v-model="producto.code" class="form-control"
                                      placeholder="Ej: PROD123" required />
                                  </div>
                                </div>
                                <div class="form-group half">
                                  <label :for="`name_${index}`">
                                    <i class="fas fa-tag label-icon"></i> Nombre:
                                  </label>
                                  <div class="input-wrapper">
                                    <input type="text" :id="`name_${index}`"
                                      v-model="producto.name" class="form-control"
                                      placeholder="Ej: Laptop Gamer" required />
                                  </div>
                                </div>
                              </div>
  
                              <div v-if="!producto.esExistente" class="form-row">
                                <div class="form-group half">
                                  <label :for="`brandId_${index}`">
                                    <i class="fas fa-copyright label-icon"></i>
                                    Marca:
                                  </label>
                                  <div class="input-wrapper">
                                    <select :id="`brandId_${index}`"
                                      v-model="producto.brandId"
                                      class="form-control" required>
                                      <option value="" disabled>Seleccione una
                                        marca</option>
                                      <option v-for="marca in marcas"
                                        :key="marca.id" :value="marca.id">
                                        {{ marca.brandName }}
                                      </option>
                                    </select>
                                  </div>
                                </div>
                                <div class="form-group half">
                                  <label :for="`categoryId_${index}`">
                                    <i class="fas fa-folder label-icon"></i>
                                    Categoría:
                                  </label>
                                  <div class="input-wrapper">
                                    <select :id="`categoryId_${index}`"
                                      v-model="producto.categoryId"
                                      class="form-control" required>
                                      <option value="" disabled>Seleccione una
                                        categoría</option>
                                      <option v-for="categoria in categorias"
                                        :key="categoria.id"
                                        :value="categoria.id">
                                        {{ categoria.categoryName }}
                                      </option>
                                    </select>
                                  </div>
                                </div>
                              </div>
  
                              <div class="form-group">
                                <label :for="`quantity_${index}`">
                                  <i class="fas fa-sort-numeric-up label-icon"></i>
                                  Cantidad:
                                </label>
                                <div class="input-wrapper">
                                  <input type="number" :id="`quantity_${index}`"
                                    v-model="producto.quantity" class="form-control"
                                    placeholder="Ej: 10" min="1" required />
                                </div>
                              </div>
                            </div>
  
                            <!-- Tab: Precios -->
                            <div v-show="producto.activeTab === 'prices'" class="tab-pane">
                              <div class="form-row">
                                <div class="form-group half">
                                  <label :for="`purchasePrice_${index}`">
                                    <i class="fas fa-shopping-cart label-icon"></i>
                                    Precio de compra:
                                  </label>
                                  <div class="input-wrapper">
                                    <input type="number"
                                      :id="`purchasePrice_${index}`"
                                      v-model="producto.purchasePrice"
                                      class="form-control" placeholder="Ej: 1200"
                                      step="0.01" min="0" required />
                                  </div>
                                </div>
                                <div v-if="!producto.esExistente"
                                  class="form-group half">
                                  <label :for="`salePrice_${index}`">
                                    <i class="fas fa-tag label-icon"></i> Precio de
                                    venta:
                                  </label>
                                  <div class="input-wrapper">
                                    <input type="number" :id="`salePrice_${index}`"
                                      v-model="producto.salePrice"
                                      class="form-control" placeholder="Ej: 1500"
                                      step="0.01" min="0" required />
                                  </div>
                                </div>
                              </div>
  
                              <div v-if="!producto.esExistente" class="form-row">
                                <div class="form-group">
                                  <label :for="`touristPrice_${index}`">
                                    <i class="fas fa-plane label-icon"></i> Precio turista:
                                  </label>
                                  <div class="input-wrapper">
                                    <input type="number"
                                      :id="`touristPrice_${index}`"
                                      v-model="producto.touristPrice"
                                      class="form-control" placeholder="Ej: 1500"
                                      step="0.01" min="0" required />
                                  </div>
                                </div>
                              </div>
                            </div>
  
                            <!-- Tab: Mayoreo -->
                            <div v-show="producto.activeTab === 'wholesale'" class="tab-pane">
                              <div class="form-group checkbox-group">
  <label class="switch-label">
    <i class="fas fa-truck label-icon"></i> Esta opción permite al usuario poner los productos con precio para mayorista:
  </label>
  <div class="orden-switch-wrapper">
    <label class="orden-switch">
      <input type="checkbox" v-model="producto.wholesaleSale">
      <span class="orden-slider round"></span>
    </label>
    <span class="switch-text">{{ producto.wholesaleSale ? 'Habilitado' : 'Deshabilitado' }}</span>
  </div>
</div>
  
                              <!-- Información de mayoreo -->
                              <div class="wholesale-section" v-if="producto.wholesaleSale">
                                <div class="form-row">
                                  <div class="form-group half">
                                    <label :for="`wholesalePrice_${index}`">
                                      <i class="fas fa-money-bill-wave label-icon"></i>
                                      Precio mayorista:
                                    </label>
                                    <div class="input-wrapper">
                                      <input type="number"
                                        :id="`wholesalePrice_${index}`"
                                        v-model="producto.wholesalePrice"
                                        class="form-control"
                                        placeholder="Ej: 1100" step="0.01"
                                        min="0" required />
                                    </div>
                                  </div>
                                  <div class="form-group half">
                                    <label :for="`wholesaleQuantity_${index}`">
                                      <i class="fas fa-sort-amount-up label-icon"></i>
                                      Cantidad mínima:
                                    </label>
                                    <div class="input-wrapper">
                                      <input type="number"
                                        :id="`wholesaleQuantity_${index}`"
                                        v-model="producto.wholesaleQuantity"
                                        class="form-control"
                                        placeholder="Ej: 10" min="1" required />
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <!-- Mensaje cuando está deshabilitado -->
                              <div class="wholesale-info" v-if="!producto.wholesaleSale">
                                <i class="fas fa-info-circle"></i>
                                <span>La venta al por mayor está deshabilitada para este producto.</span>
                              </div>
                            </div>
  
                            <!-- Tab: Impuestos -->
                            <div v-show="producto.activeTab === 'tax'" class="tab-pane">
                              <div class="tax-info">
                                <div class="tax-header">
                                  <i class="fas fa-info-circle"></i> Información de
                                  impuestos
                                </div>
                                <div class="tax-content">
                                  <p>Los impuestos se calcularán automáticamente en el
                                    servidor basados en el precio de compra.</p>
  
                                  <div class="tax-preview">
                                    <div class="tax-preview-row">
                                      <span class="tax-label">Precio
                                        unitario:</span>
                                      <span class="tax-value">{{
                                        formatearMoneda(producto.purchasePrice)
                                        }}</span>
                                    </div>
                                    <div class="tax-preview-row">
                                      <span class="tax-label">IVA estimado
                                        (13%):</span>
                                      <span class="tax-value">{{
                                        formatearMoneda(calcularIVAEstimado(producto.purchasePrice))
                                        }}</span>
                                    </div>
                                    <div class="tax-preview-row">
                                      <span class="tax-label">Cantidad:</span>
                                      <span class="tax-value">{{ producto.quantity
                                        || 0 }}</span>
                                    </div>
                                    <div class="tax-preview-row total-row">
                                      <span class="tax-label">Total estimado con
                                        IVA:</span>
                                      <span class="tax-value total-value">{{
                                        formatearMoneda(calcularTotalConIVA(producto))
                                        }}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
  
              <!-- Botones de acción -->
              <div class="form-actions">
                <button type="button" @click="limpiarFormulario" class="btn btn-secondary">
                  <i class="fas fa-times"></i> Cancelar
                </button>
                <button type="submit" class="btn btn-primary" :disabled="enviando || !ordenValida">
                  <i class="fas fa-save"></i> {{ enviando ? 'Registrando...' : 'Registrar Orden' }}
                </button>
              </div>
  
              <!-- Mensajes de error y éxito -->
              <div v-if="error" class="message error">
                <i class="fas fa-exclamation-circle message-icon"></i>
                <span>{{ error }}</span>
              </div>
  
              <div v-if="exitoso" class="message success">
                <i class="fas fa-check-circle message-icon"></i>
                <span>Orden registrada exitosamente.</span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Componente CreateOrden -->
  <create-orden v-else-if="activeTab === 'crear'" />
  
  <!-- Componente Ordenes -->
  <ordenes v-else-if="activeTab === 'ordenes'" />
  
  <!-- Componente OrdenesLista -->
  <ordenes-lista v-else-if="activeTab === 'ordenesLista'" />
  
  <!-- Componente BuscarDetails -->
  <buscar-details v-else-if="activeTab === 'buscar'" />
  
  <!-- Componente Details-eliminados (solo si el usuario es admin) -->
  <details-eliminados v-else-if="activeTab === 'eliminados' && esAdmin" @detalle-restaurado="onDetalleRestaurado" />
  
  <!-- Componente OrderDelets (solo si el usuario es admin) -->
  <order-delets v-else-if="activeTab === 'pedidosEliminados' && esAdmin" @orden-restaurada="onOrdenRestaurada" />
  </div>
  </template>
  
  <script>
  import apiRequest from '@/Servicios/HttpService';
  import AyudanteSesion from '@/Servicios/AyudanteSesion';
  import '@/components/stilos/order-details.css';
  import DetailsEliminados from '../OrdenesDetalles/Details-eliminados.vue';
  import BuscarDetails from './BusacarDetails.vue';
  import CreateOrden from './CreateOrden.vue';
  import Ordenes from './Ordenes.vue';
  import OrdenesLista from './OrdenesLista.vue';
  import OrderDelets from './OrderDelets.vue';
  
  export default {
  name: 'OrderDetails',
  components: {
  DetailsEliminados,
  BuscarDetails,
  CreateOrden,
  Ordenes,
  OrdenesLista,
  OrderDelets
  },
  
  data() {
  return {
    // Tab activa
    activeTab: 'activos',
    
    // Datos de la orden actual
    ordenActual: {
      invoiceNumber: '',
      products: []
    },
  
    // Estado del formulario
    enviando: false,
    error: null,
    exitoso: false,
  
    // Datos para selects
    categorias: [],
    marcas: [],
    cargandoCategorias: false,
    cargandoMarcas: false,
    
    // Estado de administrador
    esAdmin: false
  };
  },
  
  computed: {
  ordenValida() {
    // Verificar si hay al menos un producto y todos los productos tienen los campos requeridos
    if (this.ordenActual.products.length === 0) return false;
  
    return this.ordenActual.invoiceNumber &&
      this.ordenActual.products.every(p => {
        if (p.esExistente) {
          return p.productId && p.quantity && p.purchasePrice;
        } else {
          return p.code && p.name && p.purchasePrice && p.salePrice &&
            p.touristPrice && p.quantity && p.brandId && p.categoryId;
        }
      });
  }
  },
  
  created() {
  // Cargar categorías y marcas al iniciar el componente
  this.cargarCategorias();
  this.cargarMarcas();
  
  // Verificar si el usuario es administrador
  this.verificarAdmin();
  },
  
  methods: {
  // Método para verificar si el usuario es administrador
  verificarAdmin() {
    // Obtener el rol del usuario desde AyudanteSesion
    const datosUsuario = AyudanteSesion.obtenerDatosSesion();
    this.esAdmin = datosUsuario.rol === 'Admin';
    
    // Si el usuario no es admin y está en la pestaña de eliminados, cambiar a la pestaña activos
    if (!this.esAdmin && (this.activeTab === 'eliminados' || this.activeTab === 'pedidosEliminados')) {
      this.activeTab = 'activos';
    }
  },
  
  cambiarTab(tab) {
    // Si intenta acceder a la pestaña de eliminados y no es admin, no permitir el cambio
    if ((tab === 'eliminados' || tab === 'pedidosEliminados') && !this.esAdmin) {
      this.$buefy.toast.open({
        message: 'No tiene permisos para acceder a esta sección',
        type: 'is-danger'
      });
      return;
    }
    
    this.activeTab = tab;
  },
  
  onDetalleRestaurado() {
    // Podemos realizar alguna acción cuando un detalle es restaurado
    this.$buefy.toast.open({
      message: 'Detalle restaurado correctamente',
      type: 'is-success'
    });
  },
  
  onOrdenRestaurada() {
    // Podemos realizar alguna acción cuando una orden es restaurada
    this.$buefy.toast.open({
      message: 'Pedido restaurado correctamente',
      type: 'is-success'
    });
  },
  
  async cargarCategorias() {
    this.cargandoCategorias = true;
    try {
      const response = await apiRequest({
        method: 'GET',
        path: 'categories'
      });
  
      if (response.status === 200) {
        this.categorias = response.data;
      } else {
        console.error('Error al cargar categorías:', response.status);
      }
    } catch (err) {
      console.error('Error al cargar categorías:', err);
    } finally {
      this.cargandoCategorias = false;
    }
  },
  
  async cargarMarcas() {
    this.cargandoMarcas = true;
    try {
      const response = await apiRequest({
        method: 'GET',
        path: 'brands'
      });
  
      if (response.status === 200) {
        this.marcas = response.data;
      } else {
        console.error('Error al cargar marcas:', response.status);
      }
    } catch (err) {
      console.error('Error al cargar marcas:', err);
    } finally {
      this.cargandoMarcas = false;
    }
  },
  
  obtenerNombreCategoria(categoriaId) {
    if (!categoriaId) return '';
    
    // Asegurarse de que categoriaId sea un número
    const catId = parseInt(categoriaId);
    const categoria = this.categorias.find(c => c.id === catId);
    
    // Si tenemos un ID de categoría pero no encontramos la categoría
    if (!categoria) {
      // Si las categorías no están cargadas o están cargando, mostrar mensaje de carga
      if (this.categorias.length === 0 || this.cargandoCategorias) {
        // Intentar cargar las categorías si no están cargando ya
        if (!this.cargandoCategorias) {
          this.cargarCategorias();
        }
        return 'Cargando...';
      }
      // Si las categorías están cargadas pero no encontramos esta, mostrar el ID
      return `Categoría ID: ${catId}`;
    }
    
    return categoria.categoryName;
  },
  
  obtenerNombreMarca(marcaId) {
    if (!marcaId) return '';
    
    // Asegurarse de que marcaId sea un número
    const brandId = parseInt(marcaId);
    const marca = this.marcas.find(m => m.id === brandId);
    
    // Si tenemos un ID de marca pero no encontramos la marca
    if (!marca) {
      // Si las marcas no están cargadas o están cargando, mostrar mensaje de carga
      if (this.marcas.length === 0 || this.cargandoMarcas) {
        // Intentar cargar las marcas si no están cargando ya
        if (!this.cargandoMarcas) {
          this.cargarMarcas();
        }
        return 'Cargando...';
      }
      // Si las marcas están cargadas pero no encontramos esta, mostrar el ID
      return `Marca ID: ${brandId}`;
    }
    
    return marca.brandName;
  },
  
  agregarProductoALista() {
    this.ordenActual.products.push({
      esExistente: true,
      productId: null,
      code: '',
      name: '',
      purchasePrice: null,
      salePrice: null,
      touristPrice: null,
      quantity: null,
      reservedStock: 0,
      brandId: null,
      categoryId: null,
      wholesaleSale: false,
      wholesalePrice: null,
      wholesaleQuantity: null,
      cargando: false,
      error: null,
      encontrado: false,
      activeTab: 'info'
    });
  },
  
  eliminarProducto(index) {
    this.ordenActual.products.splice(index, 1);
  },
  
  async buscarProducto(index) {
    const producto = this.ordenActual.products[index];
    if (!producto.productId) return;
  
    producto.cargando = true;
    producto.error = null;
  
    try {
      const response = await apiRequest({
        method: 'GET',
        path: `products/${producto.productId}`
      });
  
      if (response.status === 200) {
        // Producto encontrado, cargar sus datos
        const productoData = response.data;
  
        producto.code = productoData.code;
        producto.name = productoData.name;
        producto.purchasePrice = parseFloat(productoData.purchasePrice);
        producto.salePrice = parseFloat(productoData.salePrice);
        producto.touristPrice = parseFloat(productoData.touristPrice);
        producto.stock = productoData.stock;
        producto.reservedStock = productoData.reservedStock || 0;
        
        // Guardar los objetos completos de marca y categoría
        producto.brand = productoData.brand;
        producto.category = productoData.category;
        
        // Mantener los IDs para compatibilidad con el resto del código
        producto.brandId = productoData.brand.id;
        producto.categoryId = productoData.category.id;
  
        // Datos de mayoreo
        producto.wholesaleSale = productoData.wholesaleSale || false;
        producto.wholesalePrice = parseFloat(productoData.wholesalePrice) || 0;
        producto.wholesaleQuantity = parseInt(productoData.wholesaleQuantity) || 10;
  
        producto.encontrado = true;
      } else {
        producto.error = `Error ${response.status}: No se pudo encontrar el producto`;
        producto.encontrado = false;
      }
    } catch (err) {
      producto.error = err.message || 'Error al buscar el producto';
      producto.encontrado = false;
    } finally {
      producto.cargando = false;
    }
  },
  
  async verificarOrdenExistente(invoiceNumber) {
    try {
      const response = await apiRequest({
        method: 'GET',
        path: 'orders'
      });
  
      if (response.status === 200 && Array.isArray(response.data)) {
        // Buscar la orden con el número de factura proporcionado
        const ordenExistente = response.data.find(orden => 
          orden.invoiceNumber.trim().toLowerCase() === invoiceNumber.trim().toLowerCase()
        );
        
        return ordenExistente || null;
      }
      return null;
    } catch (err) {
      console.error('Error al verificar orden existente:', err);
      return null;
    }
  },
  
  async registrarDetalle() {
    this.enviando = true;
    this.error = null;
    this.exitoso = false;
  
    try {
      // Validar que el número de factura no esté vacío
      const invoiceNumber = this.ordenActual.invoiceNumber.trim();
      if (!invoiceNumber) {
        this.error = "Debe proporcionar un número de factura válido";
        this.enviando = false;
        return;
      }
  
      // Validar que haya al menos un producto
      if (this.ordenActual.products.length === 0) {
        this.error = "Debe agregar al menos un producto a la orden";
        this.enviando = false;
        return;
      }
  
      // Verificar si la orden existe
      const ordenExistente = await this.verificarOrdenExistente(invoiceNumber);
      
      if (!ordenExistente) {
        this.error = `No se encontró ninguna orden con el número de factura "${invoiceNumber}". Por favor, cree primero la orden en la pestaña "Crear Orden".`;
        this.enviando = false;
        return;
      }
  
      const productos = [...this.ordenActual.products]; // Copia para no modificar el original
  
      // Array para almacenar las respuestas de cada producto
      const respuestas = [];
      let hayError = false;
  
      // Procesar cada producto individualmente
      for (let i = 0; i < productos.length; i++) {
        const p = productos[i];
        let productoData;
  
        if (p.esExistente) {
          // Si es producto existente, SOLO enviar ID, cantidad y precio
          productoData = {
            productId: parseInt(p.productId),
            quantity: parseInt(p.quantity),
            purchasePrice: parseFloat(p.purchasePrice)
          };
        } else {
          // Si es producto nuevo, enviar todos los datos necesarios
          productoData = {
            code: p.code,
            name: p.name,
            purchasePrice: parseFloat(p.purchasePrice),
            salePrice: parseFloat(p.salePrice),
            touristPrice: parseFloat(p.touristPrice),
            quantity: parseInt(p.quantity),
            brandId: parseInt(p.brandId),
            categoryId: parseInt(p.categoryId),
            // Datos de mayoreo - ahora opcionales
            wholesaleSale: p.wholesaleSale
          };
  
          // Solo agregar estos campos si wholesaleSale está habilitado
          if (p.wholesaleSale) {
            productoData.wholesalePrice = parseFloat(p.wholesalePrice) || parseFloat(p.salePrice) * 0.9;
            productoData.wholesaleQuantity = parseInt(p.wholesaleQuantity) || 10;
          }
        }
  
        // Crear objeto de orden para un solo producto
        const ordenData = {
          invoiceNumber: invoiceNumber,
          isActive: true,
          products: [productoData]
        };
  
        try {
          const response = await apiRequest({
            method: 'POST',
            path: 'order-details',
            data: ordenData
          });
  
          if (response.status === 201 || response.status === 200) {
            // Guardar la respuesta
            respuestas.push(response.data[0]);
          } else {
            hayError = true;
            this.error = `Error ${response.status} en producto ${i + 1}: ${response.data?.message || 'No se pudo registrar el producto'}`;
            break; // Detener el proceso si hay error
          }
        } catch (err) {
          hayError = true;
          // Mejorar el mensaje de error para ser más específico
          if (err.response) {
            this.error = `Error ${err.response.status} en producto ${i + 1}: ${err.response.data?.message || 'Error al procesar la solicitud'}`;
          } else {
            this.error = `Error en producto ${i + 1}: ${err.message || 'Error al conectar con el servidor'}`;
          }
          break; // Detener el proceso si hay error
        }
      }
  
      if (!hayError) {
        // Éxito - todos los productos se registraron correctamente
        this.exitoso = true;
  
        // Resetear formulario después de 2 segundos
        setTimeout(() => {
          this.limpiarFormulario();
        }, 2000);
      }
    } catch (err) {
      this.error = err.message || 'Error al conectar con el servidor';
    } finally {
      this.enviando = false;
    }
  },
  
  limpiarFormulario() {
    this.ordenActual = {
      invoiceNumber: '',
      products: []
    };
    this.error = null;
    this.exitoso = false;
  },
  
  formatearMoneda(valor) {
    // Verificar si es un número válido
    if (!valor || isNaN(valor)) return '$0.00';
  
    // Formatear con 2 decimales y separador de miles
    return new Intl.NumberFormat('es-SV', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(valor);
  },
  
  calcularIVAEstimado(precio) {
    if (!precio || isNaN(precio)) return 0;
    return parseFloat(precio) * 0.13; // 13% de IVA
  },
  
  calcularTotalConIVA(producto) {
    const precio = parseFloat(producto.purchasePrice) || 0;
    const cantidad = parseInt(producto.quantity) || 0;
    const iva = this.calcularIVAEstimado(precio);
    return (precio + iva) * cantidad;
  }
  }
  };
  </script>
  
  <style scoped>
.orden-switch {
position: relative;
display: inline-block;
width: 42px;
height: 22px;
}

.orden-switch input {
opacity: 0;
width: 0;
height: 0;
}

.orden-slider {
position: absolute;
cursor: pointer;
top: 0;
left: 0;
right: 0;
bottom: 0;
background-color: #ccc;
transition: .4s;
border-radius: 24px;
}

.orden-slider:before {
position: absolute;
content: "";
height: 16px;
width: 16px;
left: 3px;
bottom: 3px;
background-color: white;
transition: .4s;
border-radius: 50%;
}

.orden-switch input:checked + .orden-slider {
background-color: #2196F3;
}

.orden-switch input:checked + .orden-slider:before {
transform: translateX(20px);
}

.orden-switch-wrapper {
display: flex;
align-items: center;
gap: 8px;
margin-top: 10px;
}

.switch-text {
font-weight: 500;
font-size: 15px;
}
</style>