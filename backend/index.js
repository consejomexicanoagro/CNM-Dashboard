const express = require('express');
const cors = require('cors'); // CORS evita que se bloquen las peticiones entre el puerto del Frtontend y Backend
require('dotenv').config(); // Esta linea llama a la variable de entorno en donde estan nuestros datos sesnsibles

//Importaciones y Peticiones al servidor local (En caso de estar en producción utiliza el puerto de Produccción)

const app = express();
const PORT = process.env.PORT || 3000;

// Mediadores para hacer peticiones entre Front y Backend y entrada de datos en formato JSON
app.use(cors()); 
app.use(express.json());

//app.get() es el acceso al Endpoint
app.get('/api/saludo', (req, res) => {
    res.json({mensaje: 'La comunicación entre Front y Back ha sido exitosa 👍'});
});

// Aqui se enciende el servidor para comenzar a escuchar peticiones
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});