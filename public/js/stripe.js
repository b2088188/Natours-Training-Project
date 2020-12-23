import {showAlert} from './alerts';
import axios from 'axios';
const stripe = Stripe('pk_test_51I1RsJLbA09BGGD0g1P70qa12Mcf5rKuF7sYm5Qx1D7aWOtHgRFeiIbQpd1uvQbtjxcLyJQpzTdDkV1Im7hvukdm00YzSUZzQL');

export const bookTour = async tourId => {
	try {	      
	// 1) Get Checkout Session from Server
	const session = await axios.get(`/api/v1/bookings/checkout-session/${tourId}`)
	console.log(session);
	// 2) Create checkout form + charge credit card
	await stripe.redirectToCheckout({
		sessionId: session.data.data.session.id
	});
	}
	catch(err) {
	  console.log(err);
	  showAlert('error', err);
	}			
}