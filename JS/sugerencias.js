const sugerencias = document.getElementById("sugerencias");
const sugerenciaGrande = document.getElementById("sugerenciaGrande");
const cerrarSugerenciaGrande = document.getElementById("cerrarSugerenciaGrande");
const nombreSugerenciaGrande = document.getElementById("nombreSugerenciaGrande");
const textoCompletoSugerenciaGrande = document.getElementById("textoCompletoSugerenciaGrande");

window.onload = function () {
    const email = localStorage.getItem("usuarioLogueado");

    //Función para cargar las sugerencias
    function cargarSugerencias(orden) {
        fetch(`http://localhost:3000/sugerencias/ordenadas?orden=${orden}`)
            .then(res => res.json())
            .then(data => {
                sugerencias.textContent = "";

                data.forEach(sug => {
                    const li = document.createElement("li");
                    li.classList.add("sugerencia");

                    const nombre = document.createElement("h3");
                    nombre.textContent = sug.nombre_completo;

                    //Mostrar solo los primeros 100 caracteres de la sugerencia
                    const textoSugerencia = document.createElement("p");
                    const resumen = sug.texto_sugerencia.length > 100 ? sug.texto_sugerencia.substring(0, 100) + "..." : sug.texto_sugerencia;
                    textoSugerencia.textContent = resumen;

                    //Agregar evento de click para mostrar la sugerencia completa con el texto completo
                    li.addEventListener("click", () => {
                        //Obtener la sugerencia completa con su ID
                        fetch(`http://localhost:3000/sugerencias/completas`)
                            .then(res => res.json())
                            .then(sugerenciasCompletas => {
                                const sugerenciaCompleta = sugerenciasCompletas.find(s => s.id_sugerencia === sug.id_sugerencia);
                                nombreSugerenciaGrande.textContent = sugerenciaCompleta.nombre_completo;
                                textoCompletoSugerenciaGrande.textContent = sugerenciaCompleta.texto_sugerencia;
                                sugerenciaGrande.style.display = "flex"; // Mostrar

                                //Actualizamos el ID de la sugerencia en el contenedor
                                sugerenciaGrande.dataset.id = sugerenciaCompleta.id_sugerencia;

                                //Recuperar la calificación del usuario para esa sugerencia
                                if (email) {
                                    //Obtener ID del usuario
                                    fetch(`http://localhost:3000/usuarios/${email}`)
                                        .then(res => res.json())
                                        .then(usuario => {
                                            const idUsuario = usuario.id_usuario;

                                            //Consulta a la base de datos para obtener la calificación del usuario para esta sugerencia
                                            fetch(`http://localhost:3000/calificaciones/usuario/${idUsuario}/sugerencia/${sugerenciaCompleta.id_sugerencia}`)
                                                .then(res => res.json())
                                                .then(data => {
                                                    const calificacion = data.calificacion || 0;
                                                    actualizarEstrellas(calificacion);
                                                });
                                        });
                                }
                            });
                    });

                    //Agregar todo al contenedor de la sugerencia
                    li.appendChild(nombre);
                    li.appendChild(textoSugerencia);
                    sugerencias.appendChild(li);
                });
            });
    }

    //Cargar las sugerencias por defecto
    cargarSugerencias('reciente');

    //Ordenar por Reciente
    document.getElementById("ordenarReciente").addEventListener("click", () => {
        cargarSugerencias('reciente');
    });

    //Ordenar por Calificación
    document.getElementById("ordenarCalificacion").addEventListener("click", () => {
        cargarSugerencias('calificacion');
    });

    //Enviar nueva sugerencia
    document.getElementById("enviarSugerencia").addEventListener("click", () => {
        const texto = document.getElementById("textoSugerencia").value.trim();

        if (!texto) {
            alert("Por favor, escribe tu sugerencia.");
            return;
        }

        if (!email) {
            alert("Debes iniciar sesión primero.");
            return;
        }

        //Obtener ID del usuario
        fetch(`http://localhost:3000/usuarios/${email}`)
            .then(res => res.json())
            .then(usuario => {
                const idUsuario = usuario.id_usuario;

                return fetch("http://localhost:3000/sugerencias", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        id_usuario: idUsuario,
                        texto_sugerencia: texto
                    })
                });
            })
            .then(res => {
                if (!res.ok) throw new Error("Error al enviar sugerencia");
                alert("¡Gracias por tu sugerencia!");
                location.reload();
            })
            .catch(err => alert("Error: " + err.message));
    });

    //Cerrar cuando se haga click en el botón de cerrar
    cerrarSugerenciaGrande.addEventListener("click", () => {
        sugerenciaGrande.style.display = "none";
    });

    //Cerrar si se hace click fuera del contenedor
    window.addEventListener("click", (e) => {
        if (e.target === sugerenciaGrande) {
            sugerenciaGrande.style.display = "none";
        }
    });

    const estrellas = document.querySelectorAll('.estrella');

    //Función para actualizar las estrellas visualmente
    function actualizarEstrellas(calificacion) {
        //Limpiar las estrellas 
        estrellas.forEach(estrella => {
            estrella.classList.remove('seleccionada');
        });

        //Establecer las estrellas seleccionadas según la calificación
        for (let i = 1; i <= calificacion; i++) {
            document.querySelector(`.estrella[data-calificacion='${i}']`).classList.add('seleccionada');
        }
    }

    //Evento de hover sobre las estrellas
    estrellas.forEach((estrella, index) => {
        estrella.addEventListener('mouseover', () => {
            for (let i = 0; i <= index; i++) {
                estrellas[i].classList.add('hover');
            }
        });

        //Evento para quitar el hover
        estrella.addEventListener('mouseout', () => {
            for (let i = 0; i <= index; i++) {
                estrellas[i].classList.remove('hover');
            }
        });
    });

    // Evento de click en las estrellas dentro del modal
    estrellas.forEach(estrella => {
        estrella.addEventListener('click', (e) => {
            const calificacion = e.target.dataset.calificacion;
            const idSugerencia = sugerenciaGrande.dataset.id;

            //Verificar si el usuario ha iniciado sesión
            if (!email) {
                alert("Debes iniciar sesión primero.");
                return;
            }

            //Obtener ID del usuario
            fetch(`http://localhost:3000/usuarios/${email}`)
                .then(res => res.json())
                .then(usuario => {
                    const idUsuario = usuario.id_usuario;

                    //Verificar si el usuario ya ha calificado esta sugerencia
                    fetch(`http://localhost:3000/calificaciones/usuario/${idUsuario}/sugerencia/${idSugerencia}`)
                        .then(res => res.json())
                        .then(data => {
                            if (data.length > 0) {
                                alert("Ya has calificado esta sugerencia.");
                                return;
                            }

                            //Marcar las estrellas hasta la seleccionada
                            estrellas.forEach(star => {
                                if (parseInt(star.dataset.calificacion) <= calificacion) {
                                    star.classList.add('seleccionada');  //Añadir clase para resaltar
                                } else {
                                    star.classList.remove('seleccionada'); 
                                }
                            });

                            //Enviar la calificación a la base de datos
                            fetch(`http://localhost:3000/calificaciones/${idSugerencia}`, {
                                method: "PUT",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify({
                                    id_usuario: idUsuario,
                                    calificacion: parseInt(calificacion)
                                })
                            })
                            .then(res => res.json())
                            .then(data => {
                                if (data.promedio !== undefined) {
                                    //Mostrar el promedio de calificación actualizado
                                    document.getElementById('promedioCalificacion').textContent = `Promedio: ${data.promedio.toFixed(2)}`;
                                    alert("¡Gracias por calificar!");
                                }
                            })
                            .catch(err => alert("Error: " + err.message));
                        });
                })
                .catch(err => alert("Error al obtener usuario: " + err.message));
        });
    });
};
