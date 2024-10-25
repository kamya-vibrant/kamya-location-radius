
    //test inputs
    document.getElementById("entity_name").value = 'MCV TEST SUPPLIER';
    document.getElementById("first_name").value = 'Matthew';
    document.getElementById("last_name").value = 'Maverick';
    document.getElementById("email").value = 'mmm123@yopmail.com';
    document.getElementById("phone").value = '(02) 9240 5917';
    document.getElementById("postal_address").value = '20 Jones Road, Mount Ommaney, Queensland, Australia, 4074';
    document.getElementById("acn").value = '123456789';
    document.getElementById("abn").value = '123456789';



    async function registerSupplier(event){
    	alert(2);
	event.preventDefault();
	let first_name = event.target['first_name'].value;
	let last_name = event.target['last_name'].value;
	let email = event.target['email'].value;
	let phone = event.target['phone'].value;
	let entity_name = event.target['entity_name'].value;
	let postal_address = event.target['postal_address'].value;
	let abn = event.target['abn'].value;
	let acn = event.target['acn'].value;
	
	let parameter = {
		    model: 'supplier',
	        action: 'register',
	        insert: { 
	        			'first_name': first_name, 
	        			'last_name': last_name, 
	        			'email': email, 
	        			'phone': phone, 
	        			'entity_name': entity_name, 
	        			'postal_address': postal_address, 
	        			'abn': abn, 
	        			'acn': acn
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
