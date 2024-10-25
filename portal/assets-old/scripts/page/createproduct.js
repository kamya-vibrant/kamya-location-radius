console.log('tesssst');	

document.getElementById('input-file').files[0];
document.getElementById('description').value;
$('#product_name').val();
$('#price').val();
$('#status').val();
$('#sb_id').val();
$('#unit_productname').val();
$('#unit_description').val();
$('#unit').val();
$('#unit_price').val();
$('#unit_status').val();
 document.getElementById('unitImg').files[0];
 



	async function createPantry(event){

		 const checkboxes = document.querySelectorAll('input[name="allergy"]:checked');
		  const selected_alergens = [];

				    checkboxes.forEach((checkbox) => {
				        selected_alergens.push(checkbox.value);
				    });

    event.preventDefault();



	    	
		let description = event.target['description'].value;
		let product_name = event.target['product_name'].value;
		let price = event.target['price'].value;
		let status = event.target['status'].value;
		let sb_id = event.target['sb_id'].value;
		let img  = event.target['input-file'].files[0];


	// CONDITION HERE

	 if (!product_name || !description || !img || !price){

	 		 alert('please fill out the form');
	 		  event.preventDefault();
	 		  return;
	 		}

			else if (isNaN(price)){

			 		 alert('please put valid characters');
			 		  event.preventDefault();
			 		   return;

			 } else {


				let parameter = {
						    model: 'pantry',
					        action: 'insert', 
			        insert: {
		        			'img': img.name, 
		        			'product_name': product_name, 
		        			'description': description, 
		        			'price': price,
		        			'status': status,
		        			'sb_id': sb_id,
		        			'allergen': selected_alergens,	        		
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

	}


	document.getElementById('status').addEventListener('change', function() {

		    if (this.checked) {
		          document.getElementById('status').value = '1';
		    } else {
		       document.getElementById('status').value = '0';
		    }
		});


// dietaries

	 	// document.getElementById('halal').addEventListener('click', function() {
	    //         var inputValue = document.getElementById('dietaries').value = '1';
	    //     });

	 	// document.getElementById('pescaterian').addEventListener('click', function() {
	    //         var inputValue = document.getElementById('dietaries').value = '2';
	    //     });

	 	// document.getElementById('vegan').addEventListener('click', function() {
	    //         var inputValue = document.getElementById('dietaries').value = '3';
	            
	    //     });

	 	// document.getElementById('vegetarian').addEventListener('click', function() {
	    //          document.getElementById('dietaries').value = '4';

        // });

// unit

document.getElementById('unit_status').addEventListener('change', function() {

	    if (this.checked) {
	          document.getElementById('unit_status').value = '1';
	    } else {
	       document.getElementById('unit_status').value = '0';
	    }
	});




	async function createUnit(event){
		  		
		    event.preventDefault();

				let file = event.target['unitImg'].files[0];
				let filex = [];
		    	let unit_productname =$('#unit_productname').val();	
		    	// let img_a  = [img_b.name,img_b.size,img_b.type];
		    	let unit = $('#unit').val();
		    	let unit_description = $('#unit_description').val();
		    	let unit_price=  $('#unit_price').val();
		    	let unit_status =  $('#unit_status').val();
		    	
		       

		        if(!file || !product_name ||!unit ||!unit_description ||!unit_price ||!unit_status)  {

		        	alert('please Fill up the form');

		        	return;

		        	 
		        }else  if  (isNaN(unit_price)){

			 		 alert('please put valid characters');
			 		 
			 		   return;


		        }else {


		        	filex = [file.name,file.size,file.type];

		        }


		        	// let filex = [file.name,file.size,file.type];
				
					let parameter = {
						    model: 'input',
					        action: 'insert', 
					        insert: { 	 	
					        			'img':filex,
					        			'product':unit_productname,
					        			'unit':unit,
					        			'description':unit_description,
					        			'price':unit_price,
					        			'status':unit_status,
										
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


 async  function deleteEvent(event){

 		document.getElementById('unit-form').reset();
 		return;
 }


//  document.getElementById('unitImg').addEventListener('change', function(event) {
//             let file = event.target.files[0];
//             if (file) {
//                 console.log('File Name: ', file.name);
//                 console.log('File Size: ', file.size);
//                 console.log('File Type: ', file.type);
//             } else {
//                 console.log('No file selected');
//             }
//         });




 function getSelectedAllergies() {
    // Get all checkboxes
    const checkboxes = document.querySelectorAll('input[name="allergy"]:checked');


    // Create an array to store selected values
    const selectedAllergies = [];
    
    // Iterate over each checked checkbox and push its value to the array
    checkboxes.forEach((checkbox) => {
        selectedAllergies.push(checkbox.value);
    });
    
    // Display selected allergies
    displaySelectedAllergies(selectedAllergies);
}

function displaySelectedAllergies(allergies) {
    // Get the element to display the selected allergies
    const list = document.getElementById('selectedAllergiesList');
    
    // Clear previous list items
    list.innerHTML = '';
    
    // Create list items for each selected allergy
    allergies.forEach((allergy) => {
        const listItem = document.createElement('li');
        listItem.textContent = allergy;
        list.appendChild(listItem);
    });
}

    	
	