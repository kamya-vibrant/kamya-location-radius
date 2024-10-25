
console.log('test1');

	document.getElementById('sb_id').value;
 	document.getElementById('product_name').value;
 	document.getElementById('description').value;
 	 document.getElementById('item_min').value;
 	document.getElementById('price').value;
 	document.getElementById('menu_serving').value;
 	document.getElementById('menu_price_percent').value;
 	document.getElementById('is_customizable').value;
 	document.getElementById('is_last_min_order').value;
 	document.getElementById('status').value;

 	// var name = $('#product_name').val();
 	// var regex = /^[A-Za-z\s]+$/;




    async function registerSupplier(event){

	event.preventDefault();

	let sb_id = event.target['sb_id'].value;
	let menu_heading = event.target['product_name'].value;
	let description = event.target['description'].value;
	let item_min = event.target['item_min'].value;
	let price = event.target['price'].value;
	let menu_serving = event.target['menu_serving'].value;
	let menu_price_percent = event.target['menu_price_percent'].value;
	let is_customizable = event.target['is_customizable'].value;
	let is_last_min_order = event.target['is_last_min_order'].value;

		
	//put your validations here

	var price_name = $('#price').val();
 	var regex = /^[A-Za-z\s]+$/;

			// if (regex.test(price_name) && (regex.test(menus)
				if (regex.test(price_name) || regex.test(item_min) || regex.test(menu_serving) || regex.test(menu_price_percent)){
				alert('please put valid characters');
	       		event.preventDefault(); // Prevent form submission

	      } 
	      else 

	      {
	
			let parameter = {
				    model: 'supplier',
			        action: 'register', 
			        insert: { 
			        			'sb_id': sb_id,
			        			'menu_heading': menu_heading,
			        			'description': description, 
			        			'price': price,
			        			'item_min': item_min,
			        			'menu_serving': menu_serving,
			        			'menu_price_percent': menu_price_percent,
			        			'is_customizable': is_customizable,
			        			'is_last_min_order': is_last_min_order,
			        			'status': status,
			        		}
			    };

			try {
				console.log('description'+'='+description);
				console.log('product_name'+'='+menu_heading);
				console.log('price'+'='+price);
				console.log('sb_id'+'='+sb_id);
				console.log('item_min'+'='+item_min);
				console.log('menu_serving'+'='+menu_serving);
				console.log('menu_price_percent'+'='+menu_price_percent);
				console.log('is_customizable'+'='+is_customizable);
				console.log('is_last_min_order'+'='+is_last_min_order);
				console.log('status'+'='+status	);
			    var response = await sendhttpRequest(parameter);
			    console.log('response');
			    console.log(response);
			} catch(error) {
			    console.log("Error: ", error);
			}  

		 }


		}

		async function functionStatus(event){

			if (status == 1) {
			 document.getElementById("status").value = "10";
			}
}