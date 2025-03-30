<template>
    <b-navbar type="is-ligth" class="fondo">
        <!-- <template #brand>
            <b-navbar-item  :to="{ path: '/' }">
                <img src="@/assets/logo.png" />
            </b-navbar-item>
        </template> -->

        <template #start>
      
            <b-navbar-item 
                v-for="view in viewsWithoutChildren" 
                :key="view.label" 
                tag="router-link" 
                :to="{ path: view.href }"
            >
                {{ view.label }}
            </b-navbar-item>

            <b-navbar-dropdown 
                v-for="view in viewsWithChildren" 
                :key="view.label + '-dropdown'" 
                :label="view.label"
            >
                <b-navbar-item 
                    v-for="child in view.children" 
                    :key="child.label" 
                    tag="router-link" 
                    :to="{ path: child.href }"
                >
                    {{ child.label }}
                </b-navbar-item>
            </b-navbar-dropdown>
        </template>

        <template #end>
            <b-navbar-item tag="router-link" :to="{ path: '/perfil' }">
                <b-icon icon="account" size="is-medium"></b-icon>
                <span> </span>
                {{ usuario }}
            </b-navbar-item>
            <b-navbar-item>
                <div class="">
                    <a class="button " @click="salir">
                        Cerrar sesión
                    </a>
                </div>
            </b-navbar-item>
        </template>
    </b-navbar>
</template>

<script>
import AyudanteSesion from '../Servicios/AyudanteSesion'
import rolesConfig from '../config/RolesConfig'

export default {
    name: "EncabezadoComponent",
    data() {
        return {
            usuario: "",
            rol: "",
            views: []
        };
    },
    computed: {
        viewsWithoutChildren() {
            return this.views.filter(view => !view.children || view.children.length === 0);
        },
        viewsWithChildren() {
            return this.views.filter(view => view.children && view.children.length > 0);
        }
    },
    mounted() {
        const sesion = AyudanteSesion.obtenerDatosSesion();
        this.usuario = sesion.usuario;
        this.rol = sesion.rol;
        const roleConfig = rolesConfig[this.rol];
        this.views = roleConfig.views; 
    },
    methods: {
        salir() {
            AyudanteSesion.cerrarSesion();
        }
    }
}
</script>


<style scoped>
.fondo {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 3; 
    background-color: white; 
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); 
    padding: 0.5rem 1rem; 
}

body {
    padding-top: 4rem; 
}



 .button {
    border: none;
    color: var(--primary-light);
    background-color: var(--primary-dark);
 }
 .button:hover {
    border: none;
    color: var(--accent);
    background-color: var(--primary-dark);
 }

</style>

