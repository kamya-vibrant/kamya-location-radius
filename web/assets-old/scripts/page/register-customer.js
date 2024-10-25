var stu=0;
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

function selectSchool(id,name,num){
	$('#schoolselectfield'+num).hide();
	document.getElementById('cSschoolid'+num).value = id;
	document.getElementById('cSschool'+num).value = name;
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
async function saveStudents(id){
	for(i=0; i<=stu; i++){
		if(rmvSTU.includes(i)==false){
			Sfname = document.getElementById('cSfname'+i).value;
			Slname = document.getElementById('cSlname'+i).value;
			Sschool = document.getElementById('cSschoolid'+i).value;
			Sclass = document.getElementById('cSclass'+i).value;
			seafoods = allerg[i]['seafoods'];
			nuts = allerg[i]['nuts'];
			coconut = allerg[i]['coconut'];
			gluten = allerg[i]['gluten'];
			shellfish = allerg[i]['shellfish'];
			egg = allerg[i]['egg'];
			dairy = allerg[i]['dairy'];
			let parameterx = {
					model: 'student',
					action: 'insert',
					insert: { 
						        'first_name': Sfname, 
						       	'last_name': Slname,
						        'school': Sschool,
						        'class': Sclass,
						        'customer_id': id,
						        'seafoods' : seafoods,
						        'nuts' : nuts,
						        'coconut' : coconut,
						        'gluten' : gluten,
						        'shellfish' : shellfish,
						        'egg' : egg,
						        'dairy' : dairy
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
    as += '<input id="cSschool'+stu+'" readonly onclick="chooseSchool('+stu+')"  class="form-field-input" placeholder="School" required/>';
    as += '<lord-icon src="https://cdn.lordicon.com/eeouelif.json" stroke="bold"  colors="primary:#121331,secondary:#000000" style="width:30px;height:30px"  class="form-field-icon"> </lord-icon></div>';
    as += '<div class="form-field-options" style="display: none;" id ="schoolselectfield'+stu+'"></div> </div>';
    as += '<div class="form-field col30">';
    as += '<div class="form-field-label">Class</div>';
    as += '<div class="x-center">';
    as += '<input id="cSclass'+stu+'"  class="form-field-input" placeholder="Class" required/>';
    as += '<lord-icon src="https://cdn.lordicon.com/nwkmdrya.json" stroke="bold"  colors="primary:#121331,secondary:#000000" style="width:30px;height:30px"  class="form-field-icon"></lord-icon>';
    as += '</div> </div></div>';
    as += '<div class="form-group-row col70 flex" style="margin-top: 50px;">';
    as += '<div class="form-field-2 column col100 top10">';
    as += '<div class="form-field-label-shown"> <span>Allergies</span>  </div>';
    as += '<div class="form-field-tags">';
    as += '<div id="cSseafood'+stu+'" onclick="funcSeafoods(this.id)" class="form-field-tag">Seafood</div>';
    as += '<div id="cSgluten'+stu+'" onclick="funcGluten(this.id)" class="form-field-tag">Gluten</div>';
    as += '<div id="cSnuts'+stu+'" onclick="funcNuts(this.id)" class="form-field-tag">Nuts</div>';
    as += '<div id="cScoconut'+stu+'" onclick="funcCoconut(this.id)" class="form-field-tag">Coconut</div>';
    as += '<div id="cSegg'+stu+'" onclick="funcEgg(this.id)" class="form-field-tag">Eggs</div>';
    as += '<div id="cSdairy'+stu+'" onclick="funcDairy(this.id)" class="form-field-tag">Dairy</div>';
    as += '<div id="cSshellfish'+stu+'" onclick="funcShellfish(this.id)"class="form-field-tag">Shellfish and Crustaceans</div></div>';
    as += '<div class="form-field-tags-selected" id="allergiesSection'+stu+'">';
    as += '  </div> </div>  </div> </div></div>';
    allerg[stu]=[{'seafoods': 0 , 'nuts': 0, 'coconut': 0, 'gluten': 0, 'shellfish':0, 'egg':0, 'dairy':0}];
    $('#stuSection').append(as);
    loadSchool(stu);
}

function funcShellfish(id){
	let ShellfishButton = document.getElementById(id);
	exp = id.split('shellfish');
	num = parseInt(exp[1]);
	ico_aller = '<div id="alle_shellfish'+num+'" class="form-field-tags-selected-item"> <img src="site/assets/img/shellfish.png" style="width:50px;height:50px"/>  <span>Shellfish & Crustaceans</span> </div>';
	if(ShellfishButton.classList.contains("active")){
		document.getElementById('alle_shellfish'+num).remove();
		allerg[num]['shellfish']=0;
		ShellfishButton.classList.remove('active');

	}else{
		allerg[num]['shellfish']=1;
		ShellfishButton.classList.add('active');
		$('#allergiesSection'+num).append(ico_aller);
	}
}
function funcCoconut(id){
	let CoconutButton = document.getElementById(id);
	exp = id.split('coconut');
	num = parseInt(exp[1]);
	ico_aller ='<div id = "alle_coconut'+num+'" class="form-field-tags-selected-item">  <img src="site/assets/img/coconut.png" style="width:50px;height:50px"/> <span>coconut</span> </div>';
	if(CoconutButton.classList.contains("active")){
		document.getElementById('alle_coconut'+num).remove();
		allerg[num]['coconut']=0;
		CoconutButton.classList.remove('active');
	}else{
		allerg[num]['coconut']=1;
		CoconutButton.classList.add('active');
		$('#allergiesSection'+num).append(ico_aller);
	}
}
function funcNuts(id){
	let NutsButton = document.getElementById(id);
	exp = id.split('nuts');
	num = parseInt(exp[1]);
	ico_aller = '<div id ="alle_nuts'+num+'" class="form-field-tags-selected-item">  <lord-icon src="https://cdn.lordicon.com/ikccflft.json"  style="width:50px;height:50px">  </lord-icon> <span>Nuts</span> </div>';
	if(NutsButton.classList.contains("active")){
		document.getElementById('alle_nuts'+num).remove();
		allerg[num]['nuts']=0;
		NutsButton.classList.remove('active');
	}else{
		allerg[num]['nuts']=1;
		NutsButton.classList.add('active');
		$('#allergiesSection'+num).append(ico_aller);
	}
}
function funcSeafoods(id){
	let SeafoodsButton = document.getElementById(id);
	exp = id.split('seafood');
	num = parseInt(exp[1]);
	ico_aller = '<div id = "alle_seafoods'+num+'" class="form-field-tags-selected-item">  <lord-icon src="https://cdn.lordicon.com/cdxdocof.json"  style="width:50px;height:50px">  </lord-icon> <span>Seafood</span> </div>';
	if(SeafoodsButton.classList.contains("active")){
		document.getElementById('alle_seafoods'+num).remove();
		allerg[num]['seafoods']=0;
		SeafoodsButton.classList.remove('active');
	}else{
		allerg[num]['seafoods']=1;
		SeafoodsButton.classList.add('active');
		$('#allergiesSection'+num).append(ico_aller);
	}
}
function funcGluten(id){
	let GlutenButton = document.getElementById(id);
	exp = id.split('gluten');
	num = parseInt(exp[1]);
	ico_aller = '<div id = "alle_gluten'+num+'" class="form-field-tags-selected-item"> <img src="site/assets/img/gluten-free.png" style="width:50px;height:50px"/> <span>Gluten</span>  </div>';
	if(GlutenButton.classList.contains("active")){
		document.getElementById('alle_gluten'+num).remove();
		allerg[num]['gluten']=0;
		GlutenButton.classList.remove('active');
	}else{
		allerg[num]['gluten']=1;
		GlutenButton.classList.add('active');
		$('#allergiesSection'+num).append(ico_aller);
	}
}

function funcEgg(id){
	let EggButton = document.getElementById(id);
	exp = id.split('egg');
	num = parseInt(exp[1]);
	ico_aller = '<div id = "alle_egg'+num+'" class="form-field-tags-selected-item"> <img src="site/assets/img/eggs.png" style="width:50px;height:50px"/> <span>Egg</span>  </div>';
	if(EggButton.classList.contains("active")){
		document.getElementById('alle_egg'+num).remove();
		allerg[num]['egg']=0;
		EggButton.classList.remove('active');
	}else{
		allerg[num]['egg']=1;
		EggButton.classList.add('active');
		$('#allergiesSection'+num).append(ico_aller);
	}
}

function funcDairy(id){
	let dairyButton = document.getElementById(id);
	exp = id.split('dairy');
	num = parseInt(exp[1]);
	ico_aller = '<div id = "alle_dairy'+num+'" class="form-field-tags-selected-item"> <img src="site/assets/img/dairy-free.png" style="width:50px;height:50px"/> <span>Dairy</span>  </div>';
	if(dairyButton.classList.contains("active")){
		document.getElementById('alle_dairy'+num).remove();
		allerg[num]['dairy']=0;
		dairyButton.classList.remove('active');
	}else{
		allerg[num]['dairy']=1;
		dairyButton.classList.add('active');
		$('#allergiesSection'+num).append(ico_aller);
	}
}
function chooseSchool(num){
	document.getElementById('schoolselectfield'+num).style.display = 'block';
}