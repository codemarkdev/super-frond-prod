<template>
    <b-navbar type="is-warning" class="fondo">
        <template #brand>
            <b-navbar-item tag="router-link" :to="{ path: '/' }">
                <img src="@/assets/logo.png" />
            </b-navbar-item>
        </template>

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
                <div class="buttons">
                    <a class="button is-light" @click="salir">
                        Salir
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
        // Vistas sin hijos
        viewsWithoutChildren() {
            return this.views.filter(view => !view.children || view.children.length === 0);
        },
        // Vistas con hijos
        viewsWithChildren() {
            return this.views.filter(view => view.children && view.children.length > 0);
        }
    },
    mounted() {
        const sesion = AyudanteSesion.obtenerDatosSesion();
        this.usuario = sesion.usuario;
        this.rol = sesion.rol;
        this.views = rolesConfig[this.rol].views;
    },
    methods: {
        salir() {
            AyudanteSesion.cerrarSesion();
        }
    }
}
</script>
