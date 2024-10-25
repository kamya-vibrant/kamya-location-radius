const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
let url = window.location.href;

url = new URL(url);
itemID = url.searchParams.get("id");
$('#link_to_add_products_mnu').attr('href','/add-mnu-products?id='+itemID);
let supp_id = Supplier_[0]['id'];
var mnu_;
async function menudta(id){
 	let parameter = {
          model: 'menu',
          action: 'retrieve',
          retrieve: '*',
          condition: [
          		['id','=',id]
          	]
      };

    try {
        var response = await sendhttpRequest(parameter);
        document.getElementById('header-3').innerHTML =response.data[0].name;
        return response.data[0];
	}catch(error) {
        console.log("Error: ", error);
    }
}
async function productsformnu(){
    showLoading();
    var menusLi ='';
    mnu_ = await menudta(itemID);
    var listings = mnu_.listings.split(',');
    let parameter = {
          model: 'listing',
          action: 'retrieve',
          retrieve: '*',
          condition:[
                    ['sb_id','=',supp_id]
            ]
      };

      try {
        var response = await sendhttpRequest(parameter);
        var prodMnu = response.data;
        lengh_ = prodMnu.length;
        var ArrprodMnu=[];
        for(i=0; i<lengh_; i++){
          var start_d = new Date(prodMnu[i].start_date);
          var end_d = new Date(prodMnu[i].end_date);
        	di= prodMnu[i].id;
          let image = ( prodMnu[i].image === null) ? '/portal/assets/images/no-image.png' : prodMnu[i].image;
        	if(listings.includes( di.toString() ) ){
        		//ArrprodMnu.push(prodMnu[i]);
            menusLi +=`<div class="col-sm-6 col-lg-3 rvm_">
                          <div class="card d-block">
                              <div class="card-body">
                                  <h4 class="card-title">${prodMnu[i].item_name}</h4>
                                  <h6 class="card-subtitle text-muted">$${prodMnu[i].price}</h6>
                              </div>
                              <div class="clt_img"><img class="img-fluid" src="${image}" alt="Card image cap"></div>
                              <div class="card-body">
                                  <p class="card-text">${prodMnu[i].short_description}</p>
                                  <p class="card-text"><b>Start Date:</b> ${monthNames[start_d.getMonth()]} ${start_d.getDay()}, ${start_d.getFullYear()}</p>
                                  <p class="card-text"><b>End Date:</b> ${monthNames[end_d.getMonth()]} ${end_d.getDay()}, ${end_d.getFullYear()}</p>
                                  <button class="btn red icon-right" OnClick="removeProd(${prodMnu[i].id},'${prodMnu[i].item_name}')">Remove <i class="bi bi-trash-fill"></i></button>
                                  
                              </div> 
                          </div>
                      </div>`;
        	}
        }
        $('#mnu_product_tbl').append(menusLi);

      } catch(error) {
        console.log("Error: ", error);
      }
    setTimeout(
    closeLoading 
    , 50);   
}

productsformnu();
async function removeselected(id){
	lists ='';
	prods = mnu_.listings.split(',');
	for(i=0; i<prods.length; i++){
		if(prods[i].toString()!=id.toString()){
			if(lists=='')lists = prods[i];
			else lists += ','+prods[i];
		}
	}
	let parameter = {
          model: 'menu',
          action: 'update',
          update: {
          		'listings': lists
          },
          condition: [
          		['id','=',itemID]
          	]
      };

    try {
        var response = await sendhttpRequest(parameter);
        $('.rvm_').remove();
        closemodal('centermodal1');
        productsformnu();
	  }catch(error) {
        console.log("Error: ", error);
    }
}
function removeProd(id, item){
  modalcont = `<div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h4 class="modal-title" id="myCenterModalLabel">OneHive</h4>
                            <button type="button" class="btn-close"  onclick="closemodal('centermodal1')" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <h5>Are you sure you want to remove ${item}?</h5>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-light" onclick="closemodal('centermodal1')" >Cancel</button>
                            <button type="button" onclick="removeselected(${id})"class="btn btn-primary">Yes</button>
                        </div>
                    </div>
            </div>`;  
  $('#centermodal1').append(modalcont);
  $('#centermodal1').show();
  
}

function closemodal(id){
    $('#'+id).hide();
    $('.modal-dialog').remove();
}