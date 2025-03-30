<template>
    <section>
        <div class="comprobante" id="comprobante" v-if="datosNegocio">
            <p><b>{{ titulo }}</b></p>
            <p>Tienda el Divino Niño</p>

            <p><b>Cliente: </b>{{ venta.nombreCliente }}</p>
            <p><b>Cajero: </b>{{ venta.nombreUsuario }}</p>
            <p><b>Fecha: </b>{{ venta.fecha }}</p>
            <table class="centered-table">
                <thead>
                    <th class="fixed-size">Producto</th>
                    <th class="fixed-size">Cant.</th>
                    <th class="fixed-size">Precio</th>
                </thead>
                <tbody>
                    <tr v-for="(producto, index) in venta.products" :key="index">
                        <td class="truncate fixed-size">{{ producto.nombre }}</td>
                        <td class="fixed-size">{{ producto.cantidad }}</td>
                        <td class="fixed-size">${{ producto.precio }}</td>
                    </tr>
                </tbody>
            </table>
            <p><b>Total:</b>${{ Number(venta.total).toFixed(2) }}</p>
            <p v-if="tipo !== 'cotiza'"><b>Su pago:</b>${{ Number(venta.pagado).toFixed(2) }}</p>
            <p v-if="tipo === 'venta'"><b>Cambio:</b>${{ (Number(venta.pagado) - Number(venta.total)).toFixed(2) }}</p>
            <p v-if="tipo === 'cuenta' || tipo === 'apartado'"><b>Por pagar:</b>${{ Number(venta.porPagar).toFixed(2) }}
            </p>
            <p><b>Gracias por su preferencia</b></p>
            <p>----------------------------</p>
            <p>Sistema de ventas implementado por:</p>
            <p><b>codemark.es</b></p>
        </div>
    </section>
</template>
<script>
import AyudanteSesion from '../../Servicios/AyudanteSesion'
import Utiles from '../../Servicios/Utiles'
import Printd from "printd";

export default {
    name: "ComprobanteCompra",
    props: ["venta", "tipo"],

    data: () => ({
        titulo: "",
        datosNegocio: null,
        cssText: `
                .comprobante{
                    width: 250px;
                    font-family: monospace;
                    font-size: 14px;
                }

                .comprobante > p{
                    margin: 0!important;
                    padding: 0!important;
                    text-align: center;
                }

                .comprobante > img{
                    display: block;
                    margin: 0 auto;
                }

                .comprobante > th, td {
                  border-bottom: 1px solid #ddd;
                  font-size: 12px !important;
                  margin: 0!important;
                  padding: 0!important;
                }

                .centered-table {
                    margin-left: auto;
                    margin-right: auto;
                }
                    @media print {
    body {
        visibility: hidden;
    }
    .comprobante {
        visibility: visible;
    }
}
        

            `,

    }),

    beforeMount() {
        this.generarTitulo()
        this.obtenerDatosNegocio()
    },

    mounted() {


        this.d = new Printd();
        const { contentWindow } = this.d.getIFrame();
        contentWindow.addEventListener("beforeprint", () =>
            console.log("before print event!")
        );
        contentWindow.addEventListener("afterprint", () =>
            console.log("after print event!")
        );

        this.imprimir();
    },

    methods: {
        generarTitulo() {
            switch (this.tipo) {
                case "venta":
                    this.titulo = "COMPROBANTE DE COMPRA"
                    break
                case "cuenta":
                    this.titulo = "COMPROBANTE DE CUENTA"
                    break

                case "apartado":
                    this.titulo = "COMPROBANTE DE APARTADO"
                    break

                case "cotiza":
                    this.titulo = "COTIZACIÓN"
                    break

                default:
                    this.titulo = "COMPROBANTE"
            }
        },

        obtenerDatosNegocio() {
            this.datosNegocio = AyudanteSesion.obtenerDatosNegocio()
            this.datosNegocio.logo = Utiles.regresarRuta() + this.datosNegocio.logo
        },

        imprimir() {
        // Ocultar la fecha antes de imprimir
        const fechaElement = document.querySelector('.comprobante p:nth-child(4)'); // Ajusta este selector según la estructura
        if (fechaElement) {
            fechaElement.style.display = 'none'; // Oculta el elemento de la fecha
        }

        // Espera un breve momento para asegurarte de que el estilo se haya aplicado
        setTimeout(() => {
            let zona = document.getElementById("comprobante");

            // Imprime el contenido
            this.d.print(zona, [this.cssText]);

            // Restaurar el elemento de la fecha después de la impresión
            if (fechaElement) {
                fechaElement.style.display = ''; // Restaura la visibilidad
            }

            this.$emit("impreso", false);
        }, 10);
    },
    }
}
</script>
<style scoped>
.comprobante {
    width: 250px;
    font-family: monospace;
    font-size: 14px;
}

.comprobante>p {
    margin: 0 !important;
    padding: 0 !important;
    text-align: center;
}

.comprobante>img {
    display: block;
    margin: 0 auto;
}

.comprobante>th,
td {
    border-bottom: 1px solid #ddd;
    font-size: 12px !important;
    margin: 0 !important;
    padding: 0 !important;
}

.centered-table {
    margin-left: auto;
    margin-right: auto;
}

.truncate {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.fixed-width {
    max-width: 80px;
    width: 80px;
}

.fixed-size {
    max-width: 80px;
    width: 80px;
    max-height: 20px;
    height: 20px;
}
@media print {
    body {
        visibility: hidden;
    }
    .comprobante {
        visibility: visible;
    }
}
</style>