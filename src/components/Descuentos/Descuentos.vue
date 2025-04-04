<template>
  <section>
    <div class="level mb-5">
      <div class="level-left">
        <div class="level-item">
          <h1 class="title is-4">Gestión de Descuentos</h1>
        </div>
      </div>
    </div>

    <!-- Tabs de navegación -->
    <div class="tabs is-boxed mb-4">
      <ul>
        <li v-if="esAdmin" :class="{ 'is-active': activeTab === 'lista' }">
          <a @click="activeTab = 'lista'">
            <span class="icon is-small"><i class="mdi mdi-tag-multiple"></i></span>
            <span>Lista de Descuentos</span>
          </a>
        </li>
        <li v-if="esAdmin" :class="{ 'is-active': activeTab === 'nuevo' }">
          <a @click="activeTab = 'nuevo'">
            <span class="icon is-small"><i class="mdi mdi-tag-plus"></i></span>
            <span>Nuevo Descuento</span>
          </a>
        </li>
        <li :class="{ 'is-active': activeTab === 'verificar' }">
          <a @click="activeTab = 'verificar'">
            <span class="icon is-small"><i class="mdi mdi-check-circle"></i></span>
            <span>Verificar Validez</span>
          </a>
        </li>
        <li :class="{ 'is-active': activeTab === 'calcular' }">
          <a @click="activeTab = 'calcular'">
            <span class="icon is-small"><i class="mdi mdi-calculator"></i></span>
            <span>Calcular Descuentos</span>
          </a>
        </li>
      </ul>
    </div>

    <!-- Tab: Lista de Descuentos -->
    <div v-if="activeTab === 'lista'" class="card">
      <header class="card-header">
        <p class="card-header-title">
          <span class="icon mr-2"><i class="mdi mdi-tag-multiple"></i></span>
          Lista de Descuentos
        </p>
      </header>
      <div class="card-content">
        <mensaje-inicial v-if="!descuentos.length && !cargando.lista" :titulo="'No hay descuentos registrados'"
          :subtitulo="'Crea un nuevo descuento usando la pestaña Nuevo Descuento'" />

        <b-table v-else :data="descuentos" :loading="cargando.lista" :striped="true" :hoverable="true" :paginated="true"
          :per-page="10" :pagination-simple="false" :pagination-position="'bottom'" :pagination-rounded="true">
          <b-table-column field="name" label="Nombre" v-slot="props">
            {{ props.row.name }}
          </b-table-column>

          <b-table-column field="type" label="Tipo" v-slot="props">
            <b-tag
                :type="props.row.type === 'PERCENTAGE' ? 'is-info' : props.row.type === 'FIXED_AMOUNT' ? 'is-success' : 'is-warning'">
                {{ props.row.type === 'PERCENTAGE' ? 'Porcentaje' :
                  props.row.type === 'FIXED_AMOUNT' ? 'Monto Fijo' :
                    props.row.type === 'BUY_X_GET_Y' ? 'Promoción ' :
                      props.row.type === 'BUNDLE' ? 'Paquete' :
                        props.row.type === 'SEASONAL' ? 'Temporal' : 'Otro' }}
              </b-tag>
          </b-table-column>

          <b-table-column field="type" label="Tipo y Valor" v-slot="props">
            <div>
            
              <span class="ml-2">
                {{ props.row.type === 'PERCENTAGE' ? `${props.row.value}%` :
                  props.row.type === 'FIXED_AMOUNT' ? `$${props.row.value}` :
                    props.row.type === 'BUY_X_GET_Y' ? `${props.row.name} ` :
                      props.row.type === 'BUNDLE' ? `Paquete ${props.row.value}` :
                        props.row.type === 'SEASONAL' ? `Descuento ${props.row.value}` : 'N/A' }}
              </span>
            </div>
          </b-table-column>

          <b-table-column field="minQuantity" label="Cantidad Mínima" v-slot="props">
            {{ props.row.minQuantity }}
          </b-table-column>

          <b-table-column field="product" label="Producto" v-slot="props">
            {{ props.row.product ? props.row.product.name : 'Todos' }}
          </b-table-column>

          <b-table-column field="category" label="Categoría" v-slot="props">
            {{ props.row.category ? props.row.category.categoryName : 'Todas' }}
          </b-table-column>

          <b-table-column field="startDate" label="Fecha Inicio" v-slot="props">
            {{ formatDate(props.row.startDate) }}
          </b-table-column>

          <b-table-column field="endDate" label="Fecha Fin" v-slot="props">
            {{ formatDate(props.row.endDate) }}
          </b-table-column>

          <b-table-column field="isActive" label="Estado" v-slot="props">
            <b-tag :type="props.row.isActive ? 'is-success' : 'is-danger'">
              {{ props.row.isActive ? 'Activo' : 'Inactivo' }}
            </b-tag>
          </b-table-column>

          <b-table-column field="acciones" label="Acciones" centered v-slot="props">
            <div class="buttons is-centered">

              <b-tooltip label="Editar" position="is-top">
                <b-button class="is-info" @click="editarDescuento(props.row)" size="is-small">
                  <b-icon icon="pencil" />
                </b-button>
              </b-tooltip>
              <b-tooltip label="Eliminar" position="is-top">
                <b-button class="is-danger" @click="eliminarDescuento(props.row.id)" size="is-small">
                  <b-icon icon="delete" />
                </b-button>
              </b-tooltip>
            </div>
          </b-table-column>
        </b-table>
      </div>
    </div>

    <!-- Tab: Nuevo Descuento -->
    <div v-if="activeTab === 'nuevo'" class="card">
      <header class="card-header">
        <p class="card-header-title">
          <span class="icon mr-2"><i class="mdi mdi-tag-plus"></i></span>
          {{ modoEdicion ? 'Editar Descuento' : 'Nuevo Descuento' }}
        </p>
      </header>
      <div class="card-content">
        <form @submit.prevent="guardarDescuento">
          <div class="columns is-multiline">
            <!-- Nombre del descuento -->
            <div class="column is-6">
              <b-field label="Nombre del descuento" :type="{ 'is-danger': errores.name }" :message="errores.name">
                <b-input v-model="nuevoDescuento.name" placeholder="Ej: Descuento de Verano" required></b-input>
              </b-field>
            </div>

            <!-- Tipo de descuento -->
            <div class="column is-6">
              <b-field label="Tipo de descuento" :type="{ 'is-danger': errores.type }" :message="errores.type">
                <b-select v-model="nuevoDescuento.type" placeholder="Seleccione tipo" expanded required>
                  <option value="PERCENTAGE">Descuento porcentual</option>
                  <option value="FIXED_AMOUNT">Descuento por monto fijo</option>
                  <option value="BUY_X_GET_Y">Promoción</option>
                  <option value="BUNDLE">Descuento por paquete</option>
                  <option value="SEASONAL">Descuento temporal</option>
                </b-select>
              </b-field>
            </div>

            <!-- Valor del descuento -->
            <div class="column is-6">
              <b-field :label="nuevoDescuento.type === 'PERCENTAGE'
                ? 'Porcentaje de descuento'
                : nuevoDescuento.type === 'FIXED_AMOUNT'
                  ? 'Monto de descuento'
                  : nuevoDescuento.type === 'BUY_X_GET_Y'
                    ? 'Promoción'
                    : 'Otro tipo de descuento'">
                <b-input v-model.number="nuevoDescuento.value" type="number"
                  :placeholder="nuevoDescuento.type === 'PERCENTAGE' ? 'Ej: 15' : 'Ej: 100'" :min="0"
                  :max="nuevoDescuento.type === 'PERCENTAGE' ? 100 : null" step="0.01" required></b-input>
              </b-field>
            </div>

            <!-- Cantidad mínima -->
            <div class="column is-6">
              <b-field label="Cantidad mínima" :type="{ 'is-danger': errores.minQuantity }"
                :message="errores.minQuantity">
                <b-input v-model.number="nuevoDescuento.minQuantity" type="number" placeholder="Ej: 2" min="1"
                  required></b-input>
              </b-field>
            </div>

            <!-- ID del Producto  - MODIFICADO PARA INGRESAR DIRECTAMENTE EL ID -->

            <!-- filepath: c:\Users\adona\Documents\Super\Pos\src\components\Descuentos\Descuentos.vue -->
            <!-- filepath: c:\Users\adona\Documents\Super\Pos\src\components\Descuentos\Descuentos.vue -->
            <div class="column is-6">
              <b-field label="Producto" :type="{ 'is-danger': errores.productId }" :message="errores.productId">
                <b-autocomplete v-model="productoSeleccionado" :data="productos" placeholder="Seleccione un producto"
                  field="name" :loading="cargando.productos" @select="productoSeleccionadoHandler"
                  @input="buscarProductos" :open-on-focus="true" :keep-first="true" icon="magnify" required>
                  <template #empty>No se encontraron productos</template>
                </b-autocomplete>
              </b-field>
            </div>
            <!-- Categoría  -->
            <!-- <div class="column is-6">
              <b-field label="Categoría ">
                <b-select v-model="nuevoDescuento.categoryId" placeholder="Seleccione una categoría" expanded>

                  <option v-for="categoria in categorias" :key="categoria.id" :value="categoria.id">
                    {{ categoria.categoryName }}
                  </option>
                </b-select>
              </b-field>
            </div> -->

            <!-- Fecha de inicio -->
            <div class="column is-6">
              <b-field label="Fecha de inicio" :type="{ 'is-danger': errores.startDate }" :message="errores.startDate">
                <div class="date-input-container" ref="startDateContainer">
                  <input type="text" class="input" placeholder="dd/mm/aaaa" v-model="fechaInicioInput"
                    @click="toggleStartCalendar" readonly>
                  <span class="icon is-right">
                    <i class="mdi mdi-calendar"></i>
                  </span>
                </div>
              </b-field>
            </div>

            <!-- Fecha de fin -->
            <div class="column is-6">
              <b-field label="Fecha de fin" :type="{ 'is-danger': errores.endDate }" :message="errores.endDate">
                <div class="date-input-container" ref="endDateContainer">
                  <input type="text" class="input" placeholder="dd/mm/aaaa" v-model="fechaFinInput"
                    @click="toggleEndCalendar" readonly>
                  <span class="icon is-right">
                    <i class="mdi mdi-calendar"></i>
                  </span>
                </div>
              </b-field>
            </div>

            <!-- Estado activo -->
            <div class="column is-6">
              <b-field label="Estado del descuento">
                <b-switch v-model="nuevoDescuento.isActive" type="is-info">
                </b-switch>
              </b-field>
            </div>
          </div>

          <div class="field mt-5">
            <div class="control">
              <div class="buttons">
                <b-button type="is-primary" native-type="submit" :loading="cargando.guardando" expanded>
                  {{ modoEdicion ? 'Actualizar Descuento' : 'Crear Descuento' }}
                </b-button>
                <b-button v-if="modoEdicion" type="is-light" @click="cancelarEdicion" expanded>
                  Cancelar
                </b-button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Tab: Verificar Validez de Descuento -->
    <div v-if="activeTab === 'verificar'" class="card">
      <header class="card-header">
        <p class="card-header-title">
          <span class="icon mr-2"><i class="mdi mdi-check-circle"></i></span>
          Verificar Validez de Descuento
        </p>
      </header>
      <div class="card-content">
        <div class="columns">
          <div class="column is-6">
            <b-field label="Nombre del Descuento" :type="{ 'is-danger': errores.verificarNombre }">
              <b-autocomplete v-model="verificarDescuentoNombre" :data="descuentosFiltrados"
                placeholder="Ingrese el nombre del descuento" field="name" :loading="cargando.lista"
                @select="opcionSeleccionada" :open-on-focus="true" :clear-on-select="true" :keep-first="true"
                icon="magnify" required>
                <template #empty>No se encontraron descuentos con ese nombre</template>
              </b-autocomplete>
            </b-field>
            <div class="field mt-4">
              <div class="control">
                <b-button type="is-primary" @click="verificarValidezDescuentoPorNombre" :loading="cargando.verificando"
                  :disabled="!verificarDescuentoNombre" expanded>
                  Verificar Validez
                </b-button>
              </div>
            </div>
          </div>
          <div class="column is-6">
            <div v-if="resultadoVerificacion" class="box">
              <div class="has-text-centered mb-4">
                <b-icon :icon="resultadoVerificacion.isValid ? 'check-circle' : 'alert-circle'"
                  :type="resultadoVerificacion.isValid ? 'is-success' : 'is-danger'" size="is-large"></b-icon>
                <p class="is-size-5 mt-2"
                  :class="resultadoVerificacion.isValid ? 'has-text-success' : 'has-text-danger'">
                  {{ resultadoVerificacion.message }}
                </p>
              </div>

              <div v-if="resultadoVerificacion.discount" class="content">
                <h5 class="title is-5 mb-3">Detalles del Descuento</h5>
                <div class="field is-horizontal">
                  <div class="field-label is-normal">
                    <label class="label">Nombre:</label>
                  </div>
                  <div class="field-body">
                    <div class="field">
                      <p class="control">
                        <span>{{ resultadoVerificacion.discount.name }}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div class="field is-horizontal">
                  <div class="field-label is-normal">
                    <label class="label">Tipo:</label>
                  </div>
                  <div class="field-body">
                    <div class="field">
                      <p class="control">
                        <b-tag :type="'is-info'">
                          {{ resultadoVerificacion.discount.type === 'PERCENTAGE' ? 'Porcentaje' : '' }}
                        </b-tag>
                      </p>
                    </div>
                  </div>
                </div>

                <div class="field is-horizontal">
                  <div class="field-label is-normal">
                    <label class="label">Valor:</label>
                  </div>
                  <div class="field-body">
                    <div class="field">
                      <p class="control">
                        <span>{{ resultadoVerificacion.discount.type === 'PERCENTAGE' ?
                          `${resultadoVerificacion.discount.value}%` :
                          `$${resultadoVerificacion.discount.value}` }}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div class="field is-horizontal">
                  <div class="field-label is-normal">
                    <label class="label">Cantidad Mínima:</label>
                  </div>
                  <div class="field-body">
                    <div class="field">
                      <p class="control">
                        <span>{{ resultadoVerificacion.discount.minQuantity }}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div class="field is-horizontal">
                  <div class="field-label is-normal">
                    <label class="label">Vigencia:</label>
                  </div>
                  <div class="field-body">
                    <div class="field">
                      <p class="control">
                        <span>{{ formatDate(resultadoVerificacion.discount.startDate) }} - {{
                          formatDate(resultadoVerificacion.discount.endDate) }}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div class="field is-horizontal">
                  <div class="field-label is-normal">
                    <label class="label">Estado:</label>
                  </div>
                  <div class="field-body">
                    <div class="field">
                      <p class="control">
                        <b-tag :type="resultadoVerificacion.discount.isActive ? 'is-success' : 'is-danger'">
                          {{ resultadoVerificacion.discount.isActive ? 'Activo' : 'Inactivo' }}
                        </b-tag>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else-if="errores.verificar" class="notification is-danger">
              {{ errores.verificar }}
            </div>

            <div v-else-if="!cargando.verificando" class="notification is-light">
              Ingrese el nombre de un descuento y haga clic en "Verificar Validez" para comprobar si el descuento está
              vigente.
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab: Calcular Descuentos para un Producto -->
    <div v-if="activeTab === 'calcular'" class="card">
      <header class="card-header">
        <p class="card-header-title">
          <span class="icon mr-2"><i class="mdi mdi-calculator"></i></span>
          Calcular Descuentos para un Producto
        </p>
      </header>
      <div class="card-content">
        <form @submit.prevent="calcularDescuentosProducto">
          <div class="columns is-multiline">
            <!-- ID del Producto -->
            <div class="column is-6">
              <b-field label="ID del Producto" :type="{ 'is-danger': errores.calcularProductId }"
                :message="errores.calcularProductId">
                <b-input v-model.number="calcularDatos.productId" type="number" placeholder="Ej: 123" min="1"
                  required></b-input>
              </b-field>
            </div>

            <!-- Cantidad -->
            <div class="column is-6">
              <b-field label="Cantidad" :type="{ 'is-danger': errores.calcularCantidad }"
                :message="errores.calcularCantidad">
                <b-input v-model.number="calcularDatos.cantidad" type="number" placeholder="Ej: 2" min="1"
                  required></b-input>
              </b-field>
            </div>

            <!-- Precio Unitario -->
            <div class="column is-6">
              <b-field label="Precio Unitario" :type="{ 'is-danger': errores.calcularPrecio }"
                :message="errores.calcularPrecio">
                <b-input v-model.number="calcularDatos.precioUnitario" type="number" placeholder="Ej: 1500" min="0.01"
                  step="0.01" required></b-input>
              </b-field>
            </div>

            <!-- Fecha específica  -->
            <div class="column is-6">
              <b-field label="Fecha específica " :type="{ 'is-danger': errores.calcularFecha }"
                :message="errores.calcularFecha">
                <div class="date-input-container" ref="calcularFechaContainer">
                  <input type="text" class="input" placeholder="dd/mm/aaaa" v-model="calcularFechaInput"
                    @click="toggleCalcFechaCalendar" readonly>
                  <span class="icon is-right">
                    <i class="mdi mdi-calendar"></i>
                  </span>
                </div>
              </b-field>
            </div>
          </div>

          <div class="field mt-4">
            <div class="control">
              <b-button type="is-primary" native-type="submit" :loading="cargando.calculando"
                :disabled="!calcularDatos.productId || !calcularDatos.cantidad || !calcularDatos.precioUnitario"
                expanded>
                Calcular Descuentos
              </b-button>
            </div>
          </div>
        </form>

        <!-- Resultados del cálculo -->
        <div v-if="resultadosCalculo.length > 0" class="mt-5">
          <h5 class="title is-5 mb-3">Descuentos Aplicables</h5>

          <div v-if="resultadosCalculo.length === 0 && !cargando.calculando" class="notification is-warning">
            No se encontraron descuentos aplicables para este producto con los parámetros especificados.
          </div>

          <div v-else class="descuentos-aplicables">
            <div v-for="(resultado, index) in resultadosCalculo" :key="index" class="card mb-4">
              <div class="card-content">
                <div class="columns is-multiline">
                  <div class="column is-12">
                    <div class="level">
                      <div class="level-left">
                        <div class="level-item">
                          <h6 class="title is-6">{{ resultado.discount && resultado.discount.name ?
                            resultado.discount.name
                            : 'Descuento sin nombre' }}</h6>
                        </div>
                      </div>
                      <div class="level-right">
                        <div class="level-item">
                          <b-tag :type="resultado.valid ? 'is-success' : 'is-danger'" size="is-medium">
                            {{ resultado.valid ? 'Válido' : 'No Válido' }}
                          </b-tag>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="column is-6">
                    <div class="field">
                      <label class="label">Tipo de Descuento:</label>
                      <p>
                        <b-tag :type="'is-info'">
                          {{ resultado.discount && resultado.discount.type === 'PERCENTAGE' ? 'Porcentaje' : '' }}
                        </b-tag>
                        <span class="ml-2">{{ resultado.discount && resultado.discount.type === 'PERCENTAGE' ?
                          `${resultado.discount.value || 0}%` :
                          `$${resultado.discount ? (resultado.discount.value || 0) : 0}` }}</span>
                      </p>
                    </div>
                  </div>

                  <div class="column is-6">
                    <div class="field">
                      <label class="label">Cantidad Mínima:</label>
                      <p>{{ resultado.discount ? (resultado.discount.minQuantity || 0) : 0 }}</p>
                    </div>
                  </div>

                  <div class="column is-6">
                    <div class="field">
                      <label class="label">Monto del Descuento:</label>
                      <p class="has-text-weight-bold has-text-success">${{ (resultado.discountAmount || 0).toFixed(2) }}
                      </p>
                    </div>
                  </div>

                  <div class="column is-6">
                    <div class="field">
                      <label class="label">Precio Final:</label>
                      <p class="has-text-weight-bold">${{ (resultado.finalPrice || 0).toFixed(2) }}</p>
                    </div>
                  </div>

                  <div class="column is-12">
                    <div class="field">
                      <label class="label">Vigencia:</label>
                      <p>{{ resultado.validFrom || 'N/A' }} - {{ resultado.validTo || 'N/A' }}</p>
                      <p class="is-size-7 has-text-grey">Zona horaria: {{ resultado.timezone || 'UTC' }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Resumen de precios -->
          <div v-if="resultadosCalculo.length > 0" class="card mt-4 has-background-light">
            <div class="card-content">
              <div class="columns">
                <div class="column is-4">
                  <div class="field">
                    <label class="label">Precio Original:</label>
                    <p class="is-size-5">${{ (calcularDatos.precioUnitario * calcularDatos.cantidad).toFixed(2) }}</p>
                  </div>
                </div>
                <div class="column is-4">
                  <div class="field">
                    <label class="label">Mejor Descuento:</label>
                    <p class="is-size-5 has-text-success">${{ mejorDescuento.toFixed(2) }}</p>
                  </div>
                </div>
                <div class="column is-4">
                  <div class="field">
                    <label class="label">Mejor Precio Final:</label>
                    <p class="is-size-5 has-text-weight-bold">${{ mejorPrecioFinal.toFixed(2) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="errores.calcular" class="notification is-danger mt-4">
          {{ errores.calcular }}
        </div>

        <div v-else-if="!cargando.calculando && activeTab === 'calcular'" class="notification is-light mt-4">
          Complete el formulario y haga clic en "Calcular Descuentos" para ver los descuentos aplicables al producto.
        </div>
      </div>
    </div>

    <!-- Calendarios flotantes -->
    <div v-if="showStartCalendar" class="floating-calendar" :style="startCalendarStyle" ref="startCalendarRef">
      <div class="calendar-header">
        <div class="month-year">
          {{ nombreMes }} de {{ startCalendarYear }}
          <div class="nav-buttons">
            <button @click.stop="prevMonth('start')">
              <span class="icon">←</span>
            </button>
            <button @click.stop="nextMonth('start')">
              <span class="icon">→</span>
            </button>
          </div>
        </div>
      </div>
      <div class="weekdays">
        <div v-for="day in diasSemana" :key="day">{{ day }}</div>
      </div>
      <div class="days">
        <div v-for="day in startCalendarDays" :key="day.id" :class="[
          'day',
          { 'other-month': day.otherMonth },
          { 'selected': isSelectedStartDate(day.date) },
          { 'today': isToday(day.date) }
        ]" @click.stop="selectStartDate(day.date)">
          {{ day.day }}
        </div>
      </div>
      <div class="calendar-footer">
        <button class="btn-clear" @click.stop="clearStartDate">Borrar</button>
        <button class="btn-today" @click.stop="setTodayAsStart">Hoy</button>
      </div>
    </div>

    <div v-if="showEndCalendar" class="floating-calendar" :style="endCalendarStyle" ref="endCalendarRef">
      <div class="calendar-header">
        <div class="month-year">
          {{ nombreMesFin }} de {{ endCalendarYear }}
          <div class="nav-buttons">
            <button @click.stop="prevMonth('end')">
              <span class="icon">←</span>
            </button>
            <button @click.stop="nextMonth('end')">
              <span class="icon">→</span>
            </button>
          </div>
        </div>
      </div>
      <div class="weekdays">
        <div v-for="day in diasSemana" :key="day">{{ day }}</div>
      </div>
      <div class="days">
        <div v-for="day in endCalendarDays" :key="day.id" :class="[
          'day',
          { 'other-month': day.otherMonth },
          { 'selected': isSelectedEndDate(day.date) },
          { 'today': isToday(day.date) }
        ]" @click.stop="selectEndDate(day.date)">
          {{ day.day }}
        </div>
      </div>
      <div class="calendar-footer">
        <button class="btn-clear" @click.stop="clearEndDate">Borrar</button>
        <button class="btn-today" @click.stop="setTodayAsEnd">Hoy</button>
      </div>
    </div>

    <!-- Calendario para fecha de cálculo -->
    <div v-if="showCalcFechaCalendar" class="floating-calendar" :style="calcFechaCalendarStyle"
      ref="calcFechaCalendarRef">
      <div class="calendar-header">
        <div class="month-year">
          {{ calcFechaNombreMes }} de {{ calcFechaCalendarYear }}
          <div class="nav-buttons">
            <button @click.stop="prevMonth('calcFecha')">
              <span class="icon">←</span>
            </button>
            <button @click.stop="nextMonth('calcFecha')">
              <span class="icon">→</span>
            </button>
          </div>
        </div>
      </div>
      <div class="weekdays">
        <div v-for="day in diasSemana" :key="day">{{ day }}</div>
      </div>
      <div class="days">
        <div v-for="day in calcFechaCalendarDays" :key="day.id" :class="[
          'day',
          { 'other-month': day.otherMonth },
          { 'selected': isSelectedCalcFechaDate(day.date) },
          { 'today': isToday(day.date) }
        ]" @click.stop="selectCalcFechaDate(day.date)">
          {{ day.day }}
        </div>
      </div>
      <div class="calendar-footer">
        <button class="btn-clear" @click.stop="clearCalcFechaDate">Borrar</button>
        <button class="btn-today" @click.stop="setTodayAsCalcFecha">Hoy</button>
      </div>
    </div>

    <b-loading :is-full-page="false" v-model="cargando.general" :can-cancel="false"></b-loading>
  </section>
</template>

<script>
import apiRequest from '../../Servicios/HttpService';
import MensajeInicial from '../Extras/MensajeInicial';
import AyudanteSesion from '../../Servicios/AyudanteSesion';

export default {
  name: 'GestionDescuentos', // Nombre multi-palabra para evitar errores
  components: { MensajeInicial },

  data() {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    return {
      // Añadir filtros para los descuentos
      filtros: {
        isActive: null,
        productId: null,
        includeExpired: false,
        date: null
      },
      activeTab: 'lista',
      descuentos: [],
      productos: [],
      categorias: [],
      nuevoDescuento: {
        name: '',
        type: 'PERCENTAGE',
        value: null,
        minQuantity: 1,
        productId: null,
        categoryId: null,
        startDate: null,
        endDate: null,
        isActive: true
      },
      errores: {
        name: '',
        type: '',
        value: '',
        minQuantity: '',
        startDate: '',
        endDate: '',
        productId: '',
        verificarNombre: '',
        verificar: '',
        calcularProductId: '',
        calcularCantidad: '',
        calcularPrecio: '',
        calcularFecha: '',
        calcular: ''
      },
      cargando: {
        general: false,
        lista: false,
        guardando: false,
        verificando: false
      },
      modoEdicion: false,
      descuentoEditandoId: null,

      // Propiedades para la verificación de validez
      verificarDescuentoNombre: '',
      verificarDescuentoSeleccionado: null,
      resultadoVerificacion: null,

      // Propiedades para calcular descuentos
      calcularDatos: {
        productId: null,
        cantidad: 1,
        precioUnitario: null,
        fecha: null
      },
      calcularFechaInput: '',
      resultadosCalculo: [],

      // Calendario personalizado
      fechaInicioInput: '',
      fechaFinInput: '',
      showStartCalendar: false,
      showEndCalendar: false,
      showCalcFechaCalendar: false,
      startCalendarMonth: currentMonth,
      startCalendarYear: currentYear,
      endCalendarMonth: currentMonth,
      endCalendarYear: currentYear,
      calcFechaCalendarMonth: currentMonth,
      calcFechaCalendarYear: currentYear,
      startCalendarStyle: {
        top: '0px',
        left: '0px'
      },
      endCalendarStyle: {
        top: '0px',
        left: '0px'
      },
      calcFechaCalendarStyle: {
        top: '0px',
        left: '0px'
      },
      meses: [
        "enero",
        "febrero",
        "marzo",
        "abril",
        "mayo",
        "junio",
        "julio",
        "agosto",
        "septiembre",
        "octubre",
        "noviembre",
        "diciembre",
      ],
      diasSemana: ["L", "M", "X", "J", "V", "S", "D"],
    };
  },

  computed: {
    descuentosFiltrados() {
      if (!this.verificarDescuentoNombre) {
        return this.descuentos;
      }

      const nombreBusqueda = this.verificarDescuentoNombre.toLowerCase();
      return this.descuentos.filter(descuento =>
        descuento.name.toLowerCase().includes(nombreBusqueda)
      );
    },

    esAdmin() {
      const datosUsuario = AyudanteSesion.obtenerDatosSesion();
      return datosUsuario.rol === 'Admin';
    },
    nombreMes() {
      return this.meses[this.startCalendarMonth];
    },
    nombreMesFin() {
      return this.meses[this.endCalendarMonth];
    },
    calcFechaNombreMes() {
      return this.meses[this.calcFechaCalendarMonth];
    },
    startCalendarDays() {
      return this.getCalendarDays(this.startCalendarYear, this.startCalendarMonth);
    },
    endCalendarDays() {
      return this.getCalendarDays(this.endCalendarYear, this.endCalendarMonth);
    },
    calcFechaCalendarDays() {
      return this.getCalendarDays(this.calcFechaCalendarYear, this.calcFechaCalendarMonth);
    },
    mejorDescuento() {
      if (!this.resultadosCalculo.length) return 0;

      // Encontrar el descuento con el monto más alto
      return Math.max(...this.resultadosCalculo
        .filter(r => r.valid)
        .map(r => r.discountAmount));
    },
    mejorPrecioFinal() {
      if (!this.resultadosCalculo.length) return 0;

      // Encontrar el precio final más bajo
      const precios = this.resultadosCalculo
        .filter(r => r.valid)
        .map(r => r.finalPrice);

      return precios.length ? Math.min(...precios) : (this.calcularDatos.precioUnitario * this.calcularDatos.cantidad);
    }
  },

  mounted() {
  
    this.cargarDescuentos();
    this.cargarCategorias();
    this.verificarPermisos();

    // Eventos para el calendario
    document.addEventListener('click', this.handleClickOutside);
    window.addEventListener('resize', this.updateCalendarPositions);
    window.addEventListener('scroll', this.updateCalendarPositions);
  },

  beforeDestroy() {
    // Limpiar eventos
    document.removeEventListener('click', this.handleClickOutside);
    window.removeEventListener('resize', this.updateCalendarPositions);
    window.removeEventListener('scroll', this.updateCalendarPositions);
  },

  watch: {
    activeTab() {
      this.verificarPermisos();
    }
  },

  methods: {

    async buscarProductos(termino) {
      if (!termino || termino.trim() === '') {
        this.productos = []; // Limpiar la lista si no hay término
        return;
      }

      this.cargando.productos = true;
      try {
        const response = await apiRequest({
          method: 'GET',
          path: `products/search/${termino}`, // Ajusta la ruta según sea necesario

        });

        if (response && response.data) {
          // Filtrar y mapear los productos
          this.productos = response.data.filter(producto => !producto.isDeleted).map(producto => ({
            id: producto.id,
            name: `${producto.name} (${producto.brand?.brandName || 'Sin Marca'}) - ${producto.category?.categoryName || 'Sin Categoría'}`,
            code: producto.code,
            stock: producto.stock,
            category: producto.category.id
          }));
        } else {
          this.productos = [];
        }
      } catch (error) {
        console.error('Error al buscar productos:', error);

      } finally {
        this.cargando.productos = false;
      }
    },
    productoSeleccionadoHandler(producto) {
      if (producto) {
        console.log('Producto seleccionado:', producto);
        this.nuevoDescuento.productId = producto.id; // Asignar el ID del producto seleccionado
        this.nuevoDescuento.categoryId = producto.category || null; // Asignar el ID de la categoría del producto
        this.productoSeleccionado = producto; // Guardar el producto seleccionado
      } else {
        this.nuevoDescuento.productId = null; // Limpiar el ID del producto si no hay selección
        this.nuevoDescuento.categoryId = null; // Limpiar el ID de la categoría si no hay selección
      }
    },
    verificarPermisos() {
      // Si no es admin y está en una pestaña restringida, redirigir a una pestaña permitida
      if (!this.esAdmin && (this.activeTab === 'lista' || this.activeTab === 'nuevo')) {
        this.activeTab = 'verificar';

      }
    },
    // Método para validar el ID del producto
    validarProductId() {
      this.errores.productId = '';

      // Si el campo está vacío, establecer productId como null
      if (this.nuevoDescuento.productId === '' || this.nuevoDescuento.productId === undefined) {
        this.nuevoDescuento.productId = null;
        return;
      }


    },

    // Métodos para el calendario personalizado
    toggleStartCalendar() {
      if (this.showEndCalendar) {
        this.showEndCalendar = false;
      }
      if (this.showCalcFechaCalendar) {
        this.showCalcFechaCalendar = false;
      }
      this.showStartCalendar = !this.showStartCalendar;
      if (this.showStartCalendar) {
        this.$nextTick(() => {
          this.positionStartCalendar();
        });
      }
    },

    toggleEndCalendar() {
      if (this.showStartCalendar) {
        this.showStartCalendar = false;
      }
      if (this.showCalcFechaCalendar) {
        this.showCalcFechaCalendar = false;
      }
      this.showEndCalendar = !this.showEndCalendar;
      if (this.showEndCalendar) {
        this.$nextTick(() => {
          this.positionEndCalendar();
        });
      }
    },

    toggleCalcFechaCalendar() {
      if (this.showStartCalendar) {
        this.showStartCalendar = false;
      }
      if (this.showEndCalendar) {
        this.showEndCalendar = false;
      }
      this.showCalcFechaCalendar = !this.showCalcFechaCalendar;
      if (this.showCalcFechaCalendar) {
        this.$nextTick(() => {
          this.positionCalcFechaCalendar();
        });
      }
    },

    positionStartCalendar() {
      const inputEl = this.$refs.startDateContainer;
      if (inputEl && this.$refs.startCalendarRef) {
        const rect = inputEl.getBoundingClientRect();
        const calendarHeight = this.$refs.startCalendarRef.offsetHeight;
        const windowHeight = window.innerHeight;

        // Verificar si hay suficiente espacio debajo
        const spaceBelow = windowHeight - rect.bottom;
        const showBelow = spaceBelow >= calendarHeight;

        this.startCalendarStyle = {
          top: showBelow ? `${rect.bottom + window.scrollY}px` : `${rect.top + window.scrollY - calendarHeight}px`,
          left: `${rect.left + window.scrollX}px`,
          zIndex: '1000'
        };
      }
    },

    positionEndCalendar() {
      const inputEl = this.$refs.endDateContainer;
      if (inputEl && this.$refs.endCalendarRef) {
        const rect = inputEl.getBoundingClientRect();
        const calendarHeight = this.$refs.endCalendarRef.offsetHeight;
        const windowHeight = window.innerHeight;

        // Verificar si hay suficiente espacio debajo
        const spaceBelow = windowHeight - rect.bottom;
        const showBelow = spaceBelow >= calendarHeight;

        this.endCalendarStyle = {
          top: showBelow ? `${rect.bottom + window.scrollY}px` : `${rect.top + window.scrollY - calendarHeight}px`,
          left: `${rect.left + window.scrollX}px`,
          zIndex: '1000'
        };
      }
    },

    positionCalcFechaCalendar() {
      const inputEl = this.$refs.calcularFechaContainer;
      if (inputEl && this.$refs.calcFechaCalendarRef) {
        const rect = inputEl.getBoundingClientRect();
        const calendarHeight = this.$refs.calcFechaCalendarRef.offsetHeight;
        const windowHeight = window.innerHeight;

        // Verificar si hay suficiente espacio debajo
        const spaceBelow = windowHeight - rect.bottom;
        const showBelow = spaceBelow >= calendarHeight;

        this.calcFechaCalendarStyle = {
          top: showBelow ? `${rect.bottom + window.scrollY}px` : `${rect.top + window.scrollY - calendarHeight}px`,
          left: `${rect.left + window.scrollX}px`,
          zIndex: '1000'
        };
      }
    },

    updateCalendarPositions() {
      if (this.showStartCalendar) {
        this.positionStartCalendar();
      }
      if (this.showEndCalendar) {
        this.positionEndCalendar();
      }
      if (this.showCalcFechaCalendar) {
        this.positionCalcFechaCalendar();
      }
    },

    handleClickOutside(event) {
      // Cerrar calendario inicial si se hace clic fuera
      if (this.showStartCalendar &&
        this.$refs.startCalendarRef &&
        !this.$refs.startCalendarRef.contains(event.target) &&
        this.$refs.startDateContainer &&
        !this.$refs.startDateContainer.contains(event.target)) {
        this.showStartCalendar = false;
      }

      // Cerrar calendario final si se hace clic fuera
      if (this.showEndCalendar &&
        this.$refs.endCalendarRef &&
        !this.$refs.endCalendarRef.contains(event.target) &&
        this.$refs.endDateContainer &&
        !this.$refs.endDateContainer.contains(event.target)) {
        this.showEndCalendar = false;
      }

      // Cerrar calendario de fecha de cálculo si se hace clic fuera
      if (this.showCalcFechaCalendar &&
        this.$refs.calcFechaCalendarRef &&
        !this.$refs.calcFechaCalendarRef.contains(event.target) &&
        this.$refs.calcularFechaContainer &&
        !this.$refs.calcularFechaContainer.contains(event.target)) {
        this.showCalcFechaCalendar = false;
      }
    },

    getCalendarDays(year, month) {
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();

      // Obtener el día de la semana del primer día (0 = domingo, 1 = lunes, ..., 6 = sábado)
      let firstDayOfWeek = firstDay.getDay();
      // Ajustar para que lunes sea 0
      firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

      const days = [];

      // Días del mes anterior
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevMonthYear = month === 0 ? year - 1 : year;
      const daysInPrevMonth = new Date(prevMonthYear, prevMonth + 1, 0).getDate();

      for (let i = 0; i < firstDayOfWeek; i++) {
        const day = daysInPrevMonth - firstDayOfWeek + i + 1;
        days.push({
          day,
          date: new Date(prevMonthYear, prevMonth, day),
          otherMonth: true,
          id: `prev-${day}`
        });
      }

      // Días del mes actual
      for (let i = 1; i <= daysInMonth; i++) {
        days.push({
          day: i,
          date: new Date(year, month, i),
          otherMonth: false,
          id: `current-${i}`
        });
      }

      // Días del mes siguiente
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextMonthYear = month === 11 ? year + 1 : year;
      const remainingDays = 42 - days.length; // 6 filas x 7 días

      for (let i = 1; i <= remainingDays; i++) {
        days.push({
          day: i,
          date: new Date(nextMonthYear, nextMonth, i),
          otherMonth: true,
          id: `next-${i}`
        });
      }

      return days;
    },

    isSelectedStartDate(date) {
      if (!this.nuevoDescuento.startDate) return false;

      return date.getDate() === this.nuevoDescuento.startDate.getDate() &&
        date.getMonth() === this.nuevoDescuento.startDate.getMonth() &&
        date.getFullYear() === this.nuevoDescuento.startDate.getFullYear();
    },

    isSelectedEndDate(date) {
      if (!this.nuevoDescuento.endDate) return false;

      return date.getDate() === this.nuevoDescuento.endDate.getDate() &&
        date.getMonth() === this.nuevoDescuento.endDate.getMonth() &&
        date.getFullYear() === this.nuevoDescuento.endDate.getFullYear();
    },

    isSelectedCalcFechaDate(date) {
      if (!this.calcularDatos.fecha) return false;

      return date.getDate() === this.calcularDatos.fecha.getDate() &&
        date.getMonth() === this.calcularDatos.fecha.getMonth() &&
        date.getFullYear() === this.calcularDatos.fecha.getFullYear();
    },

    isToday(date) {
      const today = new Date();
      return date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
    },

    selectStartDate(date) {
      this.nuevoDescuento.startDate = new Date(date);
      this.fechaInicioInput = this.formatDateForInput(date);
      this.showStartCalendar = false;
    },

    selectEndDate(date) {
      this.nuevoDescuento.endDate = new Date(date);
      this.fechaFinInput = this.formatDateForInput(date);
      this.showEndCalendar = false;
    },

    selectCalcFechaDate(date) {
      this.calcularDatos.fecha = new Date(date);
      this.calcularFechaInput = this.formatDateForInput(date);
      this.showCalcFechaCalendar = false;
    },

    prevMonth(type) {
      if (type === 'start') {
        if (this.startCalendarMonth === 0) {
          this.startCalendarMonth = 11;
          this.startCalendarYear--;
        } else {
          this.startCalendarMonth--;
        }
      } else if (type === 'end') {
        if (this.endCalendarMonth === 0) {
          this.endCalendarMonth = 11;
          this.endCalendarYear--;
        } else {
          this.endCalendarMonth--;
        }
      } else if (type === 'calcFecha') {
        if (this.calcFechaCalendarMonth === 0) {
          this.calcFechaCalendarMonth = 11;
          this.calcFechaCalendarYear--;
        } else {
          this.calcFechaCalendarMonth--;
        }
      }
    },

    nextMonth(type) {
      if (type === 'start') {
        if (this.startCalendarMonth === 11) {
          this.startCalendarMonth = 0;
          this.startCalendarYear++;
        } else {
          this.startCalendarMonth++;
        }
      } else if (type === 'end') {
        if (this.endCalendarMonth === 11) {
          this.endCalendarMonth = 0;
          this.endCalendarYear++;
        } else {
          this.endCalendarMonth++;
        }
      } else if (type === 'calcFecha') {
        if (this.calcFechaCalendarMonth === 11) {
          this.calcFechaCalendarMonth = 0;
          this.calcFechaCalendarYear++;
        } else {
          this.calcFechaCalendarMonth++;
        }
      }
    },

    clearStartDate() {
      this.nuevoDescuento.startDate = null;
      this.fechaInicioInput = "";
      this.showStartCalendar = false;
    },

    clearEndDate() {
      this.nuevoDescuento.endDate = null;
      this.fechaFinInput = "";
      this.showEndCalendar = false;
    },

    clearCalcFechaDate() {
      this.calcularDatos.fecha = null;
      this.calcularFechaInput = "";
      this.showCalcFechaCalendar = false;
    },

    setTodayAsStart() {
      const today = new Date();
      this.nuevoDescuento.startDate = today;
      this.fechaInicioInput = this.formatDateForInput(today);
      this.startCalendarMonth = today.getMonth();
      this.startCalendarYear = today.getFullYear();
      this.showStartCalendar = false;
    },

    setTodayAsEnd() {
      const today = new Date();
      this.nuevoDescuento.endDate = today;
      this.fechaFinInput = this.formatDateForInput(today);
      this.endCalendarMonth = today.getMonth();
      this.endCalendarYear = today.getFullYear();
      this.showEndCalendar = false;
    },

    setTodayAsCalcFecha() {
      const today = new Date();
      this.calcularDatos.fecha = today;
      this.calcularFechaInput = this.formatDateForInput(today);
      this.calcFechaCalendarMonth = today.getMonth();
      this.calcFechaCalendarYear = today.getFullYear();
      this.showCalcFechaCalendar = false;
    },

    formatDateForInput(date) {
      if (!date) return '';
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    },

    formatDateForApi(date) {
      if (!date) return '';
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },

    // Métodos originales del componente
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },

    async cargarDescuentos() {
      this.cargando.lista = true;
      try {
        // Construir los parámetros de consulta basados en los filtros
        const params = {};

        if (this.filtros.isActive !== null) {
          params.isActive = this.filtros.isActive;
        }

        if (this.filtros.productId) {
          params.productId = this.filtros.productId;
        }

        if (this.filtros.includeExpired) {
          params.includeExpired = this.filtros.includeExpired;
        }

        if (this.filtros.date) {
          // Asegurarse de que la fecha esté en formato YYYY-MM-DD
          params.date = this.filtros.date;
        }

        const response = await apiRequest({
          method: 'GET',
          path: 'discounts',
          params: params
        });

        if (response && response.data) {
          this.descuentos = Array.isArray(response.data) ? response.data : [];

          // Depuración para ver la estructura de los datos
          console.log('Descuentos cargados:', this.descuentos);
        } else {
          this.descuentos = [];
        }
      } catch (error) {
        console.error('Error al cargar descuentos:', error);
        this.$buefy.toast.open({
          message: 'Error al cargar la lista de descuentos',
          type: 'is-danger',
          duration: 3000
        });
        this.descuentos = [];
      } finally {
        this.cargando.lista = false;
      }
    },

    async cargarCategorias() {
      try {
        const response = await apiRequest({
          method: 'GET',
          path: 'categories'
        });

        if (response && response.data) {
          this.categorias = Array.isArray(response.data) ? response.data : [];
        } else {
          this.categorias = [];
        }
      } catch (error) {
        console.error('Error al cargar categorías:', error);
        this.categorias = [];
      }
    },

    validarFormulario() {
      let esValido = true;
      this.errores = {
        name: '',
        type: '',
        value: '',
        minQuantity: '',
        startDate: '',
        endDate: '',
        productId: '',
        verificarNombre: '',
        verificar: '',
        calcularProductId: '',
        calcularCantidad: '',
        calcularPrecio: '',
        calcularFecha: '',
        calcular: ''
      };

      if (!this.nuevoDescuento.name.trim()) {
        this.errores.name = 'El nombre del descuento es requerido';
        esValido = false;
      }

      if (!this.nuevoDescuento.type) {
        this.errores.type = 'El tipo de descuento es requerido';
        esValido = false;
      }

      if (this.nuevoDescuento.value === null || this.nuevoDescuento.value === undefined || this.nuevoDescuento.value <= 0) {
        this.errores.value = 'El valor del descuento debe ser mayor a 0';
        esValido = false;
      } else if (this.nuevoDescuento.type === 'PERCENTAGE' && this.nuevoDescuento.value > 100) {
        this.errores.value = 'El porcentaje no puede ser mayor a 100%';
        esValido = false;
      }

      if (!this.nuevoDescuento.minQuantity || this.nuevoDescuento.minQuantity < 1) {
        this.errores.minQuantity = 'La cantidad mínima debe ser al menos 1';
        esValido = false;
      }

      if (!this.nuevoDescuento.productId) {
        this.errores.productId = 'Debe seleccionar un producto válido';
        esValido = false;
      }

      if (!this.nuevoDescuento.startDate) {
        this.errores.startDate = 'La fecha de inicio es requerida';
        esValido = false;
      }

      if (!this.nuevoDescuento.endDate) {
        this.errores.endDate = 'La fecha de fin es requerida';
        esValido = false;
      } else if (this.nuevoDescuento.startDate && this.nuevoDescuento.endDate &&
        new Date(this.nuevoDescuento.endDate) <= new Date(this.nuevoDescuento.startDate)) {
        this.errores.endDate = 'La fecha de fin debe ser posterior a la fecha de inicio';
        esValido = false;
      }

      return esValido;
    },

    validarFormularioCalculo() {
      let esValido = true;
      this.errores.calcularProductId = '';
      this.errores.calcularCantidad = '';
      this.errores.calcularPrecio = '';
      this.errores.calcularFecha = '';
      this.errores.calcular = '';

      if (!this.calcularDatos.productId || this.calcularDatos.productId <= 0) {
        this.errores.calcularProductId = 'El ID del producto es requerido y debe ser un número positivo';
        esValido = false;
      }

      if (!this.calcularDatos.cantidad || this.calcularDatos.cantidad <= 0) {
        this.errores.calcularCantidad = 'La cantidad es requerida y debe ser mayor a 0';
        esValido = false;
      }

      if (!this.calcularDatos.precioUnitario || this.calcularDatos.precioUnitario <= 0) {
        this.errores.calcularPrecio = 'El precio unitario es requerido y debe ser mayor a 0';
        esValido = false;
      }

      // La fecha es , pero si se proporciona debe ser válida
      if (this.calcularDatos.fecha && !(this.calcularDatos.fecha instanceof Date && !isNaN(this.calcularDatos.fecha))) {
        this.errores.calcularFecha = 'La fecha proporcionada no es válida';
        esValido = false;
      }

      return esValido;
    },

    prepararDatosParaEnvio() {
      // Crear una copia del objeto para no modificar el original
      const datos = { ...this.nuevoDescuento };

      // Formatear fechas a ISO string
      if (datos.startDate instanceof Date) {
        datos.startDate = datos.startDate.toISOString();
      }

      if (datos.endDate instanceof Date) {
        datos.endDate = datos.endDate.toISOString();
      }

      // Asegurarse de que los valores sean del tipo correcto
      datos.value = Number(datos.value);
      datos.minQuantity = Number(datos.minQuantity);

      // Asegurarse de que los IDs sean null cuando corresponda
      datos.productId = datos.productId || null;
      datos.categoryId = datos.categoryId || null; // Incluir el categoryId

      // Asegurarse de que isActive sea booleano
      datos.isActive = Boolean(datos.isActive);

      console.log('Datos preparados para enviar:', datos);
      return datos;
    },
    async guardarDescuento() {
      if (!this.validarFormulario()) {
        return;
      }

      this.cargando.guardando = true;

      try {
        // Preparar los datos para enviar
        const datos = this.prepararDatosParaEnvio();
        console.log('Datos a enviar:', datos); // Para depuración

        let response;
        if (this.modoEdicion) {
          response = await apiRequest({
            method: 'PATCH',
            path: `discounts/${this.descuentoEditandoId}`,
            data: datos
          });
        } else {
          response = await apiRequest({
            method: 'POST',
            path: 'discounts',
            data: datos
          });
        }

        if (response) {
          this.$buefy.toast.open({
            message: this.modoEdicion ? 'Descuento actualizado exitosamente' : 'Descuento creado exitosamente',
            type: 'is-success',
            duration: 3000
          });

          this.resetearFormulario();
          this.cargarDescuentos();
          this.activeTab = 'lista';
        }
      } catch (error) {
        console.error('Error al guardar descuento:', error);

        let mensajeError = `Error al ${this.modoEdicion ? 'actualizar' : 'crear'} el descuento`;

        // Verificar si hay errores de validación específicos
        if (error.response && error.response.data && error.response.data.errors) {
          const errores = error.response.data.errors;

          // Mapear los errores del backend a los campos del formulario
          Object.keys(errores).forEach(campo => {
            if (Object.prototype.hasOwnProperty.call(this.errores, campo)) {
              this.errores[campo] = Array.isArray(errores[campo])
                ? errores[campo][0]
                : errores[campo];
            }
          });

          mensajeError += ': Por favor, corrija los errores en el formulario';
        } else if (error.message) {
          mensajeError += `: ${error.message}`;
        }

        this.$buefy.toast.open({
          message: mensajeError,
          type: 'is-danger',
          duration: 5000
        });
      } finally {
        this.cargando.guardando = false;
      }
    },

    editarDescuento(descuento) {
      this.modoEdicion = true;
      this.descuentoEditandoId = descuento.id;

      console.log('Editando descuento:', descuento); // Para depuración

      // Copiar los datos del descuento al formulario
      this.nuevoDescuento = {
        name: descuento.name || '',
        type: descuento.type || 'PERCENTAGE',
        value: descuento.value !== undefined ? Number(descuento.value) : null,
        minQuantity: descuento.minQuantity !== undefined ? Number(descuento.minQuantity) : 1,
        productId: descuento.product ? descuento.product.id : (descuento.productId || null),
        categoryId: descuento.category ? descuento.category.id : (descuento.categoryId || null),
        startDate: descuento.startDate ? new Date(descuento.startDate) : null,
        endDate: descuento.endDate ? new Date(descuento.endDate) : null,
        isActive: Boolean(descuento.isActive)
      };

      // Actualizar los campos de entrada de fecha
      this.fechaInicioInput = this.formatDateForInput(this.nuevoDescuento.startDate);
      this.fechaFinInput = this.formatDateForInput(this.nuevoDescuento.endDate);

      this.activeTab = 'nuevo';
    },
    cancelarEdicion() {
      this.resetearFormulario();
      this.modoEdicion = false;
      this.descuentoEditandoId = null;
    },

    resetearFormulario() {
      this.nuevoDescuento = {
        name: '',
        type: 'PERCENTAGE',
        value: null,
        minQuantity: 1,
        productId: null,
        categoryId: null,
        startDate: null,
        endDate: null,
        isActive: true
      };

      this.fechaInicioInput = '';
      this.fechaFinInput = '';

      this.errores = {
        name: '',
        type: '',
        value: '',
        minQuantity: '',
        startDate: '',
        endDate: '',
        productId: '',
        verificarNombre: '',
        verificar: '',
        calcularProductId: '',
        calcularCantidad: '',
        calcularPrecio: '',
        calcularFecha: '',
        calcular: ''
      };

      this.modoEdicion = false;
      this.descuentoEditandoId = null;
    },

    async eliminarDescuento(id) {
      this.$buefy.dialog.confirm({
        title: 'Eliminar Descuento',
        message: '¿Está seguro que desea eliminar este descuento? Esta acción no se puede deshacer.',
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        type: 'is-danger',
        hasIcon: true,
        onConfirm: async () => {
          this.cargando.general = true;

          try {
            const response = await apiRequest({
              method: 'DELETE',
              path: `discounts/${id}`
            });

            // Verificar si la respuesta es exitosa (código 200)
            if (response && response.status === 200) {
              this.$buefy.toast.open({
                message: 'Descuento eliminado exitosamente',
                type: 'is-success',
                duration: 3000
              });

              this.cargarDescuentos();
            }
          } catch (error) {
            console.error('Error al eliminar descuento:', error);

            // Verificar si el error es porque el descuento no fue encontrado
            if (error.response && error.response.status === 404) {
              this.$buefy.toast.open({
                message: 'El descuento no existe o ya fue eliminado',
                type: 'is-warning',
                duration: 3000
              });
              // Recargar la lista para asegurar que esté actualizada
              this.cargarDescuentos();
            } else {
              this.$buefy.toast.open({
                message: 'Error al eliminar el descuento',
                type: 'is-danger',
                duration: 3000
              });
            }
          } finally {
            this.cargando.general = false;
          }
        }
      });
    },

    async toggleEstadoDescuento(descuento) {
      this.cargando.general = true;

      try {
        const nuevoEstado = !descuento.isActive;
        const response = await apiRequest({
          method: 'PATCH',
          path: `discounts/${descuento.id}/toggle-status`,
          data: { isActive: nuevoEstado }
        });

        if (response) {
          this.$buefy.toast.open({
            message: `Descuento ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente`,
            type: 'is-success'
          });

          this.cargarDescuentos();
        }
      } catch (error) {
        console.error('Error al cambiar estado del descuento:', error);
        this.$buefy.toast.open({
          message: 'Error al cambiar el estado del descuento',
          type: 'is-danger'
        });
      } finally {
        this.cargando.general = false;
      }
    },

    // Método para aplicar filtros
    aplicarFiltros() {
      this.cargarDescuentos();
    },

    // Método para resetear filtros
    resetearFiltros() {
      this.filtros = {
        isActive: null,
        productId: null,
        includeExpired: false,
        date: null
      };
      this.cargarDescuentos();
    },

    opcionSeleccionada(descuento) {
      if (descuento) {
        this.verificarDescuentoSeleccionado = descuento;
        this.verificarDescuentoNombre = descuento.name;
      }
    },

    async verificarValidezDescuentoPorNombre() {
      // Limpiar errores previos
      this.errores.verificarNombre = '';
      this.errores.verificar = '';
      this.resultadoVerificacion = null;

      // Validar que se haya ingresado un nombre
      if (!this.verificarDescuentoNombre.trim()) {
        this.errores.verificarNombre = 'Debe ingresar un nombre de descuento';
        return;
      }

      // Si no se seleccionó un descuento del autocompletado, buscar por nombre
      if (!this.verificarDescuentoSeleccionado) {
        const descuentoEncontrado = this.descuentos.find(
          d => d.name.toLowerCase() === this.verificarDescuentoNombre.toLowerCase()
        );

        if (!descuentoEncontrado) {
          this.errores.verificar = 'No se encontró ningún descuento con ese nombre exacto';
          return;
        }

        this.verificarDescuentoSeleccionado = descuentoEncontrado;
      }

      this.cargando.verificando = true;

      try {
        const response = await apiRequest({
          method: 'GET',
          path: `discounts/${this.verificarDescuentoSeleccionado.id}/check-validity`
        });

        if (response && response.data) {
          this.resultadoVerificacion = response.data;
          console.log('Resultado de verificación:', this.resultadoVerificacion);
        } else {
          this.errores.verificar = 'No se pudo obtener información sobre la validez del descuento';
        }
      } catch (error) {
        console.error('Error al verificar validez del descuento:', error);

        if (error.response && error.response.status === 404) {
          this.errores.verificar = 'El descuento no existe en el sistema';
        } else if (error.response && error.response.data && error.response.data.message) {
          this.errores.verificar = error.response.data.message;
        } else {
          this.errores.verificar = 'Error al verificar la validez del descuento';
        }
      } finally {
        this.cargando.verificando = false;
        // Limpiar la selección después de verificar
        this.verificarDescuentoSeleccionado = null;
      }
    },

    async calcularDescuentosProducto() {
      // Validar el formulario
      if (!this.validarFormularioCalculo()) {
        return;
      }

      this.cargando.calculando = true;
      this.resultadosCalculo = [];
      this.errores.calcular = '';

      try {

        let url = `discounts/product/${this.calcularDatos.productId}/calculate?quantity=${this.calcularDatos.cantidad}&unitPrice=${this.calcularDatos.precioUnitario}`;

        // Añadir fecha si está presente
        if (this.calcularDatos.fecha) {
          url += `&date=${this.formatDateForApi(this.calcularDatos.fecha)}`;
        }

        console.log('URL completa:', url);

        const response = await apiRequest({
          method: 'GET',
          path: url
        });

        console.log('Respuesta completa:', response);

        if (response && response.data) {

          let resultados = response.data;

          // Si no es un array, convertirlo en uno
          if (!Array.isArray(resultados)) {
            resultados = [resultados];
          }

          this.resultadosCalculo = resultados;
          console.log('Resultados de cálculo:', this.resultadosCalculo);

          if (this.resultadosCalculo.length === 0) {
            this.$buefy.toast.open({
              message: 'No se encontraron descuentos aplicables para este producto',
              type: 'is-warning',
              duration: 3000
            });
          } else {
            this.$buefy.toast.open({
              message: `Se encontraron ${this.resultadosCalculo.length} descuento(s) aplicable(s)`,
              type: 'is-success',
              duration: 3000
            });
          }
        } else {
          this.resultadosCalculo = [];
          this.errores.calcular = 'No se pudo obtener información sobre los descuentos aplicables';
        }
      } catch (error) {
        console.error('Error al calcular descuentos:', error);

        if (error.response && error.response.status === 404) {
          this.errores.calcular = 'El producto especificado no existe';
        } else if (error.response && error.response.status === 400) {
          this.errores.calcular = 'Parámetros incorrectos. Verifique los valores ingresados.';

          // Mostrar detalles del error si están disponibles
          if (error.response.data && error.response.data.message) {
            this.errores.calcular += ` Detalle: ${error.response.data.message}`;
          }
        } else if (error.response && error.response.data && error.response.data.message) {
          this.errores.calcular = error.response.data.message;
        } else {
          this.errores.calcular = 'Error al calcular los descuentos aplicables';
        }
      } finally {
        this.cargando.calculando = false;
      }
    }
  }
};
</script>

<style scoped>
.card {
  margin-bottom: 1.5rem;
}

/* Estilos para el contenedor de entrada de fecha */
.date-input-container {
  position: relative;
  width: 100%;
}

.date-input-container .icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

/* Estilos para el calendario flotante */
.floating-calendar {
  position: absolute;
  width: 300px;
  background-color: white;
  border: 1px solid #dbdbdb;
  border-radius: 4px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 15px;
  z-index: 1000;
}

.calendar-header {
  margin-bottom: 15px;
  text-align: center;
}

.month-year {
  font-weight: bold;
  position: relative;
  font-size: 1.1rem;
  text-transform: capitalize;
}

.nav-buttons {
  position: absolute;
  right: 0;
  top: 0;
  display: flex;
  gap: 10px;
}

.nav-buttons button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0 5px;
  font-size: 1.2rem;
  color: #3273dc;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-weight: bold;
  margin-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 5px;
}

.days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
}

.day {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 35px;
  cursor: pointer;
  border-radius: 4px;
  font-size: 14px;
}

.day:hover {
  background-color: #f5f5f5;
}

.day.other-month {
  color: #b5b5b5;
}

.day.selected {
  background-color: #3273dc;
  color: white;
}

.day.today {
  border: 1px solid #3273dc;
}

.calendar-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
}

.btn-clear,
.btn-today {
  background: none;
  border: none;
  cursor: pointer;
  color: #3273dc;
  padding: 5px 10px;
  border-radius: 4px;
}

.btn-clear:hover,
.btn-today:hover {
  background-color: #f0f0f0;
}

.btn-today {
  font-weight: bold;
}

@media screen and (max-width: 768px) {
  .floating-calendar {
    width: 280px;
    left: 50% !important;
    transform: translateX(-50%);
  }
}
</style>