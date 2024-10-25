
var getID='';
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
	}
	if(getID==''){
		document.getElementById('resetpasswordpage').remove();
		alert('Invalid Request');
	}
async function resetPassword(event){
	event.preventDefault();
	pass1 = event.target['pass1'].value;
	pass2 = event.target['pass2'].value;
	if(pass1==pass2){
		showLoading();
		let parameter = {
				model: 'user',
			    action: 'update',
			    condition:[
			        	["id", "=", getID ]
			     ],
			        update: { 'password': encodePass(pass1) }
			 };
		try {
			   var response = await sendhttpRequest(parameter);
			   wl = location.href;
			   shwp = wl.split('resetpassword');
			   window.location.href=shwp[0];
		} catch(error) {
			    console.log("Error: ", error);
		}  
		setTimeout(
	closeLoading 
	, 50);    
	}else{
		alert('Password & Retype Password is not equal.');
	}
	
}