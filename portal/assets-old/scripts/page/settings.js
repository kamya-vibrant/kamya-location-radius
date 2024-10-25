
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

