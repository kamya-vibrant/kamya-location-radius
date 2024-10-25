

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
		    		setStorageItem('customer', '');
		    		setStorageItem('organiser', '');
		    	}

		    	if(response.isCustomer){
		    		setStorageItem('customer', response.customer);
		    		setStorageItem('organiser', '');
		    		setStorageItem('supplier', '');
		    	}

		    	if(response.isOrganiser){
		    		setStorageItem('organiser', response.organiser);
		    		setStorageItem('customer', '');
		    		setStorageItem('supplier', '');
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
	console.log(getStorageItem);
	if(sidebar!==null){
		$("#sidebar-nav-items").empty();
		console.log(sidebar.menu);
		menu = sidebar.menu;
		let menuItem;
		for (var key of Object.keys(menu)) {
			menuItem = '';
			if(menu[key]['url']=='/dashboard') {
				if(localStorage.isOrganiser=='true')menu[key]['url']='/organizer-dashboard';
				else if(localStorage.isSupplier=='true')menu[key]['url']='/supplier-dashboard';
				else if(localStorage.isCustomer=='true')menu[key]['url']='/customer-dashboard';
			}
		    console.log(key + " -> " + menu[key]['title'] + menu[key]['url']);

		    if (typeof menu[key]['sub_menus'] !== "undefined") {

		    	menuItem = '<li class="side-nav-item"><a data-bs-toggle="collapse" href="#sidebar'+menu[key]['title']+'" aria-expanded="false" aria-controls="sidebar'+menu[key]['title']+'" class="side-nav-link collapsed">';
			    menuItem = menuItem + '<i class="'+menu[key]['icon']+'"></i><span>';
			    menuItem = menuItem + menu[key]['title'];
			    menuItem = menuItem + '</span><span class="menu-arrow"></span></a>';
			    menuItem = menuItem + '<div class="collapse" id="sidebar'+menu[key]['title']+'" style=""><ul class="side-nav-second-level">';

			    for (const subKey of Object.keys(menu[key]['sub_menus'])) {
				    menuItem = menuItem + '<li><a href="'+menu[key]['sub_menus'][subKey].url+'">'+menu[key]['sub_menus'][subKey].title+'</a></li>';
				}

                menuItem = menuItem + '</ul></div>';
			    menuItem = menuItem + '</li>';

		    } else {
		    	menuItem = '<li class="side-nav-item"><a class="side-nav-link"  href="'+menu[key]['url']+'" >';
			    menuItem = menuItem + '<i class="'+menu[key]['icon']+'"></i><span>';
			    menuItem = menuItem + menu[key]['title'];
			    menuItem = menuItem + '</span></a></li>';
		    }
		    
		    $("#sidebar-nav-items").append(menuItem);
		}

		menuItem = '<li class="side-nav-item" ><a class="side-nav-link"  href="/logout" >';
		menuItem = menuItem + '<i class="bi bi-box-arrow-right"></i><span>Log Out';
		menuItem = menuItem + '</span></a></li>';
		$("#sidebar-nav-items").append(menuItem);

		// menuItem = ' <a class="sidenav-item top-auto" href="/logout" onclick="route()">';
		// menuItem = menuItem + '<i class="bi bi-box-arrow-right"></i> <span>Log Out';
        // menuItem = menuItem + '</span></a>';    
        // $("#sidebar-nav-items").append(menuItem);    
	}
}

async function setUserDetails(){
	let loggedData = getStorageItem('loggedData');
	
	supplierData = JSON.parse(localStorage.supplier);
	var _posi = ''; var pro_img='';
	if(loggedData!==null){
		sett_ing_page='';
		if(localStorage.isOrganiser=='true'){
			_posi='Organiser';
		}else if(localStorage.isSupplier=='true'){
			_posi='Supplier';
			sett_ing_page +=`<a href="/settings" class="dropdown-item">
                        <i class="ri-settings-4-fill align-middle me-1"></i>
                        <span>Settings</span>
                    </a>`;
        	pro_img= await getImgSup(supplierData[0].id);
		}else if(localStorage.isCustomer=='true'){
			_posi='Customer';
			customerData = JSON.parse(localStorage.customer);
			pro_img= await getImgCus(customerData[0].id);
		}else if(localStorage.isAdmin=='true'){
			_posi='Admin';
		}
		$('.usr_image').attr('src', pro_img);
		$("._posi").html(_posi);
		$("#sidebar_user").empty();
		$("#sidebar_user").append(loggedData.first_name);
		$("#top_nav_name").empty();
		$("#top_nav_name").append(loggedData.first_name+" "+loggedData.last_name);
		drpp_us = `<a href="/${_posi.toLowerCase()+'-profile'}" class="dropdown-item">
                        <i class="ri-account-circle-fill align-middle me-1"></i>
                        <span>My Account</span>
                    </a>
                    ${sett_ing_page}
                    <a href="/logout" class="dropdown-item">
                        <i class="ri-logout-box-fill align-middle me-1"></i>
                        <span>Logout</span>
                    </a>`;

        $('#dropdown_user').append(drpp_us);
                                

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


inactivityTime();
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
if(localStorage.isSupplier!='false')Get_CUR_user = Get_supplier();	
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

	if(users_supplier.position=="Super admin" || users_supplier.position=="Admin" || users_supplier.position=='Location Manager')return '<button class="menu_assign btn default" OnClick="menu('+id+')">Assign Menu</button>';
	else  return '';
}
function check_docu(id){
	if(users_supplier.position=="Super admin" || users_supplier.position=="Admin")return '<a href="/location-docs?id='+id+'" class="menu_assign btn default">Check Documents</a>';
	else  return '';
}
function remove_locat(id,location_name1){
	if(users_supplier.position=="Super admin" )return '<button class="rmLocation btn red icon-right" OnClick="removeLocation(\''+id+'\',\''+location_name1+'\')">Remove <i class="bi bi-trash-fill"></i></button>';
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
			        <td><div class="button-group">`+ assign_mneu(rrs.id)+remove_locat(rrs.id,rrs.location_name)+check_docu(rrs.id)+`</div></td>
                    
			    </tr>`
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
var settings_page = false;
var user_location_id="";
async function SettingsData(){
	if(settings_page==false){
		var script = document.createElement("script");
	    script.type = "text/javascript";
	    script.src = "/portal/assets/scripts/page/settings.js"; 
	    document.getElementsByTagName("head")[0].appendChild(script);
	    settings_page = true;
	}
	
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
	    if(users_supplier.position=="Super admin"){
	    	profile_button = `<button class="btn orange icon-right" onclick ="window.location.href='/supplier-profile'" style="float: right;">Profile
                    				<i class="bi bi-person-fill"></i>
                				</button>`;
            $('#setting-sup-header').append(profile_button); 
	    }
	    if(users_supplier.position!="Super admin"){
	    	document.getElementById('frmSettings').remove(); 
	    }
	    if(users_supplier.position=="Location Manager" || users_supplier.position=="Location User"){
	    	user_target = await userSingleInfo(JSON.parse(localStorage.loggedData).id);
	    	user_location_id = user_target.location_id;
	    	viewDocs();
	    }else document.getElementById('userLocationSetting').remove(); 
}
async function userSingleInfo(id){
	let parameter = {
		model: 'user',
		action: 'retrieve',
		condition: [
				['id','=',id]
			]
	};
	try {
	    var response  =  await sendhttpRequest(parameter);
	    return response.data[0];
	} catch(error) {
	        console.log("Error: ", error);
	} 

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
/* School */
var org_id;
async function getOrgName(id){
	let parameter = {
		    model: 'organiser',
	        action: 'retrieve',
	        field: ['name'],
	        condition: [
		        	["id", "=", id]
		        ]
	    }
	try {
	    var response =  await sendhttpRequest(parameter);
	    return response.data[0].name
	} catch(error) {
	    console.log("Error: ", error);
	} 
}
async function schooldata(org_id){
		let parameter = {
		    model: 'school',
	        action: 'retrieve',
	        retrieve: '*',
	        condition: [
		        	["org_id", "=", org_id]
		        ]
	    }
		try {
	    	var response =  await sendhttpRequest(parameter);
	    	ArrSchool = response.data;
	    	lnth = ArrSchool.length;
	    	rowtbl='';
	    	// var Arrfinances=[]; ai=0; 	
	    	for(i=0; i<lnth; i++){
	    		orgname = await getOrgName(ArrSchool[i].org_id);
	    		ArrSchool[i].org_id=orgname;
	    	};
	    	var tableBody = document
				  .getElementById("tblSchool")
				  .getElementsByTagName("tbody")[0];
			var rowsHtml = ArrSchool
			  .map(
			    (ArrSchool) =>
			      `<tr>
			        <td>${ArrSchool.name}</td>
			        <td>${ArrSchool.org_id}</td>
			        <td>${ArrSchool.website}</td>  
			        <td><div class="button-group"><button class="btn default icon-right" onclick="window.location.href = '/class?id=${ArrSchool.id}';">View Class <i class="bi bi-eye"></i></button>
			        <button class="btn default-3 icon-right" OnClick="window.location.href='/add-school?id=${ArrSchool.id}'">Edit <i class="bi bi-pencil-fill"></i></button>
                    <button id="rmv_school${ArrSchool.id}" class="btn red icon-right" OnClick="removeSchoool(${ArrSchool.id}, '${ArrSchool.name}')">Remove <i class="bi bi-trash-fill"></i></button></div></td>
			    </tr>`
			  )
			  .join("");

			tableBody.innerHTML = rowsHtml;
	    } catch(error) {
	        console.log("Error: ", error);
	    } 
}
async function runSchooldata(){
	if(localStorage.isOrganiser!='false'){
		orgD = getStorageItem('organiser');
		org_id = orgD[0]['id'];
		schooldata(org_id);
	}
}

async function rmSchool(id){
	let parameter = {
		    model: 'school',
	        action: 'delete',
	        condition: [
		        	["id", "=", id]
		        ]
	    };
	try {
	    	var response  =  await sendhttpRequest(parameter);
	    	orgD = getStorageItem('organiser');
			org_id = orgD[0]['id'];
	    	schooldata(org_id);
	    } catch(error) {
	        console.log("Error: ", error);
	    }     
}

function removeSchoool(id,name){
  let text = "Are you sure you want to remove school name: "+name+"?";
  if (confirm(text) == true) {
    rmSchool(id);
  } 
}
/* End of School */
/* School Class */
async function getSchoolName(id){
	let parameter = {
		    model: 'school',
	        action: 'retrieve',
	        field: ['name'],
	        condition: [
		        	["id", "=", id]
		        ]
	    }
	try {
	    var response =  await sendhttpRequest(parameter);
	    return response.data[0].name
	} catch(error) {
	    console.log("Error: ", error);
	} 
}
async function classdata(school_id){
		document.getElementById('link_to_create_class').href='/add-class?schoolid='+school_id;
		let parameter = {
		    model: 'class_',
	        action: 'retrieve',
	        retrieve: '*',
	        condition: [
		        	["school_id", "=", school_id]
		        ]
	    }
		try {
	    	var response =  await sendhttpRequest(parameter);
	    	ArrClass = response.data;
	    	lnth = ArrClass.length;
	    	rowtbl='';
	    	// var Arrfinances=[]; ai=0; 	
	    	for(i=0; i<lnth; i++){
	    		schoolname = await getSchoolName(school_id);
	    		ArrClass[i].schoolname=schoolname;
	    		// ArrClass[i].school_id=;
	    	};
	    	var tableBody = document
				  .getElementById("tblSchool")
				  .getElementsByTagName("tbody")[0];
			var rowsHtml = ArrClass
			  .map(
			    (ArrClass) =>
			      `<tr>
			        <td>${ArrClass.name}</td>
			        <td>${ArrClass.teacher_name}</td>
			        <td>${ArrClass.teacher_email}</td>  
			        <td>${ArrClass.schoolname}</td> 
			        <td><div class="button-group">
			        <button class="btn default-3 icon-right" OnClick="window.location.href='/add-class?id=${ArrClass.id}&schoolid=${ArrClass.school_id}'">Edit <i class="bi bi-pencil-fill"></i></button>
                    <button id="rmv_school${ArrClass.id}" class="btn red icon-right" OnClick="removeclass(${ArrClass.id}, '${ArrClass.name}')">Remove <i class="bi bi-trash-fill"></i></button></div></td>
			    </tr>`
			  )
			  .join("");

			tableBody.innerHTML = rowsHtml;
	    } catch(error) {
	        console.log("Error: ", error);
	    } 
}
async function runClassdata(){
	getID='';
	if(localStorage.isOrganiser!='false'){
		var user_create_url=window.location.href;
		var queryStart = user_create_url.indexOf("?")+1,
		queryEnd   = user_create_url.indexOf("#") + 1 || user_create_url.length + 1,
		query = user_create_url.slice(queryStart, queryEnd - 1),
		pairs = query.replace(/\+/g, " ").split("&"),
		parms = {}, i, n, v, nv;

		for (i = 0; i < pairs.length; i++) {
			nv = pairs[i].split("=", 2);
			n = decodeURIComponent(nv[0]);
			v = decodeURIComponent(nv[1]);

			if (!parms.hasOwnProperty(n)) parms[n] = [];
			parms[n].push(nv.length === 2 ? v : null);
		}
		if (typeof parms['id'] !== 'undefined') {
		   getID = parms['id'][0];
		   classdata(getID);
		}
	}
}
async function rmClass(id){
	let parameter = {
		    model: 'class_',
	        action: 'delete',
	        condition: [
		        	["id", "=", id]
		        ]
	    };
	try {
	    	var response  =  await sendhttpRequest(parameter);
	    	runClassdata();
	    } catch(error) {
	        console.log("Error: ", error);
	    }     
}

function removeclass(id,name){
  let text = "Are you sure you want to remove Class name: "+name+"?";
  if (confirm(text) == true) {
    rmClass(id);
  } 
}
/*end of class*/

/*customer profile*/
async function getcustoInfo(id){
	let parameter = {
		    model: 'customer',
	        action: 'retrieve',
	        condition: [
		        	["id", "=", id]
		        ],
	        retrieve: '*'
	    };
	try {
	    	var response  =  await sendhttpRequest(parameter);
	    	return response.data[0];
	    } catch(error) {
	        console.log("Error: ", error);
	    }     
}
async function getstudentfromcust(id){
	let parameter = {
		    model: 'student',
	        action: 'retrieve',
	        condition: [
		        	["customer_id", "=", id]
		        ],
	        retrieve: '*'
	    };
	try {
	    	var response  =  await sendhttpRequest(parameter);
	    	return response.data;
	    } catch(error) {
	        console.log("Error: ", error);
	    }     
}

async function getschool(num){
	let parameter = {
		    model: 'school',
	        action: 'retrieve',
	        retrieve:  '*'
	    };
	try {
		var response =  await sendhttpRequest(parameter);
		sch=response.data;
		console.log(num+': ', sch);
		lngSch = sch.length;
		for(ix=0; ix<lngSch; ix++){
			$('#schoolselectfield'+num).append('<div onclick="selectSchool_('+sch[ix]['id']+',\''+sch[ix]['name']+'\','+num+')" class="form-field-option">'+sch[ix]['name']+'</div>');
		}
	}catch(error) {
	    console.log("Error: ", error);
	}     
}
async function getschoolclass(id=null){
	if(id==null)con = [['id','!=',null]];
	else con = [['id','=',id]];
	let parameter = {
		    model: 'class_',
	        action: 'retrieve',
	        retrieve: '*',
	        condition : con
	    };
	try {
	    	var response  =  await sendhttpRequest(parameter);
	    	return response.data;
	    } catch(error) {
	        console.log("Error: ", error);
	    }     
}
async function getAllergens(){
	let parameter = {
		    model: 'allergen',
	        action: 'retrieve',
	        retrieve: '*'
	    };
	try {
	    	var response  =  await sendhttpRequest(parameter);
	    	return response.data;
	    } catch(error) {
	        console.log("Error: ", error);
	    }     
}
var custo_id='';
async function getImgOrg(org_id){
	let parameter = {
		    model: 'image',
	        action: 'retrieve',
	        fields: ['image'],
	        condition: [
	        			['model','=','organiser'],
	        			['model_id','=',org_id]
	        	]
	    };
	try {
	    	var response  =  await sendhttpRequest(parameter);
	    	return response.data[0].image;
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
async function getImgCus(cus_id){
	let parameter = {
		    model: 'image',
	        action: 'retrieve',
	        fields: ['image'],
	        condition: [
	        			['model','=','customer'],
	        			['model_id','=',cus_id]
	        	]
	    };
	try {
	    	var response  =  await sendhttpRequest(parameter);
	    	return response.data[0].image;
	    } catch(error) {
	        console.log("Error: ", error);
	    }     
}
async function loadprofile(){
	$('.tab-page').hide();
	$('#profiletab').show();
	custo = JSON.parse(localStorage.customer);
	custo_id = custo[0].id;
	cusInfo = await getcustoInfo(custo_id);
	document.getElementById('left-name').innerHTML  = cusInfo.first_name+' '+cusInfo.last_name;
	document.getElementById('left-phone').innerHTML  = cusInfo.mobile_number;
	document.getElementById('left-email').innerHTML  = cusInfo.email;

	document.getElementById('fname').value = cusInfo.first_name;
	document.getElementById('lname').value = cusInfo.last_name;
	document.getElementById('phone').value = cusInfo.mobile_number;
	document.getElementById('email').value = cusInfo.email;
	document.getElementById('bank').value = cusInfo.bank;
	document.getElementById('bsb').value = cusInfo.bsb;
	document.getElementById('abn').value = cusInfo.abn;
	document.getElementById('acn').value = cusInfo.acn;
	document.getElementById('account_name').value = cusInfo.account_name;
	document.getElementById('account_number').value = cusInfo.account_number;
	stu_cust= await getstudentfromcust(custo_id);

	get_img_from = await getImgCus(custo_id);
	document.getElementById('div_img').style.backgroundImage="url("+get_img_from+")";

	stu_length = stu_cust.length;
	stu_append ='';

	$('.child_').remove();
	for(i=0; i<stu_length; i++){
		stuAllergies = stu_cust[i].allergies;
		stuAllergies = stuAllergies.split(',');
		name_school = await getSchoolName(stu_cust[i].school);
		allergens = await getAllergens();
		lngallergens = allergens.length;
		btnAllergen = '';
		classSchool = await getschoolclass(stu_cust[i].class_id);
		classSchool = classSchool[0];
		stu_append = `<div id="child${i}" class="child-form form-group child_ col100 top20 bottom20">
                    <div class="space-btwn x-center bottom20 top20">
                        <div class="header-5">Child ${i+1}</div>
                        <button class="btn red icon-right" onclick="delThis(${i})">Delete <i class="bi bi-trash"></i></button>
                    </div>
                    <div class="form-group-row col100 flex">
                        <div class="form-field col50">
                            <div class="form-field-label">First Name</div>
                            <input type="hidden" id ="stu_id${i}" value="${stu_cust[i].id}">
                            <input class="form-field-input" id="stufname${i}" placeholder="First Name" value="${stu_cust[i].first_name}" required/>
                        </div>
                        <div class="form-field col50">
                            <div class="form-field-label">Last Name</div>
                            <input class="form-field-input" id="stulname${i}" placeholder="Last Name" value="${stu_cust[i].last_name}" required/>
                        </div>
                    </div>
                    <div class="form-group-row col100 flex">
                        <div class="form-field col70">
                            <div class="form-field-label">School</div>
                            <div class="x-center">
                            	<input id="stuschoolid${i}" style="display: none;" class="form-field-input" placeholder="School" required value="${stu_cust[i].school}"/>
                                <input class="form-field-input" placeholder="School" id="stuschool${i}" onInput="stuchooseSchool1(${i})" onclick="stuchooseSchool(${i})" value="${name_school}" required/>
                                <lord-icon src="https://cdn.lordicon.com/eeouelif.json" stroke="bold"
                                    colors="primary:#121331,secondary:#000000" style="width:30px;height:30px"
                                    class="form-field-icon">
                                </lord-icon>
                            </div>
                            <div class="form-field-options" style="display: none;" id ="schoolselectfield${i}">
                            </div>
                        </div>
                        <div class="form-field col30">
                            <div class="form-field-label">Class</div>
                            <div class="x-center">
                            	<input style="display:none" id="stuclassid${i}" value="${stu_cust[i].class_id}" required/>
                                <input class="form-field-input" readonly placeholder="Class" onclick="stuchooseClass(${i})" id="stuclass_${i}" value="${classSchool.name}" required/>
                                <lord-icon src="https://cdn.lordicon.com/nwkmdrya.json" stroke="bold"
                                    colors="primary:#121331,secondary:#000000" style="width:30px;height:30px"
                                    class="form-field-icon">
                                </lord-icon>
                            </div>
                            <div class="form-field-options" style="display: none;" id ="classselectfield${i}">
                            </div>
                        </div>
                    </div>
                    <div class="form-group-row col100 flex" style="margin-top: 50px;">
                        <div class="form-field-2 column col100 top10">
                            <div class="form-field-label-shown">
                                <span>Allergies</span>
                            </div>
                            <div class="form-field-tags" id="btnAllertab${i}">
							   
                            </div>
                            <div class="form-field-tags-selected" id="allergiesSection${i}"></div>
                        </div>
                    </div>
                </div>`;
        $('#childrentab').append(stu_append);
        sch = await getschool(i);
        for(x=0; x<lngallergens; x++){
			testid = allergens[x].id;
			allergens_ = allergens[x].name;
			idbtn = allergens_.toLowerCase(); 
			name_ =idbtn.replace('free',''); idbtn1=name_.trim(); idbtn1 = idbtn1.replace(' ','_');
			idbtn=idbtn1.trim();
			idbtn = idbtn.replace(' ','_'); 
			imgaller = allergens[x].image;
			if(stuAllergies.includes(testid.toString())){
				activeBtn = 'active';
				if(imgaller.includes('lordicon')){
					$('#allergiesSection'+i).append('<div id ="ico'+idbtn+'_btn_'+i+'" class="form-field-tags-selected-item">  <lord-icon src="'+imgaller+'"  style="width:50px;height:50px">  </lord-icon> <span>'+name_+'</span> </div>');
				}else $('#allergiesSection'+i).append('<div id = "ico'+idbtn+'_btn_'+i+'" class="form-field-tags-selected-item">  <img src="'+imgaller+'" style="width:50px;height:50px"/> <span>'+name_+'</span> </div>');
			}else activeBtn = '';
			btnAllergen +='<div id="'+idbtn+'_btn_'+i+'" onclick="funcAlerr(this.id,\''+imgaller+'\', \''+name_+'\')" class="form-field-tag '+activeBtn+'">'+name_+'</div>';
			
		}

        $('#btnAllertab'+i).append(btnAllergen);
	}
	
}
async function addChildren(){
	stu_append = `<div id="child${i}" class="child-form form-group child_ col100 top20 bottom20">
                    <div class="space-btwn x-center bottom20 top20">
                        <div class="header-5">Child ${i+1}</div>
                        <button type="button" class="btn red icon-right" onclick="delThis(${i})">Delete <i class="bi bi-trash"></i></button>
                    </div>
                    <div class="form-group-row col100 flex">
                        <div class="form-field col50">
                            <div class="form-field-label">First Name</div>
                            <input type="hidden" id ="stu_id${i}" value="x">
                            <input class="form-field-input" id="stufname${i}" placeholder="First Name" value="" required/>
                        </div>
                        <div class="form-field col50">
                            <div class="form-field-label">Last Name</div>
                            <input class="form-field-input" id="stulname${i}" placeholder="Last Name" value="" required/>
                        </div>
                    </div>
                    <div class="form-group-row col100 flex">
                        <div class="form-field col70">
                            <div class="form-field-label">School</div>
                            <div class="x-center">
                            	<input id="stuschoolid${i}" type="hidden" class="form-field-input" placeholder="School" required value=""/>
                                <input class="form-field-input" placeholder="School" id="stuschool${i}" onInput="stuchooseSchool1(${i})" onclick="stuchooseSchool(${i})" value="" required/>
                                <lord-icon src="https://cdn.lordicon.com/eeouelif.json" stroke="bold"
                                    colors="primary:#121331,secondary:#000000" style="width:30px;height:30px"
                                    class="form-field-icon">
                                </lord-icon>
                            </div>
                            <div class="form-field-options" style="display: none;" id ="schoolselectfield${i}">
                            </div>
                        </div>
                        <div class="form-field col30">
                            <div class="form-field-label">Class</div>
                            <div class="x-center">
                            	<input type="hidden" id="stuclassid${i}" value="" required/>
                                <input class="form-field-input" readonly placeholder="Class" onclick="stuchooseClass(${i})" id="stuclass_${i}" value="" required/>
                                <lord-icon src="https://cdn.lordicon.com/nwkmdrya.json" stroke="bold"
                                    colors="primary:#121331,secondary:#000000" style="width:30px;height:30px"
                                    class="form-field-icon">
                                </lord-icon>
                            </div>
                            <div class="form-field-options" style="display: none;" id ="classselectfield${i}">
                            </div>
                        </div>
                    </div>
                    <div class="form-group-row col100 flex" style="margin-top: 50px;">
                        <div class="form-field-2 column col100 top10">
                            <div class="form-field-label-shown">
                                <span>Allergies</span>
                            </div>
                            <div class="form-field-tags" id="btnAllertab${i}">
							   
                            </div>
                            <div class="form-field-tags-selected" id="allergiesSection${i}"></div>
                        </div>
                    </div>
                </div>`;
     $('#childrentab').append(stu_append);

     sch = await getschool(i);
     btnAllergen ='';
        for(xy=0; xy<lngallergens; xy++){
			allergens_ = allergens[xy].name;
			idbtn = allergens_.toLowerCase(); 
			name_ =idbtn.replace('free',''); idbtn1=name_.trim(); idbtn1 = idbtn1.replace(' ','_');
			idbtn=idbtn1.trim();
			idbtn = idbtn.replace(' ','_'); 
			imgaller = allergens[xy].image;
			btnAllergen +='<div id="'+idbtn+'_btn_'+i+'" onclick="funcAlerr(this.id,\''+imgaller+'\', \''+name_+'\')" class="form-field-tag">'+name_+'</div>';

		}
		$('#btnAllertab'+i).append(btnAllergen);
        

     i++;
}
function stuchooseSchool(num){
	document.getElementById('schoolselectfield'+num).style.display = 'block';
}
function stuchooseClass(num){
	document.getElementById('classselectfield'+num).style.display = 'block';
}
async function showtab(id){
	$(".tab-item").removeClass('active');
	$('#'+id).addClass('active');
	$('.tab-page').hide();
	$('#'+id+'tab').show();
	$('#success_update').hide();
	$('#inc_fields').hide();
	$('#error_submitting').hide();
}
async function funcAlerr(id,imgaller,name_){
	let btnAller = document.getElementById(id);
	exp = id.split('_btn_');
	num = parseInt(exp[1]);
	if(btnAller.classList.contains("active")){
		document.getElementById('ico'+id).remove();
		btnAller.classList.remove('active');
	}else{
		btnAller.classList.add('active');
		if(imgaller.includes('lordicon')){
			$('#allergiesSection'+num).append('<div id ="ico'+id+'" class="form-field-tags-selected-item">  <lord-icon src="'+imgaller+'"  style="width:50px;height:50px">  </lord-icon> <span>'+name_+'</span> </div>');
		}else $('#allergiesSection'+num).append('<div id = "ico'+id+'" class="form-field-tags-selected-item">  <img src="'+imgaller+'" style="width:50px;height:50px"/> <span>'+name_+'</span> </div>');
	}
	
}
async function selectSchool_(id,name,num){
	$('#schoolselectfield'+num).hide();
	document.getElementById('stuschoolid'+num).value = id;
	document.getElementById('stuschool'+num).value = name;
	document.getElementById('stuclassid'+num).value = '';
	document.getElementById('stuclass_'+num).value = '';
	$('.class-value'+num).remove();
	let parameter = {
		    model: 'class_',
	        action: 'retrieve',
	        retrieve:  '*',
	        condition:[
	        		['school_id','=',id]
	        	]
	    };
	try {
		var response =  await sendhttpRequest(parameter);
		classdata = response.data;
		lngthcls = classdata.length;
		for(iy=0; iy<lngthcls; iy++){
			$('#classselectfield'+num).append('<div onclick="selectclass_('+classdata[iy].id+',\''+classdata[iy].name+'\','+num+')" class="form-field-option class-value'+num+'">'+classdata[iy].name+'</div>');
		}
	}catch(error) {
	    console.log("Error: ", error);
	}     
}
function selectclass_(id,name,num){
	$('#classselectfield'+num).hide();
	document.getElementById('stuclassid'+num).value = id;
	document.getElementById('stuclass_'+num).value = name;
}

async function customerProfile(event){
	event.preventDefault();
	showLoading();
	let first_name = event.target['fname'].value;
	let last_name = event.target['lname'].value;
	let phone = event.target['phone'].value;
	let email = event.target['email'].value;
	let bank = event.target['bank'].value;
	let bsb = event.target['bsb'].value;
	let abn = event.target['abn'].value;
	let acn = event.target['acn'].value;
	let account_name = event.target['account_name'].value;
	let account_number = event.target['account_number'].value;
	let parameter = {
				    model: 'customer',
			        action: 'update',
			        condition:[
			        	["id", "=", custo_id ]
			        ],
			        update: { 
			        		'first_name': first_name, 
			        		'last_name': last_name,
			        		'mobile_number': phone,
			        		'email': email, 
			        		'bank': bank,
			        		'bsb': bsb,
			        		'abn': abn, 
			        		'acn': acn,
			        		'account_name': account_name,
			        		'account_number': account_number
			        	}
			    	};
	try {
		var response = await sendhttpRequest(parameter);
		for(t=0; t<i; t++){
			if(document.getElementById('stu_id'+t).value!='x')stuSavethis = await update_stu(t);
			else stuSavethis = await add_stu(t);
		}
		$('#success_update').show();
	} catch(error) {
		console.log("Error: ", error);
		$('#error_submitting').show();
	}   
	globalThis.scrollTo({ top: 0, left: 0, behavior: "smooth" });  
	setTimeout(
	closeLoading 
	, 50); 
}
async function add_stu(num){
	id = document.getElementById('stu_id'+num).value;
	first_name = document.getElementById('stufname'+num).value;
	last_name = document.getElementById('stulname'+num).value;
	school = document.getElementById('stuschoolid'+num).value;
	class_id = document.getElementById('stuclassid'+num).value;
	allergens = await getAllergens();
	length_allergens= allergens.length;
	allergiestxt ='';
	for(allerC=0; allerC<length_allergens; allerC++){
		allergens_ = allergens[allerC].name;
		idbtn = allergens_.toLowerCase(); 
		name_ =idbtn.replace('free',''); idbtn1=name_.trim(); idbtn1 = idbtn1.replace(' ','_');
		idbtn=idbtn1.trim();
		idbtn = idbtn.replace(' ','_'); 

		let btnAller = document.getElementById(idbtn+'_btn_'+num);

		if(btnAller.classList.contains("active")){
			if(allerC==0)allergiestxt += allergens[allerC].id;
			else allergiestxt += ','+allergens[allerC].id;
		}
	}
	let parameter = {
			model: 'student',
			action: 'insert',
			insert: { 
						'customer_id': custo_id,
			        	'first_name': first_name, 
			        	'last_name': last_name,
			        	'school': school,
			        	'class_id' : class_id,
			        	'allergies': allergiestxt
			        }
	};
	try {
		var response = await sendhttpRequest(parameter);
	} catch(error) {
		console.log("Error: ", error);
	}      
}
async function update_stu(num){
	id = document.getElementById('stu_id'+num).value;
	first_name = document.getElementById('stufname'+num).value;
	last_name = document.getElementById('stulname'+num).value;
	school = document.getElementById('stuschoolid'+num).value;
	class_id = document.getElementById('stuclassid'+num).value;
	allergens = await getAllergens();
	length_allergens= allergens.length;
	allergiestxt ='';
	for(allerC=0; allerC<length_allergens; allerC++){
		allergens_ = allergens[allerC].name;
		idbtn = allergens_.toLowerCase(); 
		name_ =idbtn.replace('free',''); idbtn1=name_.trim(); idbtn1 = idbtn1.replace(' ','_');
		idbtn=idbtn1.trim();
		idbtn = idbtn.replace(' ','_'); 

		let btnAller = document.getElementById(idbtn+'_btn_'+num);
		console.log(idbtn+'_btn_'+num);
		if(btnAller.classList.contains("active")){
			if(allerC==0)allergiestxt += allergens[allerC].id;
			else allergiestxt += ','+allergens[allerC].id;
		}
	}
	let parameter = {
			model: 'student',
			action: 'update',
			    condition:[
			        	["id", "=", id ]
			        ],
			    update: { 
			        		'first_name': first_name, 
			        		'last_name': last_name,
			        		'school': school,
			        		'class_id' : class_id,
			        		'allergies': allergiestxt
			        	}
	};
	try {
		var response = await sendhttpRequest(parameter);
	} catch(error) {
		console.log("Error: ", error);
	}      
}
async function delThis(num){
	idx = document.getElementById('stu_id'+num).value;
	fname = document.getElementById('stufname'+num).value;
	lname =document.getElementById('stulname'+num).value
	if(idx!='x'){
		let text = "Are you sure you want to remove student: "+fname+" "+lname+"?";
		  if (confirm(text) == true) {
		    rm_stu(idx);
		  } 
	}else{
		loadprofile();
	} 
	$('.tab-page').hide();
	$('#childrentab').show();

}


async function rm_stu(id){
	let parameter = {
		    model: 'student',
	        action: 'delete',
	        condition: [
		        	["id", "=", id]
		        ]
	    };
	try {
	    	var response  =  await sendhttpRequest(parameter);
	    	loadprofile();
	    	$(".tab-item").removeClass('active');
			$('#profile').addClass('active');
	    } catch(error) {
	        console.log("Error: ", error);
	    }     
}
async function checking_img(model_id){
		    let parameter = {
				model: 'image',
				action: 'retrieve',
				retrieve: '*',
				condition: [
					['model','=','customer'],
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
async function uploadImage(input){
	readfiles(input.files);
}
async function processSlice(Arrimg){
	showLoading(custo_id);
		checking_img_ = await checking_img(custo_id);
		length_img = Arrimg.length;
		if(checking_img_==0){

		    let parameter = {
				model: 'image',
				action: 'insert',
				insert: { 
				        	'model': 'customer', 
				        	'model_id': custo_id,
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
						var sendingIMG = await sendslice_img(response['id'], slice, 'image');
						i_img++;
					}
				}
				loadprofile();
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
						['model','=','customer'],
						['model_id','=',custo_id]
					]
			};
			try {
				var response = await sendhttpRequest(parameter);
				if(response['code']==200){		
					i_img=1; 
					while(i_img<length_img){
					    slice = Arrimg[i_img];
						var sendingIMG = await sendslice_img(checking_img_, slice, 'image');
						i_img++;
					}
				}
				loadprofile();
			} catch(error) {
				console.log("Error: ", error);
			}  
		}
			
	setTimeout(
		closeLoading 
		, 50);    
}
async function sendslice_img(id, slice, which){
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

function processfile(file) {
  	fileName = document.querySelector('#cus_img_file').value; 
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

        var resized = resizeMe(image,extension); 
        Arrimg=resized.match(/.{1,3000}/g);
		processSlice(Arrimg);

      }
    };
}

function readfiles(files) {
  
    for (var i_ = 0; i_ < files.length; i_++) {
      processfile(files[i_]); 
    }

}

function resizeMe(img,ext_) {
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
/*end of customer profile*/

/** For global use i.e image uploads, search, etc. **/

let imageParts;
let imageUpload = false;

let user_data, uID, user_id, owner_id; // set globally the ID of logged in user

let MSL_GLOBAL = {

	main: {

		test: async () => {

			console.log("app.js - 797");
		},

		setUID: () => {
			console.log(localStorage);
			
			let userData = JSON.parse(localStorage.loggedData);

			switch (parseInt(userData.usertype)) {

				case 2:
					user_data = JSON.parse(localStorage.supplier);

					user_id = (typeof user_id === "undefined") ? user_data[0].id : user_data[0].id;
					owner_id = (typeof owner_id === "undefined") ? user_data[0].owner_id : user_data[0].owner_id;

					break;

				case 3: // organiser

					user_data = JSON.parse(localStorage.organiser);

					user_id = (typeof user_id === "undefined") ? user_data[0].id : user_data[0].id;
					owner_id = (typeof owner_id === "undefined") ? user_data[0].owner_id : user_data[0].owner_id;

					break;

				default:

					user_data = JSON.parse(localStorage.customer);

					user_id = (typeof user_id === "undefined") ? user_data[0].id : user_data[0].id;
					owner_id = (typeof owner_id === "undefined") ? user_data[0].owner_id : user_data[0].owner_id;

					$('.global-search').hide();

					break;

			}

			console.log(user_id+" - "+owner_id);

		},

		callPageJS: (page) => {
			// console.log("page", page);

			// // Remove the old script if it exists
		    // $('#pageJs').remove();

		    // // Create a new script element
		    // let script = document.createElement('script');
		    // script.id = 'pageJs';
		    // script.src = `http://localhost:3001/portal/assets/scripts/page/pantry.js`; // Dynamically load based on `page`

		    // // Attach load and error events to the script
		    // script.onload = function() {
		    //     console.log('Script has been fully loaded: ', script.src);
		    //     // Additional logic after script is loaded
		    // };

		    // script.onerror = function() {
		    //     console.log('Failed to load the script: ', script.src);
		    // };

		    // // Append the script to the <head> or <body>
		    // document.head.appendChild(script);

			setTimeout(() => {

				if (typeof $("#pageJs").attr("src") !== "undefined") {

					switch (page) {

						case 'ingredients':
							Pantry.main.showTabPane('ingredients');
							Pantry.main.tabPanes();
							break;

						case 'bookings':
							Booking.main.onLoad();
							break;

						case 'customer-booking':
							Customer.main.onLoad();
							break;

						case 'customer-customize-meals':
							Booking.main.onLoad();
							break;

						default:
							break;

					}

				}

			},0);

		},

		generateRandomString: (length) => {
	        // Define the characters to be used (alphanumeric only)
	        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	        let randomString = '';

	        // Loop to create the random string of the desired length
	        for (let i = 0; i < length; i++) {
	            // Pick a random character from the characters string
	            const randomIndex = Math.floor(Math.random() * characters.length);
	            randomString += characters[randomIndex];
	        }

	        return randomString;
	    },

		checkFormValidity: (form) => {

            // Check form validity
            if (!form[0].checkValidity()) {
                // If the form is invalid, prevent the default form submission and show validation messages
                form[0].reportValidity(); // This will show the browser's built-in validation messages
                return false;
            }

            return true;

        },

        showAlert: async (wrapper, alert, message) => {

        	$('.'+wrapper).html(`<div class="alert alert-${alert}">${message}</div>`);
        	window.scrollTo({
                top: 0,
                left: 0,
                behavior: 'smooth' // Optional: Use 'smooth' for a smooth scrolling effect
            });

            setTimeout(() => {
				$('.'+wrapper).html(``);
            },3000);
        },

		closeModal: async (modal_class) => {
			$('.'+modal_class).hide();
			$('.'+modal_class+' .custom-modal').hide();
		},

		formatDateToText: (dateString) => {

			dateString = new Date(dateString);

			const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
			const month = months[dateString.getMonth()];

			return month+", "+dateString.getDate()+" "+dateString.getFullYear();

		},

		selectImage: async (e) => {
			console.log("selectImage begin::");
            let image = $(e).data("image");
            let textarea = $("#textarea_"+$(e).data("image"));

            if (e.files && e.files[0]) {
            var reader = new FileReader();
            reader.onload = function (d) {
                textarea.text(d.target.result);
              	MSL_GLOBAL.main.initCropper(image, textarea.text());
            };

            reader.readAsDataURL(e.files[0]);
          }

		  console.log("selectImage end::");

        },

        initCropper: async (image, image_val) => {
			console.log("initCropper begin::");
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
          .modal('show');

          $("#crop_popup .crop-it").on("click", (e) => {
            const blobDataURL = cropper.getImage('PNG'); // JPEG, PNG, ...
            console.dir("image: " + image);
            switch(image) {

                case "product": 
                    image_style = "margin-left:37%;"; //project_bug_4
                    break;
				case 'ingredient': 
					image_style = "margin-left: 37%;" 
					break;
				case 'mealdeal':
					image_style = "margin-left: 37%;"
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

            if ($('input#is_changed_'+image).length == 0) $("#textarea_"+image).after(`<input type="hidden" id="is_changed_${image}" value="1">`);
            else $("input#is_changed_"+image).val(1);

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

		  console.log("initCropper end::");

        },

        splitBase64String: (base64String, chunkSize) => {
            let parts = [];
            for (let i = 0; i < base64String.length; i += chunkSize) {
                parts.push(base64String.substring(i, i + chunkSize));
            }
            return parts;
        },

        uploadBase64Part: async (model, table, id, part, which) => {
            let parameter = {
                model: model,
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

        },

        uploadImageSequentially: async (model, table, id, parts, part, which, form) => {

            for (let n = part; n < parts.length; n++) {
                try {
                    let response = await MSL_GLOBAL.main.uploadBase64Part(model, table, id, parts[n], which);
                    if (response) {
                        //if (n == (parts.length - 1)) MSL_GLOBAL.main.cleanForm(form, '' , ''); 
                        console.log(`Part ${n} of ${parts.length} is uploaded`);
                    }
                } catch (error) {
                    console.log("Error: ", error);
                }
            }

        },

        /*
			* Global Modal for OH
        */

        globalModal: (type, task, title, message) => {

        	//clear and set the type of modal i.e success, warning, danger
        	$("#staticBackdrop .modal-header").removeClass((index, className) => {
        		return (className.match(/\bbg-\S+/g) || []).join(' ');
        	});

        	$("#staticBackdrop .modal-header").addClass(" bg-"+type);

        	$("#staticBackdrop .modal-footer button:last").removeClass((index, className) => {
        		return (className.match(/\bbtn-\S+/g) || []).join(' ');
        	});

        	$("#staticBackdrop .modal-footer button:last").addClass(" btn-"+type);

        	//set the modal title
        	$("#staticBackdrop .modal-title").html(title);
        	$("#staticBackdrop .modal-body p.message").html(message);

        	//set buttons based from task i.e submission, successful or failed
        	if (task == "submission") { // for submission
        		
        		$('#staticBackdrop .modal-body p.modal-icon').html('<div class="spinner-border text-'+type+' m-2" role="status" style="margin: 20px auto !important;display: block;"></div>');
        		$("#staticBackdrop .modal-header button").hide();
        		$("#staticBackdrop .modal-footer").hide();

        	} else { // for success or danger/failed

        		if ($('#staticBackdrop .modal-body .spinner-border').length > 0) $('#staticBackdrop .modal-body .spinner-border').remove();
        		
        		if (task == "succesful") {
        			$('#staticBackdrop .modal-body p.modal-icon').html('<i class="ri-check-line h1" style="color: #17a497;"></i></i>');
        		} else {
        			$('#staticBackdrop .modal-body p.modal-icon').html('<i class="ri-close-circle-line h1" style="color: #f7473a;"></i>');
        		}

        		$("#staticBackdrop .modal-header button").show();
        		$("#staticBackdrop .modal-footer button:first").hide();
        		$("#staticBackdrop .modal-footer button:last").text('Okay').attr('data-bs-dismiss','modal').show();

        	}

			$("#staticBackdrop").modal('show');


        },

        confirmAlertModal: (type, task, title, message) => {

			return new Promise((resolve, reject) => {

				//clear and set the type of modal i.e success, warning, danger
	        	$("#staticBackdrop .modal-header").removeClass((index, className) => {
	        		return (className.match(/\bbg-\S+/g) || []).join(' ');
	        	});

	        	$("#staticBackdrop .modal-header").addClass(" bg-"+type);

	        	$("#staticBackdrop .modal-footer button:last").removeClass((index, className) => {
	        		return (className.match(/\bbtn-\S+/g) || []).join(' ');
	        	});

	        	$("#staticBackdrop .modal-footer button:last").addClass(" btn-"+type);

	        	//set the modal title
	        	$("#staticBackdrop .modal-title").html(title);
	        	$("#staticBackdrop .modal-body p.modal-icon").html('<i class="ri-information-line h1 text-info"></i>');
	        	$("#staticBackdrop .modal-body p.message").html(message);

	        	//set modal footer buttons
	        	$("#staticBackdrop .modal-footer button:first").text("No");
	        	$("#staticBackdrop .modal-footer button:last").text("Yes");

	        	// If "No" is clicked, reject the promise
		       	$("#staticBackdrop .modal-footer button:first").off('click').on('click', function() {
					$("#staticBackdrop").modal('hide');
		            resolve(false);
		        });

		       	// If "yes" is clicked, resolve the promise
		        $("#staticBackdrop .modal-footer button:last").off('click').on('click', function() {
					$("#staticBackdrop").modal('hide');
		            resolve(true);
		        });


				$("#staticBackdrop").modal('show');

			});

        }
        
	}

}

MSL_GLOBAL.main.setUID();
/*end of class*/


var supp_dash = false;
var tableupcoming_ = false;
function loadSdashboard(){
	if(supp_dash ==false){
		var script = document.createElement("script");
	    script.type = "text/javascript";
	    script.src = "/portal/assets/scripts/page/supplier-dashboard.js"; 
	    document.getElementsByTagName("head")[0].appendChild(script);
	    supp_dash=true; 
	}else{
		tableupcoming();
	} 

}
var cus_dash = false;
var tableCupcoming_ = false;
function loadCdashboard(){
	if(cus_dash ==false){
		var script = document.createElement("script");
	    script.type = "text/javascript";
	    script.src = "/portal/assets/scripts/page/customer-dashboard.js"; 
	    document.getElementsByTagName("head")[0].appendChild(script);
	    cus_dash=true; 
	}else{
		tableCupcoming();
	} 

}

var org_dash = false;
var tableOupcoming_ = false;
function loadOdashboard(){
	if(org_dash ==false){
		var script = document.createElement("script");
	    script.type = "text/javascript";
	    script.src = "/portal/assets/scripts/page/organizer-dashboard.js"; 
	    document.getElementsByTagName("head")[0].appendChild(script);
	    org_dash=true; 
	}else{
		tableOupcoming();
	} 
}