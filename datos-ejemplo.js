// DATOS DE PRUEBA - NO INCLUIR EN PRODUCCIÓN
// Este archivo es solo para referencia y pruebas locales

const datosEjemplo = {
    clientes: [
        {
            nit: "1234567890",
            correo: "empresa1@ejemplo.com",
            password: "pass123",
            razonSocial: "EMPRESA DEMO S.A.",
            tipoContribuyente: "IVA",
            tipoEntidad: "PERSONAS JURIDICAS",
            contacto: "Juan Pérez",
            administracion: "GRANDE",
            facturacion: "ELECTRONICA",
            regimen: "GENERAL",
            actividad: "Comercio al por mayor",
            consolidacion: "MENSUAL",
            encargado: "NESTOR",
            direccion: "Av. Principal 123, Ciudad"
        },
        {
            nit: "9876543211",
            correo: "comercio2@ejemplo.com",
            password: "demo456",
            razonSocial: "COMERCIO EJEMPLO LTDA",
            tipoContribuyente: "RC-IVA",
            tipoEntidad: "PERSONAS JURIDICAS",
            contacto: "María González",
            administracion: "MEDIANA",
            facturacion: "MANUAL",
            regimen: "SIMPLIFICADO",
            actividad: "Comercio al por menor",
            consolidacion: "TRIMESTRAL",
            encargado: "MARIA",
            direccion: "Calle Secundaria 456, Ciudad"
        },
        {
            nit: "5551234562",
            correo: "servicios3@ejemplo.com",
            password: "test789",
            razonSocial: "SERVICIOS PROFESIONALES SRL",
            tipoContribuyente: "IRACIS",
            tipoEntidad: "PERSONAS JURIDICAS",
            contacto: "Carlos Rodríguez",
            administracion: "PEQUEÑA",
            facturacion: "ELECTRONICA",
            regimen: "GENERAL",
            actividad: "Servicios profesionales",
            consolidacion: "ANUAL",
            encargado: "JUAN",
            direccion: "Plaza Central 789, Ciudad"
        }
    ],

    notasEjemplo: [
        "Pendiente revisión de documentos fiscales del mes anterior",
        "Cliente solicita reunión para planificación tributaria",
        "Actualizar información de contacto en el próximo período",
        "Recordar envío de estados de cuenta trimestrales"
    ],

    instruccionesUso: {
        paso1: "Abrir la aplicación en el navegador",
        paso2: "Iniciar sesión con Usuario: Nestor, Contraseña: 1005",
        paso3: "Ir a la sección de Clientes",
        paso4: "Hacer clic en 'Agregar Cliente'",
        paso5: "Copiar los datos de ejemplo de arriba",
        paso6: "Llenar el formulario y guardar",
        paso7: "Repetir para agregar más clientes de prueba",
        paso8: "Explorar todas las funcionalidades"
    },

    pruebasPDF: {
        nota: "Para probar la funcionalidad de PDFs:",
        opcion1: "Usar cualquier PDF que tengas disponible",
        opcion2: "Crear un PDF simple con un procesador de texto",
        opcion3: "Descargar PDFs de prueba de internet",
        importante: "Los PDFs se almacenan en el navegador, no ocupan espacio en el servidor"
    },

    configInicial: {
        tipoContribuyente: ["IVA", "RC-IVA", "IRACIS", "IRE", "INGRESOS BRUTOS"],
        tipoEntidad: ["PERSONAS FISICAS", "PERSONAS JURIDICAS"],
        administracion: ["GRANDE", "MEDIANA", "PEQUEÑA"],
        facturacion: ["ELECTRONICA", "MANUAL"],
        regimen: ["GENERAL", "SIMPLIFICADO"],
        consolidacion: ["ANUAL", "MENSUAL", "TRIMESTRAL"],
        encargado: ["NESTOR", "MARIA", "JUAN", "PEDRO"]
    }
};

// Para usar estos datos en la consola del navegador:
// 1. Abrir DevTools (F12)
// 2. Ir a la pestaña Console
// 3. Copiar y pegar este archivo completo
// 4. Ejecutar: console.table(datosEjemplo.clientes)
// 5. O acceder a cualquier propiedad: datosEjemplo.notasEjemplo

console.log("Datos de ejemplo cargados. Usa 'datosEjemplo' en la consola para ver los ejemplos.");
