<template>
    <section>
        <h1 class="title is-1">Editar producto</h1>
        <b-breadcrumb align="is-left">
            <b-breadcrumb-item tag='router-link' to="/">Inicio</b-breadcrumb-item>
            <b-breadcrumb-item tag='router-link' to="/inventario">Inventario</b-breadcrumb-item>
            <b-breadcrumb-item active>Editar producto</b-breadcrumb-item>
        </b-breadcrumb>
        <form-producto :productoProp="datosProducto" @registrado="onEditar" v-if="datosProducto" ref="formProducto" />
    </section>
</template>
<script>
import apiRequest from '../../Servicios/HttpService';
import FormProducto from './FormProducto'
export default {
    name: "EditarProducto",
    components: { FormProducto },

    data: () => ({
        cargando: false,
        datosProducto: null
    }),
    watch: {
        productoProp(newVal) {
            this.producto = { ...newVal };
            this.setSelectedValues(); 
        }
    },

    async mounted() {
        this.cargando = true
        const producto = await apiRequest({
            method: 'GET',
            path: `products/${this.$route.params.id}`
        })
        this.datosProducto = producto.data
        this.cargando = false
        this.$nextTick(() => {
            this.$refs.formProducto.setSelectedValues();
        });
    },

    methods: {
        async onEditar(datosProducto) {
            this.cargando = true
			console.log('price', datosProducto)
            const stock = Number(datosProducto.stock)
            const { status } = await apiRequest({
                method: 'PATCH',
                path: `products/${this.$route.params.id}`,
                data: {
                    code: datosProducto.code,
                    name: datosProducto.name,
                    purchasePrice: datosProducto.purchasePrice,
                    salePrice: datosProducto.salePrice,
                    stock: stock,
                    reservedStock: 0,
                    wholesaleSale: datosProducto.wholesaleSale,
                    touristPrice: datosProducto.touristPrice,
                    wholesalePrice: datosProducto.wholesalePrice,
                    wholesaleQuantity: datosProducto.wholesaleQuantity,
                    brandId: datosProducto.brandId,
                    categoryId: datosProducto.categoryId
                }
            })

            if (status == 200) {
                this.cargando = false
                this.$buefy.toast.open({
                    type: 'is-info',
                    message: 'Información de producto actualizada con éxito.'
                })
                this.$router.push({ name: 'ProductosComponent' })
            } else {
                this.cargando = false
                this.$buefy.toast.open({
                    type: 'is-danger',
                    message: 'Información de producto fallo al actualizar.'
                })
                this.$router.push({ name: 'ProductosComponent' })
            }
        }
    }
}
</script>