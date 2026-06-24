//arranca tema oscuro/claro desde localStorage y toggle
(function () {
    const KEY = "mascoteroTheme";
    // lee q tema esta guardado
    const tema = () => localStorage.getItem(KEY) || "light";

    document.documentElement.setAttribute("dataTheme", tema());

    //click en boton toggle cambia dark/light
    document.addEventListener("click", function (e) {
        const btn = e.target.closest("[dataThemeToggle]");
        if (!btn) return;

        const nuevo = tema() === "dark" ? "light" : "dark";
        localStorage.setItem(KEY, nuevo);
        document.documentElement.setAttribute("dataTheme", nuevo);
        btn.textContent = nuevo === "dark" ? "Modo claro" : "Modo oscuro";
    });

    //pone el texto correcto en todos los botones al cargar
    document.querySelectorAll("[dataThemeToggle]").forEach(function (btn) {
        btn.textContent = tema() === "dark" ? "Modo claro" : "Modo oscuro";
    });
})();
