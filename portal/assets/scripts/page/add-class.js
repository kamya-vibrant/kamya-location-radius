var getID='';
var schoolid ='';
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
	console.log(parms);
	if (typeof parms['schoolid'] !== 'undefined')schoolid=parms['schoolid'][0];
	if (typeof parms['id'] !== 'undefined') {
		getID = parms['id'][0];
		procs = await processClass(getID);
		
		document.getElementById("h2_class_create_page").innerText = "Update Class";
		document.getElementById("submit").innerText = "Update";
		document.getElementById("p_class_create_page").innerText  = "Updating Class name: "+procs[0].name+" , Teacher: "+procs[0].teacher_name+" ";
	}
}
testpage();
async function processClass(getID){
	proc = await getClassdata(getID);
	// console.log('sfdsfdsfdfdsf :',proc);
	return proc;
}


async function getClassdata(id){
	let parameter = {
		    model: 'class_',
	        action: 'retrieve',
	        retrieve: '*',
	        condition: [
		        	["id", "=", id]
		        ]
	   
	    }
	try {
	    	var response =  await sendhttpRequest(parameter);
	    	infoClass = response.data;
		    document.getElementById("name").value = infoClass[0].name;
		    document.getElementById("teacher_name").value = infoClass[0].teacher_name;
		    document.getElementById("teacher_email").value = infoClass[0].teacher_email;
		    return infoClass;

	    } catch(error) {
	        console.log("Error: ", error);
	    }     
}
orgD=getStorageItem('organiser');

async function addClass(event){
	event.preventDefault();


	let org_id = orgD[0].id;
	let name = event.target['name'].value;
	let teacher_name = event.target['teacher_name'].value;
	let teacher_email = event.target['teacher_email'].value;
	if(getID!==''){
		let parameter = {
				    model: 'class_',
			        action: 'update',
			        condition:[
			        	["id", "=", getID ]
			        ],
			        update: { 
			        		'name': name, 
			        		'teacher_email': teacher_email,
			        		'teacher_name': teacher_name
			        	}
			    	};
		try {
			    var response = await sendhttpRequest(parameter);
			    window.location.href="/class?id="+schoolid;
		} catch(error) {
			    console.log("Error: ", error);
		}      
	}else{
		let parameter = {
				    model: 'class_',
			        action: 'insert',
			        insert: { 
			        		'name': name, 
			        		'teacher_email': teacher_email,
			        		'teacher_name': teacher_name,
			        		'org_id': org_id,
			        		'school_id': schoolid

			        	}
			    	};
		try {
			    var response = await sendhttpRequest(parameter);
			    window.location.href="/class?id="+schoolid;
		} catch(error) {
			    console.log("Error: ", error);
		}      
	}
}