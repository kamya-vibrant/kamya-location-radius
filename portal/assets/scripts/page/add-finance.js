const finance_report = document.querySelector("#finance_report");
const file_reportid = document.getElementById('file_report');
// var file_report = document.getElementById('file_report').value;
async function supplier_dsa(){
	Supplier_=JSON.parse(localStorage.supplier);
	if(Supplier_.length==0){
			console.log('log:',localStorage.loggedData);
			let parameter = {
			    model: 'user',
		        action: 'retrieve',
		        fields: ['supplier_id'],
		        condition: [
			        	["id", "=", JSON.parse(localStorage.loggedData).user_id],
			        ]
			    }
			try {
				var response =  await sendhttpRequest(parameter);
				console.log(response);
				Supplier_id_ = response.data[0].supplier_id;
			}catch(error) {
			        console.log("Error: ", error);
			}    
		    	

	}else Supplier_id_ =Supplier_[0].id;
}
supplier_dsa();
async function loadSchool(){
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
			$('#school').append('<option value="'+sch[i]['id']+'">'+sch[i]['name']+'</option>');
		}
	}catch(error) {
	    console.log("Error: ", error);
	}     
}
loadSchool();
finance_report.addEventListener('change', function () {
    putfile(this);
  });

function putfile(input){
	if (input.files && input.files[0]) {
	    var reader = new FileReader();
	    reader.onload = function (e) {
	      	file_reportid.setAttribute('src', e.target.result);

	    };
	    reader.readAsDataURL(input.files[0]);
	}
}
async function addfinancefunc(event){
	event.preventDefault();
	showLoading();
	let School = event.target['school'].value;
	let delivery_date = event.target['delivery_date'].value;
	let orders = event.target['orders'].value;
	let payout = event.target['payout'].value;
	let status = event.target['status'].value;
	file_=file_reportid.src;
	Arrfile=file_.match(/.{1,7000}/g);
	fileLength = Arrfile.length;
	let parameter = {
			model: 'finance',
			action: 'insert',
			insert: { 
						'school_id': School, 
						'delivery_day': delivery_date,
						'orders': orders, 
						'payout': payout, 
						'status': status, 
						'finance_report': Arrfile[0],
						'supplier_id': Supplier_id_
					}
	};

 	try {
		var response = await sendhttpRequest(parameter);
		if(response['code']==200){
					    		
			i=1; 
			while(i<fileLength){	
				slice = Arrfile[i];
				aendfile = await sendslice(response['id'], slice, 'finance_report');
				i++;
			}
		}
		location.href = '/finance';
	} catch(error) {
		console.log("Error: ", error);
	}
	setTimeout(
	closeLoading 
	, 50);     
}

async function sendslice(id, slice, which){
	let parameter2 = {
				model: 'finance',
				action: 'insertfile',
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

// process image

var fileinput = document.getElementById('finance_report');

var max_width = 1400;
var max_height = 1400;

var preview = document.getElementById('preview_img');

var form = document.getElementById('form-div');

function processfile(file) {
  	fileName = document.querySelector('#finance_report').value; 
    extension = fileName.split('.').pop(); 
    if( !( /image/i ).test( file.type ) )
        {

            return false;
        }

    // read the files
    var reader = new FileReader();
    reader.readAsArrayBuffer(file);
    
    reader.onload = function (event) {
      // blob stuff
      var blob = new Blob([event.target.result]); // create blob...
      window.URL = window.URL || window.webkitURL;
      var blobURL = window.URL.createObjectURL(blob); // and get it's URL
      file_reportid.src = blobURL;
      // helper Image object
      var image = new Image();
      image.src = blobURL;

      image.onload = function() {

        var resized = resizeMe(image,extension); // send it to canvas
        file_reportid.setAttribute('src', resized);

      }
    };
}

function readfiles(files) {
  
    for (var i = 0; i < files.length; i++) {
      processfile(files[i]); // process each file at once
    }

}

// this is where it starts. event triggered when user selects files
fileinput.onchange = function(){
  if ( !( window.File && window.FileReader && window.FileList && window.Blob ) ) {
    alert('The File APIs are not fully supported in this browser.');
    return false;
    }
  readfiles(fileinput.files);
}

// === RESIZE ====

function resizeMe(img,ext_) {
  
  var canvas = document.createElement('canvas');
  var width = img.width;
  var height = img.height;

  // calculate the width and height, constraining the proportions
  if (width > height) {
    if (width > max_width) {
      //height *= max_width / width;
      height = Math.round(height *= max_width / width);
      width = max_width;
    }
  } else {
    if (height > max_height) {
      //width *= max_height / height;
      width = Math.round(width *= max_height / height);
      height = max_height;
    }
  }
  
  // resize the canvas and draw the image data into it
  canvas.width = width;
  canvas.height = height;
  var ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, width, height);

  if(ext_=='jpg')ext_='jpeg';
  return canvas.toDataURL("image/"+ext_,0.7); 

}