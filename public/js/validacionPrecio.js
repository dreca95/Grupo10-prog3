// valida q el precio sea > 0 antes de guardar producto
function initValidacionPrecio() {
    const precioInput = document.getElementById("precio");
    const precioError = document.getElementById("precioError");
    const form = document.querySelector("form");

    if (!precioInput || !precioError || !form) return;

    const precioDefault = precioInput.value || 0;

    //si dejan el campo vacio al salir restaura el valor original
    function restaurarPrecioSiVacio() {
        if (precioInput.value === "") {
            precioInput.value = precioDefault;
        }
    }

    //esconde el mensaje de error mientras escriben
    function ocultarErrorPrecio() {
        precioError.style.display = "none";
        precioError.textContent = "";
    }

    //muestra error sil precio invalido
    function mostrarErrorPrecio() {
        precioError.textContent = "El precio debe ser mayor a $0.";
        precioError.style.display = "block";
    }

    precioInput.addEventListener("blur", restaurarPrecioSiVacio);
    precioInput.addEventListener("input", ocultarErrorPrecio);

    //al submit chequea numero y frena si es 0 o NaN
    form.addEventListener("submit", (e) => {
        restaurarPrecioSiVacio();
        const precio = Number(precioInput.value);

        if (Number.isNaN(precio) || precio <= 0) {
            e.preventDefault();
            mostrarErrorPrecio();
        }
    });
}
