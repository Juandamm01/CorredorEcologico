window.onload = function () {
    limpiarFormularios();

    const usuarioLogueado = localStorage.getItem('usuarioLogueado');

    asignarFuncionalidades();

    if (usuarioLogueado) {
        mostrarUsuarioLogueado(usuarioLogueado);
    } else {
        mostrarFormularioRegistro();
    }
};

//Función para asignar TODAS los Funcionalidades siempre
function asignarFuncionalidades() {
    document.getElementById("crearCuenta").addEventListener("click", crearCuenta);
    document.getElementById("iniciarSesion").addEventListener("click", iniciarSesion);
    document.getElementById("irLogin").addEventListener("click", mostrarFormularioLogin);
    document.getElementById("irRegistro").addEventListener("click", mostrarFormularioRegistro); 
    document.getElementById("cerrarSesion").addEventListener("click", cerrarSesion);
}

//Mostrar formulario de registro
function mostrarFormularioRegistro() {
    document.getElementById("formRegistro").style.display = 'block';
    document.getElementById("formLogin").style.display = 'none';
    document.getElementById("perfilUsuario").style.display = 'none'; 
    document.getElementById("avisoLegalLink").style.display = "block";

    //Limpiar campos
    document.getElementById("nombreCreacion").value = "";
    document.getElementById("emailCreacion").value = "";
    document.getElementById("contraseñaCreacion").value = "";
    document.getElementById("condiciones").checked = false;
    document.getElementById("emailLogin").value = "";
    document.getElementById("contraseñaLogin").value = "";

    asignarFuncionalidades(); 
}

//Mostrar formulario login
function mostrarFormularioLogin() {
    document.getElementById("formRegistro").style.display = 'none';
    document.getElementById("formLogin").style.display = 'block';
    document.getElementById("perfilUsuario").style.display = 'none';
    document.getElementById("avisoLegalLink").style.display = "none";

    limpiarFormularios();
    asignarFuncionalidades();
}


function limpiarFormularios() {
    //Limpiar formulario de registro
    document.getElementById("nombreCreacion").value = "";
    document.getElementById("emailCreacion").value = "";
    document.getElementById("contraseñaCreacion").value = "";
    document.getElementById("condiciones").checked = false;

    //Limpiar formulario de login
    document.getElementById("emailLogin").value = "";
    document.getElementById("contraseñaLogin").value = "";
}


function mostrarUsuarioLogueado(email) {
    document.getElementById("formRegistro").style.display = 'none';
    document.getElementById("formLogin").style.display = 'none';
    document.getElementById("perfilUsuario").style.display = 'block';

    document.getElementById("formEditarContraseña").style.display = "none";
    document.getElementById("nuevaContraseña").value = "";

    document.getElementById("avisoLegalLink").style.display = "none";
    document.getElementById("popupAvisoLegal").style.display = "none";

    //Realizar la solicitud para obtener los datos del usuario
    fetch(`http://localhost:3000/usuarios/${email}`)
        .then(res => res.json())
        .then(usuario => {
            console.log(usuario); 

            //Se establece los datos del usuario
            document.getElementById("perfilNombre").textContent = usuario.nombre_completo;
            document.getElementById("perfilCorreo").textContent = usuario.email;
        })
        .catch(error => {
            console.error('Error al obtener los datos del usuario:', error);
        });

    asignarFuncionalidades(); //Volver a asignar funcionalidades
}


//Función para eliminar sugerencia
function eliminarSugerencia(idSugerencia) {
    const confirmacion = confirm("¿Estás seguro de que deseas eliminar esta sugerencia?");
    if (!confirmacion) return;

    fetch(`http://localhost:3000/sugerencias/${idSugerencia}`, {
        method: "DELETE"
    })
    .then(res => res.json())
    .then(data => {
        alert("Sugerencia eliminada correctamente.");
        //Después de eliminar, recargar las sugerencias
        mostrarUsuarioLogueado(localStorage.getItem('usuarioLogueado'));
    })
    .catch(error => {
        alert("Error al eliminar la sugerencia: " + error.message);
    });
}



//Seccion de Crear cuenta
document.getElementById("crearCuenta").addEventListener("click", function(e) {
    e.preventDefault(); 

    const nombre = document.getElementById("nombreCreacion").value.trim();
    const email = document.getElementById("emailCreacion").value.trim();
    const contraseña = document.getElementById("contraseñaCreacion").value.trim();
    const condiciones = document.getElementById("condiciones").checked;

    //Validación de campos
    if (!nombre || !email || !contraseña) {
        alert("Por favor, rellena todos los campos.");
        return;
    }

    if (!condiciones) {
        alert("Debes aceptar las condiciones legales.");
        return;
    }

    fetch("http://localhost:3000/usuarios", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            nombre_completo: nombre,
            email: email,
            contraseña: contraseña
        })
    })
    .then(res => {
        if (!res.ok) {
            return res.text().then(text => { throw new Error(text) });
        }
        return res.text();
    })
    .then(data => {
        alert(data);
        localStorage.setItem('usuarioLogueado', email);
        mostrarUsuarioLogueado(email);
        limpiarFormularios();

        //Busca info del usuario recién creado
        fetch(`http://localhost:3000/usuarios/${email}`)
            .then(res => res.json())
            .then(usuario => {
                mostrarPerfilUsuario(usuario);
            });
    })
    .catch(error => {
        alert("Error al crear la cuenta: " + error.message);
    });
});

//Iniciar sesión
document.getElementById("iniciarSesion").addEventListener("click", function(e) {
    e.preventDefault(); //Evita recargar la página

    const email = document.getElementById("emailLogin").value.trim();
    const contraseña = document.getElementById("contraseñaLogin").value.trim();

    //Validar campos vacíos
    if (!email || !contraseña) {
        alert("Por favor, rellena todos los campos.");
        return;
    }

    fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: email,
            contraseña: contraseña
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert("Inicio de sesión exitoso");
            localStorage.setItem('usuarioLogueado', email);
            mostrarUsuarioLogueado(email);
            limpiarFormularios();
    
            //Ahora sí, buscar info del usuario en el servidor
            fetch(`http://localhost:3000/usuarios/${email}`)
                .then(res => res.json())
                .then(usuario => {
                    mostrarPerfilUsuario(usuario);
                });
        } else {
            alert("Credenciales incorrectas");
        }
    })
    
    
    .catch(error => console.error("Error:", error));
});

//Cerrar sesión
function cerrarSesion() {
    localStorage.removeItem('usuarioLogueado');
    document.getElementById("perfilUsuario").style.display = "none";
    mostrarFormularioRegistro();
    limpiarFormularios()

    document.getElementById("formEditarContraseña").style.display = "none";
    document.getElementById("nuevaContraseña").value = "";
}

function mostrarPerfilUsuario(usuario) {
    document.getElementById("perfilUsuario").style.display = "block";

    document.getElementById("perfilNombre").textContent = usuario.nombre_completo;
    document.getElementById("perfilCorreo").textContent = usuario.email;
    
    document.getElementById("formEditarContraseña").style.display = "none";
    document.getElementById("nuevaContraseña").value = "";

    // Para agregar sugerencias del usuario
    let lista = document.getElementById("listaSugerencias");
    let li = document.createElement("li");
    li.textContent = "No has enviado sugerencias aún.";
}

//Mostrar el input para editar contraseña
document.getElementById("editarContraseñaBtn").addEventListener("click", () => {
    document.getElementById("formEditarContraseña").style.display = "block";
});

//Guardar nueva contraseña
document.getElementById("guardarContraseñaBtn").addEventListener("click", () => {
    const nueva = document.getElementById("nuevaContraseña").value.trim();
    const email = localStorage.getItem("usuarioLogueado");

    if (!nueva) {
        alert("Ingresa una nueva contraseña.");
        return;
    }

    fetch(`http://localhost:3000/usuarios/${email}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ nuevaContraseña: nueva })
    })
    .then(res => {
        if (!res.ok) throw new Error("Error al actualizar contraseña");
        return res.text();
    })
    .then(msg => {
        alert("Contraseña actualizada correctamente.");
        document.getElementById("formEditarContraseña").style.display = "none";
        document.getElementById("nuevaContraseña").value = "";
    })
    .catch(err => {
        alert("Error: " + err.message);
    });
});

//Funcionalidad del boton de cancelar edicion de contraseña
document.getElementById("cancelarEdicionBtn").addEventListener("click", () => {
    document.getElementById("formEditarContraseña").style.display = "none";
    document.getElementById("nuevaContraseña").value = "";
});

//Configuracion de boton de eliminar cuenta
document.getElementById("eliminarCuentaBtn").addEventListener("click", () => {
    const confirmacion = confirm("¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.");
    if (!confirmacion) return;

    const email = localStorage.getItem("usuarioLogueado");

    //Obtener el ID del usuario con su email
    fetch(`http://localhost:3000/usuarios/${email}`)
        .then(res => res.json())
        .then(usuario => {
            const id = usuario.id_usuario;

            //Eliminar por ID
            return fetch(`http://localhost:3000/usuarios/${id}`, {
                method: "DELETE"
            });
        })
        .then(res => {
            if (!res.ok) throw new Error("Error al eliminar cuenta");
            alert("Cuenta eliminada correctamente.");
            localStorage.removeItem("usuarioLogueado");
            mostrarFormularioRegistro();
        })
        .catch(err => {
            alert("Error: " + err.message);
        });
});

//Funcionalidad para abrir el pop-up de Aviso Legal
document.getElementById("avisoLegalLink").addEventListener("click", function (e) {
    e.preventDefault();
    document.getElementById("popupAvisoLegal").style.display = "flex"; 
});

//Funcionalidad para cerrar el pop-up de Aviso Legal
document.getElementById("closeAvisoLegal").addEventListener("click", function () {
    document.getElementById("popupAvisoLegal").style.display = "none";
});

//Funcionalidad para cerrar el pop-up si clickea fuera del mismo
window.addEventListener("click", (e) => {
        if (e.target === document.getElementById("popupAvisoLegal")) {
            document.getElementById("popupAvisoLegal").style.display = "none";
        }
});
