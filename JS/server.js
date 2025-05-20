const express = require("express")
const cors = require("cors")
const connection = require("./database")
const bcrypt = require('bcrypt');

const app = express	()
const port = 3000

app.use(cors())
app.use(express.json())


//Ruta para insertar usuario
app.post("/usuarios", async (req, res) => {
    const { nombre_completo, email, contraseña } = req.body;

    //Verifica si el email ya existe
    connection.query("SELECT * FROM usuarios WHERE email = ?", [email], async (err, result) => {
        if (err) {
            console.error("Error en la consulta:", err);
            return res.status(500).send("Error en el servidor");
        }

        if (result.length > 0) {
            //Si el correo ya está registrado
            return res.status(400).send("El correo ya está registrado");
        }


        const hash = await bcrypt.hash(contraseña, 10);

        //Si no existe, se agrega el usuario en la base de datos con la contraseña hasheada
        connection.query("INSERT INTO usuarios (nombre_completo, email, contraseña) VALUES (?, ?, ?)", [nombre_completo, email, hash], (err, resultado) => {
            if (err) {
                console.error("Error al insertar:", err);
                return res.status(500).send("Error al registrar usuario");
            }

            res.send("Usuario agregado");
        });
    });
});


//Ruta para listar usuarios
app.get("/usuarios", (req,res)=>{
    connection.query("SELECT * FROM usuarios", (err,resultados)=>{
        if(err) throw err
        res.json(resultados)
    })
})


//Ruta para eliminar usuarios
app.delete("/usuarios/:id", (req, res) => {
    const id = req.params.id
    connection.query("DELETE FROM usuarios WHERE id_usuario = ?", [id], (err, resultado) => {
        if (err) throw err
        res.send("Usuario eliminado")
    })
})

//Ruta para el login
app.post("/login", (req, res) => {
    const { email, contraseña } = req.body;

    //Valida si los campos no están vacíos
    if (!email || !contraseña) {
        return res.status(400).json({ success: false, message: "Email y contraseña son requeridos" });
    }

    //Buscar el usuario por email
    connection.query("SELECT * FROM usuarios WHERE email = ?", [email], (err, result) => {
        if (err) {
            console.error("Error en la consulta:", err);
            return res.status(500).json({ success: false, message: "Error en el servidor" });
        }

        if (result.length > 0) {
            //Comparar la contraseña con el hash almacenado en la base de datos
            bcrypt.compare(contraseña, result[0].contraseña, (err, isMatch) => {
                if (err) {
                    console.error("Error al comparar contraseñas:", err);
                    return res.status(500).json({ success: false, message: "Error al comparar contraseñas" });
                }

                if (isMatch) {
                    //Usuario y contraseña correctos
                    return res.json({ success: true, message: "Inicio de sesión exitoso" });
                } else {
                    //Contraseña incorrecta
                    return res.json({ success: false, message: "Credenciales incorrectas" });
                }
            });
        } else {
            //Usuario no encontrado
            return res.json({ success: false, message: "Usuario no encontrado" });
        }
    });
});


//Ruta para validar si existe la cuenta en la base de datos
app.get("/usuarios/:email", (req, res) => {
    const email = req.params.email;

    connection.query("SELECT * FROM usuarios WHERE email = ?", [email], (err, result) => {
        if (err) {
            console.error("Error en la consulta:", err);
            return res.status(500).send("Error en el servidor");
        }

        if (result.length > 0) {
            res.json(result[0]); //Devuelve el usuario encontrado
        } else {
            res.status(404).send("Usuario no encontrado");
        }
    });
});

//Ruta para actualizar la contraseña
app.put("/usuarios/:email", async (req, res) => {
    const email = req.params.email;
    const { nuevaContraseña } = req.body; 

    if (!nuevaContraseña) {
        return res.status(400).send("Nueva contraseña requerida");
    }

    //Hashea la nueva contraseña
    const hash = await bcrypt.hash(nuevaContraseña, 10);

    //Se actualiza la contraseña hasheada en la base de datos 
    connection.query("UPDATE usuarios SET contraseña = ? WHERE email = ?", [hash, email], (err, result) => {
        if (err) {
            console.error("Error al actualizar la contraseña:", err);
            return res.status(500).send("Error al actualizar la contraseña");
        }

        //Si se actualizo, muestra este mensaje
        res.send("Contraseña actualizada correctamente");
    });
});

//Ruta para agregar sugerencias
app.post("/sugerencias", (req, res) => {
    const { id_usuario, texto_sugerencia } = req.body;

    if (!id_usuario || !texto_sugerencia) {
        return res.status(400).send("Faltan datos");
    }

    connection.query(
        "INSERT INTO sugerencias (id_usuario, texto_sugerencia) VALUES (?, ?)",
        [id_usuario, texto_sugerencia],
        (err, result) => {
            if (err) {
                console.error("Error al insertar sugerencia:", err);
                return res.status(500).send("Error al guardar sugerencia");
            }

            res.send("Sugerencia guardada");
        }
    );
});

//Eliminar sugerencia por ID (de momento sin usar)
app.delete("/sugerencias/:id", (req, res) => {
    const id = req.params.id;
    connection.query("DELETE FROM sugerencias WHERE id_sugerencia = ?", [id], (err, result) => {
        if (err) {
            console.error("Error al eliminar sugerencia:", err);
            return res.status(500).send("Error en el servidor");
        }
        res.send("Sugerencia eliminada");
    });
});

app.get("/sugerencias/completas", (req, res) => {
    const sql = `
        SELECT s.id_sugerencia, s.texto_sugerencia, u.nombre_completo
        FROM sugerencias s
        JOIN usuarios u ON s.id_usuario = u.id_usuario
    `;
    connection.query(sql, (err, results) => {
        if (err) {
            console.error("Error al obtener sugerencias completas:", err);
            return res.status(500).send("Error al obtener sugerencias completas");
        }
        res.json(results);
    });
});

//Ruta para obtener el resumen de las sugerencias
app.get("/sugerencias/resumen", (req, res) => {
    const sql = `
        SELECT s.id_sugerencia, 
               s.texto_sugerencia, 
               u.nombre_completo,
               SUBSTRING(s.texto_sugerencia, 1, 100) AS texto_resumen  -- Solo una parte de la sugerencia
        FROM sugerencias s
        JOIN usuarios u ON s.id_usuario = u.id_usuario
    `;
    connection.query(sql, (err, results) => {
        if (err) {
            console.error("Error al obtener sugerencias:", err);
            return res.status(500).send("Error al obtener sugerencias");
        }
        res.json(results);
    });
});

//Ruta para agregar calificación a la tabla calificaciones
app.put("/calificaciones/:id", (req, res) => {
    const id_sugerencia = req.params.id;
    const { id_usuario, calificacion } = req.body;

    //Verifica si la calificación está entre 1 y 5
    if (calificacion < 1 || calificacion > 5) {
        return res.status(400).json({ message: "La calificación debe estar entre 1 y 5" });
    }

    //Insertar la calificación del usuario para la sugerencia
    connection.query(
        "INSERT INTO calificaciones (id_usuario, id_sugerencia, nota) VALUES (?, ?, ?)",
        [id_usuario, id_sugerencia, calificacion],
        (err, result) => {
            if (err) {
                console.error("Error al insertar la calificación:", err);
                return res.status(500).json({ message: "Error al insertar la calificación" });
            }
            res.json({ message: "Calificación agregada correctamente" });
        }
    );
});

//Ruta para verificar si un usuario ya ha calificado una sugerencia
app.get("/calificaciones/usuario/:id_usuario/sugerencia/:id_sugerencia", (req, res) => {
    const { id_usuario, id_sugerencia } = req.params;

    connection.query(
        "SELECT * FROM calificaciones WHERE id_usuario = ? AND id_sugerencia = ?",
        [id_usuario, id_sugerencia],
        (err, result) => {
            if (err) {
                console.error("Error al verificar calificación:", err);
                return res.status(500).send("Error al verificar calificación");
            }
            res.json(result); //Si hay resultados, significa que el usuario ya ha calificado
        }
    );
});

//Ruta para obtener las sugerencias ordenadas por id_sugerencia
app.get("/sugerencias/ordenadas", (req, res) => {
    const orden = req.query.orden || 'reciente';  //Por defecto es ordenar por ID
    let sql;

    if (orden === 'reciente') {
        sql = `
            SELECT s.id_sugerencia, s.texto_sugerencia, u.nombre_completo, s.calificacion
            FROM sugerencias s
            JOIN usuarios u ON s.id_usuario = u.id_usuario
            ORDER BY s.id_sugerencia DESC`;
    } else if (orden === 'calificacion') {
        sql = `
            SELECT s.id_sugerencia, s.texto_sugerencia, u.nombre_completo, s.calificacion
            FROM sugerencias s
            JOIN usuarios u ON s.id_usuario = u.id_usuario
            ORDER BY s.calificacion DESC`;  //Ordenar por calificación
    }

    connection.query(sql, (err, results) => {
        if (err) {
            console.error("Error al obtener sugerencias:", err);
            return res.status(500).send("Error al obtener sugerencias");
        }
        res.json(results);
    });
});

//Ruta para obtener la calificación de un usuario para una sugerencia
app.get("/calificaciones/usuario/:id_usuario/sugerencia/:id_sugerencia", (req, res) => {
    const { id_usuario, id_sugerencia } = req.params;

    connection.query(
        "SELECT * FROM calificaciones WHERE id_usuario = ? AND id_sugerencia = ?",
        [id_usuario, id_sugerencia],
        (err, result) => {
            if (err) {
                console.error("Error al obtener calificación:", err);
                return res.status(500).send("Error al obtener calificación");
            }
            if (result.length > 0) {
                res.json({ calificacion: result[0].nota });
            } else {
                res.json({ calificacion: null }); //No tiene calificación
            }
        }
    );
});
 

app.listen(port, () => {
    console.log(`Servidor conectado en http://localhost:${port}`)
})