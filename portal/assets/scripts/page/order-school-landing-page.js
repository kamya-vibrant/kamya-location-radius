getID='';
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
if (typeof parms['id'] !== 'undefined') getID = parms['id'][0];

async function get_customer(id){
	let parameter = {
		    model: 'student',
	        action: 'retrieve',
	        condition: [
		        	["customer_id", "=", id]
		        ]
	    };
	try {
	    	var response  =  await sendhttpRequest(parameter);
	    	if(response.code=='200'){
	    		stud = response.data;
	    		lstud = stud.length;
	    		schoolids=[]; element_sc='';
	    		for(i=0; i<lstud; i++){
	    			if(!schoolids.includes(stud[i].school)){
	    				schoolids.push(stud[i].school);
	    				schoolINF = await Get_school(stud[i].school);
	    				element_sc +=`<div class="hero-global-option" onclick ="window.location='/customer-booking?id=${getID}&schoolid=${schoolINF.id}'">${schoolINF.name}</div>`;
	    			}
	    		}
	    		$('#sel_school').append(element_sc);
	    		cssx = `.hero-global-option:hover{
					        color:blue !important;
					    }`;
			    var style = document.createElement('style');

				if (style.styleSheet) {
				    style.styleSheet.cssText = cssx;
				} else {
				    style.appendChild(document.createTextNode(cssx));
				}

				document.getElementsByTagName('head')[0].appendChild(style);

	    	}
	    } catch(error) {
	        console.log("Error: ", error);
	    }     
}
async function Get_school(id){
	let parameter = {
		    model: 'school',
	        action: 'retrieve',
	        condition: [
		        	["id", "=", id]
		        ]
	    };
	try {
	    	var response  =  await sendhttpRequest(parameter);
	    	return response.data[0];
	    } catch(error) {
	        console.log("Error: ", error);
	    }     
}
if(getID!='')get_customer(getID);