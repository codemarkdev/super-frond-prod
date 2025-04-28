<template>
	<section>
		<!-- Título principal que cambia según la pestaña activa -->
		<div v-if="activeTab === 'activos'">
			<div class="level mb-5">
				<div class="level-left">
					<div class="level-item">
						<h1 class="title is-4">Clientes</h1>
					</div>
				</div>
				<div class="level-right">
					<div class="level-item">
						<router-link to="/agregar-cliente" class="button is-primary">
							<span class="icon">
								<i class="mdi mdi-plus"></i>
							</span>
							<span>Agregar cliente</span>
						</router-link>
					</div>
				</div>
			</div>
		</div>
		<div v-else-if="activeTab === 'eliminados'">
			<div class="level mb-5">
				<div class="level-left">
					<div class="level-item">
						<h1 class="title is-4">Clientes Eliminados</h1>
					</div>
				</div>
				<!-- Sin botón de agregar en esta vista -->
			</div>
		</div>
		
		<!-- Implementando tabs de Bulma -->
		<div class="tabs is-boxed mb-4">
			<ul>
				<li :class="{ 'is-active': activeTab === 'activos' }">
					<a @click="cambiarTab('activos')">
						<span class="icon is-small"><i class="mdi mdi-account-multiple"></i></span>
						<span>Clientes Activos</span>
					</a>
				</li>
				<li :class="{ 'is-active': activeTab === 'eliminados' }">
					<a @click="cambiarTab('eliminados')">
						<span class="icon is-small"><i class="mdi mdi-archive"></i></span>
						<span>Clientes Eliminados</span>
					</a>
				</li>
			</ul>
		</div>

		<!-- Clientes Activos Tab Content -->
		<div v-if="activeTab === 'activos'">
			<div v-if="clientes.length < 1">
				<mensaje-inicial :titulo="'No se han encontrado clientes'" 
					:subtitulo="'Agrega clientes pulsando el botón de Agregar cliente'" />
			</div>

			<div v-if="clientes.length > 0">
				<div>
					<b-table :data="clientes" :per-page="perPage"
						:current-page.sync="currentPage" :pagination-simple="isPaginationSimple"
						:pagination-position="paginationPosition" :default-sort-direction="defaultSortDirection"
						:pagination-rounded="isPaginationRounded" :sort-icon="sortIcon" :sort-icon-size="sortIconSize"
						default-sort="name" aria-next-label="Next page" aria-previous-label="Previous page"
						aria-page-label="Page" aria-current-label="Current page"
						:sticky-header="false" :height="null">
						<b-table-column field="name" label="Nombre del cliente" sortable searchable v-slot="props">
							{{ props.row.name }}
						</b-table-column>

						<b-table-column field="phone" label="Teléfono" sortable searchable v-slot="props">
							{{ props.row.phone }}
						</b-table-column>

						<b-table-column field="acciones" label="Acciones" v-slot="props" centered>
							<div class="buttons is-centered">
								<b-tooltip label="Ver ventas" position="is-top">
									<b-button class="btn-info" @click="verVentas(props.row.id, props.row.name)">
										<b-icon icon="shopping" />
									</b-button>
								</b-tooltip>
								<b-tooltip label="Editar cliente" position="is-top">
									<b-button class="btn-primary" @click="editar(props.row.id)">
										<b-icon icon="pen" />
									</b-button>
								</b-tooltip>
								<b-tooltip label="Eliminar cliente" position="is-top">
									<b-button class="btn-link" @click="eliminar(props.row.id)">
										<b-icon icon="delete" />
									</b-button>
								</b-tooltip>
							</div>
						</b-table-column>
					</b-table>
					<b-pagination
						v-if="totalPages > 1"
						:total="totalClientes"
						:current.sync="currentPage"
						:per-page="perPage"
						:rounded="isPaginationRounded"
						:simple="isPaginationSimple"
						:position="paginationPosition"
						@change="obtenerClientes"
					></b-pagination>
				</div>
			</div>
		</div>

		<!-- Componente Clientes Eliminados -->
		<clientes-eliminados v-if="activeTab === 'eliminados'" @cliente-restaurado="obtenerClientes" />
		
		<b-loading :is-full-page="true" v-model="cargando" :can-cancel="false"></b-loading>

		<!-- Modal para mostrar las ventas del cliente -->
		<b-modal :active.sync="isVentasModalActive" has-modal-card trap-focus aria-role="dialog" aria-modal>
			<div class="modal-card" style="width: auto; max-width: 80vw;">
				<header class="modal-card-head">
					<p class="modal-card-title">Ventas del Cliente: {{ clienteSeleccionadoNombre }}</p>
					<button class="delete" aria-label="close" @click="isVentasModalActive = false"></button>
				</header>
				<section class="modal-card-body">
					<div v-if="!clienteTieneVentas" class="has-text-centered">
						<div class="box p-6">
							<div class="icon-text is-flex is-justify-content-center mb-4">
								<span class="icon has-text-warning is-large">
									<i class="mdi mdi-alert-circle mdi-36px"></i>
								</span>
							</div>
							<p class="is-size-4 mb-4">Este cliente no tiene compras registradas</p>
							<p class="is-size-6 has-text-grey">
								El cliente no ha realizado ninguna compra hasta el momento.
							</p>
						</div>
					</div>
					<div v-else class="has-text-centered">
						<div class="box p-6">
							<h2 class="title is-4 mb-4">Resumen de Ventas</h2>
							<div class="columns">
								<div class="column">
									<div class="card">
										<div class="card-content">
											<p class="title is-5">Total de Ventas</p>
											<p class="subtitle is-2 has-text-primary">${{ ventasCliente.totalSales.toFixed(2) }}</p>
										</div>
									</div>
								</div>
							</div>
							<p class="mt-4 is-size-6 has-text-grey">
								Para ver el detalle completo de las ventas, consulte el módulo de ventas.
							</p>
						</div>
					</div>
				</section>
				<footer class="modal-card-foot">
					<button class="button" @click="isVentasModalActive = false">Cerrar</button>
				</footer>
			</div>
		</b-modal>
	</section>
</template>

<script>
import MensajeInicial from '../Extras/MensajeInicial'
import ClientesEliminados from './Clientes-Eliminados.vue'
import apiRequest from '../../Servicios/HttpService';

export default {
	name: "ClientesComponent",
	components: { 
		MensajeInicial,
		ClientesEliminados
	},

	data: () => ({
		activeTab: 'activos',
		cargando: false,
		clientes: [],
		isPaginated: true,
		isPaginationSimple: false,
		isPaginationRounded: true,
		paginationPosition: 'bottom',
		defaultSortDirection: 'asc',
		sortIcon: 'arrow-up',
		sortIconSize: 'is-medium',
		currentPage: 1,
		perPage: 10,
		totalClientes: 0,
		totalPages: 1,
		isVentasModalActive: false,
		ventasCliente: null,
		clienteSeleccionado: null,
		clienteSeleccionadoNombre: '',
		clienteTieneVentas: false
	}),

	mounted() {
		this.obtenerClientes()
	},

	methods: {
		cambiarTab(tab) {
			this.activeTab = tab
			if (tab === 'activos') {
				this.obtenerClientes()
			}
			// El tab de eliminados tiene su propio componente que maneja su carga de datos
		},

		formatDate(dateString) {
			if (!dateString) return ''
			const date = new Date(dateString)
			return date.toLocaleDateString('es-MX', { 
				year: 'numeric', 
				month: 'long', 
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			})
		},

		async eliminar(idCliente) {
			this.$buefy.dialog.confirm({
				title: 'Eliminar cliente',
				message: 'Seguro que quieres <b>eliminar</b> este cliente? Esta acción no se puede revertir.',
				confirmText: 'Sí, eliminar',
				cancelText: 'Cancelar',
				type: 'is-danger',
				hasIcon: true,
				onConfirm: () => {
					this.cargando = true
					apiRequest({
						method: 'DELETE',
						path: `customers/${idCliente}`
					})
						.then(resultado => {
							if (!resultado) {
								this.$buefy.toast.open('Error al eliminar')
								this.cargando = false
								return
							}

							if (resultado) {
								this.cargando = false
								this.$buefy.toast.open({
									type: 'is-info',
									message: 'Cliente eliminado.'
								})
								this.obtenerClientes()
							}
						})
				}
			})
		},

		editar(idCliente) {
			this.$router.push({
				name: "EditarCliente",
				params: { id: idCliente }
			})
		},

		obtenerClientes() {
			this.cargando = true
			apiRequest({
				method: 'GET',
				path: 'customers'
			})
				.then(respuesta => {
					if (respuesta && respuesta.data) {
						// Si la respuesta tiene formato paginado
						if (Array.isArray(respuesta.data.data)) {
							this.clientes = respuesta.data.data;
							this.totalClientes = respuesta.data.total || this.clientes.length;
							this.totalPages = respuesta.data.totalPages || 1;
						} else {
							// Si la respuesta es un array simple
							this.clientes = respuesta.data;
							this.totalClientes = this.clientes.length;
							this.totalPages = Math.ceil(this.totalClientes / this.perPage);
						}
					} else {
						this.clientes = [];
						this.totalClientes = 0;
						this.totalPages = 1;
					}
					this.cargando = false;
				})
				.catch(error => {
					console.error("Error al obtener clientes:", error);
					this.clientes = [];
					this.totalClientes = 0;
					this.totalPages = 1;
					this.cargando = false;
					this.$buefy.toast.open({
						message: 'Error al cargar los clientes',
						type: 'is-danger'
					});
				});
		},

		verVentas(idCliente, nombreCliente) {
			this.cargando = true;
			this.clienteSeleccionado = idCliente;
			this.clienteSeleccionadoNombre = nombreCliente || 'Cliente';
			this.clienteTieneVentas = false;
			
			apiRequest({
				method: 'GET',
				path: `customers/sales-by-customer/${idCliente}`
			})
			.then(respuesta => {
				this.cargando = false;
				
				if (respuesta && respuesta.data && Array.isArray(respuesta.data)) {
					// Buscamos específicamente el cliente solicitado en el array
					const clienteVentas = respuesta.data.find(item => item.id === idCliente);
					
					// Verificamos si el cliente existe y tiene ventas
					if (clienteVentas && clienteVentas.totalSales !== null && clienteVentas.totalSales > 0) {
						this.ventasCliente = clienteVentas;
						this.clienteTieneVentas = true;
					} else {
						// Si no tiene ventas o totalSales es null
						this.ventasCliente = { id: idCliente, totalSales: 0 };
						this.clienteTieneVentas = false;
					}
				} else {
					// Si la respuesta no es válida
					this.ventasCliente = { id: idCliente, totalSales: 0 };
					this.clienteTieneVentas = false;
				}
				
				this.isVentasModalActive = true;
			})
			.catch(error => {
				console.error("Error al obtener ventas del cliente:", error);
				this.cargando = false;
				this.ventasCliente = { id: idCliente, totalSales: 0 };
				this.clienteTieneVentas = false;
				this.$buefy.toast.open({
					message: 'Error al cargar las ventas del cliente',
					type: 'is-danger'
				});
				this.isVentasModalActive = true;
			});
		}
	}
}
</script>