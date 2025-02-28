const AyudanteSesion = {
  verificarSesion() {
    return !!localStorage.getItem('userData')
  },

  obtenerDatosSesion() {
    const datosUsuario = JSON.parse(localStorage.getItem('userData') || '{}')
    return {
      id: datosUsuario.id,
      usuario: datosUsuario.username,
      nombre: datosUsuario.name
    }
  },

  establecerSesion(usuario) {
    location.reload()
    localStorage.setItem('userData', JSON.stringify(usuario))
  },

  establecerDatosNegocio(datos) {
    localStorage.setItem('datosNegocio', JSON.stringify(datos))
  },  

  obtenerDatosNegocio() {
    return JSON.parse(localStorage.getItem('datosNegocio') || '{}')
  },

  cerrarSesion() {
    localStorage.removeItem('userData')
    localStorage.removeItem('datosNegocio')
    location.reload()
  }
}

export default AyudanteSesion