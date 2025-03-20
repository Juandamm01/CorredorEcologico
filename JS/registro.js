document.getElementById("registroForm").addEventListener("submit", function(event) {
event.preventDefault(); 

        let formData = {
            nombre: document.getElementById("nombre").value,
            email: document.getElementById("email").value,
            telefono: document.getElementById("telefono").value,
            ubicacion: document.getElementById("ubicacion").value,
            intereses: Array.from(document.querySelectorAll("input[name='intereses']:checked")).map(el => el.value),
            mensaje: document.getElementById("mensaje").value
        };


        //De momento esto no entender tons quedemonos quietos y averiguar
        //Despues porque tengo sueño

        fetch("http://127.0.0.1:5000/registrar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
        })
        .catch(error => console.error("Error:", error));
    });
