
const createdUnit = [];
let createdUnits;

const selectedAllergen = [];
let selectedAllergens;

const selectedDietary = [];
let selectedDietaries;

let imageParts;

Supplier_=JSON.parse(localStorage.supplier);

function CreateTextFile(val,filename) {
    var ts; 
    var fso = new ActiveXObject("Scripting.FileSystemObject");
    var savefilepath = "saveFile.json"
    var savefile = fso.GetFile(savefilepath);

    // open for writing only, value 2, overwriting the previous
    // contents of the file
    ts = savefile.OpenAsTextStream(2);

    var myTestJson = {"id1" : "one", "id2" : "two"};

    // copy to json
    ts.WriteLine(myTestJson);

    ts.Close;
}

selectImage = async (e) => {
	let image = $(e).data("image");
	let textarea = $("#textarea_"+$(e).data("image"));

	if (e.files && e.files[0]) {
    var reader = new FileReader();
    reader.onload = function (d) {
    	textarea.text(d.target.result);
      //document.getElementById('crop').click();
      initCropper(image, textarea.text());
    };

    reader.readAsDataURL(e.files[0]);
  }

}

initCropper = async (image, image_val) => {

	//image = if this for main product or for unit
	//image_val = this is the base64 value if the image selected

	let cropper;
	let image_style;

	$('#crop_popup').on('shown.bs.modal', function(){
    const cropOptions = {
      image: image_val,
      imgFormat: '200x200', // Formats: 3/2, 200x360, auto
      // circleCrop: true,
      zoomable: true
    }

    // Initiate cropper
    cropper = $('#crop_popup .modal-body').cropimage( cropOptions )

    setTimeout( () => {console.log('set-image'); cropper.setImage( image_val )}, 1000 )
  })
  .modal();

  $("#crop_popup .crop-it").on("click", (e) => {
  	const blobDataURL = cropper.getImage('PNG'); // JPEG, PNG, ...
  	
  	switch(image) {

  		case "product":
  			image_style = "margin-left:-95%;";
  			break;

  		case "unit":
  			image_style = "margin-left:-150%;";
  			break;

	  	default:
	  		image_style = "visibility:visible;";
	  		break;
  	}

  	$("."+image+"_image").attr({
  		"src": blobDataURL,
  		"style": "visibility:visible;"+image_style
  	});

  	$(".form-field-image-overlay-"+image).attr({
  		"style":"background-color: unset;"
  	});

  	// base64Parts = splitBase64String(blobDataURL, 3000);
  	// uploadImageSequentially('pantry', 1, base64Parts, 0, 1);

  	//start clearing cropper image
  	cropper = null; // always clear the cropper after cropping image. cropimage.js has no destroy() function so we need to do it manually
  	image = ""; // clear the data-image value so it won't mess up the other image holders
  	image_style = "";

  	setTimeout(()=>{
  		$("#crop_popup").modal('hide');
  	},350);

  });

}

async function createProduct(event){

	event.preventDefault();

	let product_name = event.target['product_name'].value;
	let description = event.target['description'].value;
	let sb_id = Supplier_[0]['id']; //this is is from supplier table
	let price = event.target['price'].value;
	let product_status = event.target['product_status'].value;
	let product_image = $('.product_image').attr("src");
	let productImage;
	let ArrImage;
	let imageLength;
	let base64Parts;

	//start trimming down base64 image src if an image is selected
	if (product_image.length > 0) {

		base64Parts = splitBase64String(product_image, 3000);
		productImage = base64Parts[0];

	} else {
		productImage = '';
	}

	console.log(productImage);

  let parameter = {
						    		model: 'pantry',
					        	action: 'insert',
					        	insert: { 
					        			'sb_id': sb_id, 
					        			'name': product_name, 
					        			'description': description, 
					        			'price': price,
					        			'image': productImage, 
					        			'status': product_status, // product status 
					        	}
					   			};

	try {
	  		var response = await sendhttpRequest(parameter);
	    	
	    	//continue to upload/update the base64 image to DB
	    	if (response['code'] == 200) {
	    		// if an image is selected, continue the update/upload
	    		if (productImage.length > 0) {
	    			uploadImageSequentially('unit', response['id'], base64Parts, 1, 'image');
		    	}

		    	//now check for the selected allergens and add it into allergens_assoc table together with the new id of created product
		    	if (selectedAllergen.length !== 0) {
		    		for (var j = 0; j < selectedAllergens.length; j++) {
		    			insertPantryDetails('allergens_assoc', 'aid', response['id'], selectedAllergens[j]);
		    		}
		    	}

		    	//now check for the selected allergens and add it into allergens_assoc table together with the new id of created product
		    	if (selectedDietary.length !== 0) {
		    		for (var k = 0; k < selectedDietaries.length; k++) {
		    			insertPantryDetails('dietary_assoc', 'did', response['id'], selectedDietaries[k]);
		    		}
		    	}

		    	//update the created unit with pantry id
		    	if (createdUnit.length !== 0) {
		    		for (var l = 0; l < createdUnits.length; l++) {
		    			updateUnits(response['id'], createdUnits[l]);
		    		}
		    	}

		    	// setTimeout(()=>{
		    	// 	window.location = "/pantry";
		    	// }, 1000);

	    	}

	  	} catch(error) {
        console.log("Error: ", error);
    	}
}

createUnit = async (event) => {

	let unit_name = event.target['unit_name'].value;
	let unit = event.target['unit'].value;
	let unit_description = event.target['unit_description'].value;
	let unit_price = event.target['unit_price'].value;
	let unit_status = event.target['unit_status'].value;
	let unit_image = $(".unit_image").attr("src");
	let unitImage;
	let ArrImage;
	let imageLength;
	let base64Parts;

	//start trimming down base64 image src if an image is selected
	if (unit_image.length > 0) {

		base64Parts = splitBase64String(unit_image, 3000);
		unitImage = base64Parts[0];

	} else {
		unitImage = '';
	}
	
	const unit_table = $('.unit_table');

	let parameter = {
						    		model: 'pantry',
					        	action: 'insert_unit',
					        	insert: { 
					        			'pid': 0, // for initital insertion. will update once product is successfuly created 
					        			'name': unit_name, 
					        			'unit': unit, 
					        			'description': unit_description,
					        			'price': unit_price,
					        			'image': unitImage,
					        			'status': unit_status, // product status 
					        	}
					   			};

	try {
	  		var response = await sendhttpRequest(parameter);
	    	
	    	if (response['code'] == 200) {

	    		//append added unit into unit table
		    	let unit_table_td = `<tr class="added-unit-${response['id']}"> \
	                              <td> \
	                                  <div class="img-container"> \
	                                  	<img class="unit_item_${response['id']}_image" src=${unit_image}> \
	                                  </div> \
	                                  <input type="file" class="form-field-image-input unit-${response['id']}" data-image="unit_item_${response['id']}" onchange="selectImage(this); return false;" style="visibility: hidden;width: 0;" /> \
                                    <textarea id="textarea_unit_item_${response['id']}" style="display:none">${unit_image}</textarea> \
                                    <button type="button" data-btn="select-image" class="btn default form-image-btn" data-image="unit" onclick="$('.unit-${response['id']}').click(); return false;" style="font-size: 11px; display: none;">Select Image</button> \
	                              </td> \
	                              <td class="bold"> \
	                              	<span class="form-value form-unit-name-${response['id']}">${response.data['name']}</span> \
	                              	<input class="form-hidden form-field-input" type="text" name="name_${response['id']}" value="${response.data['name']}" />
	                              </td> \
	                              <td class="bold"> \
	                              	<span class="form-value form-unit-unit-${response['id']}">${response.data['unit']}</span> \
	                              	<input class="form-hidden form-field-input" type="text" name="unit_${response['id']}" value="${response.data['unit']}" />
	                              </td> \
	                              <td class="bold"> \
	                              	<span class="form-value form-unit-description-${response['id']}">${response.data['description']}</span> \
	                              	<input class="form-hidden form-field-input" type="text" name="description_${response['id']}" value="${response.data['description']}" />
	                              </td> \
	                              <td class="bold"> \
	                              	<span class="form-value form-unit-price-${response['id']}">$${parseFloat(response.data['price']).toFixed(2)}</span> \
	                              	<input class="form-hidden form-field-input" type="text" name="price_${response['id']}" value="${parseFloat(response.data['price']).toFixed(2)}" />
	                              </td> \
	                              <td> \
	                              	<label class="switch"> \
	                                  <input type="checkbox" ${(response.data['status'] == 1 ? "checked" : "")}> \
	                                  <span class="slider round"></span> \
	                                </label> \
	                             	</td> \
	                              <td> \
	                                <div class="button-group x-center"> \
	                                    <button type="button" class="btn default form-edit-btn" data-uid="${response['id']}" onclick="initEditCreatedUnit(this); return false;"><i class="bi bi-pencil-fill"></i></button> \
	                                    <button type="button" class="btn red form-delete-btn" data-uid="${response['id']}" onclick="removeCreatedUnit(this); return false;"><i class="bi bi-trash"></i></button> \
	                                    <button type="button" class="btn default form-save-btn" data-uid="${response['id']}" onclick="saveUnit(this); return false;" style="display: none;"><i class="bi bi-check"></i></button> \
	                                    <button type="button" class="btn red form-cancel-btn" data-uid="${response['id']}" onclick="cancelEditUnit(this); return false;" style="display: none;"><i class="bi bi-x-circle"></i></button> \
	                                </div> \
	                              </td> \
	                          </tr>`;
		    	unit_table.append(unit_table_td);

		    	//add created unit into array
		    	createdUnit.push(response['id']);
					createdUnits = createdUnit;

		    	//continue to upload/update the base64 image to DB if an image is selected.
		    	if (unit_image.length > 0) {
	    			uploadImageSequentially('unit', response['id'], base64Parts, 1, 'image');
		    	}

		    	console.log(createdUnits);
	    	}

	  	} catch(error) {
        console.log("Error: ", error);
    	}
}

initEditCreatedUnit = async (e) => {

	// add edit class
	$(".added-unit-"+$(e).data('uid')).addClass(" edit");

	//hide show input fields
	$(".added-unit-"+$(e).data('uid')+" .form-value").hide();
	$(".added-unit-"+$(e).data('uid')+" .form-hidden").show();

	//hide show buttons
	$(".added-unit-"+$(e).data('uid')+" .form-edit-btn").hide();
	$(".added-unit-"+$(e).data('uid')+" .form-delete-btn").hide();

	$(".added-unit-"+$(e).data('uid')+" .form-image-btn").show();
	$(".added-unit-"+$(e).data('uid')+" .form-save-btn").show();
	$(".added-unit-"+$(e).data('uid')+" .form-cancel-btn").show();

}

saveUnit = async (e) => {

	let unit_name = $("input[name=name_"+$(e).data('uid')+"]").val();
	let unit_unit = $("input[name=unit_"+$(e).data('uid')+"]").val();
	let unit_description = $("input[name=description_"+$(e).data('uid')+"]").val();
	let unit_price = $("input[name=price_"+$(e).data('uid')+"]").val();

	let unit_image = $(".unit_item_"+$(e).data('uid')+"_image").attr("src");
	let unitImage;
	let ArrImage;
	let imageLength;

	//start trimming down base64 image src if an image is selected
	if (unit_image.length > 0) {
		ArrImage = unit_image.match(/.{1,3000}/g);
		imageLength = ArrImage.length;

		unitImage = ArrImage[0];
	} else {
		unitImage = '';
	}

	let parameter = {
				model: 'pantry',
				action: 'save_unit',
				fields: {
					'name': unit_name,
					'unit': unit_unit,
					'description': unit_description,
					'price': unit_price,
					'image': unitImage,
				},
				condition: [
					['id', '=', $(e).data('uid')]
				]
	};

	console.log(parameter);
	try {
  	var response  =  await sendhttpRequest(parameter);
  	console.log(response);

  	if (response['code'] == 200) {
  		$('.form-unit-name-'+$(e).data('uid')).text(unit_name);
  		$('.form-unit-unit-'+$(e).data('uid')).text(unit_unit);
  		$('.form-unit-description-'+$(e).data('uid')).text(unit_description);
  		$('.form-unit-price-'+$(e).data('uid')).text("$"+parseFloat(unit_price).toFixed(2));

  		//hide show input fields
			$(".added-unit-"+$(e).data('uid')+" .form-value").show();
			$(".added-unit-"+$(e).data('uid')+" .form-hidden").hide();

			//hide show buttons
			$(".added-unit-"+$(e).data('uid')+" .form-edit-btn").show();
			$(".added-unit-"+$(e).data('uid')+" .form-delete-btn").show();

			$(".added-unit-"+$(e).data('uid')+" .form-image-btn").hide();
			$(".added-unit-"+$(e).data('uid')+" .form-save-btn").hide();
			$(".added-unit-"+$(e).data('uid')+" .form-cancel-btn").hide();

			//continue to upload/update the base64 image to DB if an image is selected.
    	if (unit_image.length > 0) {
    		for (var i = 1; i < ArrImage.length; i++) {
    			slice = ArrImage[i];
    			sendslice('unit', $(e).data('uid'), slice, 'image');
    		}
    	}
  	}
  	//$(".added-unit-"+$(e).data('uid')).remove();

  } catch(error) {
      console.log("Error: ", error);
  } 

}

cancelEditUnit = async (e) => {

	// remove edit class
	$(".added-unit-"+$(e).data('uid')).removeClass(" edit");

	//hide show input fields
	$(".added-unit-"+$(e).data('uid')+" .form-value").show();
	$(".added-unit-"+$(e).data('uid')+" .form-hidden").hide();

	//hide show buttons
	$(".added-unit-"+$(e).data('uid')+" .form-edit-btn").show();
	$(".added-unit-"+$(e).data('uid')+" .form-delete-btn").show();

	$(".added-unit-"+$(e).data('uid')+" .form-image-btn").hide();
	$(".added-unit-"+$(e).data('uid')+" .form-save-btn").hide();
	$(".added-unit-"+$(e).data('uid')+" .form-cancel-btn").hide();

}

removeCreatedUnit = async (e) => {
	
	if (confirm('Are you sure you want to remove this unit? This action can\'t be undone.')) {

		let parameter = {
		  model: 'pantry',
	    action: 'remove_unit',
	    condition: [
		        	["id", "=", $(e).data('uid')]
		        ]
	    };

		try {
		    	var response  =  await sendhttpRequest(parameter);
		    	console.log(response);

		    	$(".added-unit-"+$(e).data('uid')).remove();

		    } catch(error) {
		        console.log("Error: ", error);
		    } 

	}

}

insertPantryDetails = async (table, id, pid, detail_id) => {
	/**
	 * NOTE: this function is both for allergens and dietaries
	 * params:
	 * table = table of assoc to be inserted
	 * pid = id of pantry/product that has been created
	 * detail_id = id of selected allergen or dietary from the form
	 * 
	 * **/

	let parameter = {
		model: 'pantry',
		table: table,
		action: 'insert_pantry_details',
		field: {
			'pid': pid, 
			'tid' : detail_id
		}
	}

	console.log(parameter);

	try {
	  		var response = await sendhttpRequest(parameter);
	  		console.log(response);

	  	} catch(error) {
        console.log("Error: ", error);
    	}
}

updateUnits = async (pid, uid) => {

	let parameter = {
		model: 'pantry',
		action: 'update_unit',
		update: {
			'pid': pid,
			'uid': uid
		}
	}

	try {
  		var response = await sendhttpRequest(parameter);
  		console.log(response);

  	} catch(error) {
      console.log("Error: ", error);
  	}

}

setStatus = async (e) => {
	if ($(e).is(":checked")) {
		console.log(1);
		$("input[name="+$(e).data("label")+"]").val(1);
	} else{
		$("input[name="+$(e).data("label")+"]").val(0);
	}
}

// selecting of allergens and dietaries

selectProductDetails = async (e) => {
	let icon = "";
	let id = $(e).data("id");
	let icon_link = $(e).data("icon-link");
	let name = $(e).data("name");
	let info = $(e).data("info");

	if ($(e).hasClass("active")) {
		//remove active state to selected allergen or dietary
		$(e).removeClass(" active");
		
		//remove icon to the allergen wrapper
		$('.'+info+'-section .'+info+'-'+id).remove();

		if ($(e).data("info") == "allergen") {
			var index = $.inArray(id, selectedAllergen);
			if (index > -1) {
				selectedAllergens = selectedAllergen.splice(index, 1);
			}
		} else {
			var index = $.inArray(id, selectedDeitary);
			if (index > -1) {
				selectedDietaries = selectedDeitary.splice(index, 1);
			}
		}
	
	} else {

		//add active state to selected allergen or dietary
		$(e).addClass(" active");

		// check if selected value is already in array. if value does not exist, push it into array. if already existing, do nothing
		if ($.inArray(id, selectedAllergen) === -1) {
			
			if ($(e).data("info") == "allergen") {
				selectedAllergen.push(id);
				selectedAllergens = selectedAllergen;
			} else {
				selectedDietary.push(id);
				selectedDietaries = selectedDietary;
			}
		}
		
		//add icon to the allergen wrapper
		icon = `<div class="form-field-tags-selected-item ${info}-${id}"> \
		<lord-icon src="${icon_link}" colors="primary:#012928,secondary:#01dc82" trigger="hover" style="width:50px;height:50px"></lord-icon><span>${name}</span> \
		</div>`;

		$('.'+info+'-section').append(icon);
	}
}

// end of allergens and dietaries

// start of images

function splitBase64String(base64String, chunkSize) {
    let parts = [];
    for (let i = 0; i < base64String.length; i += chunkSize) {
        parts.push(base64String.substring(i, i + chunkSize));
    }
    return parts;
}


// splitBase64 = async (img_val, partSize) => {

// 	// Remove the data URL prefix
//   var base64Content = img_val.split(',')[1];

//   // Split the base64 string into parts
//   var parts = [];
//   for (var i = 0; i < base64Content.length; i += partSize) {
//     parts.push(base64Content.substring(i, i + partSize));
//   }

//   imageParts = parts;
// }

uploadBase64Part = async (table, id, part, which) => {
	let parameter = {
		model: 'pantry',
		table: table,
		action: 'upload_image_parts',
		fields: [
			which
		],
		parts: [
			part
		],
		condition: [['id', '=', id]]
	}

	try {
			let response = await sendhttpRequest(parameter)
			if (response['code'] == 200) return true;
		} catch (error) {
			console.log("Error: ", error);
		}

	return false;

}

uploadImageSequentially = async (table, id, parts, part, which) => {

	for (let n = part; n < parts.length; n++) {
		try {
			let response = await uploadBase64Part(table, id, parts[n], which);
			if (response) console.log(`Part ${n} is uploaded for ${id}`);
		} catch (error) {
			console.log("Error: ", error);
		}
	}

}

// async function sendslice(table, id, slice, which){
// 	let parameter2 = {
// 				model: 'pantry',
// 				table: table,
// 				action: 'insertimg',
// 				insert: {  
// 						which: slice
// 				},
// 				fields: [
// 					which
// 				],
// 				condition: [['id', '=', id]]
// 			};

// 	try {
// 				let response = await sendhttpRequest(parameter2);
// 			} catch(error) {
// 				console.log("Error: ", error);
// 			}      
// }

// end of images

/** Old codes
function putlogo(input){
	
	product_display.style.visibility = 'visible';
	if (input.files && input.files[0]) {
    var reader = new FileReader();
    reader.onload = function (e) {
    	//textarealogo.textContent = e.target.result;
 			//document.getElementById('crop').click();
    };

    reader.readAsDataURL(input.files[0]);
    imgval = 'logo';
    img_logo.style.visibility = 'visible';

    
  	if(bannerdisplay == false){
  		// img_logo.style.marginTop = "-150px";
  		// img_logo.style.marginLeft = "376px";
  	}
  }
}

function putbanner(input){
	
	product_display.style.visibility = 'visible';
	if (input.files && input.files[0]) {
    var reader = new FileReader();
    reader.onload = function (e) {
      // img_banner.setAttribute('src', e.target.result);
      textareabanner.textContent = e.target.result;
      document.getElementById('crop').click();
    };

    reader.readAsDataURL(input.files[0]);
    img_banner.style.visibility = 'visible';
    
    // var banner_ = document.querySelector('#banner');
  	// var filebanner = banner_.files[0];
  	// var readerbanner = new FileReader();
  	// readerbanner.addEventListener('load', readFilebanner);
  	// readerbanner.readAsText(filebanner);
  	// img_logo.style.marginTop = "-150px";
  	// img_logo.style.marginLeft = "200px";
  	bannerdisplay = true;
  	imgval = 'banner';
  }
}

$(document).ready(function(){
  var img
  $('#imagUpload').change(function(e){
    img = e.target.files[0]
    
    $('#image_preview').attr('src', URL.createObjectURL(img))
    $('#image_preview,#crop').removeClass('d-none')
  })

  let cropper
  function start_cropping(imgval){
  	
  	valimg = $('#textarea'+imgval).val();
    var img_link = valimg;
    if(imgval=='logo')imgvalformat='auto';
    else imgvalformat='auto';
    var imgformat = imgvalformat;
    // alert(imgvalformat);
    $('#crop_popup').on('shown.bs.modal', function(){
      const cropOptions = {
        image: img_link,
        imgFormat: imgvalformat, // Formats: 3/2, 200x360, auto
        // circleCrop: true,
        zoomable: true
      }

      // Initiate cropper
      cropper = $('#crop_popup .modal-body').cropimage( cropOptions )

      setTimeout( () => {console.log('set-image'); cropper.setImage( img_link )}, 1000 )
    })
    .modal();
  }

  $('#crop').click(function(){
    start_cropping(imgval);
  })

  // $('#crop_popup').on('click', '.crop-it', function(){
  //   // Get the cropped image source URL
  //   const blobDataURL = cropper.getImage('PNG') // JPEG, PNG, ...
  //   if( !blobDataURL ) return
  //   if(imgval=='logo')img_logo.setAttribute('src', blobDataURL);
  //    else img_banner.setAttribute('src', blobDataURL);
  //   $('#modalclose').click();
  // })
  $('#crop_popup').on('click', '.reset-it', function(){
    start_cropping(imgval);
  })
})
**/
