const z = require("zod");

const movieSchema = z.object({
  title: z.string({
    invalid_type_error: "Movie title must be a string",
    required_error: "Movie title is required",
  }),
  year: z.number().int().min(1900).max(2025),
  director: z.string(),
  duration: z.number().int().positive(),
  poster: z.string().url({
    message: "Poster must be a valid url",
  }),
  genre: z.array(
    z.enum([
      "Action",
      "Adventure",
      "Animation",
      "Biography",
      "Comedy",
      "Crime",
      "Drama",
      "Fantasy",
      "Horror",
      "Romance",
      "Thriller",
      "Sci-Fi",
    ])
  ),
  rate: z.number().min(0).max(10).optional().default(5.0),
});

function validateMovie(movie) {
  return movieSchema.safeParse(movie);
}

function validatePartialMovie(movie) {
  return movieSchema.partial().safeParse(movie);
}

module.exports = {
  validateMovie,
  validatePartialMovie,
};
