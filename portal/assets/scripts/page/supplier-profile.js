// var owner_id;
async function supplierProfile(event){
	event.preventDefault();
	showLoading();
	let first_name = event.target['fname'].value;
	let last_name = event.target['lname'].value;
	let phone = event.target['phone'].value;
	let email = event.target['sup_email'].value;

	let bank = event.target['bank'].value;
	let bsb = event.target['bsb'].value;
	let abn = event.target['abn'].value;
	let acn = event.target['acn'].value;
	let account_name = event.target['account_name'].value;
	let account_number = event.target['account_number'].value;

	let full_address = event.target['full_address'].value;
	let street = event.target['street'].value;
	let suburb = event.target['suburb'].value;
	let postal_code = event.target['postal_code'].value;

	let parameter = {
		    model: 'user',
	        action: 'update',
	        update: {
	        	'first_name': first_name,
	        	'last_name': last_name,
	        	'phone': phone,
	        	'email': email
	        },
	        condition: [
		        	["id", "=", owner_id]
		        ]
	}
	try {
	    var response =  await sendhttpRequest(parameter);
	    if(response.code=="200"){
	    	let parameter1 = {
				    model: 'supplier',
			        action: 'update',
			        update: {
			        	'bank': bank,
			        	'bsb': bsb,
			        	'abn': abn,
			        	'acn': acn,
			        	'account_name': account_name,
			        	'account_number': account_number,
			        	'address': full_address,
			        	'street': street,
			        	'suburb': suburb,
			        	'postal_code': postal_code,
			        	'email': email
			        },
			        condition: [
				        	["owner_id", "=", owner_id]
				        ]
			}
			try {
			    var response =  await sendhttpRequest(parameter1);
			    var sup_here = await GetSupplierhere(owner_id);
			} catch(error) {
				$('#error_submitting').show();
			    console.log("Error: ", error);
			}   
	    }
	} catch(error) {
		$('#error_submitting').show();
	    console.log("Error: ", error);
	} 
	setTimeout(
	closeLoading 
	, 50);  
}
async function GetUserhere(id){
	let parameter = {
		    model: 'user',
	        action: 'retrieve',
	        retrieve: '*',
	        condition: [
		        	["id", "=", id]
		        ]
	}
	try {
	    var response =  await sendhttpRequest(parameter);
	    return response.data[0];
	} catch(error) {
	    console.log("Error: ", error);
	}   
}
async function GetSupplierhere(owner_id){
	let parameter = {
		    model: 'supplier',
	        action: 'retrieve',
	        retrieve: '*',
	        condition: [
		        	["owner_id", "=", owner_id]
		        ]
	}
	try {
	    var response =  await sendhttpRequest(parameter);
	    return response.data[0];
	} catch(error) {
	    console.log("Error: ", error);
	}   
}
async function getImgSup(sup_id){
	let parameter = {
		    model: 'image',
	        action: 'retrieve',
	        fields: ['image'],
	        condition: [
	        			['model','=','supplier'],
	        			['model_id','=',sup_id]
	        	]
	    };
	try {
	    	var response  =  await sendhttpRequest(parameter);
	    	return response.data[0].image;
	    } catch(error) {
	        console.log("Error: ", error);
	    }     
}
async function getprofiledata(){
	sup_info = JSON.parse(localStorage.supplier);
	sup_id = sup_info[0].id;
	owner_id = sup_info[0].owner_id;
	userdet = await GetUserhere(owner_id);
	document.getElementById('fname').value = userdet.first_name;
	document.getElementById('lname').value = userdet.last_name;
	document.getElementById('phone').value = userdet.phone;
	document.getElementById('sup_email').value = userdet.email;
	supdet = await GetSupplierhere(owner_id);
	document.getElementById('full_address').value = supdet.address;
	document.getElementById('street').value = supdet.street;
	document.getElementById('suburb').value = supdet.suburb;
	document.getElementById('postal_code').value = supdet.postal_code;

	document.getElementById('bank').value = supdet.bank;
	document.getElementById('bsb').value = supdet.bsb;
	document.getElementById('abn').value = supdet.abn;
	document.getElementById('acn').value = supdet.acn;
	document.getElementById('account_name').value = supdet.account_name;
	document.getElementById('account_number').value = supdet.account_number;

	document.getElementById('left-name').innerHTML = userdet.first_name + ' ' + userdet.last_name;
	document.getElementById('left-phone').innerHTML = userdet.phone;
	document.getElementById('left-email').innerHTML = userdet.email;

	get_img_from = await getImgSup(sup_id);
	document.getElementById('div_img').style.backgroundImage="url("+get_img_from+")";
}
getprofiledata();

async function checking_img_s(model_id){
		    let parameter = {
				model: 'image',
				action: 'retrieve',
				retrieve: '*',
				condition: [
					['model','=','supplier'],
					['model_id','=',model_id]
				]
			};
			try {
				var response = await sendhttpRequest(parameter);
				response = response.data;
				return response[0].id
			} catch(error) {
				return 0;
			}  
}
async function uploadImage_s(input){
	readfiles_s(input.files);
}
async function processSlice_s(Arrimg){
		
	showLoading();
		checking_img_ = await checking_img_s(sup_id);
		length_img = Arrimg.length;
		if(checking_img_==0){

		    let parameter = {
				model: 'image',
				action: 'insert',
				insert: { 
				        	'model': 'supplier', 
				        	'model_id': sup_id,
				        	'image': Arrimg[0],
				        	'is_primary' : '1'
				        }
			};
			try {
				var response = await sendhttpRequest(parameter);

				if(response['code']==200){		
					i_img=1; 
					while(i_img<length_img){
					    slice = Arrimg[i_img];
						var sendingIMG = await sendslice_img_s(response['id'], slice, 'image');
						i_img++;

					}

				}

				updateprofile = await getprofiledata();
				get_img_from = await getImgSup(sup_id);
				$('.usr_image').attr('src',get_img_from);
			} catch(error) {
				console.log("Error: ", error);
			}  
		}else{
			let parameter = {
				model: 'image',
				action: 'update',
				update: { 
				        	'image': Arrimg[0],
				        },
				condition:[
						['model','=','supplier'],
						['model_id','=',sup_id]
					]
			};
			try {
				var response = await sendhttpRequest(parameter);
				if(response['code']==200){		
					i_img=1; 
					while(i_img<length_img){
					    slice = Arrimg[i_img];
						var sendingIMG = await sendslice_img_s(checking_img_, slice, 'image');
						i_img++;
					}
				}
				getprofiledata();
				get_img_from = await getImgSup(sup_id);
				$('.usr_image').attr('src',get_img_from);
			} catch(error) {
				console.log("Error: ", error);
			}  
		}
			
	setTimeout(
		closeLoading 
		, 50);    
}
async function sendslice_img_s(id, slice, which){
	let parameter2 = {
				model: 'image',
				action: 'insertfile',
				insert: {  
						which: slice
				},
				fields: [
					which
				],
				condition: [['id', '=', id]]
			};
		try {
					var response = await sendhttpRequest(parameter2);
					return response;
				} catch(error) {
					console.log("Error: ", error);
				}      
}

function processfile_s(file) {
  	fileName = document.querySelector('#sup_img_file').value; 
    extension = fileName.split('.').pop(); 
    if( !( /image/i ).test( file.type ) )
        {
            return false;
        }

    var reader = new FileReader();
    reader.readAsArrayBuffer(file);
    
    reader.onload = function (event) {
      var blob = new Blob([event.target.result]); 
      window.URL = window.URL || window.webkitURL;
      var blobURL = window.URL.createObjectURL(blob); 
      var image = new Image();
      image.src = blobURL;

      image.onload = function() {

        var resized = resizeMe_s(image,extension); 
        Arrimg=resized.match(/.{1,3000}/g);
		processSlice_s(Arrimg);

      }
    };
}

function readfiles_s(files) {
  
    for (var i_ = 0; i_ < files.length; i_++) {
      processfile_s(files[i_]); 
    }

}

function resizeMe_s(img,ext_) {
  var max_width = 1400;
  var max_height = 1400;
  var canvas = document.createElement('canvas');
  var width = img.width;
  var height = img.height;

  if (width > height) {
    if (width > max_width) {
      height = Math.round(height *= max_width / width);
      width = max_width;
    }
  } else {
    if (height > max_height) {
      width = Math.round(width *= max_height / height);
      height = max_height;
    }
  }
 
  canvas.width = width;
  canvas.height = height;
  var ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, width, height);

  if(ext_=='jpg')ext_='jpeg';
  return canvas.toDataURL("image/"+ext_,0.7); 
}