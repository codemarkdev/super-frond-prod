<template>
    <section class="section">
      <div class="container">
        <div class="level">
          <div class="level-left">
            <div class="level-item">
              <h1 class="title">Gestión de Categorías</h1>
            </div>
          </div>
          <div class="level-right">
            <div class="level-item">
              <b-button 
                type="is-primary" 
                size="is-medium" 
                class="is-rounded" 
                icon-left="plus" 
                @click="agregarCategoria">
                Agregar categoría
              </b-button>
            </div>
          </div>
        </div>
  
        <b-table 
          :data="categorias"
          :loading="cargando"
          paginated
          per-page="10"
          :mobile-cards="true"
          detailed
          detail-key="id"
          :show-detail-icon="true">
          
          <b-table-column field="categoryName" label="Categoría" sortable searchable v-slot="props">
            {{ props.row.categoryName }}
          </b-table-column>
  
          <b-table-column field="products" label="Productos" centered v-slot="props">
            <b-tag type="is-info" size="is-medium">
              {{ props.row.products.length }}
            </b-tag>
          </b-table-column>
  
          <b-table-column field="acciones" label="Acciones" centered v-slot="props">
            <div class="buttons is-centered">
              <b-button 
                type="is-info" 
                icon-left="pen" 
                size="is-small"
                @click="editar(props.row)"
                tooltip="Editar categoría">
                Editar
              </b-button>
              
              <b-button 
                type="is-danger" 
                icon-left="delete" 
                size="is-small"
                :disabled="props.row.products.length > 0"
                @click="eliminar(props.row)"
                :tooltip="props.row.products.length > 0 ? 'No se puede eliminar una categoría con productos' : 'Eliminar categoría'">
                Eliminar
              </b-button>
            </div>
          </b-table-column>
  
          <template #empty>
            <div class="has-text-centered p-4">
              <b-icon icon="package-variant" size="is-large"></b-icon>
              <p class="is-size-5 mt-2">No hay categorías registradas</p>
            </div>
          </template>
  
          <template #loading>
            <div class="has-text-centered p-4">
              <b-icon icon="loading" size="is-large" custom-class="fa-spin"></b-icon>
              <p class="is-size-5 mt-2">Cargando categorías...</p>
            </div>
          </template>
  
          <template #detail="props">
            <div class="content">
              <p><strong>Nombre:</strong> {{ props.row.categoryName }}</p>
              <p><strong>Productos asociados:</strong> {{ props.row.products.length }}</p>
            </div>
          </template>
        </b-table>
  
        <b-modal
          v-model="mostrarDialogoCategorias"
          has-modal-card
          trap-focus
          :destroy-on-hide="false"
          aria-role="dialog"
          aria-label="Modal de categoría"
          close-button-aria-label="Cerrar"
          aria-modal>
          <dialogo-categorias 
            :titulo="tituloModal" 
            :nombre="nombreCategoria" 
            @close="onCerrarDialogo" 
            @registrar="onRegistrar" 
            v-if="mostrarDialogoCategorias">
          </dialogo-categorias>
        </b-modal>
  
        <b-loading :is-full-page="true" v-model="cargando" :can-cancel="false"></b-loading>
      </div>
    </section>
  </template>
  
  <script>
  import apiRequest from '@/Servicios/HttpService'
  import DialogoCategorias from './DialogoCategorias'
  
  export default {
    name: "CategoriasComponent",
    components: { DialogoCategorias },
    
    data: () => ({     
      categorias: [],
      cargando: false,
      mostrarDialogoCategorias: false,
      tituloModal: "",
      nombreCategoria: "",
      idCategoria: "",
    }),
  
    mounted() {
      this.obtenerCategorias()
    },
  
    methods: {
      async eliminar(categoria) {
        if (categoria.products.length > 0) {
          this.$buefy.toast.open({
            type: 'is-warning',
            message: 'No se puede eliminar una categoría que tiene productos asociados',
            duration: 5000
          })
          return
        }
  
        this.$buefy.dialog.confirm({
          title: 'Eliminar categoría',
          message: `¿Seguro que quieres <b>eliminar</b> la categoría ${categoria.categoryName}? Esta acción no se puede revertir.`,
          confirmText: 'Sí, eliminar',
          cancelText: 'Cancelar',
          type: 'is-danger',
          hasIcon: true,
          onConfirm: async () => {
            try {
              this.cargando = true
              const response = await apiRequest({
                method: 'DELETE',
                path: `categories/${categoria.id}`,
              })
  
              if (response.status === 200) {
                this.$buefy.toast.open({
                  type: 'is-success',
                  message: 'Categoría eliminada correctamente',
                  duration: 3000
                })
                await this.obtenerCategorias()
              } else {
                throw new Error('Error al eliminar la categoría')
              }
            } catch (error) {
              this.$buefy.toast.open({
                type: 'is-danger',
                message: 'Error al eliminar la categoría',
                duration: 5000
              })
              console.error('Error:', error)
            } finally {
              this.cargando = false
            }
          }
        })
      },
  
      editar(categoria) {
        this.tituloModal = "Editar"
        this.mostrarDialogoCategorias = true
        this.idCategoria = categoria.id
        this.nombreCategoria = categoria.categoryName
      },
  
      onCerrarDialogo() {
        this.mostrarDialogoCategorias = false
        this.nombreCategoria = ""
        this.idCategoria = ""

      },
  
      async onRegistrar(nombre) {
        try {
          this.cargando = true
          const isEditing = this.tituloModal === 'Editar'
          
          // Front-end validation to check for duplicate categories
          const categoriaExistente = this.categorias.find(categoria => 
            categoria.categoryName.toLowerCase() === nombre.toLowerCase() &&
            categoria.id !== this.idCategoria // Exclude the current category when editing
          )

          if (categoriaExistente) {
            this.$buefy.toast.open({
              type: 'is-warning',
              message: `La categoría ${nombre} ya existe, selecciona otra`,
              duration: 5000
            })
            this.cargando = false
            return
          }
          
          const response = await apiRequest({
            method: isEditing ? 'PATCH' : 'POST',
            path: isEditing ? `categories/${this.idCategoria}` : 'categories',
            data: { 
              categoryName: nombre 
            }
          })
  
          if (response.status === 200 || response.status === 201) {
            this.$buefy.toast.open({
              type: 'is-success',
              message: isEditing ? 'Categoría actualizada correctamente' : 'Categoría creada correctamente',
              duration: 3000
            })
            await this.obtenerCategorias()
            this.nombreCategoria = ""
            this.mostrarDialogoCategorias = false
          } else {
            throw new Error(isEditing ? 'Error al actualizar la categoría' : 'Error al crear la categoría')
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
      agregarCategoria() {
        this.tituloModal = "Agregar"
        this.mostrarDialogoCategorias = true
        this.nombreCategoria = ""
        this.idCategoria = ""
      },
  
      async obtenerCategorias() {
        try {
          this.cargando = true
          const response = await apiRequest({
            method: 'GET',
            path: 'categories'
          })
  
          if (response.status === 200 && Array.isArray(response.data)) {
            this.categorias = response.data
          } else {
            throw new Error('Error al obtener las categorías')
          }
        } catch (error) {
          this.$buefy.toast.open({
            type: 'is-danger',
            message: 'Error al cargar las categorías',
            duration: 5000
          })
          console.error('Error:', error)
        } finally {
          this.cargando = false
        }
      },
      async obtenerCategoriaPorId(id) {
        try {
          this.cargando = true
          const response = await apiRequest({
            method: 'GET',
            path: `categories/${id}`
          })
  
          if (response.status === 200) {
            return response.data
          } else if (response.status === 404) {
            this.$buefy.toast.open({
              type: 'is-warning',
              message: 'Categoría no encontrada',
              duration: 3000
            })
            return null
          } else {
            throw new Error('Error al obtener la categoría')
          }
        } catch (error) {
          this.$buefy.toast.open({
            type: 'is-danger',
            message: 'Error al cargar la categoría',
            duration: 5000
          })
          console.error('Error:', error)
          return null
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