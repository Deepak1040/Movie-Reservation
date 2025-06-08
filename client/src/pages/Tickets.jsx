// import axios from 'axios';
// import { useContext, useEffect, useState } from 'react';
// import Loading from '../components/Loading';
// import Navbar from '../components/Navbar';
// import ShowtimeDetails from '../components/ShowtimeDetails';
// import { AuthContext } from '../context/AuthContext';

// const Tickets = () => {
// 	const { auth } = useContext(AuthContext);
// 	const [tickets, setTickets] = useState([]);
// 	const [isFetchingticketsDone, setIsFetchingticketsDone] = useState(false);
// 	const fetchTickets = async () => {
// 		try {
// 			setIsFetchingticketsDone(false);
// 			const response = await axios.get('/auth/tickets', {
// 				headers: {
// 					Authorization: `Bearer ${auth.token}`,
// 				},
// 			});
// 			setTickets(
// 				response.data.data.tickets?.sort((a, b) => {
// 					if (a.showtime.showtime > b.showtime.showtime) {
// 						return 1;
// 					}
// 					return -1;
// 				})
// 			);
// 		} catch (error) {
// 			console.error(error);
// 		} finally {
// 			setIsFetchingticketsDone(true);
// 		}
// 	};

// 	useEffect(() => {
// 		fetchTickets();
// 	}, []);

// 	return (
// 		<div className='flex min-h-screen flex-col gap-4 bg-gradient-to-br from-indigo-900 to-blue-500 pb-8 text-gray-900 sm:gap-8'>
// 			<Navbar />
// 			<div className='mx-4 flex h-fit flex-col gap-4 rounded-md bg-gradient-to-br from-indigo-200 to-blue-100 p-4 drop-shadow-xl sm:mx-8 sm:p-6'>
// 				<h2 className='text-3xl font-bold text-gray-900'>My Tickets</h2>
// 				{isFetchingticketsDone ? (
// 					<>
// 						{tickets.length === 0 ? (
// 							<p className='text-center'>
// 								You have not purchased any tickets yet
// 							</p>
// 						) : (
// 							<div className='grid grid-cols-1 gap-4 xl:grid-cols-2 min-[1920px]:grid-cols-3'>
// 								{tickets.map((ticket, index) => {
// 									return (
// 										<div
// 											className='flex flex-col'
// 											key={index}
// 										>
// 											<ShowtimeDetails showtime={ticket.showtime} />
// 											<div className='flex h-full flex-col justify-between rounded-b-lg bg-gradient-to-br from-indigo-100 to-white text-center text-lg drop-shadow-lg md:flex-row'>
// 												<div className='flex h-full flex-col items-center gap-x-4 px-4 py-2 md:flex-row'>
// 													<p className='whitespace-nowrap font-semibold'>
// 														Seats :{' '}
// 													</p>
// 													<p className='text-left'>
// 														{ticket.seats
// 															.map((seat) => seat.row + seat.number)
// 															.join(', ')}
// 													</p>
// 													<p className='whitespace-nowrap'>
// 														({ticket.seats.length} seats)
// 													</p>
// 												</div>
// 											</div>
// 										</div>
// 									);
// 								})}
// 							</div>
// 						)}
// 					</>
// 				) : (
// 					<Loading />
// 				)}
// 			</div>
// 		</div>
// 	);
// };

// export default Tickets;

import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import Loading from '../components/Loading';
import Navbar from '../components/Navbar';
import ShowtimeDetails from '../components/ShowtimeDetails';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Tickets = () => {
	const { auth } = useContext(AuthContext);
	const [tickets, setTickets] = useState([]);
	const [isFetchingticketsDone, setIsFetchingticketsDone] = useState(false);

	const fetchTickets = async () => {
		try {
			setIsFetchingticketsDone(false);
			const response = await axios.get('/auth/tickets', {
				headers: {
					Authorization: `Bearer ${auth.token}`,
				},
			});
			setTickets(
				response.data.data.tickets?.sort((a, b) => {
					if (a.showtime.showtime > b.showtime.showtime) {
						return 1;
					}
					return -1;
				})
			);
		} catch (error) {
			console.error(error);
		} finally {
			setIsFetchingticketsDone(true);
		}
	};

	useEffect(() => {
		fetchTickets();
	}, []);

	const handleResendTicket = async (ticket) => {
		const parseJwt = (token) => {
			try {
				const base64Url = token.split('.')[1];
				const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
				const jsonPayload = decodeURIComponent(
					atob(base64)
						.split('')
						.map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
						.join('')
				);
				return JSON.parse(jsonPayload);
			} catch (error) {
				console.error('Failed to decode token:', error);
				return null;
			}
		};

		try {
			if (!auth?.token) {
				toast.error('User not authenticated');
				return;
			}

			const decodedToken = parseJwt(auth.token);
			const userId = decodedToken?.id || decodedToken?._id;

			if (!userId) {
				toast.error('Unable to identify user from token');
				return;
			}

			const showtime = ticket?.showtime;
			if (!showtime?._id) {
				toast.error('Showtime information is missing');
				return;
			}

			const seatList = ticket?.seats?.map((seat) => seat.row + seat.number);
			if (!seatList || seatList.length === 0) {
				toast.error('No seats found for this ticket');
				return;
			}

			const payload = {
				userId,
				showtimeId: showtime._id,
				seats: seatList,
				paymentId: 'RESEND_TICKET_' + Date.now(),
			};

			const res = await axios.post(
				'http://localhost:8080/ticket/resend',
				payload,
				{
					headers: {
						Authorization: `Bearer ${auth.token}`,
					},
				}
			);

			console.log('✅ Ticket resent successfully:', res.data);
			toast.success('Ticket sent to your email!');
		} catch (err) {
			console.error('❌ Resend failed:', err);
			toast.error(err.message || 'Failed to send ticket.');
		}
	};

	return (
		<div className='flex min-h-screen flex-col gap-4 bg-gradient-to-br from-indigo-900 to-blue-500 pb-8 text-gray-900 sm:gap-8'>
			<Navbar />
			<div className='mx-4 flex h-fit flex-col gap-4 rounded-md bg-gradient-to-br from-indigo-200 to-blue-100 p-4 drop-shadow-xl sm:mx-8 sm:p-6'>
				<h2 className='text-3xl font-bold text-gray-900'>My Tickets</h2>
				{isFetchingticketsDone ? (
					<>
						{tickets.length === 0 ? (
							<p className='text-center'>
								You have not purchased any tickets yet
							</p>
						) : (
							<div className='grid grid-cols-1 gap-4 xl:grid-cols-2 min-[1920px]:grid-cols-3'>
								{tickets.map((ticket, index) => (
									<div
										className='flex flex-col'
										key={index}
									>
										<ShowtimeDetails showtime={ticket.showtime} />
										<div className='flex h-full flex-col justify-between rounded-b-lg bg-gradient-to-br from-indigo-100 to-white text-center text-lg drop-shadow-lg md:flex-row'>
											<div className='flex h-full flex-col items-center gap-x-4 px-4 py-2 md:flex-row'>
												<p className='whitespace-nowrap font-semibold'>
													Seats:
												</p>
												<p className='text-left'>
													{ticket.seats
														.map((seat) => seat.row + seat.number)
														.join(', ')}
												</p>
												<p className='whitespace-nowrap'>
													({ticket.seats.length} seats)
												</p>
												{ticket.showtime && (
													<button
														onClick={() => handleResendTicket(ticket)}
														className='ml-4 mt-2 rounded bg-indigo-600 px-3 py-1 text-white hover:bg-indigo-700'
													>
														Send to Email
													</button>
												)}
											</div>
										</div>
									</div>
								))}
							</div>
						)}
					</>
				) : (
					<Loading />
				)}
			</div>
		</div>
	);
};

export default Tickets;
