import axios from 'axios';
import {showAlert} from './alerts';
export const login = async (email, password) => {
	try {	
	const {data} = await axios({
		method: 'POST',
		url: '/api/v1/users/login',
		data: {
			email,
			password
		}
	})
    if(data.status === 'success'){}
    	showAlert('success', 'Logged in successfully');
        window.setTimeout(() => {
          location.assign('/');
        }, 1500)    
	}
	catch({response: {data}}) {
		showAlert('error', data.message);	    
	}				
}

export const logout = async () => {
	try {
	   const {data} = await axios({
			method: 'GET',
			url: '/api/v1/users/logout'
		});
	  if(data.status === 'success')
	  	location.reload(true);
	}
	catch({response: {data}}) {
	 showAlert('error', 'Error Logout!');
	}		
}