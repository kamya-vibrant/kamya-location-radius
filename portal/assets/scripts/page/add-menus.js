
item_status=1;
document.getElementById("item_status").checked = true;

async function addMenus(event){
	event.preventDefault();
	showLoading();
  var sp_= await Get_supplier();
	let name = event.target['mnu_name'].value;
	let mnu_start_date = event.target['mnu_start_date'].value;
	let mnu_end_date = (event.target['mnu_end_date'].value=='') ? null : event.target['mnu_end_date'].value;
  var lfckv = document.getElementById("item_status").checked;
  if(lfckv)item_status=1;
  else item_status=0;
 
  let parameter = {
      model: 'menu',
      action: 'insert',
      insert: { 
            'name': name, 
            'start_date': mnu_start_date,
            'end_date': mnu_end_date,
            'sb_id': Supplier_id_,
            'is_default': 1,
            'status': item_status
          }
  };

  try {
    var response = await sendhttpRequest(parameter);
    if(response['code']==200){        
      location.href = '/add-mnu-products?id='+response.id;
    }
  } catch(error) {
    console.log("Error: ", error);
  }
	setTimeout(
	closeLoading 
	, 50);   
}




