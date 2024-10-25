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
    '/editmeal': `pages/editmeal.html`,
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
    '/location-docs': `pages/location-docs.html`,

    '/add-finance': `pages/add-finance.html`,

    '/supplier-dashboard': `pages/supplier-dashboard.html`,
    '/supplier-orders': `pages/supplier-orders.html`,
    '/supplier-profile': `pages/supplier-profile.html`,
    '/supplier-create-schedule': `pages/supplier-create-schedule.html`,
    '/supplier-create-booking': `pages/supplier-create-booking.html`,
    '/supplier-viewbooking': `pages/supplier-viewbooking.html`,
    '/supplier-vieworders': `pages/supplier-vieworders.html`,
    '/meal-deal': `pages/meal-deal.html`,
    '/newmealdeal': `pages/newmealdeal.html`,

    // supplier - inventory (pantry)
    '/pantry': `pages/pantry.html`,

    '/ingredient': `pages/inventory/ingredient.html`,
    '/create-ingredient': `pages/inventory/create-ingredient.html`,
    '/edit-ingredient': `pages/inventory/edit-ingredient.html`,

    '/recipe': `pages/inventory/recipe.html`,
    '/create-recipe': `pages/inventory/create-recipe.html`,
    '/edit-recipe': `pages/inventory/edit-recipe.html`,

    '/sizing': `pages/inventory/sizing.html`,
    '/create-sizing': `pages/inventory/create-sizing.html`,
    '/edit-sizing': `pages/inventory/edit-sizing.html`,

    '/option': `pages/inventory/option.html`,
    '/create-option': `pages/inventory/create-option.html`,
    '/edit-option': `pages/inventory/edit-option.html`,

    '/optionset': `pages/inventory/optionset.html`,
    '/create-optionset': `pages/inventory/create-optionset.html`,
    '/edit-optionset': `pages/inventory/edit-optionset.html`,

    // refer to the old listing pages and js for the products in OneHive
    '/product': `pages/inventory/product.html`,
    '/create-product': `pages/inventory/create-listing.html`,
    '/edit-product': `pages/inventory/edit-listing.html`,
   
    '/bookings': `pages/bookings.html`,
    '/orders': `pages/orders.html`,
    '/new-mealdeal': `pages/new-mealdeal.html`,
    '/menus': `pages/menus.html`,
    '/finance': `pages/finance.html`,
    '/users': `pages/users.html`,
    '/create-user': `pages/create-user.html`,
    '/location': `pages/location.html`,
    '/create-location': `pages/create-location.html`,
    '/support': `pages/support.html`,
    '/settings': `pages/settings.html`,
    '/meal-deal': `pages/meal-deal.html`,
    '/createproduct': `pages/createproduct.html`,
    '/editproduct': `pages/editproduct.html`,
    '/resetpassword': `pages/resetpassword.html`,
    '/view-bookings': `pages/view-bookings.html`,
    '/edit-bookings': `pages/edit-bookings.html`,
    '/edit-menus': `pages/edit-menus.html`,
    '/add-menus': `pages/add-menus.html`,
    '/view-menus': `pages/view-menus.html`,
    '/school': `pages/school.html`,
    '/add-school': `pages/add-school.html`,
    '/class': `pages/class.html`,
    '/add-class': `pages/add-class.html`,
    '/add-mnu-products': `pages/add-mnu-products.html`
    

};

const handleLocation = async (scriptEle) => {
    fetchlog_=await fetchLoggedData();
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
    if(route== 'pages/organizers-dashboard.html'){
      if(localStorage.isSupplier=='true')Newroute = 'pages/supplier-dashboard.html';
      else if(localStorage.isCustomer=='true') Newroute = 'pages/customer-dashboard.html';
      else  Newroute = route;
    }else  Newroute = route;
    const html = await fetch(Newroute).then((data) => data.text());
    document.getElementById("main-page").innerHTML = html;
    if(jsPath=="/"){ 
      jsPath='/index'; 
      jsIs = hr+'portal/assets/scripts/page'+jsPath+'.js';
    }else{
      jsIs = hr.replace(path,'/portal/assets/scripts/page'+jsPath+'.js');
    }
  
    scriptEle.setAttribute("src", jsIs);

    checkLoggedin();
    if(Newroute=="pages/users.html")UsersSupplier();
    if(Newroute=="pages/location.html")LocationsData();
    if(Newroute=="pages/settings.html")SettingsData();
    if(Newroute=="pages/pantry.html") setTimeout(()=>{ showTabPane('ingredients'); }, 750);
    if(Newroute=="pages/finance.html")FinanceData();
    if(Newroute=="pages/school.html")runSchooldata();
    if(Newroute=="pages/class.html")runClassdata();
    if(Newroute=="pages/customer-profile.html")loadprofile();
    if(Newroute=="pages/supplier-dashboard.html")loadSdashboard();
    if(Newroute=="pages/customer-dashboard.html")loadCdashboard();
    if(Newroute=="pages/organizers-dashboard.html")loadOdashboard();
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
            
            let logData = getStorageItem('loggedData');
            //alert(logData['origin']);
            //location.href = response.redirect+'/unset';
            localStorage.setItem('csrf',null);  
            location.href = logData['origin']+'unset';
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
