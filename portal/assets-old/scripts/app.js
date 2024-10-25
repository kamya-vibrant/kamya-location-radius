

async function sendhttpRequest(data) {
	return new Promise(function (resolve, reject) {
		  const xhr = new XMLHttpRequest();
	      xhr.open("POST", "/api");
	      xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
	      const body = JSON.stringify(data);
	      xhr.onload = () => {
	      	if (xhr.readyState == 4 && xhr.status == 200) {
	            let res = JSON.parse(xhr.response); 
	            //console.log(res);  
	            if (res.code == 200) {
	            	//this is for successful
	            	resolve(res);
	            }else{
	                //unsecessful - error message
	                reject(res.message);
	                //console.log(res.message);
	            }
	        } else {
	            console.log(`Error: ${xhr.status}`);
	        }
	      	
	    };
	    //console.log(body);
	    xhr.send(body);
	});
} 

function encodePass(string){
    return btoa(string);
}

function decodePass(){
     return atob(string);
}

function setStorageItem(name, value){
	localStorage.setItem(name, JSON.stringify(value));
}

function getStorageItem(name){
	console.log(localStorage);
	return (localStorage.getItem(name) === null) ? null : JSON.parse(localStorage.getItem(name));
}

function getSettingKey($key){
	$settingKeys = (localStorage.getItem('settingKeys') === null) ? null : JSON.parse(localStorage.getItem('settingKeys'));
	console.log('settingKeys');
	console.log($settingKeys);
	return ($settingKeys!==null) ? $settingKeys[$key] : null ;
}

async function fetchLoggedData(){
	let loggedData = getStorageItem('loggedData');
	let csrf_token = getStorageItem('csrf');
	//if(loggedData==null && csrf_token !=null){
	if(csrf_token != null){	
		let parameter = {
		    model: 'auth',
	        action: 'loggedData', 
	        csrf: csrf_token
	    };

	    try {
		    var response = await sendhttpRequest(parameter);
		    console.log('response');
		    console.log(response);
		    if(response.code==200){
		    	setStorageItem('loggedData', response.data);
		    	setStorageItem('acl', response.acl);
		    	setStorageItem('settingKeys', response.setting_keys);
		    	setStorageItem('isSupplier', response.isSupplier);
		    	setStorageItem('isCustomer', response.isCustomer);
		    	setStorageItem('isOrganiser', response.isOrganiser);
		    	setStorageItem('isAdmin', response.isAdmin);
		    	setStorageItem('isAdmin', response.isAdmin);

		    	if(response.isSupplier){
		    		setStorageItem('supplier', response.supplier);
		    	}

		    	if(response.isCustomer){
		    		setStorageItem('customer', response.customer);
		    	}

		    	if(response.isOrganiser){
		    		setStorageItem('organiser', response.organiser);
		    	}

		    }else{
		    	//logout
		    }
		} catch(error) {
		    console.log("Error: ", error);
		}   

	}

	setDynamicSideBar();
	setUserDetails();
	
}

async function setDynamicSideBar(){
	let sidebar = getStorageItem('acl');
	console.log(sidebar);
	if(sidebar!==null){
		$("#sidebar-nav-items").empty();
		console.log(sidebar.menu);
		menu = sidebar.menu;
		let menuItem;
		for (var key of Object.keys(menu)) {
			menuItem = ''
		    console.log(key + " -> " + menu[key]['title'] + menu[key]['url'])
		    menuItem = '<a class="sidenav-item"  href="'+menu[key]['url']+'" onclick="route()">';
		    menuItem = menuItem + '<i class="'+menu[key]['icon']+'"></i>';
		    menuItem = menuItem + menu[key]['title'];
		    menuItem = menuItem + '</a>';
		    $("#sidebar-nav-items").append(menuItem);
		}

		menuItem = '<a class="sidenav-item top-auto" href="/logout" onclick="route()">';
		menuItem = menuItem + '<i class="bi bi-box-arrow-right"></i> Log Out';
        menuItem = menuItem + '</a>';    
        $("#sidebar-nav-items").append(menuItem);    
	}
}

async function setUserDetails(){
	let loggedData = getStorageItem('loggedData');

	if(loggedData!==null){
		$("#sidebar_user").empty();
		$("#sidebar_user").append(loggedData.first_name);
		$("#top_nav_name").empty();
		$("#top_nav_name").append(loggedData.first_name+" "+loggedData.last_name);
	}
} 

var inactivityTime = function () {
    var time;
    window.onload = resetTimer;
    // DOM Events
    document.onmousemove = resetTimer;
    document.onkeydown = resetTimer;

    function logout() {
        //alert("You are now logged out.")
        //location.href = 'logout.html'
    }

    function resetTimer() {
        clearTimeout(time);
        time = setTimeout(logout, 1800000)
        // 1000 milliseconds = 1 second
    }
};


var users_supplier, Supplier_id_, Supplier_;

async function Get_supplier(){
	Supplier_=JSON.parse(localStorage.supplier);
	if(Supplier_.length==0){

		let parameter = {
		    model: 'user',
	        action: 'retrieve',
	        retrieve: '*',
	        condition: [

		        	["id", "=", JSON.parse(localStorage.loggedData).user_id],
		        ]
		    }
		try {
			var response =  await sendhttpRequest(parameter);
			users_supplier = response.data[0];
			Supplier_id_ = response.data[0].supplier_id;
		}catch(error) {
		        console.log("Error: ", error);
		}    
	    	

	}else{
		Supplier_id_ =Supplier_[0].id;
		users_supplier={'position' :'Super admin'};
	}
}
Get_CUR_user = Get_supplier();	
/* User's Page */
async function tbluserputdata(id){

	let parameter = {
		model: 'location',
	    action: 'retrieve',
	    fields: ['location_name'],
	    condition: [
		        	["id", "=", id]
		    	]
	    }
	try {
		var response =  await sendhttpRequest(parameter);
		return response.data[0].location_name;
	}catch(error){
		console.log("Error: ", error);
	}     
}
async function UsersSupplier(){

	if(users_supplier.position=="Super admin"){
		let parameter = {
		    model: 'user',
	        action: 'retrieve',
	        retrieve: '*',
	        condition: [
		        	["usertype", "=", "2"]
		        ]
	    }
		try {
	    	var response =  await sendhttpRequest(parameter);

	    	Arruser = response.data;
	    	rowtbl='';
	    	lnth = Arruser.length;
	    	var Arrusers=[]; ai=0; 	
	    	for(i=0; i<lnth; i++){
	    		if(Arruser[i].location_id!=0 && Arruser[i].location_id!=null){

	    			loc_name = await tbluserputdata(Arruser[i].location_id);
	    			Arruser[i].location_id=loc_name;
	    		}
	    		if(Arruser[i].supplier_id==Supplier_id_){
	    			Arrusers.push(Arruser[i]);
	    			ai++;
	    		}else if(Arruser[i].id==JSON.parse(localStorage.loggedData).user_id){
	    			Arrusers.push(Arruser[i]);
	    			ai++;
	    		}
	    	}
	    	const table = document.querySelector("#tblUser");
	    	var tableBody = document
				  .getElementById("tblUser")
				  .getElementsByTagName("tbody")[0];
			var rowsHtml = Arrusers
			  .map(
			    (Arrusers) =>
			      `<tr>
			        <td>${Arrusers.first_name}</td>
			        <td>${Arrusers.last_name}</td>
			        <td>${Arrusers.email}</td>  
			        <td>${Arrusers.phone}</td>
			        <td>${Arrusers.position}</td>
			        <td>${Arrusers.location_id}</td>
			        <td><button class="btn default" OnClick="window.location.href='/create-user?id=${Arrusers.id}'">Edit</button>
                    <button id="rmv_usr${Arrusers.id}" class="btn red icon-right" OnClick="removeSupplieruser(${Arrusers.id}, '${Arrusers.first_name + ' ' + Arrusers.last_name}')">Remove <i class="bi bi-trash-fill"></i></button></td>
			    </tr>`
			  )
			  .join("");

			tableBody.innerHTML = rowsHtml;
	    } catch(error) {
	        console.log("Error: ", error);
	    }     
	}else{
		document.getElementById('link_to_create_user').remove();
	}

	if(users_supplier.position=="Super admin")document.getElementById('rmv_usr'+JSON.parse(localStorage.loggedData).user_id).remove();

} 


async function rmSupplieruser(id){
	let parameter = {
		    model: 'user',
	        action: 'delete',
	        condition: [
		        	["id", "=", id]
		        ]
	    };
	try {
	    	var response  =  await sendhttpRequest(parameter);
	    	UsersSupplier();
	    } catch(error) {
	        console.log("Error: ", error);
	    }     
}

function removeSupplieruser(id,name){
  let text = "Are you sure you want to remove user name: "+name+"?";
  if (confirm(text) == true) {
    rmSupplieruser(id);
  } 
}

function showLoading(){

	let loadingElem = document.getElementById("loading");
	loadingElem.setAttribute("style", "");

}

function closeLoading(){

	let loadingElem = document.getElementById("loading");
	loadingElem.setAttribute("style", "display: none;");
}

/* End of User's Page */
/* location page */
function assign_mneu(id){

	if(users_supplier.position=="Super admin" || users_supplier.position=="Admin" || users_supplier.position=='Location Manager')return '<td> <button class="menu_assign btn default" OnClick="menu('+id+')">Assign Menu</button></td>';
	else  return '';
}

function remove_locat(id,location_name1){
	if(users_supplier.position=="Super admin" )return '<td><button class="rmLocation btn red icon-right" OnClick="removeLocation(\''+id+'\',\''+location_name1+'\')">Remove <i class="bi bi-trash-fill"></i></button></td>';
	else  return '';
}

function update_location_link(id,location_name){
	if(users_supplier.position=="Super admin" || users_supplier.position=='Admin' || users_supplier.position=='Location Manager' || users_supplier.position=='Finance')return '<td><a href="/create-location?id='+id+'">'+location_name+'</a></td>';
	else return '<td>'+location_name+'</td>';
}

async function LocationsData(){
	Get_supplier_ = await Get_supplier();
let parameter = {
		    model: 'location',
	        action: 'retrieve',
	        retrieve:  '*'
	    };
	try {
	    	var response =  await sendhttpRequest(parameter);
	    	const table = document.querySelector("#tblLocation");
	    	rrs = response.data;
	    	if(users_supplier=='undefined')users_supplier.position='Admin';
			if(users_supplier.position=='Location User'){
				var rrs = rrs.filter(function (el) {
				  return el.id == users_supplier.location_id ;
				});
				document.getElementById('link_to_create_location').remove();
			}else if(users_supplier.position=='Location Manager'){
				var rrs = rrs.filter(function (el) {
				  return el.id == users_supplier.location_id ;
				});
				document.getElementById('link_to_create_location').remove();
			}else if(users_supplier.position=='Admin' || users_supplier.position=="Super admin"){
				var rrs = rrs.filter(function (el) {
				  return el.supplier_id == Supplier_id_ ;
				});
			}else if(users_supplier.position=='Finance'){
				var rrs = rrs.filter(function (el) {
				  return el.id == users_supplier.location_id ;
				});
				document.getElementById('link_to_create_location').remove();
			}
	    	console.log(rrs);
	    	var tableBody = document
			  .getElementById("tblLocation")
			  .getElementsByTagName("tbody")[0];
			var rowsHtml = rrs
			  .map(
			    (rrs) =>
			      `
			      	<tr><td><img src="${rrs.logo}"/ width="100"></td>
			        `+update_location_link(rrs.id,rrs.location_name)+`
			        <td>${rrs.entity_name}</td>
			        <td>${rrs.location_address}</td>  
			        <td>${rrs.point_contact_name}</td>
			        <td>${rrs.point_contact_email}</td>
			        `+ assign_mneu(rrs.id)+remove_locat(rrs.id,rrs.location_name)+
                    
			    `</tr>`
			  )
			  .join("");

			tableBody.innerHTML = rowsHtml;

	    } catch(error) {
	        console.log("Error: ", error);
	    }     
}

async function rmLocation(id){
	let parameter = {
		    model: 'location',
	        action: 'delete',
	        condition: [
		        	["id", "=", id]
		        ]
	    };
	try {
	    	var response  =  await sendhttpRequest(parameter);
	    	LocationsData();
	    } catch(error) {
	        console.log("Error: ", error);
	    }     
}

function removeLocation(id,name){
  let text = "Are you sure you want to remove location name: "+name+"?";
  if (confirm(text) == true) {
    rmLocation(id);
  } 
}

/* End of Location Page */
fetchLoggedData();
inactivityTime();

/* settings */
async function Get_supplier_from_id(id){
	let parameter = {
		model: 'supplier',
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
async function arrangeSettings(da){
	lda = da.length;
	reDA = [];
	for(i=0; i<lda; i++){
		reDA[da[i].setting_name]= da[i].setting_value;
	}
	return reDA;
}
async function SettingsData(){
	fetchsupp = await Get_supplier();
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

	    	if(response.length!=0){
	    		setingS = await arrangeSettings(response);
	    		console.log(setingS);
	    		div_rpr = document.getElementById('divRsetP');
	    		div_rpr.setAttribute('href','javascript: requestPasswordReset("'+Supplier_id_+'","'+setingS['Point of Contact Email']+'");');
		    	document.getElementById('company_name').value = setingS['Company Name'];
		    	document.getElementById('postal_address').value = setingS['Postal Address'];
		    	document.getElementById('business_desc').value = setingS['Business Description'];
		    	document.getElementById('point_of_contact_email').value = setingS['Point of Contact Email'];
		    	document.getElementById('timezone').value = setingS['timezone'];
				document.getElementById('point_of_contact_name').value = setingS['Point of Contact Name'];
				document.getElementById('point_of_contact_phone').value = setingS['Point of Contact Phone'];
				document.getElementById('finance_contact_person_name').value = setingS['Finance Contact Person Name'];
				document.getElementById('finance_email').value = setingS['Finance Email'];
				document.getElementById('finance_contact_person_phone').value = setingS['Finance Contact Person Phone'];
	    	}
	    	
	
	    } catch(error) {
	        console.log("Error: ", error);
	    }    
	    if(users_supplier.position!="Super admin")document.getElementById('frmSettings').remove(); 
}

async function requestPasswordReset(id, email){
	showLoading();
	wl = location.href;
	shwp = wl.replace('settings','');
	let parameter = {
		model: 'setting',
		action: 'requestpasswordreset',
		requestpasswordreset: {
		    'supplier_id': id,
		    'email': email,
		    'url': shwp
		}
	};
	try {
	    var response  =  await sendhttpRequest(parameter);
	    if(response.code=='200')alert(response.message);
	} catch(error) {
	        console.log("Error: ", error);
	} 

	setTimeout(
	closeLoading 
	, 50);
}

/* End of Setting */
/* Finance */
async function tblschooldata(id){
	let parameter = {
		model: 'school',
	    action: 'retrieve',
	    fields: ['name'],
	    condition: [
		        	["id", "=", id]
		    	]
	    }
	try {
		var response =  await sendhttpRequest(parameter);
		return response.data[0].name;
	}catch(error){
		console.log("Error: ", error);
	}     
}
async function FinanceData(){
	if(users_supplier.position=="Super admin" || users_supplier.position=="Finance"){
		let parameter = {
		    model: 'finance',
	        action: 'retrieve',
	        retrieve: '*',
	        condition: [
		        	["supplier_id","=",Supplier_id_]
		        ]
	    }
		try {
	    	var response =  await sendhttpRequest(parameter);

	    	Arrfinance = response.data;
	    	lnth = Arrfinance.length;
	    	rowtbl='';
	    	// var Arrfinances=[]; ai=0; 	
	    	for(i=0; i<lnth; i++){
	    		if(Arrfinance[i].school_id!=0 && Arrfinance[i].school_id!=null){
	    			school_name = await tblschooldata(Arrfinance[i].school_id);
	    			Arrfinance[i].school_d=school_name;
	    		}
	    		if(Arrfinance[i].status=='active')Arrfinance[i].status='<div class="pill-item green">Active</div>';
	    		else Arrfinance[i].status='<div class="pill-item red">Inactive</div>';
	    	}
	    	const table = document.querySelector("#financeTable");
	    	var tableBody = document
				  .getElementById("financeTable")
				  .getElementsByTagName("tbody")[0];
			var rowsHtml = Arrfinance
			  .map(
			    (Arrfinance) =>
			      `<tr>
			        <td>${Arrfinance.school_d}</td>
			        <td>${Arrfinance.delivery_day}</td>
			        <td>${Arrfinance.orders}</td>  
			        <td>${Arrfinance.payout}</td>
			        <td><button Onclick="downloadfile('${Arrfinance.finance_report}')" class="btn default-3 icon-right">Download
                            <i class="bi bi-download"></i>
                        </button></td>
			        <td>${Arrfinance.status}</td>
			    </tr>`
			  )
			  .join("");

			tableBody.innerHTML = rowsHtml;
	    } catch(error) {
	        console.log("Error: ", error);
	    }     
	}else{
		document.getElementById('link_to_create_finance').remove();
	}
}
function downloadfile(file){
	var date = (new Date()).toISOString();
	tx = file.split(';');
	ext = tx[0].split('/'); ext = ext[1];
	const arrExt = ['apng','jpeg','bmp','pdf','png','gif','avif','jpg','jfif','pjpeg','pjp','svg','webp','ico','cur','tif','tiff'];
	if(!arrExt.includes(ext))ext ='docx';
	let fetchDataModified = file;
    let a = document.createElement("a");
     a.href = fetchDataModified;
     a.download = 'download_vibrantbands_myschoollunch_'+date+'.'+ext;
     a.click();
}


/* End of Finance*/

