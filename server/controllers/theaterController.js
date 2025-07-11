const { StatusCodes } = require('http-status-codes')
const Cinema = require('../models/Cinema')
const Theater = require('../models/Theater')

//@desc     GET all theaters
//@route    GET /theater
//@access   Public
/**
 * @swagger
 * /theaters:
 *   get:
 *     summary: Get all theaters with released showtimes
 *     tags: [Theater]
 *     responses:
 *       200:
 *         description: A list of all theaters with showtimes and cinema info
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
 *                   example: 5
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "64f3cb2fe01e0d6ad89fa277"
 *                       number:
 *                         type: integer
 *                         example: 3
 *                       seatPlan:
 *                         type: object
 *                         properties:
 *                           row:
 *                             type: string
 *                             example: "F"
 *                           column:
 *                             type: integer
 *                             example: 10
 *                       cinema:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                             example: "PVR Velachery"
 *                       showtimes:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                             movie:
 *                               type: string
 *                             showtime:
 *                               type: string
 *                               format: date-time
 *                             isRelease:
 *                               type: boolean
 *                               example: true
 *       400:
 *         description: Failed to fetch theaters
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
 *                   example: "Internal server error"
 */
exports.getTheaters = async (req, res, next) => {
	try {
		const theaters = await Theater.find()
			.populate([
				{ path: 'showtimes', select: 'movie showtime isRelease' },
				{ path: 'cinema', select: 'name' }
			])
			.then((theaters) => {
				theaters.forEach((theater) => {
					theater.showtimes = theater.showtimes.filter((showtime) => showtime.isRelease)
				})
				return theaters
			})

		res.status(StatusCodes.OK).json({ 
			success: true, 
			count: theaters.length, 
			data: theaters 
		})
	} catch (err) {
		res.status(StatusCodes.BAD_REQUEST).json({ 
			success: false, 
			message: err 
		})
	}
}

//@desc     GET single theater
//@route    GET /theater/:id
//@access   Public
/**
 * @swagger
 * /theaters/{id}:
 *   get:
 *     summary: Get a single theater by ID with released showtimes
 *     tags: [Theater]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the theater to retrieve
 *         schema:
 *           type: string
 *           example: "64f3cb2fe01e0d6ad89fa277"
 *     responses:
 *       200:
 *         description: Theater found
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
 *                     number:
 *                       type: integer
 *                       example: 3
 *                     seatPlan:
 *                       type: object
 *                       properties:
 *                         row:
 *                           type: string
 *                           example: "F"
 *                         column:
 *                           type: integer
 *                           example: 10
 *                     cinema:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                           example: "PVR Velachery"
 *                     showtimes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           movie:
 *                             type: string
 *                           showtime:
 *                             type: string
 *                             format: date-time
 *                           isRelease:
 *                             type: boolean
 *                             example: true
 *       400:
 *         description: Theater not found or error occurred
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
 *                   example: "Theater not found with id of 64f3cb2fe01e0d6ad89fa277"
 */
exports.getTheater = async (req, res, next) => {
	try {
		const theater = await Theater.findById(req.params.id)
			.populate([
				{ path: 'showtimes', select: 'movie showtime isRelease' },
				{ path: 'cinema', select: 'name' }
			])
			.then((theater) => {
				theater.showtimes = theater.showtimes.filter((showtime) => showtime.isRelease)
				return theater
			})

		if (!theater) {
			return res.status(StatusCodes.BAD_REQUEST).json({ 
				success: false, 
				message: `Theater not found with id of ${req.params.id}` 
			})
		}

		res.status(StatusCodes.OK).json({ success: true, data: theater })
	} catch (err) {
		res.status(StatusCodes.BAD_REQUEST).json({ 
			success: false, 
			message: err }
		)
	}
}

//@desc     GET single theater with all unreleased showtime
//@route    GET /theater/unreleased/:id
//@access   Private admin
/**
 * @swagger
 * /theaters/{id}/unreleased:
 *   get:
 *     summary: Get a theater by ID including all (unreleased + released) showtimes
 *     tags: [Theater]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Theater ID
 *         schema:
 *           type: string
 *           example: "64f3cb2fe01e0d6ad89fa277"
 *     responses:
 *       200:
 *         description: Theater data including all showtimes
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
 *                     number:
 *                       type: integer
 *                       example: 2
 *                     seatPlan:
 *                       type: object
 *                       properties:
 *                         row:
 *                           type: string
 *                           example: "F"
 *                         column:
 *                           type: integer
 *                           example: 10
 *                     cinema:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                           example: "INOX Express Avenue"
 *                     showtimes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           movie:
 *                             type: string
 *                           showtime:
 *                             type: string
 *                             format: date-time
 *                           isRelease:
 *                             type: boolean
 *                             example: false
 *       400:
 *         description: Theater not found or error occurred
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
 *                   example: "Theater not found with id of 64f3cb2fe01e0d6ad89fa277"
 */
exports.getUnreleasedTheater = async (req, res, next) => {
	try {
		const theater = await Theater.findById(req.params.id).populate([
			{ path: 'showtimes', select: 'movie showtime isRelease' },
			{ path: 'cinema', select: 'name' }
		])

		if (!theater) {
			return res.status(StatusCodes.BAD_REQUEST).json({ 
				success: false, 
				message: `Theater not found with id of ${req.params.id}` 
			})
		}

		res.status(StatusCodes.OK).json({ 
			success: true, 
			data: theater 
		})
	} catch (err) {
		res.status(StatusCodes.BAD_REQUEST).json({ 
			success: false, 
			message: err 
		})
	}
}

//@desc     GET theaters by movie and date
//@route    GET /theater/movie/:mid/:date/:timezone
//@access   Public
/**
 * @swagger
 * /theaters/movie/{mid}/{date}/{timezone}:
 *   get:
 *     summary: Get theaters showing a specific movie on a specific date
 *     tags: [Theater]
 *     parameters:
 *       - in: path
 *         name: mid
 *         required: true
 *         description: Movie ID
 *         schema:
 *           type: string
 *           example: "64f3cb2fe01e0d6ad89fa288"
 *       - in: path
 *         name: date
 *         required: true
 *         description: Date in ISO format (e.g., 2025-07-09)
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-07-09"
 *       - in: path
 *         name: timezone
 *         required: true
 *         description: Timezone offset in minutes (e.g., 330 for IST)
 *         schema:
 *           type: integer
 *           example: 330
 *     responses:
 *       200:
 *         description: Theaters with matching showtimes
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
 *                       number:
 *                         type: integer
 *                         example: 2
 *                       seatPlan:
 *                         type: object
 *                         properties:
 *                           row:
 *                             type: string
 *                             example: "F"
 *                           column:
 *                             type: integer
 *                             example: 10
 *                       cinema:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                             example: "INOX Express Avenue"
 *                       showtimes:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                             movie:
 *                               type: object
 *                               properties:
 *                                 _id:
 *                                   type: string
 *                                 name:
 *                                   type: string
 *                                   example: "Inception"
 *                             showtime:
 *                               type: string
 *                               format: date-time
 *                             isRelease:
 *                               type: boolean
 *                               example: true
 *       400:
 *         description: Invalid input or server error
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
 *                   example: "Internal server error"
 */
exports.getTheaterByMovie = async (req, res, next) => {
	try {
		const { mid, date, timezone } = req.params
		let theaters = await Theater.find()
			.populate([
				{
					path: 'showtimes',
					populate: { path: 'movie', select: 'name _id' },
					select: 'movie showtime isRelease'
				},
				{ path: 'cinema', select: 'name' }
			])
			.then((theaters) => {
				theaters.forEach((theater) => {
					theater.showtimes = theater.showtimes.filter((showtime) => showtime.isRelease)
				})
				return theaters
			})

		theaters = theaters.filter((theater) => {
			return theater.showtimes.some((showtime) => {
				const d1 = new Date(showtime.showtime)
				const d2 = new Date(date)
				d1.setTime(d1.getTime() - timezone * 60 * 1000)
				d2.setTime(d2.getTime() - timezone * 60 * 1000)
				return (
					showtime.movie._id.equals(mid) &&
					d1.getUTCFullYear() === d2.getUTCFullYear() &&
					d1.getUTCMonth() === d2.getUTCMonth() &&
					d1.getUTCDate() === d2.getUTCDate()
				)
			})
		})
		res.status(StatusCodes.OK).json({ 
			success: true, 
			data: theaters 
		})
	} catch (err) {
		console.log(err)
		res.status(StatusCodes.BAD_REQUEST).json({ 
			success: false, 
			message: err 
		})
	}
}

//@desc     GET theaters by movie and date with all unreleased showtime
//@route    GET /theater/movie/unreleased/:mid/:date/:timezone
//@access   Private admin
/**
 * @swagger
 * /theaters/unreleased/movie/{mid}/{date}/{timezone}:
 *   get:
 *     summary: Get all theaters showing a specific movie on a specific date (including unreleased showtimes)
 *     tags: [Theater]
 *     parameters:
 *       - in: path
 *         name: mid
 *         required: true
 *         description: Movie ID
 *         schema:
 *           type: string
 *           example: "64f3cb2fe01e0d6ad89fa288"
 *       - in: path
 *         name: date
 *         required: true
 *         description: Date in ISO format (e.g., 2025-07-09)
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-07-09"
 *       - in: path
 *         name: timezone
 *         required: true
 *         description: Timezone offset in minutes (e.g., 330 for IST)
 *         schema:
 *           type: integer
 *           example: 330
 *     responses:
 *       200:
 *         description: Theaters showing the movie (all showtimes including unreleased)
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
 *                       number:
 *                         type: integer
 *                       seatPlan:
 *                         type: object
 *                         properties:
 *                           row:
 *                             type: string
 *                             example: "F"
 *                           column:
 *                             type: integer
 *                             example: 10
 *                       cinema:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                             example: "PVR Skywalk"
 *                       showtimes:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                             movie:
 *                               type: object
 *                               properties:
 *                                 _id:
 *                                   type: string
 *                                 name:
 *                                   type: string
 *                                   example: "Oppenheimer"
 *                             showtime:
 *                               type: string
 *                               format: date-time
 *                             isRelease:
 *                               type: boolean
 *                               example: false
 *       400:
 *         description: Invalid input or server error
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
 *                   example: "Internal server error"
 */
exports.getUnreleasedTheaterByMovie = async (req, res, next) => {
	try {
		const { mid, date, timezone } = req.params
		let theaters = await Theater.find().populate([
			{
				path: 'showtimes',
				populate: { path: 'movie', select: 'name _id' },
				select: 'movie showtime isRelease'
			},
			{ path: 'cinema', select: 'name' }
		])

		theaters = theaters.filter((theater) => {
			return theater.showtimes.some((showtime) => {
				const d1 = new Date(showtime.showtime)
				const d2 = new Date(date)
				d1.setTime(d1.getTime() - timezone * 60 * 1000)
				d2.setTime(d2.getTime() - timezone * 60 * 1000)
				return (
					showtime.movie._id.equals(mid) &&
					d1.getUTCFullYear() === d2.getUTCFullYear() &&
					d1.getUTCMonth() === d2.getUTCMonth() &&
					d1.getUTCDate() === d2.getUTCDate()
				)
			})
		})
		res.status(StatusCodes.OK).json({ 
			success: true, 
			data: theaters 
		})
	} catch (err) {
		console.log(err)
		res.status(StatusCodes.BAD_REQUEST).json({ 
			success: false, 
			message: err 
		})
	}
}

//@desc     Create theater
//@route    POST /theater
//@access   Private
/**
 * @swagger
 * /theaters:
 *   post:
 *     summary: Create a new theater for a given cinema
 *     tags: [Theater]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cinema
 *               - row
 *               - column
 *             properties:
 *               cinema:
 *                 type: string
 *                 description: ID of the cinema
 *                 example: "64f3c9fce01e0d6ad89fa223"
 *               row:
 *                 type: string
 *                 description: Row letter(s) for seat plan (A to CZ)
 *                 example: "F"
 *               column:
 *                 type: integer
 *                 description: Number of columns (1 to 120)
 *                 example: 10
 *     responses:
 *       201:
 *         description: Theater created successfully
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
 *                     cinema:
 *                       type: string
 *                     number:
 *                       type: integer
 *                       example: 1
 *                     seatPlan:
 *                       type: object
 *                       properties:
 *                         row:
 *                           type: string
 *                           example: "F"
 *                         column:
 *                           type: integer
 *                           example: 10
 *       400:
 *         description: Bad request (e.g., invalid input or cinema not found)
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
 *                   example: Row is not a valid letter between A to CZ
 */
exports.createTheater = async (req, res, next) => {
	try {
		const { cinema: cinemaId, row, column } = req.body
		const rowRegex = /^([A-D][A-Z]|[A-Z])$/
		if (!rowRegex.test(row)) {
			return res.status(StatusCodes.BAD_REQUEST).json({ 
				success: false, 
				message: `Row is not a valid letter between A to CZ` 
			})
		}

		if (column < 1 || column > 120) {
			return res.status(StatusCodes.BAD_REQUEST).json({ 
				success: false, 
				message: `Column is not a valid number between 1 to 250` 
			})
		}

		const cinema = await Cinema.findById(cinemaId)

		if (!cinema) {
			return res.status(StatusCodes.BAD_REQUEST).json({ 
				success: false, 
				message: `Cinema not found with id of ${cinemaId}` 
			})
		}

		const theater = await Theater.create({ cinema, number: cinema.theaters.length + 1, seatPlan: { row, column } })

		cinema.theaters.push(theater._id)

		await cinema.save()

		res.status(StatusCodes.CREATED).json({
			success: true,
			data: theater
		})
	} catch (err) {
		res.status(StatusCodes.BAD_REQUEST).json({ 
			success: false, 
			message: err })
	}
}

//@desc     Update theaters
//@route    PUT /theater/:id
//@access   Private Admin
/**
 * @swagger
 * /theaters/{id}:
 *   put:
 *     summary: Update an existing theater by ID
 *     tags: [Theater]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Theater ID
 *         schema:
 *           type: string
 *           example: "64f3cf6ae01e0d6ad89fa2ff"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               seatPlan:
 *                 type: object
 *                 properties:
 *                   row:
 *                     type: string
 *                     example: "E"
 *                   column:
 *                     type: integer
 *                     example: 12
 *               number:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Theater updated successfully
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
 *                     cinema:
 *                       type: string
 *                     number:
 *                       type: integer
 *                       example: 2
 *                     seatPlan:
 *                       type: object
 *                       properties:
 *                         row:
 *                           type: string
 *                           example: "E"
 *                         column:
 *                           type: integer
 *                           example: 12
 *       400:
 *         description: Theater not found or input validation error
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
 *                   example: Theater not found with id of 64f3cf6ae01e0d6ad89fa2ff
 */
exports.updateTheater = async (req, res, next) => {
	try {
		const theater = await Theater.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true
		})

		if (!theater) {
			return res.status(StatusCodes.BAD_REQUEST).json({ 
				success: false, 
				message: `Theater not found with id of ${req.params.id}` 
			})
		}
		res.status(StatusCodes.OK).json({ 
			success: true, 
			data: theater 
		})
	} catch (err) {
		res.status(StatusCodes.BAD_REQUEST).json({ 
			success: false, 
			message: err 
		})
	}
}

//@desc     Delete single theaters
//@route    DELETE /theater/:id
//@access   Private Admin
/**
 * @swagger
 * /theaters/{id}:
 *   delete:
 *     summary: Delete a theater by ID
 *     tags: [Theater]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Theater ID to delete
 *         schema:
 *           type: string
 *           example: "64f3cf6ae01e0d6ad89fa2ff"
 *     responses:
 *       200:
 *         description: Theater deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Theater not found or deletion failed
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
 *                   example: Theater not found with id of 64f3cf6ae01e0d6ad89fa2ff
 */
exports.deleteTheater = async (req, res, next) => {
	try {
		const theater = await Theater.findById(req.params.id)

		if (!theater) {
			return res.status(StatusCodes.BAD_REQUEST).json({ 
				success: false, 
				message: `Theater not found with id of ${req.params.id}` 
			})
		}

		await theater.deleteOne()

		await Cinema.updateMany({ theaters: theater._id }, { $pull: { theaters: theater._id } })

		res.status(StatusCodes.OK).json({ success: true })
	} catch (err) {
		res.status(StatusCodes.BAD_REQUEST).json({ 
			success: false, 
			message: err 
		})
	}
}
