
async function saveSettings(setting_key, setting_key_value, supp_id, supp_name){
	let parameter = {
		model: 'setting',
		action: 'insert',
		insert: {
		    'model_id': supp_id,
		    'model_name': supp_name,
		    'setting_name': setting_key,
		    'setting_value': setting_key_value,
		    'is_supplier': 1
		}
	};
	try {
	    	var response  =  await sendhttpRequest(parameter);
	} catch(error) {
	        console.log("Error: ", error);
	} 
}
async function updateSettings(setting_key, setting_key_value, supp_id, supp_name){
	let parameter = {
		model: 'setting',
		action: 'update',
		update: {
		    'setting_value': setting_key_value
		},
		condition: [
		        	["setting_name", "=", setting_key],
		        	["model_id", "=", supp_id],
		        	["model_name", "=", supp_name],
		        	["is_supplier", "=", "1"],
		        ]
	};
	try {
	    	var response  =  await sendhttpRequest(parameter);
	} catch(error) {
	        console.log("Error: ", error);
	} 
}
async function settingsubmit(event){
	showLoading();
	event.preventDefault();
	console.log(localStorage);
	if(JSON.parse(localStorage.supplier).length==0){
		GetSupplier_ = await Get_supplier_from_id(Supplier_id_);
		supplier_name_= GetSupplier_.name;
	}else{
		supplier_name_ =JSON.parse(localStorage.supplier)[0].name;
	}
	company_name = document.getElementById('company_name').value;
	postal_address = document.getElementById('postal_address').value;
	timezone = document.getElementById('timezone').value;
	business_desc = document.getElementById('business_desc').value;
	point_of_contact_name = document.getElementById('point_of_contact_name').value;
	point_of_contact_email = document.getElementById('point_of_contact_email').value;
	point_of_contact_phone = document.getElementById('point_of_contact_phone').value;
	finance_contact_person_name = document.getElementById('finance_contact_person_name').value;
	finance_email = document.getElementById('finance_email').value;
	finance_contact_person_phone = document.getElementById('finance_contact_person_phone').value;

	let parameter = {
		    model: 'setting',
	        action: 'retrieve',
	        retrieve: '*',
	        condition: [
		        	["model_id", "=", Supplier_id_]
		        ]
	    };
	try {
	    	var response  =  await sendhttpRequest(parameter);
	    	response = response.data;
	    	if(response.length==0){
	    		_company_name = await saveSettings('Company Name', company_name, Supplier_id_, supplier_name_);
				_postal_address = await saveSettings('Postal Address', postal_address, Supplier_id_, supplier_name_);
				_timezone = await saveSettings('timezone', timezone, Supplier_id_, supplier_name_);
				_business_desc = await saveSettings('Business Description', business_desc, Supplier_id_, supplier_name_);
				_point_of_contact_name = await saveSettings('Point of Contact Name', point_of_contact_name, Supplier_id_, supplier_name_);
				_point_of_contact_email = await saveSettings('Point of Contact Email', point_of_contact_email, Supplier_id_, supplier_name_);
				_point_of_contact_phone = await saveSettings('Point of Contact Phone', point_of_contact_phone, Supplier_id_, supplier_name_);
				_finance_contact_person_name = await saveSettings('Finance Contact Person Name', finance_contact_person_name, Supplier_id_, supplier_name_);
				_finance_email = await saveSettings('Finance Email', finance_email, Supplier_id_, supplier_name_);
				_finance_contact_person_phone = await saveSettings('Finance Contact Person Phone', finance_contact_person_phone, Supplier_id_, supplier_name_);
	    	}else{
	    		_company_name = await updateSettings('Company Name', company_name, Supplier_id_, supplier_name_);
				_postal_address = await updateSettings('Postal Address', postal_address, Supplier_id_, supplier_name_);
				_timezone = await updateSettings('timezone', timezone, Supplier_id_, supplier_name_);
				_business_desc = await updateSettings('Business Description', business_desc, Supplier_id_, supplier_name_);
				_point_of_contact_name = await updateSettings('Point of Contact Name', point_of_contact_name, Supplier_id_, supplier_name_);
				_point_of_contact_email = await updateSettings('Point of Contact Email', point_of_contact_email, Supplier_id_, supplier_name_);
				_point_of_contact_phone = await updateSettings('Point of Contact Phone', point_of_contact_phone, Supplier_id_, supplier_name_);
				_finance_contact_person_name = await updateSettings('Finance Contact Person Name', finance_contact_person_name, Supplier_id_, supplier_name_);
				_finance_email = await updateSettings('Finance Email', finance_email, Supplier_id_, supplier_name_);
				_finance_contact_person_phone = await updateSettings('Finance Contact Person Phone', finance_contact_person_phone, Supplier_id_, supplier_name_);
	    		alert('Successfully save!');
	    	}
	    } catch(error) {
	        console.log("Error: ", error);
	    }     
	setTimeout(
	closeLoading 
	, 50); 
}
async function locationFromID(id){

	let parameter = {
		model: 'location',
	    action: 'retrieve',
	    retrieve: '*',
	    condition: [
		        	["id", "=", id]
		    	]
	    }
	try {
		var response =  await sendhttpRequest(parameter);
		return response.data[0];
	}catch(error){
		console.log("Error: ", error);
	}     
}
async function viewDocs(){
	thislocation = await locationFromID(user_location_id);
	plistr =  thislocation.public_liability_insurance;
	fslstr = thislocation.food_safety_licence;
	if(plistr!=='' || fslstr){
		strfsl=fslstr.split(';base64');
		strfsl = strfsl[0].split('/');
		if(strfsl[1]=='pdf'){
			objfsl = `<object class="view-doc-obj" data="${fslstr}" type="application/pdf">
							<div>No PDF viewer available</div>
					  </object>`;
		}else{
			objfsl = `<div class="view-doc-obj">
							<img src="${fslstr}"/>
					  </div>`;
		}
		strpli=plistr.split(';base64');
		strpli = strpli[0].split('/');
		if(strpli[1]=='pdf'){
			objpli = `<object class="view-doc-obj" data="${plistr}" type="application/pdf">
							<div>No PDF viewer available</div>
					  </object>`;
		}else{
			objpli = `<div class="view-doc-obj">
							<img src="${plistr}"/>
					  </div>`;
		}
		objElement = `<div class="form-step col80" id="contentdocs_">
							<div class="form-group-row col100 flex">
                                <div class="col50">
									<label class="lbl-doc">Public Liability Insurance</label>
									${objpli}
                                    <label class="lbl-doc">Expiry date: ${thislocation.pli_expiry_date}</label>
								</div>
								<div class="col50">
									<label class="lbl-doc">Food Safety Licence</label>
									${objfsl}
                                    <label class="lbl-doc">Expiry date: ${thislocation.fsl_expiry_date}</label>
								</div>
							</div>
					  </div>`;
		$('#viewdocs').append(objElement);
	}
}
async function locationDocuments(event){
	event.preventDefault();
	showLoading();
	public_liability_insurance = document.getElementById('img_pli').src;
	pli_expiry_date = document.getElementById('ex-pli').value;
	food_safety_licence = document.getElementById('img_fsl').src;
	fsl_expiry_date = document.getElementById('ex-fsl').value;
	Arrpli=public_liability_insurance.match(/.{1,3000}/g);
	plilength = Arrpli.length;
	Arrfsl = food_safety_licence.match(/.{1,3000}/g);
	fsllength = Arrfsl.length;
	let parameter = {
		model: 'location',
		action: 'update',
		update: {
		    'public_liability_insurance': Arrpli[0],
		    'pli_expiry_date': pli_expiry_date,
		    'food_safety_licence': Arrfsl[0],
		    'fsl_expiry_date': fsl_expiry_date
		},
		condition: [
		        	["id", "=", user_location_id],
		        ]
	};
	try {
	    var response  =  await sendhttpRequest(parameter);
	    if(response['code']==200){
			i=1; 
			while(i<plilength){
					    			
				slice = Arrpli[i];
				var sendingIMG = await sendslice(user_location_id, slice, 'public_liability_insurance');
				i++;
			}
			i=1; 
			while( i<fsllength){
				slice = Arrfsl[i];
				var sendingIMG = await sendslice(user_location_id, slice, 'food_safety_licence');
				i++;
			}
			document.getElementById('contentdocs_').remove();
			viewDocs();
		}

	} catch(error) {
	        console.log("Error: ", error);
	} 
	setTimeout(
	closeLoading 
	, 50); 
}

async function sendslice(id, slice, which){
	let parameter2 = {
				model: 'location',
				action: 'insertimg',
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

function putfile(input,id){
	fileobject = document.getElementById('img_'+id); 
	if (input.files && input.files[0]) {
	    var reader = new FileReader();
	    reader.onload = function (e) {
	      	fileobject.setAttribute('src', e.target.result);

	    };
	    reader.readAsDataURL(input.files[0]);
	}
}
async function convertthisfile(input, id){
	val = input.value;
	splt = val.split('.');
	lngthsplt = splt.length - 1;
	if(splt[lngthsplt].toLowerCase() != 'pdf'){
		readthisfiles(input.files,id);
	}else{
		putfile(input,id);
	}

}
function processthisfile(file,id) {
  	fileName = document.querySelector('#'+id).value; 
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

        var resized = resizethis(image,extension); 
        document.getElementById('img_'+id).src=resized;
      }
    };
}
function readthisfiles(files,id) {
  
    for (var i_ = 0; i_ < files.length; i_++) {
      processthisfile(files[i_],id); 
    }

}

function resizethis(img,ext_) {
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