(function () {
    const KEY = "mascoteroTheme";
    const tema = () => localStorage.getItem(KEY) || "light";

    document.documentElement.setAttribute("dataTheme", tema());

    document.addEventListener("click", function (e) {
        const btn = e.target.closest("[dataThemeToggle]");
        if (!btn) return;

        const nuevo = tema() === "dark" ? "light" : "dark";
        localStorage.setItem(KEY, nuevo);
        document.documentElement.setAttribute("dataTheme", nuevo);
        btn.textContent = nuevo === "dark" ? "Modo claro" : "Modo oscuro";
    });

    document.querySelectorAll("[dataThemeToggle]").forEach(function (btn) {
        btn.textContent = tema() === "dark" ? "Modo claro" : "Modo oscuro";
    });
})();
