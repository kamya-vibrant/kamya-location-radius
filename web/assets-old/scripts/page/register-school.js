
    //test inputs
    document.getElementById("name").value = 'MCV SCHOOL TEST';
    document.getElementById("school_number").value = '(02) 9240 5918';
    document.getElementById("school_address").value = '201 Jones Road, Mount Ommaney, Queensland, Australia, 4074';
    document.getElementById("first_name").value = 'Mckaela';
    document.getElementById("last_name").value = 'Cassandra';
    document.getElementById("email").value = 'mmm123school@yopmail.com';
    document.getElementById("organiser_number").value = '(02) 9240 5919';
    document.getElementById("organiser_address").value = '202 Jones Road, Mount Ommaney, Queensland, Australia, 4074';

    async function registerOrganiser(event){

	event.preventDefault();
	let name = event.target['name'].value;
	let school_number = event.target['school_number'].value;
	let school_address = event.target['school_address'].value;
	let first_name = event.target['first_name'].value;
	let last_name = event.target['last_name'].value;
	let email = event.target['email'].value;
	let organiser_number = event.target['organiser_number'].value;
	let organiser_address = event.target['organiser_address'].value;

	//put your validations here
	
	let parameter = {
		    model: 'organiser',
	        action: 'register', 
	        insert: { 
	        			'name': name, 
	        			'school_number': school_number, 
	        			'school_address': school_address, 
	        			'first_name': first_name, 
	        			'last_name': last_name, 
	        			'email': email, 
	        			'organiser_number': organiser_number, 
	        			'organiser_address': organiser_address
	        		}
	    };

	try {
	    var response = await sendhttpRequest(parameter);
	    console.log('response');
	    console.log(response);
	} catch(error) {
	    console.log("Error: ", error);
	}      
}
