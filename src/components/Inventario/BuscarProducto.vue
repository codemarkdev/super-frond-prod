<template>
  <b-field label="Buscar producto (nombre o código)">
    <b-autocomplete
      v-model="producto"
      id="producto"
      placeholder="Escribe el nombre o código del producto"
      :data="productosFiltrados"
      ref="autocompleteRef"
      field="name"
      @input="onInput"
      @select="seleccionarProducto"
      @keyup.enter.native="manejarEnter($event)"
      size="is-large"
      :loading="cargando"
    >
      <template #empty>
        <div class="notification is-warning is-light">
          No hay coincidencias
        </div>
      </template>
    </b-autocomplete>
  </b-field>
</template>

<script>
import apiRequest from '../../Servicios/HttpService';

export default {
  name: "BuscarProducto",
  data: () => ({
    producto: "",
    productosEncontrados: [],
    cargando: false,
    timeoutBusqueda: null,

    // control selección/duplicados
    isSelecting: false,
    lastSelectedId: null,
    lastSelectAt: 0,

    // detección de contexto de entrada
    lastEventType: null, // 'keyboard' | 'enter' | 'paste' | 'click'
    lastKeyAt: 0,
    lastPasteAt: 0,
    lastPastedText: '',

    // anti-duplicados por pegado rápido del MISMO código ya agregado
    lastAddedCode: '',
    lastAddedAt: 0,
    cooldownMs: 800,

    // coordinar búsquedas concurrentes
    pendingSearch: null,
    searchToken: 0,
  }),

  mounted() {
    if (this.$el.offsetParent !== null) this.forceFocus();
    this.$nextTick(() => {
      const input = this.$refs.autocompleteRef?.$el?.querySelector('input');
      if (!input) return;
      input.addEventListener('paste', this.onPaste);
      input.addEventListener('keydown', this.onKeyDownCapture, true);
    });
  },
  beforeDestroy() { // beforeUnmount si usas Vue 3
    const input = this.$refs.autocompleteRef?.$el?.querySelector('input');
    if (!input) return;
    input.removeEventListener('paste', this.onPaste);
    input.removeEventListener('keydown', this.onKeyDownCapture, true);
  },

  methods: {
    forceFocus() {
      this.$nextTick(() => {
        const input = this.$refs.autocompleteRef?.$el?.querySelector('input');
        if (!input) return;
        input.blur();
        input.readOnly = true;
        input.style.opacity = '0.99';
        setTimeout(() => {
          input.readOnly = false;
          input.focus();
          input.select();
          input.style.cssText = `
            caret-color: #4287f5 !important;
            animation: cursor-blink 1s step-end infinite !important;
          `;
        }, 300);
      });
    },

    onKeyDownCapture(e) {
      if (e.key === 'Enter') {
        this.lastEventType = 'enter';
      } else {
        this.lastEventType = 'keyboard';
        this.lastKeyAt = Date.now();
      }
    },

    // PASTE: limpiar saltos y BUSCAR YA (sin debounce)
    onPaste(e) {
      let text = (e.clipboardData || window.clipboardData)?.getData('text') || '';
      text = String(text).replace(/[\r\n]+/g, '').trim();
      this.lastEventType = 'paste';
      this.lastPastedText = text;
      this.lastPasteAt = Date.now();

      e.preventDefault();
      this.producto = text;
      this.buscarProductos(); // búsqueda inmediata
    },

    onInput() {
      if (this.isSelecting) return;
      clearTimeout(this.timeoutBusqueda);
      this.lastKeyAt = Date.now();
      this.lastEventType = this.lastEventType || 'keyboard';
      this.timeoutBusqueda = setTimeout(() => {
        this.buscarProductos();
      }, 120);
    },

    async buscarProductos() {
      const busqueda = (this.producto || '').trim();
      if (!busqueda) {
        this.productosEncontrados = [];
        return;
      }

      this.cargando = true;
      const myToken = ++this.searchToken;

      this.pendingSearch = (async () => {
        try {
          const resp = await apiRequest({
            method: 'GET',
            path: `products/search/${encodeURIComponent(busqueda)}?_t=${Date.now()}`,
            headers: {
              'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
              Pragma: 'no-cache',
              Expires: '0',
            },
          });

          if (myToken !== this.searchToken) return;

          const encontrados = Array.isArray(resp.data) ? resp.data : [];
          this.productosEncontrados = encontrados.filter(x => x && x.isDeleted === false);

          // Solo auto-agregar si hay match EXACTO (código o nombre)
          if (!this.isSelecting) {
            this.autoseleccionarSiCorresponde(busqueda);
          }
        } catch {
          if (myToken !== this.searchToken) return;
          this.productosEncontrados = [];
        } finally {
          if (myToken === this.searchToken) this.cargando = false;
        }
      })();

      await this.pendingSearch; // manejarEnter esperará esto
    },

    autoseleccionarSiCorresponde(query) {
      const q = String(query || '').trim();
      const one = (this.productosFiltrados.length === 1) ? this.productosFiltrados[0] : null;
      if (!one) return;

      const exactName = (one.name || '').toLowerCase() === q.toLowerCase();
      const exactCode = String(one.code) === q;

      if (exactCode || exactName) {
        this.manejarSeleccion(one);
      }
    },

    seleccionarProducto(opcion) {
      if (!opcion) return;
      this.isSelecting = true;
      this.lastEventType = 'click';
      this.manejarSeleccion(opcion);
    },

    async manejarEnter(e) {
      if (e?.preventDefault) e.preventDefault();
      if (e?.stopPropagation) e.stopPropagation();

      const q = String(this.producto || '').trim();
      if (!q) return;

      if (!this.pendingSearch) await this.buscarProductos();
      else                     await this.pendingSearch;

      const exactByCode = this.productosEncontrados.find(p => String(p.code) === q);
      if (exactByCode) { this.manejarSeleccion(exactByCode); return; }

      const one = (this.productosFiltrados.length === 1) ? this.productosFiltrados[0] : null;
      if (one && ((one.name || '').toLowerCase() === q.toLowerCase())) {
        this.manejarSeleccion(one);
        return;
      }
      // No agregar por parcial
    },

    manejarSeleccion(opcion) {
      if (!opcion?.id) return;

      const now = Date.now();

      // anti-doble por ID + tiempo
      if (this.lastSelectedId === opcion.id && (now - this.lastSelectAt) < 800) return;
      this.lastSelectedId = opcion.id;
      this.lastSelectAt = now;

      // ✅ SOLO bloquea pegado repetido si YA agregaste ese mismo código hace muy poco
      if (
        this.lastEventType === 'paste' &&
        this.lastPastedText &&
        String(opcion.code) === this.lastPastedText &&
        this.lastAddedCode === this.lastPastedText &&   // ya se agregó ese mismo código
        (now - this.lastAddedAt) < this.cooldownMs
      ) {
        // ignorar duplicado inmediato; no limpiar el input para no confundir
        return;
      }

      // emitir selección a la venta
      this.$emit('seleccionado', opcion);

      // registra lo agregado (para controlar pegados repetidos)
      this.lastAddedCode = String(opcion.code || '');
      this.lastAddedAt = now;

      setTimeout(() => {
        this.producto = '';
        this.ponerFocus();
        this.productosEncontrados = [];
        this.isSelecting = false;

        setTimeout(() => { this.lastSelectedId = null; }, 800);
      }, 250);
    },

    limpiarInput() {
      this.producto = '';
      this.$nextTick(() => {
        this.productosEncontrados = [];
        const input = document.querySelector("#producto");
        if (input) input.focus();
      });
    },

    ponerFocus() {
      this.$nextTick(() => {
        const input = document.querySelector("#producto");
        if (input) input.focus();
      });
    }
  },

  computed: {
    productosFiltrados() {
      const busqueda = (this.producto || '').toLowerCase();
      return this.productosEncontrados.filter(opcion => {
        const name = opcion?.name?.toLowerCase?.() || '';
        const code = String(opcion?.code ?? '').toLowerCase();
        return name.includes(busqueda) || code.includes(busqueda);
      });
    },
  },
};
</script>
