<template>
    <div class="order-details">
        <div class="page-header">
            <i class="fas fa-boxes header-icon"></i>
            <h2>Detalles de Orden</h2>
        </div>

        <div class="layout-container">
            <!-- Columna izquierda: Formulario -->
            <div class="left-column">
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
                                                            <span class="info-label">Marca:</span>
                                                            <span class="info-value">{{
                                                                obtenerNombreMarca(producto.brandId) }}</span>
                                                        </div>
                                                        <div class="info-row">
                                                            <span class="info-label">Categoría:</span>
                                                            <span class="info-value">{{
                                                                obtenerNombreCategoria(producto.categoryId) }}</span>
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
                                                                                {{ marca.name }}
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
                                                                                {{ categoria.name }}
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
                                                                <div class="form-group half">
                                                                    <label :for="`touristPrice_${index}`">
                                                                        <i class="fas fa-plane label-icon"></i> Precio
                                                                        turista:
                                                                    </label>
                                                                    <div class="input-wrapper">
                                                                        <input type="number"
                                                                            :id="`touristPrice_${index}`"
                                                                            v-model="producto.touristPrice"
                                                                            class="form-control" placeholder="Ej: 1500"
                                                                            step="0.01" min="0" required />
                                                                    </div>
                                                                </div>
                                                                <div class="form-group half">
                                                                    <label :for="`stock_${index}`">
                                                                        <i class="fas fa-cubes label-icon"></i> Stock
                                                                        inicial:
                                                                    </label>
                                                                    <div class="input-wrapper">
                                                                        <input type="number" :id="`stock_${index}`"
                                                                            v-model="producto.stock"
                                                                            class="form-control" placeholder="Ej: 50"
                                                                            min="0" required />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <!-- Tab: Mayoreo -->
                                                        <div v-show="producto.activeTab === 'wholesale'"
                                                            class="tab-pane">
                                                            <div class="form-group checkbox-group">
                                                                <label class="checkbox-label">
                                                                    <input type="checkbox"
                                                                        v-model="producto.wholesaleSale" />
                                                                    <span class="checkbox-text">
                                                                        <i class="fas fa-truck label-icon"></i>
                                                                        Disponible para venta al por mayor
                                                                    </span>
                                                                </label>
                                                            </div>

                                                            <div v-if="producto.wholesaleSale"
                                                                class="wholesale-section">
                                                                <div class="form-row">
                                                                    <div class="form-group half">
                                                                        <label :for="`wholesalePrice_${index}`">
                                                                            <i
                                                                                class="fas fa-money-bill-wave label-icon"></i>
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
                                                                            <i
                                                                                class="fas fa-sort-amount-up label-icon"></i>
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

            <!-- Columna derecha: Resumen y Órdenes registradas -->
            <div class="right-column">


                <!-- Lista de órdenes registradas -->
                <div class="section">
                    <div class="section-header" @click="toggleOrdenesRegistradas">
                        <div class="header-left">
                            <i class="fas fa-list-ul section-icon"></i>
                            <h3>Órdenes Registradas</h3>
                        </div>
                        <div class="badge">{{ ordenesRegistradas.length || 0 }}</div>
                        <i class="fas fa-chevron-down toggle-icon" :class="{ 'rotate': isOrdenesRegistradasOpen }"></i>
                    </div>

                    <div v-show="isOrdenesRegistradasOpen" class="section-content">


                        <!-- Mensaje si no hay órdenes -->
                        <div v-if="ordenesRegistradas.length === 0" class="message">
                            <i class="fas fa-info-circle message-icon"></i>
                            <span>No hay órdenes registradas.</span>
                        </div>

                        <!-- Mensaje si no se encuentran órdenes -->
                        <div v-else-if="filteredOrdenes.length === 0" class="message">
                            <i class="fas fa-search message-icon"></i>
                            <span>No se encontraron órdenes con ese criterio de búsqueda.</span>
                        </div>

                        <div v-else class="orders-list">
                            <div v-for="(orden, index) in filteredOrdenes" :key="index" class="order-card">
                                <div class="order-card-header">
                                    <h4>Factura: {{ orden.invoiceNumber }}</h4>
                                    <span class="order-badge">{{ orden.products.length }} productos</span>
                                </div>
                                <div class="order-card-body">
                                    <div class="order-products">
                                        <div v-for="(producto, prodIndex) in orden.products" :key="prodIndex"
                                            class="order-product-item">
                                            <div class="product-name">
                                                <i class="fas fa-box"></i>
                                                {{ producto.name || (producto.productId ? `Producto ID:
                                                ${producto.productId}` : `Producto #${prodIndex + 1}`) }}
                                            </div>
                                            <div class="product-details">
                                                <span class="product-quantity">{{ producto.quantity }} unidades</span>
                                                <span class="product-price">{{ formatearMoneda(producto.purchasePrice)
                                                    }} $</span>
                                            </div>
                                            <div v-if="producto.calculatedTaxUnit" class="product-tax">
                                                <span class="tax-label">IVA:</span>
                                                <span class="tax-value">{{ formatearMoneda(producto.calculatedTaxUnit)
                                                    }} $</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="order-total">
                                        <span class="total-label">Total:</span>
                                        <span class="total-value">{{
                                            formatearMoneda(calcularTotalOrdenRegistrada(orden)) }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Resumen de la orden -->
                <div class="section">
                    <div class="section-header">
                        <div class="header-left">
                            <i class="fas fa-receipt section-icon"></i>
                            <h3>Resumen de la Orden</h3>
                        </div>
                    </div>
                    <div class="section-content">
                        <div class="summary-content">
                            <div class="summary-row">
                                <span class="summary-label">Factura:</span>
                                <span class="summary-value">{{ ordenActual.invoiceNumber || 'No especificado' }}</span>
                            </div>
                            <div class="summary-row">
                                <span class="summary-label">Productos:</span>
                                <span class="summary-value">{{ ordenActual.products.length }}</span>
                            </div>
                            <div class="summary-row">
                                <span class="summary-label">Total unidades:</span>
                                <span class="summary-value">{{ calcularTotalUnidades() }}</span>
                            </div>
                            <div class="summary-row">
                                <span class="summary-label">Subtotal:</span>
                                <span class="summary-value">{{ formatearMoneda(calcularSubtotalOrden()) }}</span>
                            </div>
                            <div class="summary-row">
                                <span class="summary-label">IVA estimado:</span>
                                <span class="summary-value">{{ formatearMoneda(calcularIVATotalOrden()) }}</span>
                            </div>
                            <div class="summary-row total-row">
                                <span class="summary-label">Total:</span>
                                <span class="summary-value total-value">{{ formatearMoneda(calcularTotalOrden())
                                    }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Búsqueda de orden por número de factura -->
                <div class="section">
                    <div class="section-header">
                        <div class="header-left">
                            <i class="fas fa-search section-icon"></i>
                            <h3>Buscar Orden</h3>
                        </div>
                    </div>
                    <div class="section-content">
                        <div class="search-form">
                            <div class="form-group">
                                <label for="searchInvoiceNumber">
                                    <i class="fas fa-file-invoice label-icon"></i> Número de factura:
                                </label>
                                <div class="input-wrapper search-wrapper">
                                    <input type="text" id="searchInvoiceNumber" v-model="searchInvoiceNumber"
                                        class="form-control" placeholder="Ej: INV-20240315" />
                                    <button type="button" @click="buscarOrdenPorFactura" class="btn btn-search"
                                        :disabled="!searchInvoiceNumber || buscandoOrden">
                                        <i class="fas" :class="buscandoOrden ? 'fa-spinner fa-spin' : 'fa-search'"></i>
                                        {{ buscandoOrden ? 'Buscando...' : 'Buscar' }}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Mensaje de error en búsqueda -->
                        <div v-if="errorBusqueda" class="message error">
                            <i class="fas fa-exclamation-circle message-icon"></i>
                            <span>{{ errorBusqueda }}</span>
                        </div>

                        <!-- Resultados de la búsqueda -->
                        <div v-if="ordenEncontrada" class="order-search-result">
                            <div class="search-result-header">
                                <h4>
                                    <i class="fas fa-file-invoice"></i>
                                    Factura: {{ ordenEncontrada.invoiceNumber }}
                                </h4>
                                <span class="order-date">{{ ordenEncontrada.orderDate }}</span>
                            </div>

                            <div class="search-result-content">
                                <div class="search-result-products">
                                    <h5><i class="fas fa-boxes"></i> Productos en esta orden:</h5>
                                    <div class="search-product-list">
                                        <div v-for="(detalle, index) in ordenEncontrada.details" :key="index"
                                            class="search-product-item">
                                            <div class="search-product-header">
                                                <span class="product-name">{{ detalle.product.name }}</span>
                                                <span class="product-code">{{ detalle.product.code }}</span>
                                                <div class="product-actions">
                                                    <button type="button" @click="editarDetalle(detalle)"
                                                        class="btn-edit" :disabled="editandoDetalle === detalle.id">
                                                        <i class="fas"
                                                            :class="editandoDetalle === detalle.id ? 'fa-spinner fa-spin' : 'fa-edit'"></i>
                                                        <span class="edit-text">{{ editandoDetalle === detalle.id ?
                                                            'Editando...' : 'Editar' }}</span>
                                                    </button>
                                                    <button type="button" @click="confirmarEliminarDetalle(detalle.id)"
                                                        class="btn-delete" :disabled="eliminandoDetalle === detalle.id">
                                                        <i class="fas"
                                                            :class="eliminandoDetalle === detalle.id ? 'fa-spinner fa-spin' : 'fa-trash'"></i>
                                                        <span class="delete-text">{{ eliminandoDetalle === detalle.id ?
                                                            'Eliminando...' : 'Eliminar' }}</span>
                                                    </button>
                                                </div>
                                            </div>
                                            <div class="search-product-details">
                                                <div class="detail-row">
                                                    <span class="detail-label">Cantidad:</span>
                                                    <span class="detail-value">{{ detalle.quantity }} unidades</span>
                                                </div>
                                                <div class="detail-row">
                                                    <span class="detail-label">Precio unitario:</span>
                                                    <span class="detail-value">{{
                                                        formatearMoneda(detalle.purchasePriceUnit) }}</span>
                                                </div>
                                                <div class="detail-row">
                                                    <span class="detail-label">IVA unitario:</span>
                                                    <span class="detail-value">{{
                                                        formatearMoneda(detalle.calculatedTaxUnit) }}</span>
                                                </div>
                                                <div class="detail-row">
                                                    <span class="detail-label">Subtotal:</span>
                                                    <span class="detail-value">{{
                                                        formatearMoneda(detalle.calculatedTotalPriceWithouthTax)
                                                        }}</span>
                                                </div>
                                                <div class="detail-row">
                                                    <span class="detail-label">IVA total:</span>
                                                    <span class="detail-value">{{
                                                        formatearMoneda(detalle.calculatedTotalTax) }}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="search-result-summary">
                                    <div class="summary-row">
                                        <span class="summary-label">Total productos:</span>
                                        <span class="summary-value">{{ ordenEncontrada.details.length }}</span>
                                    </div>
                                    <div class="summary-row">
                                        <span class="summary-label">Total unidades:</span>
                                        <span class="summary-value">{{ calcularTotalUnidadesEncontradas() }}</span>
                                    </div>
                                    <div class="summary-row">
                                        <span class="summary-label">Subtotal:</span>
                                        <span class="summary-value">{{
                                            formatearMoneda(calcularSubtotalOrdenEncontrada()) }}</span>
                                    </div>
                                    <div class="summary-row">
                                        <span class="summary-label">IVA total:</span>
                                        <span class="summary-value">{{
                                            formatearMoneda(calcularIVATotalOrdenEncontrada()) }}</span>
                                    </div>
                                    <div class="summary-row total-row">
                                        <span class="summary-label">Total:</span>
                                        <span class="summary-value total-value">{{
                                            formatearMoneda(calcularTotalOrdenEncontrada()) }}</span>
                                    </div>
                                </div>

                                <div class="search-result-actions">
                                    <button type="button" @click="cargarOrdenEncontrada" class="btn btn-primary">
                                        <i class="fas fa-edit"></i> Editar esta orden
                                    </button>
                                    <button type="button" @click="obtenerResumenFinanciero" class="btn btn-info">
                                        <i class="fas fa-chart-pie"></i> Ver resumen financiero
                                    </button>
                                    <button type="button" @click="limpiarBusqueda" class="btn btn-secondary">
                                        <i class="fas fa-times"></i> Cerrar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Resumen financiero detallado -->
                <div v-if="resumenFinanciero" class="section">
                    <div class="section-header">
                        <div class="header-left">
                            <i class="fas fa-chart-pie section-icon"></i>
                            <h3>Resumen Financiero Detallado</h3>
                        </div>
                        <button type="button" @click="cerrarResumenFinanciero" class="btn-close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="section-content">
                        <div class="financial-summary">
                            <div class="financial-header">
                                <div class="financial-invoice">
                                    <i class="fas fa-file-invoice"></i>
                                    <span>Factura: {{ resumenFinanciero.summary.invoice.number }}</span>
                                </div>
                                <div class="financial-date">
                                    <i class="fas fa-calendar-alt"></i>
                                    <span>Fecha: {{ resumenFinanciero.summary.invoice.date }}</span>
                                </div>
                            </div>

                            <div class="financial-details">
                                <h5><i class="fas fa-list"></i> Detalles de productos:</h5>
                                <div class="financial-products-list">
                                    <div v-for="(detalle, index) in resumenFinanciero.details" :key="index"
                                        class="financial-product-item">
                                        <div class="financial-product-header">
                                            <span class="product-id">Producto ID: {{ detalle.productId }}</span>
                                        </div>
                                        <div class="financial-product-details">
                                            <div class="detail-row">
                                                <span class="detail-label">Cantidad:</span>
                                                <span class="detail-value">{{ detalle.quantity }} unidades</span>
                                            </div>
                                            <div class="detail-row">
                                                <span class="detail-label">Precio unitario con IVA:</span>
                                                <span class="detail-value">{{ formatearMoneda(detalle.unitPriceWithVAT)
                                                    }}</span>
                                            </div>
                                            <div class="detail-row">
                                                <span class="detail-label">Precio unitario sin IVA:</span>
                                                <span class="detail-value">{{
                                                    formatearMoneda(detalle.unitPriceWithoutVAT) }}</span>
                                            </div>
                                            <div class="detail-row">
                                                <span class="detail-label">Total con IVA:</span>
                                                <span class="detail-value">{{ formatearMoneda(detalle.totalPriceWithVAT)
                                                    }}</span>
                                            </div>
                                            <div class="detail-row">
                                                <span class="detail-label">Total sin IVA:</span>
                                                <span class="detail-value">{{
                                                    formatearMoneda(detalle.totalPriceWithoutVAT) }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="financial-summary-totals">
                                <div class="summary-row">
                                    <span class="summary-label">Total sin IVA:</span>
                                    <span class="summary-value">{{
                                        formatearMoneda(resumenFinanciero.summary.totalWithoutVAT) }}</span>
                                </div>
                                <div class="summary-row">
                                    <span class="summary-label">Total IVA:</span>
                                    <span class="summary-value">{{ formatearMoneda(resumenFinanciero.summary.totalVAT)
                                        }}</span>
                                </div>
                                <div class="summary-row total-row">
                                    <span class="summary-label">Total con IVA:</span>
                                    <span class="summary-value total-value">{{
                                        formatearMoneda(resumenFinanciero.summary.totalWithVAT) }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


            </div>
        </div>

        <!-- Modal de confirmación para eliminar detalle -->
        <div v-if="mostrarModalConfirmacion" class="modal-overlay">
            <div class="modal-container">
                <div class="modal-header">
                    <h4><i class="fas fa-exclamation-triangle"></i> Confirmar eliminación</h4>
                </div>
                <div class="modal-body">
                    <p>¿Está seguro que desea eliminar este detalle de orden? Esta acción no se puede deshacer.</p>
                </div>
                <div class="modal-footer">
                    <button type="button" @click="cancelarEliminarDetalle" class="btn btn-secondary">
                        <i class="fas fa-times"></i> Cancelar
                    </button>
                    <button type="button" @click="eliminarDetalle" class="btn btn-danger">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>
        </div>

        <!-- Modal para editar detalle -->
        <div v-if="mostrarModalEdicion" class="modal-overlay">
            <div class="modal-container">
                <div class="modal-header">
                    <h4><i class="fas fa-edit"></i> Editar detalle de orden</h4>
                </div>
                <div class="modal-body">
                    <div v-if="detalleEnEdicion" class="edit-form">
                        <div class="form-group">
                            <label for="editQuantity">
                                <i class="fas fa-sort-numeric-up label-icon"></i> Cantidad:
                            </label>
                            <div class="input-wrapper">
                                <input type="number" id="editQuantity" v-model="detalleEnEdicion.quantity"
                                    class="form-control" placeholder="Ej: 10" min="1" required />
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="editPurchasePrice">
                                <i class="fas fa-shopping-cart label-icon"></i> Precio de compra:
                            </label>
                            <div class="input-wrapper">
                                <input type="number" id="editPurchasePrice" v-model="detalleEnEdicion.purchasePriceUnit"
                                    class="form-control" placeholder="Ej: 1200" step="0.01" min="0" required />
                            </div>
                        </div>

                        <div class="product-info">
                            <div class="product-info-header">
                                <i class="fas fa-info-circle"></i> Información del producto
                            </div>
                            <div class="product-info-content">
                                <div class="info-row">
                                    <span class="info-label">Código:</span>
                                    <span class="info-value">{{ detalleEnEdicion.product.code }}</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">Nombre:</span>
                                    <span class="info-value">{{ detalleEnEdicion.product.name }}</span>
                                </div>
                            </div>
                        </div>

                        <div class="tax-preview">
                            <div class="tax-preview-row">
                                <span class="tax-label">IVA estimado (13%):</span>
                                <span class="tax-value">{{
                                    formatearMoneda(calcularIVAEstimado(detalleEnEdicion.purchasePriceUnit)) }}</span>
                            </div>
                            <div class="tax-preview-row">
                                <span class="tax-label">Subtotal estimado:</span>
                                <span class="tax-value">{{ formatearMoneda(detalleEnEdicion.purchasePriceUnit *
                                    detalleEnEdicion.quantity) }}</span>
                            </div>
                            <div class="tax-preview-row">
                                <span class="tax-label">IVA total estimado:</span>
                                <span class="tax-value">{{
                                    formatearMoneda(calcularIVAEstimado(detalleEnEdicion.purchasePriceUnit) *
                                    detalleEnEdicion.quantity) }}</span>
                            </div>
                            <div class="tax-preview-row total-row">
                                <span class="tax-label">Total estimado con IVA:</span>
                                <span class="tax-value total-value">{{
                                    formatearMoneda((parseFloat(detalleEnEdicion.purchasePriceUnit) +
                                        calcularIVAEstimado(detalleEnEdicion.purchasePriceUnit)) *
                                    detalleEnEdicion.quantity) }}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" @click="cancelarEditarDetalle" class="btn btn-secondary">
                        <i class="fas fa-times"></i> Cancelar
                    </button>
                    <button type="button" @click="guardarEdicionDetalle" class="btn btn-primary"
                        :disabled="actualizandoDetalle">
                        <i class="fas" :class="actualizandoDetalle ? 'fa-spinner fa-spin' : 'fa-save'"></i>
                        {{ actualizandoDetalle ? 'Guardando...' : 'Guardar cambios' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import apiRequest from '@/Servicios/HttpService';
import '@/components/stilos/detalles.css';
import '@/components/stilos/order-details.css';

export default {
    name: 'OrderDetails',

    data() {
        return {
            // Datos de la orden actual
            ordenActual: {
                invoiceNumber: '',
                products: []
            },

            // Estado del formulario
            enviando: false,
            error: null,
            exitoso: false,

            // Órdenes registradas
            ordenesRegistradas: [],
            isOrdenesRegistradasOpen: false,
            searchQuery: '',

            // Datos para selects
            categorias: [],
            marcas: [],
            cargandoCategorias: false,
            cargandoMarcas: false,

            // Búsqueda de orden por factura
            searchInvoiceNumber: '',
            buscandoOrden: false,
            errorBusqueda: null,
            ordenEncontrada: null,

            // Eliminación de detalles
            mostrarModalConfirmacion: false,
            detalleIdAEliminar: null,
            eliminandoDetalle: null,

            // Edición de detalles
            mostrarModalEdicion: false,
            detalleEnEdicion: null,
            editandoDetalle: null,
            actualizandoDetalle: false,

            // Resumen financiero
            resumenFinanciero: null,
            cargandoResumenFinanciero: false
        };
    },

    computed: {
        filteredOrdenes() {
            if (!this.searchQuery) return this.ordenesRegistradas;

            const query = this.searchQuery.toLowerCase();
            return this.ordenesRegistradas.filter(o =>
                o.invoiceNumber.toLowerCase().includes(query)
            );
        },

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
    },

    methods: {
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
            if (!categoriaId) return 'No especificada';
            const categoria = this.categorias.find(c => c.id === parseInt(categoriaId));
            return categoria ? categoria.name : `ID: ${categoriaId}`;
        },

        obtenerNombreMarca(marcaId) {
            if (!marcaId) return 'No especificada';
            const marca = this.marcas.find(m => m.id === parseInt(marcaId));
            return marca ? marca.name : `ID: ${marcaId}`;
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
                stock: null,
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
                    producto.brandId = productoData.brandId;
                    producto.categoryId = productoData.categoryId;

                    // Datos de mayoreo
                    producto.wholesaleSale = productoData.wholesaleSale || false;
                    if (producto.wholesaleSale) {
                        producto.wholesalePrice = parseFloat(productoData.wholesalePrice);
                        producto.wholesaleQuantity = parseInt(productoData.wholesaleQuantity);
                    }

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

        // Nuevo método para buscar orden por número de factura
        async buscarOrdenPorFactura() {
            if (!this.searchInvoiceNumber) return;

            this.buscandoOrden = true;
            this.errorBusqueda = null;
            this.ordenEncontrada = null;
            this.resumenFinanciero = null; // Limpiar resumen financiero previo

            try {
                const response = await apiRequest({
                    method: 'GET',
                    path: `order-details/orderDetail/${this.searchInvoiceNumber}`
                });

                if (response.status === 200) {
                    this.ordenEncontrada = response.data;
                } else {
                    this.errorBusqueda = `Error ${response.status}: No se encontró la orden`;
                }
            } catch (err) {
                this.errorBusqueda = err.message || 'Error al buscar la orden';
            } finally {
                this.buscandoOrden = false;
            }
        },

        // Nuevo método para obtener el resumen financiero
        async obtenerResumenFinanciero() {
            if (!this.ordenEncontrada || !this.ordenEncontrada.invoiceNumber) return;

            this.cargandoResumenFinanciero = true;

            try {
                const response = await apiRequest({
                    method: 'GET',
                    path: `order-details/summary/${this.ordenEncontrada.invoiceNumber}`
                });

                if (response.status === 200) {
                    this.resumenFinanciero = response.data;
                } else {
                    this.errorBusqueda = `Error ${response.status}: No se pudo obtener el resumen financiero`;
                }
            } catch (err) {
                this.errorBusqueda = err.message || 'Error al obtener el resumen financiero';
            } finally {
                this.cargandoResumenFinanciero = false;
            }
        },

        // Cerrar el resumen financiero
        cerrarResumenFinanciero() {
            this.resumenFinanciero = null;
        },

        // Limpiar resultados de búsqueda
        limpiarBusqueda() {
            this.searchInvoiceNumber = '';
            this.ordenEncontrada = null;
            this.errorBusqueda = null;
            this.resumenFinanciero = null;
        },

        // Cargar la orden encontrada en el formulario para edición
        cargarOrdenEncontrada() {
            if (!this.ordenEncontrada) return;

            // Limpiar formulario actual
            this.limpiarFormulario();

            // Establecer número de factura
            this.ordenActual.invoiceNumber = this.ordenEncontrada.invoiceNumber;

            // Cargar productos
            this.ordenEncontrada.details.forEach(detalle => {
                this.ordenActual.products.push({
                    esExistente: true,
                    productId: detalle.product.id,
                    code: detalle.product.code,
                    name: detalle.product.name,
                    purchasePrice: detalle.purchasePriceUnit,
                    quantity: detalle.quantity,
                    encontrado: true,
                    activeTab: 'info'
                });
            });

            // Limpiar búsqueda
            this.limpiarBusqueda();
        },

        // Métodos para eliminar detalles de orden
        confirmarEliminarDetalle(detalleId) {
            this.detalleIdAEliminar = detalleId;
            this.mostrarModalConfirmacion = true;
        },

        cancelarEliminarDetalle() {
            this.detalleIdAEliminar = null;
            this.mostrarModalConfirmacion = false;
        },

        async eliminarDetalle() {
            if (!this.detalleIdAEliminar) return;

            this.eliminandoDetalle = this.detalleIdAEliminar;
            this.mostrarModalConfirmacion = false;

            try {
                const response = await apiRequest({
                    method: 'DELETE',
                    path: `order-details/${this.detalleIdAEliminar}`
                });

                if (response.status === 204) {
                    // Eliminar el detalle de la orden encontrada
                    if (this.ordenEncontrada && this.ordenEncontrada.details) {
                        this.ordenEncontrada.details = this.ordenEncontrada.details.filter(
                            detalle => detalle.id !== this.detalleIdAEliminar
                        );

                        // Si no quedan detalles, actualizar la búsqueda
                        if (this.ordenEncontrada.details.length === 0) {
                            this.buscarOrdenPorFactura();
                        }
                    }

                    // Mostrar mensaje de éxito
                    this.$nextTick(() => {
                        this.errorBusqueda = null;
                        this.exitoso = true;
                        setTimeout(() => {
                            this.exitoso = false;
                        }, 3000);
                    });
                } else {
                    this.errorBusqueda = `Error ${response.status}: No se pudo eliminar el detalle`;
                }
            } catch (err) {
                this.errorBusqueda = err.message || 'Error al eliminar el detalle';
            } finally {
                this.eliminandoDetalle = null;
                this.detalleIdAEliminar = null;
            }
        },

        // Métodos para editar detalles de orden
        editarDetalle(detalle) {
            // Crear una copia del detalle para no modificar el original directamente
            this.detalleEnEdicion = JSON.parse(JSON.stringify(detalle));
            this.editandoDetalle = detalle.id;
            this.mostrarModalEdicion = true;
        },

        cancelarEditarDetalle() {
            this.detalleEnEdicion = null;
            this.editandoDetalle = null;
            this.mostrarModalEdicion = false;
        },

        async guardarEdicionDetalle() {
            if (!this.detalleEnEdicion) return;

            this.actualizandoDetalle = true;

            try {
                const detalleId = this.detalleEnEdicion.id;
                const datosActualizados = {
                    quantity: parseInt(this.detalleEnEdicion.quantity),
                    purchasePrice: parseFloat(this.detalleEnEdicion.purchasePriceUnit)
                };

                const response = await apiRequest({
                    method: 'PATCH',
                    path: `order-details/${detalleId}`,
                    data: datosActualizados
                });

                if (response.status === 200) {
                    // Actualizar el detalle en la orden encontrada
                    if (this.ordenEncontrada && this.ordenEncontrada.details) {
                        const index = this.ordenEncontrada.details.findIndex(d => d.id === detalleId);
                        if (index !== -1) {
                            // Actualizar los valores en la UI
                            this.ordenEncontrada.details[index].quantity = datosActualizados.quantity;
                            this.ordenEncontrada.details[index].purchasePriceUnit = datosActualizados.purchasePrice;

                            // Si la respuesta incluye los valores calculados, actualizarlos también
                            if (response.data) {
                                if (response.data.calculatedTaxUnit) {
                                    this.ordenEncontrada.details[index].calculatedTaxUnit = response.data.calculatedTaxUnit;
                                }
                                if (response.data.calculatedTotalPriceWithouthTax) {
                                    this.ordenEncontrada.details[index].calculatedTotalPriceWithouthTax = response.data.calculatedTotalPriceWithouthTax;
                                }
                                if (response.data.calculatedTotalTax) {
                                    this.ordenEncontrada.details[index].calculatedTotalTax = response.data.calculatedTotalTax;
                                }
                            }
                        }
                    }

                    // Limpiar el resumen financiero para que se actualice si se solicita de nuevo
                    this.resumenFinanciero = null;

                    // Mostrar mensaje de éxito
                    this.$nextTick(() => {
                        this.errorBusqueda = null;
                        this.exitoso = true;
                        setTimeout(() => {
                            this.exitoso = false;
                        }, 3000);
                    });

                    // Cerrar el modal
                    this.cancelarEditarDetalle();
                } else {
                    this.errorBusqueda = `Error ${response.status}: No se pudo actualizar el detalle`;
                }
            } catch (err) {
                this.errorBusqueda = err.message || 'Error al actualizar el detalle';
            } finally {
                this.actualizandoDetalle = false;
            }
        },

        // Calcular totales para la orden encontrada
        calcularTotalUnidadesEncontradas() {
            if (!this.ordenEncontrada) return 0;

            return this.ordenEncontrada.details.reduce((total, detalle) => {
                return total + (parseInt(detalle.quantity) || 0);
            }, 0);
        },

        calcularSubtotalOrdenEncontrada() {
            if (!this.ordenEncontrada) return 0;

            return this.ordenEncontrada.details.reduce((total, detalle) => {
                return total + (parseFloat(detalle.calculatedTotalPriceWithouthTax) || 0);
            }, 0);
        },

        calcularIVATotalOrdenEncontrada() {
            if (!this.ordenEncontrada) return 0;

            return this.ordenEncontrada.details.reduce((total, detalle) => {
                return total + (parseFloat(detalle.calculatedTotalTax) || 0);
            }, 0);
        },

        calcularTotalOrdenEncontrada() {
            return this.calcularSubtotalOrdenEncontrada() + this.calcularIVATotalOrdenEncontrada();
        },

        async registrarDetalle() {
            this.enviando = true;
            this.error = null;
            this.exitoso = false;

            try {
                // Preparar los datos base de la orden
                const invoiceNumber = this.ordenActual.invoiceNumber;
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
                            categoryId: parseInt(p.categoryId)
                        };

                        // Agregar datos de mayoreo si está habilitado
                        if (p.wholesaleSale) {
                            productoData.wholesalePrice = parseFloat(p.wholesalePrice);
                            productoData.wholesaleQuantity = parseInt(p.wholesaleQuantity);
                        }
                    }

                    // Crear objeto de orden para un solo producto
                    const ordenData = {
                        invoiceNumber: invoiceNumber,
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
                        this.error = `Error en producto ${i + 1}: ${err.message || 'Error al conectar con el servidor'}`;
                        break; // Detener el proceso si hay error
                    }
                }

                if (!hayError) {
                    // Éxito - todos los productos se registraron correctamente
                    this.exitoso = true;

                    // Crear una representación de la orden completa para mostrar en la UI
                    const ordenRegistrada = {
                        invoiceNumber: invoiceNumber,
                        products: productos.map((p, index) => {
                            const respuesta = respuestas[index];
                            return {
                                ...p,
                                id: respuesta?.id,
                                calculatedTaxUnit: respuesta?.calculatedTaxUnit,
                                calculatedTotalPriceWithouthTax: respuesta?.calculatedTotalPriceWithouthTax,
                                calculatedTotalTax: respuesta?.calculatedTotalTax
                            };
                        }),
                        id: respuestas[0]?.order?.id || Date.now()
                    };

                    this.ordenesRegistradas.unshift(ordenRegistrada);

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

        toggleOrdenesRegistradas() {
            this.isOrdenesRegistradasOpen = !this.isOrdenesRegistradasOpen;
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
        },

        calcularTotalUnidades() {
            return this.ordenActual.products.reduce((total, p) => {
                return total + (parseInt(p.quantity) || 0);
            }, 0);
        },

        calcularSubtotalOrden() {
            return this.ordenActual.products.reduce((total, p) => {
                const precio = parseFloat(p.purchasePrice) || 0;
                const cantidad = parseInt(p.quantity) || 0;
                return total + (precio * cantidad);
            }, 0);
        },

        calcularIVATotalOrden() {
            return this.ordenActual.products.reduce((total, p) => {
                const precio = parseFloat(p.purchasePrice) || 0;
                const cantidad = parseInt(p.quantity) || 0;
                const iva = this.calcularIVAEstimado(precio);
                return total + (iva * cantidad);
            }, 0);
        },

        calcularTotalOrden() {
            return this.calcularSubtotalOrden() + this.calcularIVATotalOrden();
        },

        calcularTotalOrdenRegistrada(orden) {
            return orden.products.reduce((total, p) => {
                const precio = parseFloat(p.purchasePrice) || 0;
                const cantidad = parseInt(p.quantity) || 0;
                const iva = p.calculatedTaxUnit || this.calcularIVAEstimado(precio);
                return total + ((precio + iva) * cantidad);
            }, 0);
        }
    }
};
</script>