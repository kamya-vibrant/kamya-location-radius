var getID='';
async function testpage(){
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
		procs = await processSchool(getID);
		document.getElementById("h2_school_create_page").innerText = "Update School";
		document.getElementById("submit").innerText = "Update";
		document.getElementById("p_school_create_page").innerText  = "Updating School name: "+procs[0].name+" , Domain: "+procs[0].website+" ";
	}
}
testpage();
async function processSchool(getID){
	proc = await getSchooldata(getID);
	return proc;
}


async function getSchooldata(id){
	let parameter = {
		    model: 'school',
	        action: 'retrieve',
	        retrieve:  '*',
	        condition: [
		        	["id", "=", id ]
		        ]
	   
	    }
	try {
	    	var response =  await sendhttpRequest(parameter);
	    	infoSchool = response.data;

		    document.getElementById("school_name").value = infoSchool[0].name;
		    document.getElementById("domain").value = infoSchool[0].website;
		    return infoSchool;

	    } catch(error) {
	        console.log("Error: ", error);
	    }     
}
orgD=getStorageItem('organiser');

async function addSchool(event){
	event.preventDefault();

	let owner_id =orgD[0].owner_id;
	let org_id = orgD[0].id;
	let name = event.target['school_name'].value;
	let domain = event.target['domain'].value;
	if(getID!==''){
		let parameter = {
				    model: 'school',
			        action: 'update',
			        condition:[
			        	["id", "=", getID ]
			        ],
			        update: { 
			        		'name': name, 
			        		'website': domain,
			        	}
			    	};
		try {
			    var response = await sendhttpRequest(parameter);
			    window.location.href="/school";
		} catch(error) {
			    console.log("Error: ", error);
		}      
	}else{
		let parameter = {
				    model: 'school',
			        action: 'insert',
			        insert: { 
			        		'name': name, 
			        		'website': domain,
			        		'org_id': org_id,
			        		'owner_id': owner_id
			        	}
			    	};
		try {
			    var response = await sendhttpRequest(parameter);
			    window.location.href="/school";
		} catch(error) {
			    console.log("Error: ", error);
		}      
	}
}