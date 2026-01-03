import app from "./app.js";
import { connect_db } from "./db.js";

// Conectar a la base de datos
connect_db();

// Escuchar solicitudes en el puerto
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server listening on port http://localhost:${PORT}`);
});
