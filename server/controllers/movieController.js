const { StatusCodes } = require('http-status-codes')
const Movie = require('../models/Movie')
const Showtime = require('../models/Showtime')

//@desc     GET all movies
//@route    GET /movie
//@access   Public
/**
 * @swagger
 * /movies:
 *   get:
 *     summary: Get all movies
 *     tags: [Movie]
 *     responses:
 *       200:
 *         description: Successfully retrieved list of movies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 3
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 64f2b9dcf25678a1bb5a1234
 *                       name:
 *                         type: string
 *                         example: The Dark Knight
 *                       genre:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["Action", "Drama"]
 *                       languages:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["English", "Hindi"]
 *                       description:
 *                         type: string
 *                         example: A gritty crime thriller about Batman and the Joker.
 *                       releaseDate:
 *                         type: string
 *                         format: date
 *                         example: 2008-07-18
 *                       length:
 *                         type: number
 *                         example: 152
 *                       isBlockbuster:
 *                         type: boolean
 *                         example: true
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2025-07-09T10:00:00.000Z
 *       400:
 *         description: Failed to retrieve movies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Could not fetch movies from database
 */
exports.getMovies = async (req, res, next) => {
	try {
		const movies = await Movie.find().sort({ createdAt: -1 })
		res.status(StatusCodes.OK).json({ 
			success: true, 
			count: movies.length, 
			data: movies 
		});
	} catch (err) {
		res.status(StatusCodes.BAD_REQUEST).json({ 
			success: false, 
			message: err 
		});
	}
}

//@desc     GET showing movies
//@route    GET /movie/showing
//@access   Public
/**
 * @swagger
 * /movies/showing:
 *   get:
 *     summary: Get all currently showing and released movies (based on showtime)
 *     tags: [Movie]
 *     responses:
 *       200:
 *         description: Successfully retrieved list of currently showing movies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 64f2b9dcf25678a1bb5a1234
 *                       name:
 *                         type: string
 *                         example: Interstellar
 *                       genre:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["Sci-Fi", "Adventure"]
 *                       languages:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["English", "Tamil"]
 *                       releaseDate:
 *                         type: string
 *                         format: date
 *                         example: 2024-06-01
 *                       count:
 *                         type: integer
 *                         description: Number of future showtimes for this movie
 *                         example: 12
 *       400:
 *         description: Error occurred while fetching currently showing movies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Internal server error during movie aggregation
 */
exports.getShowingMovies = async (req, res, next) => {
	try {
		const showingShowtime = await Showtime.aggregate([
			{ $match: { showtime: { $gte: new Date() }, isRelease: true } },
			{
				$lookup: {
					from: 'movies', // Replace "movies" with the actual collection name of your movies
					localField: 'movie',
					foreignField: '_id',
					as: 'movie'
				}
			},
			{
				$group: {
					_id: '$movie',
					count: { $sum: 1 }
				}
			},
			{
				$unwind: '$_id'
			},
			{
				$replaceRoot: {
					newRoot: {
						$mergeObjects: ['$$ROOT', '$_id']
					}
				}
			},
			{
				$sort: { count: -1 }
			}
		])

		res.status(StatusCodes.OK).json({ 
			success: true, 
			data: showingShowtime 
		});
	} catch (err) {
		console.log(err)
		res.status(StatusCodes.BAD_REQUEST).json({ 
			success: false, 
			message: err 
		})
	}
}

//@desc     GET showing movies with all unreleased showtime
//@route    GET /movie/unreleased/showing
//@access   Private admin
/**
 * @swagger
 * /movies/unreleased-showing:
 *   get:
 *     summary: Get unreleased movies that have scheduled showtimes
 *     tags: [Movie]
 *     responses:
 *       200:
 *         description: Successfully retrieved unreleased movies with upcoming showtimes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 64f2b9dcf25678a1bb5a1234
 *                       name:
 *                         type: string
 *                         example: "Dune: Part Three"
 *                       genre:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["Sci-Fi", "Adventure"]
 *                       releaseDate:
 *                         type: string
 *                         format: date
 *                         example: 2025-12-20
 *                       count:
 *                         type: integer
 *                         description: Number of scheduled future showtimes
 *                         example: 9
 *       400:
 *         description: Error occurred while fetching unreleased showtime movies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Failed to fetch unreleased showtime movies
 */
exports.getUnreleasedShowingMovies = async (req, res, next) => {
	try {
		const showingShowtime = await Showtime.aggregate([
			{ $match: { showtime: { $gte: new Date() }, isRelease: true } },
			{
				$lookup: {
					from: 'movies', // Replace "movies" with the actual collection name of your movies
					localField: 'movie',
					foreignField: '_id',
					as: 'movie'
				}
			},
			{
				$group: {
					_id: '$movie',
					count: { $sum: 1 }
				}
			},
			{
				$unwind: '$_id'
			},
			{
				$replaceRoot: {
					newRoot: {
						$mergeObjects: ['$$ROOT', '$_id']
					}
				}
			},
			{
				$sort: { count: -1, updatedAt: -1 }
			}
		])

		res.status(StatusCodes.OK).json({ 
			success: true, 
			data: showingShowtime 
		})
	} catch (err) {
		console.log(err)
		res.status(StatusCodes.BAD_REQUEST).json({ 
			success: false, 
			message: err 
		})
	}
}

//@desc     GET single movie
//@route    GET /movie/:id
//@access   Public
/**
 * @swagger
 * /movies/{id}:
 *   get:
 *     summary: Get a movie by ID
 *     tags: [Movie]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the movie to retrieve
 *         schema:
 *           type: string
 *           example: 64f2b9dcf25678a1bb5a1234
 *     responses:
 *       200:
 *         description: Successfully retrieved the movie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 64f2b9dcf25678a1bb5a1234
 *                     name:
 *                       type: string
 *                       example: The Matrix
 *                     genre:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Action", "Sci-Fi"]
 *                     languages:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["English", "Hindi"]
 *                     releaseDate:
 *                       type: string
 *                       format: date
 *                       example: 1999-03-31
 *                     length:
 *                       type: number
 *                       example: 136
 *                     description:
 *                       type: string
 *                       example: A computer hacker learns about the true nature of his reality.
 *       400:
 *         description: Movie not found or bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Movie not found with id of 64f2b9dcf25678a1bb5a1234
 */
exports.getMovie = async (req, res, next) => {
	try {
		const movie = await Movie.findById(req.params.id)

		if (!movie) {
			return res.status(StatusCodes.BAD_REQUEST).json({ 
				success: false, 
				message: `Movie not found with id of ${req.params.id}` 
			})
		}

		res.status(StatusCodes.OK).json({ 
			success: true, 
			data: movie 
		})
	} catch (err) {
		res.status(StatusCodes.BAD_REQUEST).json({ 
			success: false, 
			message: err 
		})
	}
}

//@desc     Create movie
//@route    POST /movie
//@access   Private
/**
 * @swagger
 * /movies:
 *   post:
 *     summary: Create a new movie
 *     tags: [Movie]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - genre
 *               - languages
 *               - releaseDate
 *               - length
 *             properties:
 *               name:
 *                 type: string
 *                 example: Inception
 *               genre:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Sci-Fi", "Thriller"]
 *               languages:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["English", "Hindi"]
 *               description:
 *                 type: string
 *                 example: A mind-bending thriller by Christopher Nolan.
 *               releaseDate:
 *                 type: string
 *                 format: date
 *                 example: 2010-07-16
 *               length:
 *                 type: number
 *                 example: 148
 *               isBlockbuster:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Movie created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 64f2b9dcf25678a1bb5a1234
 *                     name:
 *                       type: string
 *                       example: Inception
 *                     genre:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Sci-Fi", "Thriller"]
 *                     languages:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["English", "Hindi"]
 *                     releaseDate:
 *                       type: string
 *                       format: date
 *                       example: 2010-07-16
 *                     length:
 *                       type: number
 *                       example: 148
 *                     isBlockbuster:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Movie creation failed due to validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Movie validation failed: name is required"
 */
exports.createMovie = async (req, res, next) => {
	try {
		const movie = await Movie.create(req.body)
		res.status(StatusCodes.CREATED).json({
			success: true,
			data: movie
		})
	} catch (err) {
		res.status(StatusCodes.BAD_REQUEST).json({ 
			success: false, 
			message: err 
		})
	}
}

//@desc     Update movies
//@route    PUT /movie/:id
//@access   Private Admin
/**
 * @swagger
 * /movies/{id}:
 *   put:
 *     summary: Update a movie by ID
 *     tags: [Movie]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the movie to update
 *         schema:
 *           type: string
 *           example: 64f2b9dcf25678a1bb5a1234
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Tenet
 *               genre:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Action", "Sci-Fi"]
 *               languages:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["English", "Hindi"]
 *               description:
 *                 type: string
 *                 example: A time-inversion thriller by Christopher Nolan.
 *               releaseDate:
 *                 type: string
 *                 format: date
 *                 example: 2020-08-26
 *               length:
 *                 type: number
 *                 example: 150
 *               isBlockbuster:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Movie updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Movie'
 *       400:
 *         description: Movie not found or validation failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Movie not found with id of 64f2b9dcf25678a1bb5a1234
 */
exports.updateMovie = async (req, res, next) => {
	try {
		const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true
		})

		if (!movie) {
			return res.status(StatusCodes.BAD_REQUEST).json({ 
				success: false, 
				message: `Movie not found with id of ${req.params.id}` 
			})
		}
		res.status(StatusCodes.OK).json({ 
			success: true, 
			data: movie 
		})
	} catch (err) {
		res.status(StatusCodes.BAD_REQUEST).json({ 
			success: false, 
			message: err 
		})
	}
}

//@desc     Delete single movies
//@route    DELETE /movie/:id
//@access   Private Admin
/**
 * @swagger
 * /movies/{id}:
 *   delete:
 *     summary: Delete a movie by ID
 *     tags: [Movie]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the movie to delete
 *         schema:
 *           type: string
 *           example: 64f2b9dcf25678a1bb5a1234
 *     responses:
 *       200:
 *         description: Movie deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Movie not found or deletion failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Movie not found with id of 64f2b9dcf25678a1bb5a1234
 */
exports.deleteMovie = async (req, res, next) => {
	try {
		const movie = await Movie.findById(req.params.id)

		if (!movie) {
			return res.status(StatusCodes.BAD_REQUEST).json({ 
				success: false, 
				message: `Movie not found with id of ${req.params.id}` })
		}

		await movie.deleteOne()
		res.status(StatusCodes.OK).json({ success: true })
	} catch (err) {
		res.status(StatusCodes.BAD_REQUEST).json({ 
			success: false, 
			message: err 
		})
	}
}
