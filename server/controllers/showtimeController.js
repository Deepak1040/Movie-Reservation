const { StatusCodes } = require('http-status-codes')
const Movie = require('../models/Movie')
const Showtime = require('../models/Showtime')
const Theater = require('../models/Theater')
const User = require('../models/User')

//@desc     GET showtimes
//@route    GET /showtime
//@access   Public
/**
 * @swagger
 * /showtimes:
 *   get:
 *     summary: Get all released showtimes
 *     tags: [Showtime]
 *     responses:
 *       StatusCodes.OK:
 *         description: "Successfully retrieved all showtimes with isRelease: true"
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
 *                         example: 64f3cb2fe01e0d6ad89fa233
 *                       movie:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "The Batman"
 *                           genre:
 *                             type: array
 *                             items:
 *                               type: string
 *                             example: ["Action", "Crime"]
 *                       theater:
 *                         type: object
 *                         properties:
 *                           number:
 *                             type: integer
 *                             example: 1
 *                           seatPlan:
 *                             type: string
 *                             example: "standard"
 *                           cinema:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                                 example: "PVR Cinemas"
 *       StatusCodes.BAD_REQUEST:
 *         description: "Error fetching showtimes"
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
 *                   example: "Failed to fetch showtimes"
 */
exports.getShowtimes = async (req, res, next) => {
	try {
		const showtimes = await Showtime.find({ isRelease: true })
			.populate([
				'movie',
				{ path: 'theater', populate: { path: 'cinema', select: 'name' }, select: 'number cinema seatPlan' }
			])
			.select('-seats.user -seats.row -seats.number')

		res.status(StatusCodes.OK).json({ success: true, count: showtimes.length, data: showtimes })
	} catch (err) {
		console.log(err)
		res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: err })
	}
}
//@desc     GET showtimes with all unreleased showtime
//@route    GET /showtime/unreleased
//@access   Private admin
/**
 * @swagger
 * /showtimes/unreleased:
 *   get:
 *     summary: Get all showtimes including unreleased ones (admin view)
 *     tags: [Showtime]
 *     responses:
 *       StatusCodes.OK:
 *         description: "Successfully retrieved all showtimes, regardless of isRelease status"
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
 *                   example: 10
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "64f3cb2fe01e0d6ad89fa233"
 *                       movie:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "Oppenheimer"
 *                           genre:
 *                             type: array
 *                             items:
 *                               type: string
 *                             example: ["Drama", "History"]
 *                       theater:
 *                         type: object
 *                         properties:
 *                           number:
 *                             type: integer
 *                             example: 3
 *                           seatPlan:
 *                             type: string
 *                             example: "premium"
 *                           cinema:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                                 example: "INOX"
 *       StatusCodes.BAD_REQUEST:
 *         description: "Error retrieving showtimes"
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
exports.getUnreleasedShowtimes = async (req, res, next) => {
	try {
		const showtimes = await Showtime.find()
			.populate([
				'movie',
				{ path: 'theater', populate: { path: 'cinema', select: 'name' }, select: 'number cinema seatPlan' }
			])
			.select('-seats.user -seats.row -seats.number')

		res.status(StatusCodes.OK).json({ success: true, count: showtimes.length, data: showtimes })
	} catch (err) {
		console.log(err)
		res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: err })
	}
}

//@desc     GET single showtime
//@route    GET /showtime/:id
//@access   Public
/**
 * @swagger
 * /showtimes/{id}:
 *   get:
 *     summary: Get a single released showtime by ID
 *     tags: [Showtime]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the showtime to retrieve
 *         schema:
 *           type: string
 *           example: 64f3cb2fe01e0d6ad89fa233
 *     responses:
 *       StatusCodes.OK:
 *         description: "Successfully retrieved the released showtime"
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
 *                       example: "64f3cb2fe01e0d6ad89fa233"
 *                     showtime:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-07-15T18:00:00.000Z"
 *                     movie:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: "Avatar 3"
 *                         genre:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["Fantasy", "Adventure"]
 *                     theater:
 *                       type: object
 *                       properties:
 *                         number:
 *                           type: integer
 *                           example: 2
 *                         seatPlan:
 *                           type: string
 *                           example: "standard"
 *                         cinema:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                               example: "PVR Orion Mall"
 *       StatusCodes.BAD_REQUEST:
 *         description: "Showtime not found or not released"
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
 *                   example: "Showtime is not released"
 */
exports.getShowtime = async (req, res, next) => {
	try {
		const showtime = await Showtime.findById(req.params.id)
			.populate([
				'movie',
				{ path: 'theater', populate: { path: 'cinema', select: 'name' }, select: 'number cinema seatPlan' }
			])
			.select('-seats.user')

		if (!showtime) {
			return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: `Showtime not found with id of ${req.params.id}` })
		}

		if (!showtime.isRelease) {
			return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: `Showtime is not released` })
		}

		res.status(StatusCodes.OK).json({ success: true, data: showtime })
	} catch (err) {
		console.log(err)
		res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: err })
	}
}

//@desc     GET single showtime with user
//@route    GET /showtime/user/:id
//@access   Private Admin
/**
 * @swagger
 * /showtimes/{id}/with-users:
 *   get:
 *     summary: Get a showtime by ID including seat user details
 *     tags: [Showtime]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the showtime to retrieve
 *         schema:
 *           type: string
 *           example: 64f3cb2fe01e0d6ad89fa233
 *     responses:
 *       StatusCodes.OK:
 *         description: "Showtime with populated seat user info retrieved successfully"
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
 *                       example: "64f3cb2fe01e0d6ad89fa233"
 *                     movie:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: "Interstellar"
 *                     theater:
 *                       type: object
 *                       properties:
 *                         number:
 *                           type: integer
 *                           example: 4
 *                         seatPlan:
 *                           type: string
 *                           example: "standard"
 *                         cinema:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                               example: "PVR Phoenix"
 *                     seats:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           row:
 *                             type: string
 *                             example: "C"
 *                           number:
 *                             type: number
 *                             example: 10
 *                           user:
 *                             type: object
 *                             properties:
 *                               username:
 *                                 type: string
 *                                 example: "johndoe"
 *                               email:
 *                                 type: string
 *                                 example: "johndoe@example.com"
 *                               role:
 *                                 type: string
 *                                 example: "user"
 *       StatusCodes.BAD_REQUEST:
 *         description: "Showtime not found or error during retrieval"
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
 *                   example: "Showtime not found with id of 64f3cb2fe01e0d6ad89fa233"
 */
exports.getShowtimeWithUser = async (req, res, next) => {
	try {
		const showtime = await Showtime.findById(req.params.id).populate([
			'movie',
			{ path: 'theater', populate: { path: 'cinema', select: 'name' }, select: 'number cinema seatPlan' },
			{ path: 'seats', populate: { path: 'user', select: 'username email role' } }
		])

		if (!showtime) {
			return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: `Showtime not found with id of ${req.params.id}` })
		}

		res.status(StatusCodes.OK).json({ success: true, data: showtime })
	} catch (err) {
		console.log(err)
		res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: err })
	}
}

//@desc     Add Showtime
//@route    POST /showtime
//@access   Private
/**
 * @swagger
 * /showtimes:
 *   post:
 *     summary: Add a new showtime (with optional daily repetition)
 *     tags: [Showtime]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - movie
 *               - theater
 *               - showtime
 *             properties:
 *               movie:
 *                 type: string
 *                 description: Movie ID
 *                 example: "64f2c9a7b1a74a4567e12345"
 *               theater:
 *                 type: string
 *                 description: Theater ID
 *                 example: "64f2b1c4a14f7a0fdc8f6789"
 *               showtime:
 *                 type: string
 *                 format: date-time
 *                 description: ISO datetime string for the showtime
 *                 example: "2025-07-15T18:30:00.000Z"
 *               repeat:
 *                 type: integer
 *                 description: Number of times to repeat this showtime daily (1 to 31)
 *                 example: 3
 *               isRelease:
 *                 type: boolean
 *                 description: Whether the showtime is publicly released
 *                 example: true
 *     responses:
 *       StatusCodes.OK:
 *         description: "Showtime(s) created successfully"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 showtimes:
 *                   type: array
 *                   items:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-07-15T18:30:00.000Z"
 *       StatusCodes.BAD_REQUEST:
 *         description: "Error in input or validation failure"
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
 *                   example: "Movie not found with id of 64f2c9a7b1a74a4567e12345"
 */
exports.addShowtime = async (req, res, next) => {
	try {
		const { movie: movieId, showtime: showtimeString, theater: theaterId, repeat = 1, isRelease } = req.body

		if (repeat > 31 || repeat < 1) {
			return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: `Repeat is not a valid number between 1 to 31` })
		}

		let showtime = new Date(showtimeString)
		let showtimes = []
		let showtimeIds = []

		const theater = await Theater.findById(theaterId)

		if (!theater) {
			return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: `Theater not found with id of ${req.params.id}` })
		}

		const movie = await Movie.findById(movieId)

		if (!movie) {
			return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: `Movie not found with id of ${movieId}` })
		}

		for (let i = 0; i < repeat; i++) {
			const showtimeDoc = await Showtime.create({ theater, movie: movie._id, showtime, isRelease })

			showtimeIds.push(showtimeDoc._id)
			showtimes.push(new Date(showtime))
			showtime.setDate(showtime.getDate() + 1)
		}
		theater.showtimes = theater.showtimes.concat(showtimeIds)

		await theater.save()

		res.status(StatusCodes.OK).json({
			success: true,
			showtimes: showtimes
		})
	} catch (err) {
		console.log(err)
		res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: err })
	}
}

//@desc     Purchase seats
//@route    POST /showtime/:id
//@access   Private
/**
 * @swagger
 * /showtimes/{id}/purchase:
 *   post:
 *     summary: Purchase seats for a showtime
 *     tags: [Showtime]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Showtime ID to purchase tickets for
 *         schema:
 *           type: string
 *           example: "64f3cb2fe01e0d6ad89fa233"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - seats
 *             properties:
 *               seats:
 *                 type: array
 *                 description: Array of seat labels to purchase (e.g. "B4")
 *                 items:
 *                   type: string
 *                 example: ["A1", "A2", "B3"]
 *     responses:
 *       StatusCodes.OK:
 *         description: "Seats successfully purchased"
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
 *                   description: Updated showtime document
 *                 updatedUser:
 *                   type: object
 *                   description: Updated user document with ticket info
 *       StatusCodes.BAD_REQUEST:
 *         description: "Invalid seat or showtime not found"
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
 *                   example: "Seat is not valid"
 */
exports.purchase = async (req, res, next) => {
	try {
		const { seats } = req.body
		const user = req.user

		const showtime = await Showtime.findById(req.params.id).populate({ path: 'theater', select: 'seatPlan' })

		if (!showtime) {
			return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: `Showtime not found with id of ${req.params.id}` })
		}

		const isSeatValid = seats.every((seatNumber) => {
			const [row, number] = seatNumber.match(/([A-Za-z]+)(\d+)/).slice(1)
			const maxRow = showtime.theater.seatPlan.row
			const maxCol = showtime.theater.seatPlan.column

			if (maxRow.length !== row.length) {
				return maxRow.length > row.length
			}

			return maxRow.localeCompare(row) >= 0 && number <= maxCol
		})

		if (!isSeatValid) {
			return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'Seat is not valid' })
		}

		const isSeatAvailable = seats.every((seatNumber) => {
			const [row, number] = seatNumber.match(/([A-Za-z]+)(\d+)/).slice(1)
			return !showtime.seats.some((seat) => seat.row === row && seat.number === parseInt(number, 10))
		})

		if (!isSeatAvailable) {
			return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'Seat not available' })
		}

		const seatUpdates = seats.map((seatNumber) => {
			const [row, number] = seatNumber.match(/([A-Za-z]+)(\d+)/).slice(1)
			return { row, number: parseInt(number, 10), user: user._id }
		})

		showtime.seats.push(...seatUpdates)
		const updatedShowtime = await showtime.save()

		const updatedUser = await User.findByIdAndUpdate(
			user._id,
			{
				$push: { tickets: { showtime, seats: seatUpdates } }
			},
			{ new: true }
		)

		res.status(StatusCodes.OK).json({ success: true, data: updatedShowtime, updatedUser })
	} catch (err) {
		console.log(err)
		res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: err })
	}
}

//@desc     Update showtime
//@route    PUT /showtime/:id
//@access   Private Admin
/**
 * @swagger
 * /showtimes/{id}:
 *   put:
 *     summary: Update a showtime by ID
 *     tags: [Showtime]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Showtime ID to update
 *         schema:
 *           type: string
 *           example: "64f3cb2fe01e0d6ad89fa233"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               showtime:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-07-20T17:00:00.000Z"
 *               isRelease:
 *                 type: boolean
 *                 example: true
 *               movie:
 *                 type: string
 *                 example: "64f3cb2fe01e0d6ad89fa244"
 *               theater:
 *                 type: string
 *                 example: "64f3cb2fe01e0d6ad89fa288"
 *     responses:
 *       StatusCodes.OK:
 *         description: "Showtime updated successfully"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Showtime'
 *       StatusCodes.BAD_REQUEST:
 *         description: "Invalid input or showtime not found"
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
 *                   example: "Showtime not found with id of 64f3cb2fe01e0d6ad89fa233"
 */
exports.updateShowtime = async (req, res, next) => {
	try {
		const showtime = await Showtime.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true
		})

		if (!showtime) {
			return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: `Showtime not found with id of ${req.params.id}` })
		}
		res.status(StatusCodes.OK).json({ success: true, data: showtime })
	} catch (err) {
		res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: err })
	}
}

//@desc     Delete single showtime
//@route    DELETE /showtime/:id
//@access   Private Admin
/**
 * @swagger
 * /showtimes/{id}:
 *   delete:
 *     summary: Delete a showtime by ID
 *     tags: [Showtime]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Showtime ID to delete
 *         schema:
 *           type: string
 *           example: "64f3cb2fe01e0d6ad89fa233"
 *     responses:
 *       StatusCodes.OK:
 *         description: "Showtime deleted successfully"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       StatusCodes.BAD_REQUEST:
 *         description: "Showtime not found or deletion failed"
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
 *                   example: "Showtime not found with id of 64f3cb2fe01e0d6ad89fa233"
 */
exports.deleteShowtime = async (req, res, next) => {
	try {
		const showtime = await Showtime.findById(req.params.id)

		if (!showtime) {
			return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: `Showtime not found with id of ${req.params.id}` })
		}

		await showtime.deleteOne()

		res.status(StatusCodes.OK).json({ success: true })
	} catch (err) {
		console.log(err)
		res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: err })
	}
}

//@desc     Delete showtimes
//@route    DELETE /showtime
//@access   Private Admin
/**
 * @swagger
 * /showtimes:
 *   delete:
 *     summary: Delete multiple showtimes (or all if no IDs provided)
 *     tags: [Showtime]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ids:
 *                 type: array
 *                 description: Array of showtime IDs to delete. If omitted, all showtimes will be deleted.
 *                 items:
 *                   type: string
 *                 example: ["64f3cb2fe01e0d6ad89fa233", "64f3cb2fe01e0d6ad89fa244"]
 *     responses:
 *       StatusCodes.OK:
 *         description: "Showtimes deleted successfully"
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
 *                   example: 2
 *       StatusCodes.BAD_REQUEST:
 *         description: "Error occurred during deletion"
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
exports.deleteShowtimes = async (req, res, next) => {
	try {
		const { ids } = req.body

		let showtimesIds

		if (!ids) {
			// Delete all showtimes
			showtimesIds = await Showtime.find({}, '_id')
		} else {
			// Find showtimes based on the provided IDs
			showtimesIds = await Showtime.find({ _id: { $in: ids } }, '_id')
		}

		for (const showtimeId of showtimesIds) {
			await showtimeId.deleteOne()
		}

		res.status(StatusCodes.OK).json({ success: true, count: showtimesIds.length })
	} catch (err) {
		console.log(err)
		res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: err })
	}
}

//@desc     Delete previous day showtime
//@route    DELETE /showtime/previous
//@access   Private Admin
/**
 * @swagger
 * /showtimes/expired:
 *   delete:
 *     summary: Delete all past showtimes (before today)
 *     tags: [Showtime]
 *     responses:
 *       StatusCodes.OK:
 *         description: "Expired showtimes deleted successfully"
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
 *                   description: Number of deleted showtimes
 *                   example: 12
 *       StatusCodes.BAD_REQUEST:
 *         description: "Error during deletion"
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
exports.deletePreviousShowtime = async (req, res, next) => {
	try {
		const currentDate = new Date()
		currentDate.setHours(0, 0, 0, 0)

		const showtimesIds = await Showtime.find({ showtime: { $lt: currentDate } }, '_id')

		for (const showtimeId of showtimesIds) {
			await showtimeId.deleteOne()
		}

		res.status(StatusCodes.OK).json({ success: true, count: showtimesIds.length })
	} catch (err) {
		console.log(err)
		res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: err })
	}
}
