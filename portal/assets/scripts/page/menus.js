const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
let supp_id = Supplier_[0]['id'];
var selectedDup;
async function menusdata(){
    mnu_='';
    showLoading();
    let parameter = {
          model: 'menu',
          action: 'retrieve',
          retrieve: '*',
          condition: [
                    ['sb_id','=',supp_id]
            ]

      };

      try {
        var response = await sendhttpRequest(parameter);
        mnuD = response.data;
        lngth = mnuD.length;
        for(i=0; i<lngth; i++){
            var start_d = new Date(mnuD[i].start_date);
            var end_d = new Date(mnuD[i].end_date);
            mnu_ +=`<div class="menu__list-item small-12 large-4 medium-4">
                    <div class="space-btwn x-start">
                        <div>
                            <div class="menu__list-item-name">
                                ${mnuD[i].name}
                            </div>
                        </div>

                        <div class="left-auto x-center">
                            <button class="btn red" onclick="deleteItem(${mnuD[i].id},'${mnuD[i].name}')">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="flex">
                        <div class="text-with-labels">
                            <span class="text-value">${monthNames[start_d.getMonth()]} ${start_d.getDay()}, ${start_d.getFullYear()}</span>
                            <span class="text-label">Start Date</span>
                        </div>
                        <div class="text-with-labels">
                            <span class="text-value">${monthNames[end_d.getMonth()]} ${end_d.getDay()}, ${end_d.getFullYear()}</span>
                            <span class="text-label">End Date</span>
                        </div>
                    </div>
                    <div class="button-group top20">
                        <button class="btn icon-right default"  onclick="window.location.href = '/view-menus?id=${mnuD[i].id}';">View <i class="bi bi-eye"></i></buton>
                        <button class="btn icon-right default-3" onclick="window.location.href = '/edit-menus?id=${mnuD[i].id}';">Edit <i class="bi bi-pencil-fill"></i></buton>
                        <button class="btn icon-right default-2" onclick ="copythismenu(${mnuD[i].id})" >Copy <i class="bi bi-copy"></i></buton>
                    </div>
                </div>`;
        }
        $('.menu__list').append(mnu_);

        
      } catch(error) {
        console.log("Error: ", error);
      }
    setTimeout(
    closeLoading 
    , 50);   
}

menusdata();
async function removeselected(id){
    let parameter = {
          model: 'menu',
          action: 'delete',
          condition: [
                ['id','=',id]
            ]
      };

    try {
        var response = await sendhttpRequest(parameter);
        $('.menu__list-item').remove();
        closemodal('centermodal1');
        menusdata();
    }catch(error) {
        console.log("Error: ", error);
    }
}
function deleteItem(id , name){
  modalcont = `<div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h4 class="modal-title" id="myCenterModalLabel">OneHive</h4>
                            <button type="button" class="btn-close"  onclick="closemodal('centermodal1')" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <h5>Are you sure you want to remove ${name}?</h5>
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
async function copythismenu(id){
    let parameter = {
          model: 'menu',
          action: 'retrieve',
          retrieve: '*',
          condition:[
                ['id','=',id]
            ]
      };
      try {
        var response = await sendhttpRequest(parameter);
        mnu_s = response.data[0];
        dupModal = `<div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="exampleModalLabel">Duplicate ${mnu_s.name} menu</h5>
                                <button type="button" class="btn-close" onclick="closemodal('exampleModal')" aria-label="Close"></button>
                            </div>
                            <form onsubmit="dupMenus(event)">
                            <div class="modal-body">
                                <p>This will duplicate products form menu "${mnu_s.name}".</p>
                                    
                                        <div class="form-group-row col70">
                                 
                                            <div class="form-field form-field__no-border col50">
                                                    <label class="switch">
                                                        <input type="checkbox" data-label="item_status" id="item_status" value="0">
                                                        <span class="slider round"></span>
                                                    </label>
                                                    
                                                    <div class="form-field-label-2">Status</div>
                                            </div>
                                        </div>
                                        <div class="form-group-row col70">
                                            <div class="form-field with-value">
                                                <div class="form-field-label">Name</div>
                                                <div class="x-center">
                                                    <input id="listings" type="hidden"  value="${mnu_s.listings}" required />
                                                    <input type="text" id="mnu_name" class="form-field-input" placeholder="Name" name="name" required />
                                                </div>
                                            </div>
                                        </div>
                                        <div class="form-group-row col70 flex">
                                            <div class="form-field with-value col50">
                                                <div class="form-field-label">Start Date</div>
                                                <div class="x-center">
                                                    <input type="date" id="mnu_start_date" value="${mnu_s.start_date}" class="form-field-input" name="start_date" required />
                                                </div>
                                            </div>
                                            <div class="form-field with-value col50">
                                                <div class="form-field-label">End Date</div>
                                                <div class="x-center">
                                                    <input type="date" id="mnu_end_date" value="${mnu_s.end_date}" class="form-field-input" name="end_date" required />
                                                </div>
                                            </div>
                                        </div>
                                    
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" onclick="closemodal('exampleModal')">Close</button>
                                <button type="submit" class="btn btn-primary">Save</button>
                            </div>
                            </form>
                        </div>
                    </div>`;
            $('#exampleModal').append(dupModal);
            showmodal1();
            if(mnu_s.status=='1')document.getElementById("item_status").checked = true;
            else document.getElementById("item_status").checked = false;
            $('#menu_image').css('visibility','visible');
            $('#menu_image').css('margin-left','-100%');
            selectedDup = id;
      } catch(error) {
        console.log("Error: ", error);
      }
}
async function dupMenus(event){
    event.preventDefault();
    showLoading();
    var sp_= await Get_supplier();
    let name = event.target['mnu_name'].value;
    let mnu_start_date = event.target['mnu_start_date'].value;
    let mnu_end_date = event.target['mnu_end_date'].value;
    let listings = event.target['listings'].value;
    var lfckv = document.getElementById("item_status").checked;
    if(lfckv)item_status=1;
      else item_status=0;
      // let file_ = document.getElementById('menu_image').src;
      
      // Arrfile=file_.match(/.{1,6000}/g);
      // fileLength = Arrfile.length;
      let parameter = {
          model: 'menu',
          action: 'insert',
          insert: { 
                'name': name, 
                'start_date': mnu_start_date,
                'end_date': mnu_end_date, 
                // 'image': Arrfile[0],
                'sb_id': Supplier_id_,
                'status': item_status,
                'listings': listings
              }
      };

      try {
        var response = await sendhttpRequest(parameter);
        if(response['code']==200){        
          i=1; 
          // while(i<fileLength){  
          //   slice = Arrfile[i];
          //   aendfile = await sendslice(response['id'], slice, 'image');
          //   i++;
          // }
        }
        location.href = '/menus';
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




function showmodal1(){
    $('#exampleModal').show();
}
function closemodal(id){
    $('#'+id).hide();
    $('.modal-dialog').remove();
}