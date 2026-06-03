
/*JSON DE PRUEBA*/
const productsData = {
    comida: [
        { id: 1, nombre: "Alimento Balanceado Adulto", precio: 1200, descripcion: "Comida completa para perros adultos, alta en proteínas.", stock: 25, imagen: "/img/comida1.jpg" },
        { id: 2, nombre: "Snack Dental", precio: 250, descripcion: "Snack para higiene dental de mascotas.", stock: 100, imagen: "/img/comida2.jpg" },
        { id: 3, nombre: "Alimento Premium Gato", precio: 1400, descripcion: "Croquetas premium para gatos adultos.", stock: 30, imagen: "/img/comida3.jpg" },
        { id: 4, nombre: "Latas Pescado", precio: 220, descripcion: "Lata de pescado en salsa para gatos.", stock: 80, imagen: "/img/comida4.jpg" },
        { id: 5, nombre: "Pollo Deshidratado", precio: 600, descripcion: "Snack deshidratado de pollo para perros.", stock: 50, imagen: "/img/comida5.jpg" },
        { id: 6, nombre: "Alimento Cachorro", precio: 1300, descripcion: "Fórmula para cachorros en crecimiento.", stock: 20, imagen: "/img/comida6.jpg" },
        { id: 7, nombre: "Pasta Dental Mascota", precio: 300, descripcion: "Pasta dental con sabor para limpieza diaria.", stock: 120, imagen: "/img/comida7.jpg" },
        { id: 8, nombre: "Barritas Saludables", precio: 180, descripcion: "Barritas vitamínicas para mascotas.", stock: 200, imagen: "/img/comida8.jpg" },
        { id: 9, nombre: "Comida Húmeda Gato", precio: 350, descripcion: "Pouch húmedo para gatos con proteína.", stock: 60, imagen: "/img/comida9.jpg" },
        { id: 10, nombre: "Bowl de Comida", precio: 450, descripcion: "Bowl antideslizante para comida.", stock: 70, imagen: "/img/comida10.jpg" },
        { id: 11, nombre: "Croquetas Light", precio: 1100, descripcion: "Fórmula light para control de peso.", stock: 35, imagen: "/img/comida11.jpg" },
        { id: 12, nombre: "Multivitamínico", precio: 650, descripcion: "Suplemento vitamínico para mascotas.", stock: 90, imagen: "/img/comida12.jpg" },
        { id: 13, nombre: "Pescado Deshidratado", precio: 420, descripcion: "Snack de pescado para gatos.", stock: 45, imagen: "/img/comida13.jpg" },
        { id: 14, nombre: "Alimento Senior", precio: 1500, descripcion: "Fórmula especial para mascotas mayores.", stock: 15, imagen: "/img/comida14.jpg" },
        { id: 15, nombre: "Bites de Cordero", precio: 320, descripcion: "Snack sabor cordero, alto en proteínas.", stock: 75, imagen: "/img/comida15.jpg" },
        { id: 16, nombre: "Alimento Hipoalergénico", precio: 1800, descripcion: "Para mascotas con alergias alimentarias.", stock: 12, imagen: "/img/comida16.jpg" },
        { id: 17, nombre: "Leche para Cachorros", precio: 290, descripcion: "Suplemento lácteo para cachorros.", stock: 55, imagen: "/img/comida17.jpg" },
        { id: 18, nombre: "Galletas Entrenamiento", precio: 160, descripcion: "Pequeñas galletas para adiestramiento.", stock: 250, imagen: "/img/comida18.jpg" },
        { id: 19, nombre: "Pouch Pollo Adulto", precio: 300, descripcion: "Pouch húmedo pollo para perros.", stock: 65, imagen: "/img/comida19.jpg" },
        { id: 20, nombre: "Mix de Semillas", precio: 200, descripcion: "Complemento natural para aves y roedores.", stock: 90, imagen: "/img/comida20.jpg" }
    ],
    accesorios: [
        { id: 21, nombre: "Cucha Premium", precio: 4500, descripcion: "Cucha acolchada impermeable para interiores.", stock: 10, imagen: "/img/accesorio1.jpg" },
        { id: 22, nombre: "Collar Ajustable", precio: 800, descripcion: "Collar de nylon con hebilla ajustable.", stock: 40, imagen: "/img/accesorio2.jpg" },
        { id: 23, nombre: "Correa Reforzada", precio: 700, descripcion: "Correa de mano con amortiguador.", stock: 35, imagen: "/img/accesorio3.jpg" },
        { id: 24, nombre: "Placa Identificadora", precio: 250, descripcion: "Placa metálica personalizada.", stock: 120, imagen: "/img/accesorio4.jpg" },
        { id: 25, nombre: "Juguete Kong", precio: 950, descripcion: "Juguete resistente para masticar.", stock: 60, imagen: "/img/accesorio5.jpg" },
        { id: 26, nombre: "Rascador Gato", precio: 1800, descripcion: "Rascador con plataformas y juguete.", stock: 8, imagen: "/img/accesorio6.jpg" },
        { id: 27, nombre: "Transportín Mediano", precio: 3200, descripcion: "Transportín rígido para viajes cortos.", stock: 7, imagen: "/img/accesorio7.jpg" },
        { id: 28, nombre: "Arnés Antitirones", precio: 1500, descripcion: "Arnés ergonómico para paseos.", stock: 22, imagen: "/img/accesorio8.jpg" },
        { id: 29, nombre: "Cuchara Medidora", precio: 120, descripcion: "Cuchara para porcionar alimentos.", stock: 200, imagen: "/img/accesorio9.jpg" },
        { id: 30, nombre: "Plato Antideslizante", precio: 500, descripcion: "Plato para comida con base antideslizante.", stock: 50, imagen: "/img/accesorio10.jpg" },
        { id: 31, nombre: "Cepillo Grooming", precio: 420, descripcion: "Cepillo para mantenimiento del pelaje.", stock: 90, imagen: "/img/accesorio11.jpg" },
        { id: 32, nombre: "Cama Elevada", precio: 2700, descripcion: "Cama elevada para exteriores.", stock: 14, imagen: "/img/accesorio12.jpg" },
        { id: 33, nombre: "Placa Solar para Bebederos", precio: 980, descripcion: "Accesorio para bebederos automáticos.", stock: 25, imagen: "/img/accesorio13.jpg" },
        { id: 34, nombre: "Manta Térmica", precio: 640, descripcion: "Manta térmica para mascotas mayores.", stock: 30, imagen: "/img/accesorio14.jpg" },
        { id: 35, nombre: "Gafas de Sol Pet", precio: 300, descripcion: "Gafas protectoras para mascotas.", stock: 55, imagen: "/img/accesorio15.jpg" },
        { id: 36, nombre: "Chaleco Reflectante", precio: 580, descripcion: "Mejora la visibilidad en paseos nocturnos.", stock: 40, imagen: "/img/accesorio16.jpg" },
        { id: 37, nombre: "Kit de Higiene", precio: 760, descripcion: "Incluye shampoo y toalla absorbente.", stock: 65, imagen: "/img/accesorio17.jpg" },
        { id: 38, nombre: "Juguete Interactivo", precio: 1250, descripcion: "Juguete con sensor para entretener.", stock: 18, imagen: "/img/accesorio18.jpg" },
        { id: 39, nombre: "Bolsas Higiénicas", precio: 120, descripcion: "Rollo de bolsas para paseos.", stock: 300, imagen: "/img/accesorio19.jpg" },
        { id: 40, nombre: "Arenero Cubierto", precio: 2100, descripcion: "Arenero cubierto para gatos con filtro.", stock: 9, imagen: "/img/accesorio20.jpg" }
    ]
};

const homeController = {
    productos: (req, res) => res.render("productos"),
    comida: (req, res) => {
        const productos = productsData.comida;
        return res.render("comida", { productos });
    },
    accesorios: (req, res) => {
        const productos = productsData.accesorios;
        return res.render("accesorios", { productos });
    }
};

export default homeController;
