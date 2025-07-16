<template>
    <section>
        <p class="title is-1">Agregar productos</p>
        <b-breadcrumb align="is-left">
            <b-breadcrumb-item tag='router-link' to="/">Inicio</b-breadcrumb-item>
            <b-breadcrumb-item tag='router-link' to="/inventario">Inventario</b-breadcrumb-item>
            <b-breadcrumb-item active>Agregar producto</b-breadcrumb-item>
        </b-breadcrumb>
        <form-producto @registrado="onRegistrado" :productoProp="producto" />
        <b-loading :is-full-page="true" v-model="cargando" :can-cancel="false"></b-loading>
    </section>
</template>
<script>
import FormProducto from './FormProducto.vue'
import apiRequest from '../../Servicios/HttpService';

export default {
    name: "AgregarProducto",
    components: { FormProducto },

    data: () => ({
        cargando: false,
        producto: {
          
        },
    }),

    methods: {
        async checkDuplicateCode(newCode) {
            try {
                const respuesta = await apiRequest({
                    method: "GET",
                    path: 'products'
                });

                const newCodeString = newCode.toString();
                const found = respuesta.data.products.find(product => product.code === newCodeString);
                if (found) {
                    console.log(`El código ${newCodeString} ya existe en el producto ${found.name}.`);
                    return true; 
                }
                return false;
            } catch (error) {
                console.error("Error checking duplicate code:", error);
                return false;
            }
        },

        async generateBarcode() {
            try {
                const {data} = await apiRequest({
                    method: 'GET',
                    path: 'products/internal-barcode/generate'
                });
                console.log("Código de barras generado:", data);
                return data;
            } catch (error) {
                console.error("Error generating barcode:", error);
                return null;
            }
        },

        async onRegistrado(producto) {
            this.cargando = true

            if (!producto.code) {
                const generatedCode = await this.generateBarcode();
                if (generatedCode) {
                    producto.code = generatedCode.code;
                } else {
                    this.cargando = false;
                    this.$buefy.toast.open({
                        type: 'is-danger',
                        message: 'No se pudo generar un código de barras.'
                    });
                    return;
                }
            }

            const isDuplicate = await this.checkDuplicateCode(producto.code);
            if (isDuplicate) {
                this.cargando = false
                this.$buefy.toast.open({
                    type: 'is-danger',
                    message: 'El código de barras ya existe.'
                })
                return;
            }

           try {
            apiRequest({
                method: 'POST',
                path: 'products',
                data: {
                    code: producto.code,
                    name: producto.name,
                    purchasePrice: producto.purchasePrice,
                    salePrice: producto.salePrice,
                    touristPrice: producto.touristPrice,
                    reservedStock: 0,
                    stock: producto.stock,
                    wholesaleSale: producto.wholesaleSale,
                    wholesalePrice: producto.wholesalePrice,
                    wholesaleQuantity: producto.wholesaleQuantity,
                    brandId: producto.brandId,
                    categoryId: producto.categoryId
                }
            })
            this.cargando = false
                    this.$buefy.toast.open({
                        type: 'is-info',
                        message: 'Producto registrado con éxito.'
                    })
           } catch (error) {
            this.cargando = false
                this.$buefy.toast.open({
                        type: 'is-danger',
                        message: 'No se pudo registrar producto'
                    })
           }
        }
    }

}
</script>