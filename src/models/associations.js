import Venta from "./ventas.js";
import VentaProductos from "./ventaProductos.js";
import Accesorio from "./accesorios.js";
import Alimento from "./alimentos.js";

VentaProductos.belongsTo(Venta, { foreignKey: "id_venta", as: "venta" });
VentaProductos.belongsTo(Accesorio, { foreignKey: "id_accesorio", as: "accesorio" });
VentaProductos.belongsTo(Alimento, { foreignKey: "id_alimento", as: "alimento" });
