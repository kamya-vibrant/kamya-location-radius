var ArrLocation;
var getID='';
async function Locations(){
let parameter = {
		    model: 'location',
	        action: 'retrieve',
	        fields:  ['location_name','id']
	    };
	try {
	    	var response =  await sendhttpRequest(parameter);
	    	ArrLocation = response.data;
	    	var min = 0,
			    max = Object.keys(ArrLocation).length;
			    select = document.getElementById('location');
			for (var i = min; i<max; i++){
			    var opt = document.createElement('option');
			    opt.value = ArrLocation[i].id;
			    opt.innerHTML = ArrLocation[i].location_name;
			    select.appendChild(opt);
			}
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
				setTimeout(()=>parms,1000);
			    infoUser= await UsersGet(parms['id']);
			    getID = parms['id'][0];
			}
	    } catch(error) {
	        console.log("Error: ", error);
	    }     
} 
Locations();
async function UsersGet(id){
id = id[0];
let parameter = {
		    model: 'user',
	        action: 'retrieve',
	        retrieve:  '*',
	        condition: [
		        	["id", "=", id ]
		        ]
	   
	    }
	try {
	    	var response =  await sendhttpRequest(parameter);
	    	infoUser = response.data;

		    document.getElementById("first_name").value = infoUser[0].first_name;
		    document.getElementById("last_name").value = infoUser[0].last_name;
		    document.getElementById("email").value = infoUser[0].email;
		    if(infoUser[0].position=="Admin")postion_Change('Admin');
		    else document.getElementById("location").value = infoUser[0].location_id;
		    
		    document.getElementById("phone").value = infoUser[0].phone;
		    if(infoUser[0].location_id==0 && infoUser[0].supplier_id==0 && infoUser[0].verification_char!=''){

		    	postion_Change('Super admin');

		    	document.getElementById('position').disabled=true;
		    }else document.getElementById("position").value = infoUser[0].position; 
		    

		    document.getElementById("h2_user_create_page").innerText = "Update Registration";
		    document.getElementById("submit").innerText = "Update";
		    document.getElementById("p_user_create_page").innerText  = "Updating account of "+infoUser[0].first_name+" "+infoUser[0].last_name+" ";
	    	document.getElementById("retype-password").removeAttribute("required");
	    	document.getElementById("password").removeAttribute("required");
	    } catch(error) {
	        console.log("Error: ", error);
	    }     
} 
async function checkEmailExist(email){
	let parameter = {
		    model: 'user',
	        action: 'retrieve',
	        fields:  ['email'],
	        condition:[
	        		['email','=',email]
	        	]
	    };
	try {
		var response =  await sendhttpRequest(parameter);
		rentundata = response.data;
		return rentundata.length;
		
	}catch(error) {
	    console.log("Error: ", error);
	}     
}
Supplier_=JSON.parse(localStorage.supplier);
async function registerSupplierEmployee(event){
	event.preventDefault();
	let first_name = event.target['first_name'].value;
	let last_name = event.target['last_name'].value;
	let email = event.target['email'].value;
	let phone = event.target['phone'].value;
	let position = event.target['position'].value;
	let location_id = event.target['location'].value;
	let password = event.target['password'].value;
	let retype_password = event.target['retype-password'].value;
	showLoading();
	if(getID != ''){
		id = getID; 
		if(password===retype_password){
			if(password!=''){
				ursData = { 
			        		'first_name': first_name, 
			        		'last_name': last_name,
			        		'email': email,
			        		'phone': phone,
			        		'position':position,
			        		'location_id': location_id,
			        		'password': encodePass(password),
			        		'usertype': 2
			        	}
			}else{
				ursData = { 
			        		'first_name': first_name, 
			        		'last_name': last_name,
			        		'email': email,
			        		'phone': phone,
			        		'position':position,
			        		'location_id': location_id,
			        		'usertype': 2
			        	}
			}
			let parameter = {
				    model: 'user',
			        action: 'update',
			        condition:[
			        	["id", "=", id ]
			        ],
			        update: ursData
			    	};
			try {
			    var response = await sendhttpRequest(parameter);

			    	window.location.href="/users";
			    } catch(error) {
			        console.log("Error: ", error);
			    }      
		}else{
			alert("Password is not equal to Re-type Password!");
		}
	}else{
		checkEmail = await checkEmailExist(email);
		if(checkEmail==0){
			if(password===retype_password){
				let parameter = {
				    model: 'user',
			        action: 'register',
			        insert: { 
			        			'first_name': first_name, 
			        			'last_name': last_name,
			        			'email': email,
			        			'phone': phone,
			        			'position':position,
			        			'location_id': location_id,
			        			'supplier_id': Supplier_id_,
			        			'password': encodePass(password),
			        			'usertype': 2
			        		}
			    };
			try {
			    var response = await sendhttpRequest(parameter);

			    	window.location.href="/users";
			    } catch(error) {
			        console.log("Error: ", error);
			    }      
			}else{
				alert("Password is not equal to Re-type Password!");
			}
		}
		else alert('email already Exist!');
			
	}
	setTimeout(
	closeLoading 
	, 50);

}
function postion_Change(Pvalue){
  
	if(Pvalue=='Admin' || Pvalue=='Super admin'){

		document.getElementById('location').disabled=true;
		document.getElementById('location').value='';
	} 
	else document.getElementById('location').disabled=false;
}