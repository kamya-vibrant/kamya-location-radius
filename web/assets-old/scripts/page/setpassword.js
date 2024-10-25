
    //test inputs
    document.getElementById("password").value = 'password123';
    document.getElementById("password2").value = 'password123';

    async function setPassword(event){

		event.preventDefault();
		let password = event.target['password'].value;
		let password2 = event.target['password2'].value;
		let confc = getStorageItem('confc');

		if(password==password2){
			password = encodePass(password);
			let parameter = {
			    model: 'user',
		        action: 'update', 
		        update: { 
		        			'password': password
		        		},
		        condition: [
		        	["verification_char", "=", confc]
		        ]

		    };

			try {
			    var response = await sendhttpRequest(parameter);
			    console.log('response');
			    console.log(response);
			    if(response.code==200){
			    	location.href = '/';
			    }else{
			    	
			    }
			} catch(error) {
			    console.log("Error: ", error);
			}      
		}
	}

	
	
