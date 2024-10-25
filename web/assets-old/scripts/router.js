
const route = (event) => {

    if(event.target.href!='/'){
        event = event || window.event;
        event.preventDefault();
        window.history.pushState({}, "", event.target.href);
        handleLocation();
    }
};

const env = 'local'; 

const app_dir = (env == 'local') ? '' : '';

let scriptEle = document.createElement("script");
scriptEle.setAttribute("id", "pageJs");
document.body.appendChild(scriptEle);

const routes = {
    404: `pages/404.html`,
    '/': `pages/home.html`,
    '/checkout': `pages/checkout.html`,
    '/mealdeal': `/pages/mealdeal.html`,
    '/menu': `/pages/menu.html`,
    '/store': `/pages/store.html`,
    '/suppliers': `/pages/suppliers.html`,

    "/setpassword": `/pages/setpassword.html`,
    '/register-customer': `/pages/custreg.html`,
    '/register-school':`/pages/schoolreg.html`,
    '/register-supplier': `/pages/supplierreg.html`,
    '/web-registration': `/pages/registration.html`,
    '/custreg': `/pages/custreg.html`
};

    
const handleLocation = async (scriptEle) => {
    const hr = window.location.href;
    const path = window.location.pathname;
    let pathKey = path.replace(app_dir, '');
    let jsPath = path;

    if((path=='/' || path=='/home') && !isLoggedIn()){
        let login = document.getElementById("login-modal");
        login.classList.remove('hidden');
    }

    if(path=='/unset'){
        unsetStorageItem('uld');
        unsetStorageItem('portal');
        location.href="/";
    }

    if(pathKey.includes('setpassword')){
      jsPath = "/setpassword";
      let confc = pathKey.replace(jsPath+"/",'')
      pathKey = "/setpassword";
      setStorageItem('confc', confc);
    }

    const route = routes[pathKey] || routes[404];

    const html = await fetch(route).then((data) => data.text());
    document.getElementById("main-page").innerHTML = html;

    if(jsPath=="/"){ 
      jsPath='/index'; 
      jsIs = hr+'site/assets/scripts/page'+jsPath+'.js';
    }else{
      jsIs = hr.replace(path,'/site/assets/scripts/page'+jsPath+'.js');
    }

    bannerPop(route);

    //const jsIs = hr.replace(path,'/site/assets/scripts/page'+jsPath+'.js');
    scriptEle.setAttribute("src", jsIs);

};

window.onpopstate = handleLocation;
window.route = route;

const bannerPop = async (route) => {
  console.log('route:',route);
    if(route=='pages/home.html'){
        document.getElementById('banner-main').style = 'display: visible;';
    }else{
        document.getElementById('banner-main').style = 'display: none;';
    }
}

function loadJS(FILE_URL, async = true) {

  scriptEle.setAttribute("src", FILE_URL);
  scriptEle.setAttribute("type", "text/javascript");
  scriptEle.setAttribute("async", async);

  document.body.appendChild(scriptEle);

  // success event 
  scriptEle.addEventListener("load", () => {
    console.log("File loaded")
  });
   // error event
  scriptEle.addEventListener("error", (ev) => {
    console.log("Error on loading file", ev);
  });
}

function setStorageItem(name, value){
  localStorage.setItem(name, JSON.stringify(value));
}

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (err) {
    return false;
  }
}

handleLocation(scriptEle);
