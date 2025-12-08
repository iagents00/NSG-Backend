
import app from "./app.js";
import { connect_db } from "./db.js";




// Conectar a la base de datos
connect_db();




// Escuchar solicitudes en el puerto definido en la variable de entorno
const PORT = process.env.PORT;

app.listen(PORT, () => {

    // Mostrar mensaje de servidor en ejecución
    console.log(`Server listening on port http://localhost:${PORT}`);

});
