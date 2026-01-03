import mongoose from "mongoose";



/**
 * Función para conectar a la base de datos MongoDB.
 * Se conecta a la base de datos 'test_db' en el host 'localhost:27017'.
 * Imprime un mensaje de confirmación si la conexión es exitosa, 
 * o un mensaje de error si falla la conexión.
 */

// La función anterior estaba comentada y hacía referencia a una conexión local.
// Se ha mantenido la versión funcional de connect_db que usa variables de entorno/cloud.



export const connect_db = async () => {
    try {
        const uri = "mongodb+srv://iagentsnsg_db_user:Nc0lLH0zK6LEFJQP@cluster0.pgbmwuy.mongodb.net/Database?appName=Cluster0";

        const db = await mongoose.connect(uri);

        console.log('\x1b[32m%s\x1b[0m', 'CONECTADO A LA BASE DE DATOS:', db.connection.name.toUpperCase());

    }
    catch (error) {
        // Se proporciona información más detallada sobre el error.
        console.error('Error al conectar a la base de datos:', error.message);
        // Se podría agregar lógica para manejar el error de forma más robusta, como intentar reconectar o notificar a un administrador.  Por ejemplo:
        // process.exit(1); // Salir del proceso si la conexión falla.
    }
};