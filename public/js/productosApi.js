

fetch("/api/accesorios").then(res => res.json()).then(accesorios => console.log(accesorios));
fetch("/api/alimentos").then(res => res.json()).then(alimentos => console.log(alimentos));