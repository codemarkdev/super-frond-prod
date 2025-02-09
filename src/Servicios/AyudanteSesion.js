const AyudanteSesion = {
  verificarSesion() {
    return !!localStorage.getItem('datosUsuario')
  },

  obtenerDatosSesion() {
    const datosUsuario = JSON.parse(localStorage.getItem('datosUsuario') || '{}')
    return {
      id: datosUsuario.id,
      usuario: datosUsuario.usuario,
      nombre: datosUsuario.nombre
    }
  },

  establecerSesion(usuario) {
    localStorage.setItem('datosUsuario', JSON.stringify(usuario))
  },

  establecerDatosNegocio(datos) {
    localStorage.setItem('datosNegocio', JSON.stringify(datos))
  },  

  obtenerDatosNegocio() {
    return JSON.parse(localStorage.getItem('datosNegocio') || '{}')
  },

  cerrarSesion() {
    localStorage.removeItem('datosUsuario')
    localStorage.removeItem('datosNegocio')
    location.reload()
  }
}

export default AyudanteSesion