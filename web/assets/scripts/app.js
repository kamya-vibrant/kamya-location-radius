
function showLogin(){
	let login = document.getElementById("login-modal");
    login.classList.remove('hidden');
    login.style.display = 'flex';
}

function closeLogin(){
	let login = document.getElementById("login-modal");
    login.classList.add('hidden');
}

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

	xhr.send(body);
	});
} 

function encodePass(string){
    return btoa(string);
}

function decodePass(){
     return atob(string);
}

function isLoggedIn(){
	let details = getStorageItem('uld');
	return (details==null || details === undefined || details.length == 0) ? false : true;
}

function getLoggedDetails(key){
	let details = getStorageItem('uld');
	return (details==null || details === undefined || details.length == 0) ? '' : details[0][key];
}

function setIfLogin(){

	let login_holder = document.getElementById("login-button-holder");
    let user_name_holder = document.getElementById("user-name-holder");

    if(isLoggedIn()){
    	login_holder.classList.add('hidden');
    	user_name_holder.classList.remove('hidden');
    	let user_name = document.getElementById("user-name");
    	let portal_url = document.getElementById("portal-redirect");
    	user_name.innerHTML = getLoggedDetails('first_name')+" "+getLoggedDetails('last_name');
    	portal_url.setAttribute("href", getStorageItem('portal'));
    }else{
		login_holder.classList.remove('hidden');
    	user_name_holder.classList.add('hidden');
    }
}  

async function submitLoginForm(event){
	event.preventDefault();
	let email = event.target['email'].value;
	let password = event.target['password'].value;
	
	let parameter = {
		    model: 'auth',
	        action: 'login',
	        condition: [['email', '=', email], ['password', '=', encodePass(password), 'AND' ]]
	    };

	try {
	    var response = await sendhttpRequest(parameter);
	        console.log('response');
	        console.log(response);
	        setStorageItem('uld', response['data']);
	        setStorageItem('portal', response.redirect);
	        if(response.code==200){
	        	location.href = response.redirect; 
	        }

	    } catch(error) {
	        console.log("Error: ", error);
	        alert('Invalid User!');
	    }      
}

function setStorageItem(name, value){
	localStorage.setItem(name, JSON.stringify(value));
}

function getStorageItem(name){
	return (localStorage.getItem(name) === null) ? null : JSON.parse(localStorage.getItem(name));
}

function unsetStorageItem(name){
	localStorage.removeItem(name);
}

setIfLogin();

function showLoading(){

	let loadingElem = document.getElementById("loading");
	loadingElem.setAttribute("style", "");

}

function closeLoading(){

	let loadingElem = document.getElementById("loading");
	loadingElem.setAttribute("style", "display: none;");
}