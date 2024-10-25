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
		thislocation = await locationFromID(getID);
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
			objElement = `<tr>
	                        <td>Public Liability Insurance</td>
	                        <td>${objpli}</td>
	                        <td>${thislocation.pli_expiry_date}</td>
	                        <td><button Onclick="downloadfile('${plistr}')" class="btn default">Download</button></td>
	                    </tr>
	                    <tr>
	                        <td>Food Safety License</td>
	                        <td>${objfsl}</td>
	                        <td>${thislocation.fsl_expiry_date}</td>
	                        <td><button Onclick="downloadfile('${fslstr}')" class="btn default">Download</button></td>
	                    </tr>`;
			$('#tblLocationdocs').append(objElement);
		}
	}
		
}
viewDocs();