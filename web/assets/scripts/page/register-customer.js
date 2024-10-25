var stu=0;

$('#login-modal').hide();
async function loadSchool(num){
	let parameter = {
		    model: 'school',
	        action: 'retrieve',
	        retrieve:  '*'
	    };
	try {
		var response =  await sendhttpRequest(parameter);
		sch=response.data;
		lngSch = sch.length;
		for(i=0; i<lngSch; i++){
			$('#schoolselectfield'+num).append('<div onclick="selectSchool('+sch[i]['id']+',\''+sch[i]['name']+'\','+num+')" class="form-field-option">'+sch[i]['name']+'</div>');
		}
	}catch(error) {
	    console.log("Error: ", error);
	}     
}
loadSchool(0);
loadAllegiesbtn(0);
async function selectSchool(id,name,num){
	$('#schoolselectfield'+num).hide();
	document.getElementById('cSschoolid'+num).value = id;
	document.getElementById('cSschool'+num).value = name;
	document.getElementById('cSschool'+num).value = name;
	document.getElementById('cSclass'+num).value = '';
	// document.getElementById('cSclassid'+num).value = '';
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
		for(i=0; i<lngthcls; i++){
			$('#classselectfield'+num).append('<div onclick="selectclass('+classdata[i].id+',\''+classdata[i].name+'\','+num+')" class="form-field-option class-value'+num+'">'+classdata[i].name+'</div>');
		}
	}catch(error) {
	    console.log("Error: ", error);
	}     
}
var allerg=[{'seafoods': 0 , 'nuts': 0, 'coconut': 0, 'gluten': 0, 'shellfish':0, 'egg': 0, 'dairy': 0}];
var rmvSTU =[];
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
async function customerReg(event){
	event.preventDefault();
	let first_name = event.target['cfname'].value;
	let last_name = event.target['clname'].value;
	let cemail = event.target['cemail'].value;
	let phone = event.target['cnumber'].value;
	let password = event.target['cpassword'].value;
	let retype_password = event.target['cRpassword'].value;
	checkEmail = await checkEmailExist(cemail);
	if(checkEmail==0){
		if(password===retype_password){
			let parameter = {
					model: 'user',
				    action: 'register',
				    insert: { 
				        		'first_name': first_name, 
				        		'last_name': last_name,
				        		'email': cemail,
				        		'phone': phone,
				        		'password': encodePass(password),
				        		'usertype': 5
				        	}
				    };
			try {
				   var response = await sendhttpRequest(parameter);
				   if(response.code=='200'){
				   		let parameter1 = {
							model: 'customer',
						    action: 'register',
						    insert: { 
						        		'first_name': first_name, 
						        		'last_name': last_name,
						        		'email': cemail,
						        		'mobile_number': phone,
						        		'owner_id': response.id
						        	}
						    };
						try {
								var response1 = await sendhttpRequest(parameter1);
								saveStu = await saveStudents(response1.id);
								location.href = '/';
						}catch(error) {
							console.log("Error: ", error);
						}    
				   }
			} catch(error) {
				console.log("Error: ", error);
			}      
		}else{
			alert("Password is not equal to Re-type Password!");
		}
	}else{
		alert('Email already Exists!');
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
async function saveStudents(id){
	for(i=0; i<=stu; i++){
		if(rmvSTU.includes(i)==false){
			Sfname = document.getElementById('cSfname'+i).value;
			Slname = document.getElementById('cSlname'+i).value;
			Sschool = document.getElementById('cSschoolid'+i).value;
			Sclass = document.getElementById('cSclassid'+i).value;
			allergens = await getAllergens();
			length_allergens= allergens.length;
			allergiestxt ='';
			for(allerC=0; allerC<length_allergens; allerC++){
				allergens_ = allergens[allerC].name;
				idbtn = allergens_.toLowerCase(); 
				name_ =idbtn.replace('free',''); idbtn1=name_.trim(); idbtn1 = idbtn1.replace(' ','_');
				idbtn=idbtn1.trim();
				idbtn = idbtn.replace(' ','_'); 

				let btnAller = document.getElementById(idbtn+'_btn_'+i);
				if(btnAller.classList.contains("active")){
					if(allerC==0)allergiestxt += allergens[allerC].id;
					else allergiestxt += ','+allergens[allerC].id;
				}
			}
			let parameterx = {
					model: 'student',
					action: 'insert',
					insert: { 
						        'first_name': Sfname, 
						       	'last_name': Slname,
						        'school': Sschool,
						        'class_id': Sclass,
						        'customer_id': id,
						        'allergies': allergiestxt
						     }
				};
			try {
				var response = await sendhttpRequest(parameterx);
			}catch(error) {
				console.log("Error: ", error);
			}    
		}
		
	}
}
function removeSTU(stu){
	rmvSTU.push(stu);
	document.getElementById('dvi'+stu).remove();
}
async function addStudent(){
	Scawait = await addSTUintry();
}
async function addSTUintry(){
	stu++;
	as ='<div class="child-form form-set flex col100" id="dvi'+stu+'"><div class="form-step col30"><button onclick ="removeSTU('+stu+')"class="btn red icon-right" style="float: right;">Remove</button></div>';
    as += '<div class="form-group col70">';
    as += '<div class="form-group-row col70 flex">';
    as += '<div class="form-field col50">';
    as += '<div class="form-field-label">First Name</div>';
    as += '<input id="cSfname'+stu+'" class="form-field-input" placeholder="First Name" required/></div>';
    as += '<div class="form-field col50">';
    as += '<div class="form-field-label">Last Name</div>';
    as += '<input id="cSlname'+stu+'" class="form-field-input" placeholder="Last Name" required/></div></div>';
    as += '<div class="form-group-row col70 flex">';
    as += '<div class="form-field col70">';
    as += '<div class="form-field-label">School</div>';
    as += '<div class="x-center"><input id="cSschoolid'+stu+'" style="display: none;" class="form-field-input" placeholder="School" required/>';
    as += '<input id="cSschool'+stu+'" onInput="chooseSchool1('+stu+')" onclick="chooseSchool('+stu+')"  class="form-field-input" placeholder="School" required/>';
    as += '<lord-icon src="https://cdn.lordicon.com/eeouelif.json" stroke="bold"  colors="primary:#121331,secondary:#000000" style="width:30px;height:30px"  class="form-field-icon"> </lord-icon></div>';
    as += '<div class="form-field-options" style="display: none;" id ="schoolselectfield'+stu+'"></div> </div>';
    as += '<div class="form-field col30">';
    as += '<div class="form-field-label">Class</div>';
    as += '<div class="x-center"> <input id="cSclassid'+stu+'" type="hidden">';
    as += '<input id="cSclass'+stu+'" readOnly onInput="chooseClass1('+stu+')" onclick="chooseClass('+stu+')" class="form-field-input" placeholder="Class" required/>';
    as += '<lord-icon src="https://cdn.lordicon.com/nwkmdrya.json" stroke="bold"  colors="primary:#121331,secondary:#000000" style="width:30px;height:30px"  class="form-field-icon"></lord-icon>';
    as += '</div> <div class="form-field-options" style="display: none;" id ="classselectfield'+stu+'"></div></div></div>';
    as += '<div class="form-group-row col70 flex" style="margin-top: 50px;">';
    as += '<div class="form-field-2 column col100 top10">';
    as += '<div class="form-field-label-shown"> <span>Allergies</span>  </div>';
    as += '<div class="form-field-tags" id ="btnAllertab'+stu+'">';

    as += '</div><div class="form-field-tags-selected" id="allergiesSection'+stu+'">';
    as += '  </div> </div>  </div> </div></div>';
    allerg[stu]=[{'seafoods': 0 , 'nuts': 0, 'coconut': 0, 'gluten': 0, 'shellfish':0, 'egg':0, 'dairy':0}];
    $('#stuSection').append(as);
    loadSchool(stu);
    allergens = await loadAllegiesbtn(stu);

}
async function loadAllegiesbtn(num){
	let parameter = {
		    model: 'allergen',
	        action: 'retrieve',
	        retrieve: '*'
	    };
	try {
	    	var response  =  await sendhttpRequest(parameter);
	    	allergens = response.data;
		    lngallergens = allergens.length;
		    btnAllergen='';
		    for(x=0; x<lngallergens; x++){
					testid = allergens[x].id;
					allergens_ = allergens[x].name;
					idbtn = allergens_.toLowerCase(); 
					name_ =idbtn.replace('free',''); idbtn1=name_.trim(); idbtn1 = idbtn1.replace(' ','_');
					idbtn=idbtn1.trim();
					idbtn = idbtn.replace(' ','_'); 
					imgaller = allergens[x].image;
					btnAllergen +='<div id="'+idbtn+'_btn_'+num+'" onclick="funcAlerr(this.id,\''+imgaller+'\', \''+name_+'\')" class="form-field-tag">'+name_+'</div>';
					
			}
        	$('#btnAllertab'+num).append(btnAllergen);
	    } catch(error) {
	        console.log("Error: ", error);
	    }     
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

function chooseSchool(num){
	document.getElementById('schoolselectfield'+num).style.display = 'block';
}
async function chooseSchool1(num){
	val = document.getElementById('cSschool'+num).value;

	$('.form-field-option').remove();
	let parameter = {
		    model: 'school',
	        action: 'retrieve',
	        retrieve:  '*',
	        condition:[
	        		["name","LIKE",val+"%"]
	        	]
	    };
	try {
		var response =  await sendhttpRequest(parameter);
		sch=response.data;
		lngSch = sch.length;
		for(i=0; i<lngSch; i++){
			$('#schoolselectfield'+num).append('<div onclick="selectSchool('+sch[i]['id']+',\''+sch[i]['name']+'\','+num+')" class="form-field-option">'+sch[i]['name']+'</div>');
		}
	}catch(error) {
	    console.log("Error: ", error);
	}     
}

function chooseClass(num){
	document.getElementById('classselectfield'+num).style.display = 'block';
}
async function chooseClass1(num){

}
function selectclass(id,name,num){
	document.getElementById('cSclass'+num).value=name;
	document.getElementById('cSclassid'+num).value=id;
	document.getElementById('classselectfield'+num).style.display = 'none';
}