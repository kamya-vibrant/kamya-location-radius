let scriptEle = document.createElement("script");
scriptEle.setAttribute("id", "pageJs");
document.body.appendChild(scriptEle);

const route = (event) => {
    event = event || window.event;
    event.preventDefault();
    window.history.pushState({}, "", event.target.href);
    console.log('event');
    console.log(event.target.tagName);
    if (event.target.tagName === 'A' || event.target.tagName === 'a') {
      resetMenuState();
      event.target.classList.add('active');
    }
    handleLocation(scriptEle);
};

const env = 'dev'; 

const app_dir = (env == 'local') ? '' : '';
const web_domain = (env == 'local') ? 'http://localhost:3000' : 'https://onehive.vibrantbrands.com.au/';

const routes = {
    404: `${app_dir}/pages/404.html`,
    // organizers 
    '/': `pages/organizers-dashboard.html`,
    '/dashboard': `pages/organizers-dashboard.html`,
    '/organizers-bookings': `pages/organizers-bookings.html`,
    '/organizers-profile': `pages/organizers-profile.html`,
    '/organizers-viewbooking': `pages/organizers-viewbooking.html`,
    
    // customer 
    '/customer-dashboard': `pages/customer-dashboard.html`,
    '/customer-orders': `pages/customer-orders.html`,
    '/customer-orderhistory': `pages/customer-orderhistory.html`,
    '/customer-profile': `pages/customer-profile.html`,
    '/customer-vieworders': `pages/customer-vieworders.html`,
    '/customer-vieworder': `pages/customer-vieworder.html`,
    '/customer-editmeal': `pages/customer-editmeal.html`,
    
    // supplier 
    '/supplier-bookings': `pages/supplier-bookings.html`,


    '/add-finance': `pages/add-finance.html`,

    '/supplier-dashboard': `pages/supplier-dashboard.html`,
    '/supplier-orders': `pages/supplier-orders.html`,
    '/supplier-profile': `pages/supplier-profile.html`,
    '/supplier-create-schedule': `pages/supplier-create-schedule.html`,
    '/supplier-viewbooking': `pages/supplier-viewbooking.html`,
    '/supplier-vieworders': `pages/supplier-vieworders.html`,
    '/meal-deal': `pages/meal-deal.html`,
    '/newmealdeal': `pages/newmealdeal.html`,
   
    '/bookings': `pages/bookings.html`,
    '/orders': `pages/orders.html`,
    '/new-mealdeal': `pages/new-mealdeal.html`,
    '/menus': `pages/menus.html`,
    '/pantry': `pages/pantry.html`,
    '/finance': `pages/finance.html`,
    '/users': `pages/users.html`,
    '/create-user': `pages/create-user.html`,
    '/location': `pages/location.html`,
    '/create-location': `pages/create-location.html`,
    '/support': `pages/support.html`,
    '/settings': `pages/settings.html`,
    '/meal-deal': `pages/meal-deal.html`,
    '/create-product': `pages/create-product.html`,
    '/edit-product': `pages/edit-product.html`,

    '/createproduct': `pages/createproduct.html`,
    '/editproduct': `pages/editproduct.html`,
    '/resetpassword': `pages/resetpassword.html`,
    '/view-bookings': `pages/view-bookings.html`,
    '/edit-bookings': `pages/edit-bookings.html`,
    '/edit-menus': `pages/edit-menus.html`,
    '/view-menus': `pages/view-menus.html`

};

const handleLocation = async (scriptEle) => {
    const hr = window.location.href;
    const path = window.location.pathname;
    let pathKey = path.replace(app_dir, '');
    let jsPath = path;
    let jsIs;

    if(pathKey.includes('csrf')){
      let csrf = pathKey.replace("/csrf/",'');
      setStorageItem('csrf', csrf);
      location.href='/';
    }

    if(pathKey.includes('logout')){
      logoutUser();
    }

    const route = routes[pathKey] || routes[404];
    const html = await fetch(route).then((data) => data.text());
    console.log(route);
    document.getElementById("main-page").innerHTML = html;

    if(jsPath=="/"){ 
      jsPath='/index'; 
      jsIs = hr+'portal/assets/scripts/page'+jsPath+'.js';
    }else{
      jsIs = hr.replace(path,'/portal/assets/scripts/page'+jsPath+'.js');
    }
  
    scriptEle.setAttribute("src", jsIs);
    if(route=="pages/users.html")UsersSupplier();
    if(route=="pages/location.html")LocationsData();
    if(route=="pages/settings.html")SettingsData();
    if(route=="pages/pantry.html") setTimeout(()=>{ showTabPane('products'); }, 350);
    if(route=="pages/finance.html")FinanceData();

    checkLoggedin();
};

window.onpopstate = handleLocation;
window.route = route;

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

function checkLoggedin(){
  if(getStorageItem('csrf')==null){
    location.href=web_domain;
  }
}

async function logoutUser(){
  let csrf = getStorageItem('csrf');
  let parameter = {
        model: 'auth',
        action: 'logout',
        condition: [['csrf_token', '=', csrf]]
  };

  try {
      var response = await sendhttpRequest(parameter);
          console.log('response');
          if(response.code==200){
            location.href = response.redirect+'/unset';
          }else{
            location.href = '/';
          }

      } catch(error) {
          console.log("Error: ", error);
          location.href = '/';
      }   
}

function resetMenuState(){
  var elems = document.querySelectorAll("a.sidenav-item");

  [].forEach.call(elems, function(el) {
      el.classList.remove("active");
  });
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
