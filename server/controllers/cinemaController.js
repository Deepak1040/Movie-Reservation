const { StatusCodes } = require('http-status-codes');
const Cinema = require('../models/Cinema');

//@desc     GET all cinemas
//@route    GET /cinema
//@access   Public
/**
 * @swagger
 * /cinema:
 *   get:
 *     summary: Get all cinemas with theaters and released showtimes
 *     tags: [Cinema]
 *     responses:
 *       200:
 *         description: Successfully retrieved all cinemas with nested theater and showtime data
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
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 64df12f2bcf5e4df1475a111
 *                       name:
 *                         type: string
 *                         example: PVR Cinemas
 *                       location:
 *                         type: string
 *                         example: Chennai
 *                       theaters:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             number:
 *                               type: integer
 *                               example: 2
 *                             seatPlan:
 *                               type: string
 *                               example: standard
 *                             showtimes:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 properties:
 *                                   _id:
 *                                     type: string
 *                                     example: 64df12f2bcf5e4df1475a789
 *                                   showtime:
 *                                     type: string
 *                                     example: 2025-07-09T18:00:00.000Z
 *                                   isRelease:
 *                                     type: boolean
 *                                     example: true
 *                                   movie:
 *                                     type: object
 *                                     properties:
 *                                       name:
 *                                         type: string
 *                                         example: Inception
 *                                       length:
 *                                         type: number
 *                                         example: 148
 *       400:
 *         description: Bad request or database error
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
 *                   example: Something went wrong while fetching cinemas
 */
exports.getCinemas = async (req, res, next) => {
	try {
		const cinemas = await Cinema.find()
			.populate({
				path: 'theaters',
				populate: {
					path: 'showtimes',
					populate: { path: 'movie', select: 'name length' },
					select: 'movie showtime isRelease'
				},
				select: 'number seatPlan showtimes'
			})
			.collation({ locale: 'en', strength: 2 })
			.sort({ name: 1 })
			.then((cinemas) => {
				cinemas.forEach((cinema) => {
					cinema.theaters.forEach((theater) => {
						theater.showtimes = theater.showtimes.filter((showtime) => showtime.isRelease)
					})
				})
				return cinemas
			})

		res.status(StatusCodes.OK).json({
			success: true,
			count: cinemas.length,
			data: cinemas
		});
	} catch (err) {
		res.status(StatusCodes.BAD_REQUEST).json({
			success: false,
			message: err
		});
	}
}

//@desc     GET all cinemas with all unreleased showtime
//@route    GET /cinema/unreleased
//@access   Private admin
/**
 * @swagger
 * /cinema/unreleased:
 *   get:
 *     summary: Get all cinemas with theaters and all showtimes (including unreleased movies)
 *     tags: [Cinema]
 *     responses:
 *       200:
 *         description: Successfully retrieved all cinemas with full theater and showtime data
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
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 64df12f2bcf5e4df1475a111
 *                       name:
 *                         type: string
 *                         example: INOX Cinemas
 *                       location:
 *                         type: string
 *                         example: Bangalore
 *                       theaters:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             number:
 *                               type: integer
 *                               example: 1
 *                             seatPlan:
 *                               type: string
 *                               example: recliner
 *                             showtimes:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 properties:
 *                                   _id:
 *                                     type: string
 *                                     example: 64df12f2bcf5e4df1475a222
 *                                   showtime:
 *                                     type: string
 *                                     example: 2025-07-10T20:00:00.000Z
 *                                   isRelease:
 *                                     type: boolean
 *                                     example: false
 *                                   movie:
 *                                     type: object
 *                                     properties:
 *                                       name:
 *                                         type: string
 *                                         example: Oppenheimer
 *                                       length:
 *                                         type: number
 *                                         example: 180
 *       400:
 *         description: Bad request or database error
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
 *                   example: Failed to fetch unreleased cinemas
 */
exports.getUnreleasedCinemas = async (req, res, next) => {
	try {
		const cinemas = await Cinema.find()
			.populate({
				path: 'theaters',
				populate: {
					path: 'showtimes',
					populate: { path: 'movie', select: 'name length' },
					select: 'movie showtime isRelease'
				},
				select: 'number seatPlan showtimes'
			})
			.collation({ locale: 'en', strength: 2 })
			.sort({ name: 1 })

		res.status(StatusCodes.OK).json({
			success: true,
			count: cinemas.length,
			data: cinemas
		});
	} catch (err) {
		res.status(StatusCodes.BAD_REQUEST).json({
			success: false,
			message: err
		});
	}
}

//@desc     GET single cinema
//@route    GET /cinema/:id
//@access   Public
/**
 * @swagger
 * /cinema/{id}:
 *   get:
 *     summary: Get a single cinema by ID with released showtimes
 *     tags: [Cinema]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the cinema to retrieve
 *         schema:
 *           type: string
 *           example: 64df12f2bcf5e4df1475a111
 *     responses:
 *       200:
 *         description: Successfully retrieved cinema with theaters and released showtimes
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
 *                       example: 64df12f2bcf5e4df1475a111
 *                     name:
 *                       type: string
 *                       example: SPI Cinemas
 *                     location:
 *                       type: string
 *                       example: Hyderabad
 *                     theaters:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           number:
 *                             type: integer
 *                             example: 5
 *                           seatPlan:
 *                             type: string
 *                             example: VIP
 *                           showtimes:
 *                             type: array
 *                             description: "Only showtimes with `isRelease: true`"
 *                             items:
 *                               type: object
 *                               properties:
 *                                 _id:
 *                                   type: string
 *                                   example: 64df12f2bcf5e4df1475a999
 *                                 showtime:
 *                                   type: string
 *                                   example: 2025-07-09T19:30:00.000Z
 *                                 isRelease:
 *                                   type: boolean
 *                                   example: true
 *                                 movie:
 *                                   type: object
 *                                   properties:
 *                                     name:
 *                                       type: string
 *                                       example: Avatar 2
 *                                     length:
 *                                       type: number
 *                                       example: 165
 *       400:
 *         description: Cinema not found or bad request
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
 *                   example: Cinema not found with id of 64df12f2bcf5e4df1475a111
 */
exports.getCinema = async (req, res, next) => {
	try {
		const cinema = await Cinema.findById(req.params.id)
			.populate({
				path: 'theaters',
				populate: {
					path: 'showtimes',
					populate: { path: 'movie', select: 'name length' },
					select: 'movie showtime isRelease'
				},
				select: 'number seatPlan showtimes'
			})
			.then((cinemas) => {
				cinemas.forEach((cinema) => {
					cinema.theaters.forEach((theater) => {
						theater.showtimes = theater.showtimes.filter((showtime) => showtime.isRelease)
					})
				})
				return cinemas
			})

		if (!cinema) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				success: false,
				message: `Cinema not found with id of ${req.params.id}`
			});
		}

		res.status(StatusCodes.OK).json({
			success: true,
			data: cinema
		});
	} catch (err) {
		res.status(StatusCodes.BAD_REQUEST).json({
			success: false,
			message: err
		});
	}
}

//@desc     Create cinema
//@route    POST /cinema
//@access   Private
/**
 * @swagger
 * /cinema:
 *   post:
 *     summary: Create a new cinema
 *     tags: [Cinema]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - location
 *             properties:
 *               name:
 *                 type: string
 *                 example: Sathyam Cinemas
 *               location:
 *                 type: string
 *                 example: Chennai
 *     responses:
 *       201:
 *         description: Cinema created successfully
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
 *                       example: 64eaa3c8f66d7745b2b13a2d
 *                     name:
 *                       type: string
 *                       example: Sathyam Cinemas
 *                     location:
 *                       type: string
 *                       example: Chennai
 *                     theaters:
 *                       type: array
 *                       example: []
 *       400:
 *         description: Bad request or validation error
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
 *                   example: "Cinema validation failed: name is required"
 */
exports.createCinema = async (req, res, next) => {
	try {
		const cinema = await Cinema.create(req.body)
		res.status(StatusCodes.CREATED).json({
			success: true,
			data: cinema
		})
	} catch (err) {
		res.status(StatusCodes.BAD_REQUEST).json({
			success: false,
			message: err
		});
	}
}

//@desc     Update cinemas
//@route    PUT /cinema/:id
//@access   Private Admin
/**
 * @swagger
 * /cinema/{id}:
 *   put:
 *     summary: Update a cinema by ID
 *     tags: [Cinema]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the cinema to update
 *         schema:
 *           type: string
 *           example: 64eaa3c8f66d7745b2b13a2d
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Luxe Cinemas
 *               location:
 *                 type: string
 *                 example: Coimbatore
 *     responses:
 *       200:
 *         description: Cinema updated successfully
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
 *                       example: 64eaa3c8f66d7745b2b13a2d
 *                     name:
 *                       type: string
 *                       example: Luxe Cinemas
 *                     location:
 *                       type: string
 *                       example: Coimbatore
 *       400:
 *         description: Cinema not found or validation error
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
 *                   example: Cinema not found with id of 64eaa3c8f66d7745b2b13a2d
 *       401:
 *         description: Unauthorized - missing or invalid token
 */
exports.updateCinema = async (req, res, next) => {
	try {
		const cinema = await Cinema.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true
		})

		if (!cinema) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				success: false,
				message: `Cinema not found with id of ${req.params.id}`
			});
		}
		res.status(StatusCodes.OK).json({
			success: true,
			data: cinema
		});
	} catch (err) {
		res.status(StatusCodes.BAD_REQUEST).json({
			success: false,
			message: err
		})
	}
}

//@desc     Delete single cinema
//@route    DELETE /cinema/:id
//@access   Private Admin
/**
 * @swagger
 * /cinema/{id}:
 *   delete:
 *     summary: Delete a cinema by ID
 *     tags: [Cinema]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the cinema to delete
 *         schema:
 *           type: string
 *           example: 64eaa3c8f66d7745b2b13a2d
 *     responses:
 *       200:
 *         description: Cinema deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Cinema not found or deletion failed
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
 *                   example: Cinema not found with id of 64eaa3c8f66d7745b2b13a2d
 *       401:
 *         description: Unauthorized - missing or invalid token
 */
exports.deleteCinema = async (req, res, next) => {
	try {
		const cinema = await Cinema.findById(req.params.id)

		if (!cinema) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				success: false,
				message: `Cinema not found with id of ${req.params.id}`
			});
		}

		await cinema.deleteOne()

		res.status(StatusCodes.OK).json({
			success: true,
			message: "Cinema Deleted"
		});
	} catch (err) {
		console.log(err)
		res.status(StatusCodes.BAD_REQUEST).json({
			success: false,
			message: err
		});
	}
}


function apple(){
	return 'apple';
}