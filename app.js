const express = require("express");
const crypto = require("node:crypto");
// const cors = require('cors')    -> Para importar la libreria de cors que hemos instalado
const moviesJSON = require("./movies.json");
const {
  validateMovie,
  validatePartialMovie,
} = require("./schemas/movie_schema");

const app = express();
app.disable("x-powered-by");
app.use(express.json()); // Middleware para que podamos acceder directamente al body de las request
// app.use(cors())    -> Activamos el uso de CORS en todas las peticiones a nuestra API
//                    Con esto nos ahorraríamos añadir los headers para permitir los distintos orígenes
//                    o los distintos tipos de peticiones permitidas.

app.get("/", (request, response) => {
  response.json({ message: "hola mundo" });
});

app.get("/movies", (request, response) => {
  // SúperIMPORTANTE para que la web tenga acceso a los recursos del servidor
  // El * permite TODO origen. Podriamos restringirlo a: http://localhost:8080
  response.header("Access-Control-Allow-Origin", "*");

  const { genre } = request.query;
  console.log(genre);
  if (genre) {
    const filteredMovies = moviesJSON.filter((movie) =>
      movie.genre.some((g) => g.toLowerCase() === genre.toLowerCase())
    );
    return response.json(filteredMovies);
  }
  response.json(moviesJSON);
});

app.get("/movies/:id", (request, response) => {
  const { id } = request.params;
  const movie = moviesJSON.find((movie) => movie.id == id);
  if (movie) return response.json(movie);
  else return response.status(404).json({ message: "Movie not found" });
});

app.post("/movies", (request, response) => {
  const result = validateMovie(request.body);

  if (result.error) {
    return response
      .status(400)
      .json({ error: JSON.parse(result.error.message) });
  }

  // Aquí es donde se enviaría a la base de datos (lo hacemos más adelante)
  const newMovie = {
    id: crypto.randomUUID(),
    ...result.data, // contiene title, year, director, duration, poster, genre y rate
    // Es decir, toda la data que ha venido al ejecutar la función validateMovie (que está
    // definida en movie_schema.js, donde hace todas las validaciones)
  };

  // Aquí vamos a añadir la nueva película al json de moviesJSON (que como detalle
  // cabe decir que no sería REST porque estamos guardando el estado de la app en memoria)
  moviesJSON.push(newMovie);

  response.status(201).json(newMovie);
});

app.patch("/movies/:id", (request, response) => {
  const result = validatePartialMovie(request.body);
  if (result.error) {
    return response
      .status(400)
      .json({ error: JSON.parse(result.error.message) });
  }

  const { id } = request.params;
  const movieIndex = moviesJSON.findIndex((movie) => movie.id === id);
  if (movieIndex < 0) {
    return response.status(404).json({ message: "The movie was not found" });
  }

  // Esto es lo que haremos en base de datos próximamente
  const updateMovie = {
    ...moviesJSON[movieIndex],
    ...result.data,
  };

  moviesJSON[movieIndex] = updateMovie;

  return response.json(updateMovie);
});

app.delete("/movies/:id", (request, response) => {
  response.header("Access-Control-Allow-Origin", "*");

  const { id } = request.params;
  const movieIndex = moviesJSON.findIndex((movie) => movie.id === id);
  if (movieIndex < 0) {
    return response.status(404).json({ message: "The movie was not found." });
  }

  moviesJSON.splice(movieIndex, 1);

  return response.status(204).json({ messsage: "Movie deleted" });
});

app.options("/movies/:id", (request, response) => {
  response.header("Access-Control-Allow-Origin", "*");
  response.header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  response.send();
});

const PORT = process.env.PORT ?? 3001;

app.listen(PORT, () => {
  console.log(`Server is listening on port http://localhost:${PORT}`);
});
