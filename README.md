# Sistema de Ventas

Este sistema de ventas forma parte de un proyecto personal. Tanto el servidor, la base de datos (DB) y los recursos del servidor están alojados en una Orange Pi de manera local. El negocio se llama **REHF** en honor a mi familia:

1. Raquel
2. Elmer
3. Hanns (yo)
4. Faviana

### Objetivos:

* **Almacenamiento y Procesamiento de Datos**: Capaz de almacenar, procesar y mostrar grandes cantidades de datos al personal encargado.
* **Control de Datos a Distancia**: Permite el control de datos a través de un servidor web y a distancia mediante un bot de WhatsApp, todo esto gestionado según el rol de usuario.
* **Actualizaciones en Tiempo Real**: Renderizado de actualización, nuevos y eliminación de datos en tiempo real mediante web sockets.

### Propiedades:

* **Base de Datos (DB)**: Utiliza MariaDB Server para alojar datos como usuarios, productos, categorías, roles, ventas, etc.
* **Servidor**: Implementado con Node.js y Express para levantar un servidor HTTP.
* **Gestión de Accesos**: Control de accesos mediante usuario, contraseña y rol, con la entrega de una clave denominada **APIKEY**.
  * **APIKEY**: Contiene información del usuario, es revocable y válida solo en un dispositivo a la vez.
  * Si el **APIKEY** se revoca por el administrador, los datos de la sesión web se refrescan.
* **Almacenamiento de Imágenes**: Imágenes redimensionadas y almacenadas en dos formatos (normal y pequeño) usando un hash para evitar redundancias.
* **Consultas API**: Creación de consultas **API** al servidor mediante peticiones HTTP POST para comunicarse con la base de datos.
* **Layouts Independientes**: El cliente recibe un layout específico para cada ruta, con scripts independientes para cada acción relacionada con la **API**.
* **Sockets**: Estructura de nodos para los sockets, específicos para cada ruta del servidor.
* **Mapeo de Comandos**: Implementación de comandos específicos para el bot de WhatsApp.
* **Registro de Eventos**: Integración de registros de eventos satisfactorios, advertencias y errores.
* **Control de Hardware**: Control de apagado y reinicio del dispositivo, así como visualización del estado del CPU, RAM y disco.

### Uso:

- **Servidor Local**: Todo el sistema está alojado y ejecutado en una Orange Pi, permitiendo un acceso rápido y eficiente al inventario y otras funcionalidades del negocio.
