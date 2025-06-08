// import { TicketIcon } from '@heroicons/react/24/solid';
// import axios from 'axios';
// import { useContext, useState } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import Navbar from '../components/Navbar';
// import ShowtimeDetails from '../components/ShowtimeDetails';
// import { AuthContext } from '../context/AuthContext';

// const Purchase = () => {
// 	const navigate = useNavigate();
// 	const { auth } = useContext(AuthContext);
// 	const location = useLocation();
// 	const showtime = location.state.showtime;
// 	const selectedSeats = location.state.selectedSeats || [];
// 	const [isPurchasing, SetIsPurchasing] = useState(false);

// 	const onPurchase = async (data) => {
// 		SetIsPurchasing(true);
// 		try {
// 			const response = await axios.post(
// 				`/showtime/${showtime._id}`,
// 				{ seats: selectedSeats },
// 				{
// 					headers: {
// 						Authorization: `Bearer ${auth.token}`,
// 					},
// 				}
// 			);
// 			// console.log(response.data)
// 			navigate('/cinema');
// 			toast.success('Purchase seats successful!', {
// 				position: 'top-center',
// 				autoClose: 2000,
// 				pauseOnHover: false,
// 			});
// 		} catch (error) {
// 			console.error(error);
// 			toast.error(error.response.data.message || 'Error', {
// 				position: 'top-center',
// 				autoClose: 2000,
// 				pauseOnHover: false,
// 			});
// 		} finally {
// 			SetIsPurchasing(false);
// 		}
// 	};

// 	return (
// 		<div className='flex min-h-screen flex-col gap-4 bg-gradient-to-br from-indigo-900 to-blue-500 pb-8 sm:gap-8'>
// 			<Navbar />
// 			<div className='mx-4 h-fit rounded-lg bg-gradient-to-br from-indigo-200 to-blue-100 p-4 drop-shadow-xl sm:mx-8 sm:p-6'>
// 				<ShowtimeDetails showtime={showtime} />
// 				<div className='flex flex-col justify-between rounded-b-lg bg-gradient-to-br from-indigo-100 to-white text-center text-lg drop-shadow-lg md:flex-row'>
// 					<div className='flex flex-col items-center gap-x-4 px-4 py-2 md:flex-row'>
// 						<p className='font-semibold'>Selected Seats : </p>
// 						<p className='text-start'>{selectedSeats.join(', ')}</p>
// 						{!!selectedSeats.length && (
// 							<p className='whitespace-nowrap'>
// 								({selectedSeats.length} seats)
// 							</p>
// 						)}
// 					</div>
// 					{!!selectedSeats.length && (
// 						<button
// 							onClick={() => onPurchase()}
// 							className='flex items-center justify-center gap-2 rounded-b-lg  bg-gradient-to-br from-indigo-600 to-blue-500 px-4 py-1 font-semibold text-white hover:from-indigo-500 hover:to-blue-500 disabled:from-slate-500 disabled:to-slate-400 md:rounded-none md:rounded-br-lg'
// 							disabled={isPurchasing}
// 						>
// 							{isPurchasing ? (
// 								'Processing...'
// 							) : (
// 								<>
// 									<p>Confirm Purchase</p>
// 									<TicketIcon className='h-7 w-7 text-white' />
// 								</>
// 							)}
// 						</button>
// 					)}
// 				</div>
// 			</div>
// 		</div>
// 	);
// };

// export default Purchase;

import { TicketIcon } from '@heroicons/react/24/solid';
import axios from 'axios';
import { useContext, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import ShowtimeDetails from '../components/ShowtimeDetails';
import Tickets from './Tickets';
import { AuthContext } from '../context/AuthContext';

const Purchase = () => {
	const navigate = useNavigate();
	const { auth } = useContext(AuthContext);
	const location = useLocation();
	const showtime = location.state.showtime;
	const selectedSeats = location.state.selectedSeats || [];
	const [isPurchasing, setIsPurchasing] = useState(false);

	const loadRazorpayScript = () => {
		return new Promise((resolve) => {
			const script = document.createElement('script');
			script.src = 'https://checkout.razorpay.com/v1/checkout.js';
			script.onload = () => resolve(true);
			script.onerror = () => resolve(false);
			document.body.appendChild(script);
		});
	};

	const onPurchase = async () => {
		if (!selectedSeats.length) return;

		setIsPurchasing(true);

		const razorpayLoaded = await loadRazorpayScript();
		if (!razorpayLoaded) {
			toast.error('Razorpay SDK failed to load.');
			setIsPurchasing(false);
			return;
		}

		try {
			// Calculate price per seat or total
			const seatPrice = showtime.ticketPrice || 200; // fallback to 200 if undefined
			const amount = selectedSeats.length * seatPrice;

			// Create Razorpay order
			const { data: order } = await axios.post(
				'http://localhost:8080/create-order',
				{ amount },
				{
					headers: { Authorization: `Bearer ${auth.token}` },
				}
			);

			const options = {
				key: 'rzp_test_sycH67uhy6UEpf',
				amount: order.amount,
				currency: order.currency,
				name: 'Cinema Booking',
				description: `Booking for ${showtime.movieTitle}`,
				order_id: order.id,
				handler: async (response) => {
					try {
						console.log('Booking Seats...');

						await axios.post(
							`http://localhost:8080/showtime/${showtime._id}`,
							{ seats: selectedSeats },
							{
								headers: { Authorization: `Bearer ${auth.token}` },
							}
						);

						// const userId = auth?.user?._id;
						// if (!userId) {
						// 	console.error('User ID is undefined');
						// 	toast.error('User authentication error. Please login again.');
						// 	return;
						// }

						console.log('Sending payment confirmation...', {
							userId,
							showtimeId: showtime._id,
							seats: selectedSeats,
							paymentId: response.razorpay_payment_id,
						});

						const confirmRes = await axios.post(
							'http://localhost:8080/payment/confirm',
							{
								userId,
								showtimeId: showtime._id,
								seats: selectedSeats,
								paymentId: response.razorpay_payment_id,
							},
							{
								headers: { Authorization: `Bearer ${auth.token}` },
							}
						);

						console.log('Payment confirmation response:', confirmRes.data);
						toast.success('Payment successful! Ticket will be sent via email.');
						navigate('/ticket');
					} catch (error) {
						console.error('Error during booking confirmation:', error);
						toast.success('Payment Successful');
						navigate('/ticket');
					}
				},
				prefill: {
					name: auth.user?.name || 'Deepak',
					email: auth.user?.email || 'Deepak@example.com',
					contact: '8270438442',
				},
				theme: {
					color: '#6366f1',
				},
			};

			const rzp = new window.Razorpay(options);
			rzp.open();
		} catch (err) {
			console.error(err);
			toast.error(err.response?.data?.message || 'Payment failed');
		} finally {
			setIsPurchasing(false);
		}
	};

	return (
		<div className='flex min-h-screen flex-col gap-4 bg-gradient-to-br from-indigo-900 to-blue-500 pb-8 sm:gap-8'>
			<Navbar />
			<div className='mx-4 h-fit rounded-lg bg-gradient-to-br from-indigo-200 to-blue-100 p-4 drop-shadow-xl sm:mx-8 sm:p-6'>
				<ShowtimeDetails showtime={showtime} />
				<div className='flex flex-col justify-between rounded-b-lg bg-gradient-to-br from-indigo-100 to-white text-center text-lg drop-shadow-lg md:flex-row'>
					<div className='flex flex-col items-center gap-x-4 px-4 py-2 md:flex-row'>
						<p className='font-semibold'>Selected Seats : </p>
						<p className='text-start'>{selectedSeats.join(', ')}</p>
						{!!selectedSeats.length && (
							<p className='whitespace-nowrap'>
								({selectedSeats.length} seats)
							</p>
						)}
					</div>
					{!!selectedSeats.length && (
						<button
							onClick={onPurchase}
							className='flex items-center justify-center gap-2 rounded-b-lg  bg-gradient-to-br from-indigo-600 to-blue-500 px-4 py-1 font-semibold text-white hover:from-indigo-500 hover:to-blue-500 disabled:from-slate-500 disabled:to-slate-400 md:rounded-none md:rounded-br-lg'
							disabled={isPurchasing}
						>
							{isPurchasing ? (
								'Processing...'
							) : (
								<>
									<p>Confirm Purchase</p>
									<TicketIcon className='h-7 w-7 text-white' />
								</>
							)}
						</button>
					)}
				</div>
			</div>
		</div>
	);
};

export default Purchase;
