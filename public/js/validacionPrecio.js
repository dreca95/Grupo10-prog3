function initValidacionPrecio() {
    const precioInput = document.getElementById("precio");
    const precioError = document.getElementById("precioError");
    const form = document.querySelector("form");

    if (!precioInput || !precioError || !form) return;

    const precioDefault = precioInput.value || 0;

    function restaurarPrecioSiVacio() {
        if (precioInput.value === "") {
            precioInput.value = precioDefault;
        }
    }

    function ocultarErrorPrecio() {
        precioError.style.display = "none";
        precioError.textContent = "";
    }

    function mostrarErrorPrecio() {
        precioError.textContent = "El precio debe ser mayor a $0.";
        precioError.style.display = "block";
    }

    precioInput.addEventListener("blur", restaurarPrecioSiVacio);
    precioInput.addEventListener("input", ocultarErrorPrecio);

    form.addEventListener("submit", (e) => {
        restaurarPrecioSiVacio();
        const precio = Number(precioInput.value);

        if (Number.isNaN(precio) || precio <= 0) {
            e.preventDefault();
            mostrarErrorPrecio();
        }
    });
}
