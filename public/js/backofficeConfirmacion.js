const confirmarModal = document.getElementById("confirmarModal");
const confirmarModalTexto = document.getElementById("confirmarModalText");
const btnCancelar = document.getElementById("confirmarModalCancelar");
const btnConfirmar = document.getElementById("confirmarModalOk");

let form = null;

document.addEventListener("submit", (e) => {
    const formulario = e.target.closest(".bajaForm, .activarForm");
    if (!formulario) return;

    e.preventDefault();
    form = formulario;

    const activarProducto = formulario.classList.contains("activarForm");
    confirmarModalTexto.textContent = activarProducto
        ? "¿Desea activar el producto?"
        : "¿Desea eliminar el producto?";

    btnConfirmar.classList.toggle("modalConfirmarEliminar", !activarProducto);
    btnConfirmar.classList.toggle("modalConfirmar", activarProducto);

    confirmarModal.classList.add("mostrar");
});

btnCancelar.addEventListener("click", () => {
    form = null;
    confirmarModal.classList.remove("mostrar");
});

btnConfirmar.addEventListener("click", () => {
    if (form) {
        form.submit();
    }
    form = null;
    confirmarModal.classList.remove("mostrar");
});
