//Funcion que agrega o elimina la clase transparente al header segun su posicion
window.addEventListener("scroll", function () {
    let posicion = document.getElementById("pr").offsetTop;
    if (window.scrollY >= posicion) {
        document.querySelector("header").classList.remove("transparente");
    } else {
        document.querySelector("header").classList.add("transparente");
    }
});

//Funcion para que la pagina baje de forma suave al darle a "Saber mas"
document.getElementById("masInfo").addEventListener("click", function (event) {
    if (this.hash !== "") {
        event.preventDefault(); // Evita el comportamiento predeterminado de la etiqueta a
        let target = document.querySelector(this.hash);
        if (target) {
            window.scrollTo({
                top: target.offsetTop,
                behavior: "smooth"
            });
        }
    }
});