const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
let url = window.location.href;
url = new URL(url);
itemID = url.searchParams.get("id");
let supp_id = Supplier_[0]['id'];

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
        ids = response.data[0].listings;
        ids = ids.split(',');
        if(response.data[0].listings!=='')$('#tempVal').val(','+response.data[0].listings);
    }catch(error) {
        console.log("Error: ", error);
    }
}

async function productsformnu(){
    // showLoading();
    mnu_='';
    loadth = await menudta(itemID);
    let parameter = {
          model: 'listing',
          action: 'retrieve',
          retrieve: '*',
          condition:[
                    ['sb_id','=',supp_id],
                    ['status','=','1']
            ]
      };

      try {
        var response = await sendhttpRequest(parameter);
        var prodMnu = response.data;
        for(i=0; i<prodMnu.length; i++){
            var start_d = new Date(prodMnu[i].start_date);
            var end_d = new Date(prodMnu[i].end_date);
            let image = ( prodMnu[i].image === null) ? '/portal/assets/images/no-image.png' : prodMnu[i].image;
            // if((i%3)==0)mnu_ +=`</div><div class="menu__list small-12 large-12">`;
            mnu_ +=`<div class="menu__list-item">
                    <div class="space-btwn x-start">
                        <div>
                            <div class="menu__list-item-name">
                                ${prodMnu[i].item_name}
                            </div>
                            <img src="${image}" style="max-width:100%;"/>
                        </div>
                    </div>
                    <div class="flex">
                        <div class="card-body">
                            <p class="card-text">${prodMnu[i].short_description}</p>
                            <p class="card-text"><b>Start Date:</b> ${monthNames[start_d.getMonth()]} ${start_d.getDay()}, ${start_d.getFullYear()}</p>
                            <p class="card-text"><b>End Date:</b> ${monthNames[end_d.getMonth()]} ${end_d.getDay()}, ${end_d.getFullYear()}</p>
                            <div class="form-field form-field__no-border col50">
                                <label class="switch">
                                    <input type="checkbox" data-label="item_status" id="inp_${prodMnu[i].id}" value="0" onchange="checkthisval(${prodMnu[i].id})">
                                    <span class="slider round"></span>
                                </label>
                                <div class="form-field-label-2">Select</div>
                            </div>
                                  
                        </div>

                    </div>

                </div>`;
            }
            $('#mnu_product_tbl').append(mnu_);
            // var tableBody = document
            //       .getElementById("mnu_product_tbl")
            //       .getElementsByTagName("tbody")[0];
            // var rowsHtml = prodMnu
            //   .map(
            //     (prodMnu) =>
            //       `<tr>
            //         <td><input type="checkbox" id="inp_${prodMnu.id}" onchange="checkthisval(${prodMnu.id})" style="margin-right:10px"><img src="${prodMnu.image}" style="max-width:200px"/></td>
            //         <td>${prodMnu.item_name}</td>
            //         <td>${prodMnu.short_description}</td>  
            //         <td>${prodMnu.price}</td>
            //         <td>${prodMnu.start_date}</td>
            //         <td>${prodMnu.end_date}</td>
            //     </tr>`
            //   )
            //   .join("");

            // tableBody.innerHTML = rowsHtml;
            console.log(ids.length);
            for(i=0; i<ids.length; i++){
                document.getElementById('inp_'+ids[i]).checked = true;
                // alert(ids[i]);
            }

      } catch(error) {
        console.log("Error: ", error);
      }
    // setTimeout(
    // closeLoading 
    // , 50);   
}
productsformnu();

async function checkthisval(id){
    var isChecked = $("#inp_"+id).is(":checked");
    var tempval = $('#tempVal').val();
    if(isChecked){
        $('#tempVal').val(tempval+','+id);
    }else{
        tempval = tempval.replace(','+id,'');
        $('#tempVal').val(tempval);
    }
    
}
async function SaveProducts(){
     var tempval = $('#tempVal').val();
    if(tempval!==''){
        tempval = tempval.substring(1);
        let parameter = {
              model: 'menu',
              action: 'update',
              update: {
                    'listings': tempval
              },
              condition:[
                        ['id','=',itemID]
                ]
          };

          try {
            var response = await sendhttpRequest(parameter);
            window.location.href='/view-menus?id='+itemID;
          } catch(error) {
            console.log("Error: ", error);
          }
    }else alert('No Selected product!');
}