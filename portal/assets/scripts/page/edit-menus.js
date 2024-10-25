let url = window.location.href;

url = new URL(url);
itemID = url.searchParams.get("id");

async function loadmnu(){
	let parameter = {
      model: 'menu',
      action: 'retrieve',
      retrieve: '*',
      condition: [
      		['id', '=', itemID]
      	]
  };

  try {
    var response = await sendhttpRequest(parameter);
    mnu_ = response.data[0];
    // document.getElementById('menu_image').src = mnu_.image;
    $('#menu_image').css('visibility','visible');
    $('#menu_image').css('margin-left','-100%');
    document.getElementById('mnu_name').value = mnu_.name;
    document.getElementById('mnu_start_date').value = mnu_.start_date;
    document.getElementById('mnu_end_date').value = mnu_.end_date;
    if(mnu_.status=='1')document.getElementById("item_status").checked = true;
    else document.getElementById("item_status").checked = false;
  } catch(error) {
    console.log("Error: ", error);
  }
}
loadmnu();

async function updateMenus(event){
	event.preventDefault();
	showLoading();
	  var sp_= await Get_supplier();
		let name = event.target['mnu_name'].value;
		let mnu_start_date = event.target['mnu_start_date'].value;
    let mnu_end_date = (event.target['mnu_end_date'].value=='') ? null : event.target['mnu_end_date'].value;
	  var lfckv = document.getElementById("item_status").checked;
	  if(lfckv)item_status=1;
	  else item_status=0;
	  // let file_ = document.getElementById('menu_image').src;
	  
	  // Arrfile=file_.match(/.{1,6000}/g);
	  // fileLength = Arrfile.length;
	  let parameter = {
	      model: 'menu',
	      action: 'update',
	      update: { 
	            'name': name, 
	            'start_date': mnu_start_date,
	            'end_date': mnu_end_date, 
	            // 'image': Arrfile[0],
	            'sb_id': Supplier_id_,
	            'status': item_status
	          },
	      condition:[
	      		['id', '=',itemID]
	      	]
	  };

	  try {
	    var response = await sendhttpRequest(parameter);
	    // if(response['code']==200){        
	      // i=1; 
	      // while(i<fileLength){  
	      //   slice = Arrfile[i];
	      //   aendfile = await sendslice(itemID, slice, 'image');
	      //   i++;
	      // }
	    // }

	    location.href = 'add-mnu-products?id='+itemID;//'/menus';
	  } catch(error) {
	    console.log("Error: ", error);
	  }
	setTimeout(
	closeLoading 
	, 50);   
}

async function sendslice(id, slice, which){
  let parameter2 = {
        model: 'menu',
        action: 'insertimg',
        insert: {  
            which: slice
        },
        fields: [
          which
        ],
        condition: [['id', '=', id]]
      };
  try {
      var response = await sendhttpRequest(parameter2);
      return response;
  } catch(error) {
    console.log("Error: ", error);
  }    
}  
async function uploadImage_s(input){
	readfiles_s(input.files);
}

function processfile_s(file) {
  	fileName = document.querySelector('#mnu_upload_img').value; 
    extension = fileName.split('.').pop(); 
    if( !( /image/i ).test( file.type ) )
        {
            return false;
        }

    var reader = new FileReader();
    reader.readAsArrayBuffer(file);
    
    reader.onload = function (event) {
      var blob = new Blob([event.target.result]); 
      window.URL = window.URL || window.webkitURL;
      var blobURL = window.URL.createObjectURL(blob); 
      var image = new Image();
      image.src = blobURL;

      image.onload = function() {

        var resized = resizeMe_s(image,extension); 
        $('#menu_image').attr('src',resized);
        $('#menu_image').css('visibility','visible');
        $('#menu_image').css('margin-left','-100%');


      }
    };
}

function readfiles_s(files) {
  
    for (var i_ = 0; i_ < files.length; i_++) {
      processfile_s(files[i_]); 
    }

}

function resizeMe_s(img,ext_) {
  var max_width = 1400;
  var max_height = 1400;
  var canvas = document.createElement('canvas');
  var width = img.width;
  var height = img.height;

  if (width > height) {
    if (width > max_width) {
      height = Math.round(height *= max_width / width);
      width = max_width;
    }
  } else {
    if (height > max_height) {
      width = Math.round(width *= max_height / height);
      height = max_height;
    }
  }
 
  canvas.width = width;
  canvas.height = height;
  var ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, width, height);

  if(ext_=='jpg')ext_='jpeg';
  return canvas.toDataURL("image/"+ext_,0.7); 
}