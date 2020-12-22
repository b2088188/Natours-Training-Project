const login = async (email, password) => {
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
    	alert('Logged in successfully');
        window.setTimeout(() => {
          location.assign('/');
        }, 1000)    
	}
	catch({response: {data}}) {
	    alert(data.message);
	}				
}

document.querySelector('.form').addEventListener('submit', e => {
	e.preventDefault();
	const email = document.getElementById('email').value;
	const password = document.getElementById('password').value;
	login(email, password)
})