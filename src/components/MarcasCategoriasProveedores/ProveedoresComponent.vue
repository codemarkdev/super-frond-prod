<template>
    <section class="section">
      <div class="container">
        <div class="level">
          <div class="level-left">
            <div class="level-item">
              <h1 class="title">Gestión de Proveedores</h1>
            </div>
          </div>
          <div class="level-right">
            <div class="level-item">
              <b-button 
                type="is-primary" 
                size="is-medium" 
                class="is-rounded" 
                icon-left="plus" 
                @click="agregarProveedor">
                Agregar proveedor
              </b-button>
            </div>
          </div>
        </div>
  
        <b-table 
          :data="proveedores"
          :loading="cargando"
          paginated
          per-page="10"
          :mobile-cards="true"
          detailed
          detail-key="id"
          :show-detail-icon="true">
          
          <b-table-column field="name" label="Nombre" sortable searchable v-slot="props">
            {{ props.row.name }}
          </b-table-column>

          <b-table-column field="taxId" label="NIT" sortable searchable v-slot="props">
            {{ props.row.taxId }}
          </b-table-column>

          <b-table-column field="acciones" label="Acciones" centered v-slot="props">
            <div class="buttons is-centered">
              <b-button 
                type="is-info" 
                icon-left="pen" 
                size="is-small"
                @click="editar(props.row)"
                tooltip="Editar proveedor">
                Editar
              </b-button>
              
              <b-button 
                type="is-danger" 
                icon-left="delete" 
                size="is-small"
                @click="eliminar(props.row)"
                tooltip="Eliminar proveedor">
                Eliminar
              </b-button>
            </div>
          </b-table-column>
  
          <template #empty>
            <div class="has-text-centered p-4">
              <b-icon icon="truck-delivery" size="is-large"></b-icon>
              <p class="is-size-5 mt-2">No hay proveedores registrados</p>
            </div>
          </template>
  
          <template #loading>
            <div class="has-text-centered p-4">
              <b-icon icon="loading" size="is-large" custom-class="fa-spin"></b-icon>
              <p class="is-size-5 mt-2">Cargando proveedores...</p>
            </div>
          </template>
  
          <template #detail="props">
            <div class="content">
              <p><strong>Nombre:</strong> {{ props.row.name }}</p>
              <p><strong>NIT:</strong> {{ props.row.taxId }}</p>
              <p><strong>Dirección:</strong> {{ props.row.address }}</p>
              <p><strong>Teléfono:</strong> {{ props.row.phone }}</p>
            </div>
          </template>
        </b-table>
  
        <b-modal
          v-model="mostrarDialogoProveedores"
          has-modal-card
          trap-focus
          :destroy-on-hide="false"
          aria-role="dialog"
          aria-label="Modal de proveedor"
          close-button-aria-label="Cerrar"
          aria-modal>
          <dialogo-proveedores 
            :titulo="tituloModal" 
            :proveedor="proveedorSeleccionado" 
            @close="onCerrarDialogo" 
            @registrar="onRegistrar" 
            v-if="mostrarDialogoProveedores">
          </dialogo-proveedores>
        </b-modal>
  
        <b-loading :is-full-page="true" v-model="cargando" :can-cancel="false"></b-loading>
      </div>
    </section>
  </template>
  
  <script>
  import apiRequest from '@/Servicios/HttpService'
  import DialogoProveedores from './DialogoProveedores'
  
  export default {
    name: "ProveedoresComponent",
    components: { DialogoProveedores },
    
    data: () => ({     
      proveedores: [],
      cargando: false,
      mostrarDialogoProveedores: false,
      tituloModal: "",
      proveedorSeleccionado: null,
    }),
  
    mounted() {
      this.obtenerProveedores()
    },
  
    methods: {
      async eliminar(proveedor) {
        this.$buefy.dialog.confirm({
          title: 'Eliminar proveedor',
          message: `¿Seguro que quieres <b>eliminar</b> al proveedor ${proveedor.name}? Esta acción no se puede revertir.`,
          confirmText: 'Sí, eliminar',
          cancelText: 'Cancelar',
          type: 'is-danger',
          hasIcon: true,
          onConfirm: async () => {
            try {
              this.cargando = true
              const response = await apiRequest({
                method: 'DELETE',
                path: `providers/${proveedor.id}`,
              })
  
              if (response.status === 200) {
                this.$buefy.toast.open({
                  type: 'is-success',
                  message: 'Proveedor eliminado correctamente',
                  duration: 3000
                })
                await this.obtenerProveedores()
              } else {
                throw new Error('Error al eliminar el proveedor')
              }
            } catch (error) {
              this.$buefy.toast.open({
                type: 'is-danger',
                message: 'Error al eliminar el proveedor',
                duration: 5000
              })
              console.error('Error:', error)
            } finally {
              this.cargando = false
            }
          }
        })
      },
  
      editar(proveedor) {
        this.tituloModal = "Editar"
        this.mostrarDialogoProveedores = true
        this.proveedorSeleccionado = { ...proveedor }
      },
  
      onCerrarDialogo() {
        this.mostrarDialogoProveedores = false
        this.proveedorSeleccionado = null
      },
  
      async onRegistrar(datos) {
        try {
          this.cargando = true
          const isEditing = this.tituloModal === 'Editar'
          
          // Validar NIT único
          const proveedorExistente = this.proveedores.find(prov => 
            prov.taxId === datos.taxId &&
            prov.id !== this.proveedorSeleccionado?.id
          )

          if (proveedorExistente) {
            this.$buefy.toast.open({
              type: 'is-warning',
              message: `El NIT ${datos.taxId} ya está registrado`,
              duration: 5000
            })
            this.cargando = false
            return
          }
          
          const response = await apiRequest({
            method: isEditing ? 'PATCH' : 'POST',
            path: isEditing ? `providers/${this.proveedorSeleccionado.id}` : 'providers',
            data: datos
          })
  
          if (response.status === 200 || response.status === 201) {
            this.$buefy.toast.open({
              type: 'is-success',
              message: isEditing ? 'Proveedor actualizado correctamente' : 'Proveedor creado correctamente',
              duration: 3000
            })
            await this.obtenerProveedores()
            this.mostrarDialogoProveedores = false
          } else {
            throw new Error(isEditing ? 'Error al actualizar el proveedor' : 'Error al crear el proveedor')
          }
        } catch (error) {
          this.$buefy.toast.open({
            type: 'is-danger',
            message: 'Error al procesar la solicitud',
            duration: 5000
          })
          console.error('Error:', error)
        } finally {
          this.cargando = false
        }
      },
      agregarProveedor() {
        this.tituloModal = "Agregar"
        this.mostrarDialogoProveedores = true
        this.proveedorSeleccionado = {
          name: '',
          taxId: '',
          address: '',
          phone: ''
        }
      },
  
      async obtenerProveedores() {
        try {
          this.cargando = true
          const response = await apiRequest({
            method: 'GET',
            path: 'providers'
          })
  
          if (response.status === 200 && Array.isArray(response.data)) {
            this.proveedores = response.data
          } else {
            throw new Error('Error al obtener los proveedores')
          }
        } catch (error) {
          this.$buefy.toast.open({
            type: 'is-danger',
            message: 'Error al cargar los proveedores',
            duration: 5000
          })
          console.error('Error:', error)
        } finally {
          this.cargando = false
        }
      }
    }
  }
  </script>
  
  <style scoped>
  .section {
    padding: 1.5rem;
  }
  
  .buttons.is-centered {
    justify-content: center;
    margin: 0;
  }
  
  .button {
    margin: 0 0.25rem;
  }
  
  .level {
    margin-bottom: 1.5rem;
  }
  
  .table-container {
    margin-top: 1rem;
  }
  
  .content {
    padding: 1rem;
  }
  
  .fa-spin {
    animation: fa-spin 2s infinite linear;
  }
  
  @keyframes fa-spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(359deg);
    }
  }
  </style>