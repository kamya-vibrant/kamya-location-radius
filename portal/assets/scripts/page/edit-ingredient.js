
const createdUnit = [];
let createdUnits;

var selectedAllergen = [];
let selectedAllergens;

const selectedDietary = [];
let selectedDietaries;

// let imageParts;

let formErrors = 0;
// let imageUpload = false;

let suppID = Supplier_[0]['id'];
let itemID = "";
let MSL = {

    main: {

        onLoad: async () => {

            let url = window.location.href;

            url = new URL(url);
            itemID = url.searchParams.get("id");

            MSL.ingredient.getIngredient(itemID);
            MSL.main.getAllergens();
            setTimeout(() => {
                MSL.ingredient.getDetails('allergens_assoc', itemID);
            },500);
        },

        checkFormValidity: (form) => {

            // Check form validity
            if (!form[0].checkValidity()) {
                // If the form is invalid, prevent the default form submission and show validation messages
                form[0].reportValidity(); // This will show the browser's built-in validation messages
                return false;
            }

            return true;

        },

        cleanForm: async (form) => {

            if (formErrors == 0) {
                //$(".alert_wrapper").html("<div class='alert alert-success'>Ingredient has been updated.</div>");
                window.scrollTo({
                    top: 0,
                    left: 0,
                    behavior: 'smooth' // Optional: Use 'smooth' for a smooth scrolling effect
                });
                
                setTimeout(()=>{
                    $('button.btn_submit').html('Save Changes <i class="bi bi-check"></i>').removeAttr("disabled");
                },500);

                //clear the alert message
                //setTimeout(() => {
                   //$(".alert_wrapper").html("");
                //},2500);
            }
        },

        setStatus: async (e) => {
            if ($(e).is(":checked")) {
                console.log(1);
                $("input[name="+$(e).data("label")+"]").val(1);
            } else{
                $("input[name="+$(e).data("label")+"]").val(0);
            }
        },

        getAllergens: async () => {

            let parameter = {
                model: 'assoc',
                table: 'allergen',
                action: 'custom_retrieve',
                retrieve: '*'
            }

            let allergens;

            try {
                let response = await sendhttpRequest(parameter);
                console.log(response);

                if (response['code'] == 200 && response['data'] != '') {
                    $.map(response['data'], (item, index) => {

                        allergens += `<div class="form-field-tag " data-id="${item.id}" data-item_id="${itemID}" data-icon-link="${item.image}" data-info="allergens" data-name="${item.name}" data-task="allergens" data-create="1" data-for="ingredient" onclick="MSL.ingredient.updateDetails(this); return false;">${item.name}</div>`;

                    });

                    $('.allergens-wrapper').html(allergens.replace("undefined",""));
                }

            } catch(error) {
                console.log("Error: ", error);
            }
        },

        selectImage: async (e) => {
            let image = $(e).data("image");
            let textarea = $("#textarea_"+$(e).data("image"));

            if (e.files && e.files[0]) {
            var reader = new FileReader();
            reader.onload = function (d) {
                textarea.text(d.target.result);
              //document.getElementById('crop').click();
              MSL.main.initCropper(image, textarea.text());
            };

            reader.readAsDataURL(e.files[0]);
          }

        },

        initCropper: async (image, image_val) => {
            //image = if this for main product or for unit
            //image_val = this is the base64 value if the image selected

            let cropper;
            let image_style;
            var myModal = new bootstrap.Modal(document.getElementById("crop_popup"), {});
            // $('#crop_popup').on('shown.bs.modal', function(){
            const cropOptions = {
              image: image_val,
              imgFormat: '200x200', // Formats: 3/2, 200x360, auto
              // circleCrop: true,
              zoomable: true
            }

            // Initiate cropper
            cropper = $('#crop_popup .modal-body').cropimage( cropOptions )

            setTimeout( () => {console.log('set-image'); cropper.setImage( image_val )}, 1000 )
          // })
          // .modal();
            myModal.show();
          $("#crop_popup .crop-it").on("click", (e) => {
            const blobDataURL = cropper.getImage('PNG'); // JPEG, PNG, ...
            
            switch(image) {

                case "product": case 'ingredient':
                    image_style = "margin-left:-95%;";
                    break;

                case "unit":
                    image_style = "margin-left:-150%;";
                    break;

                default:
                    image_style = "visibility:visible;";
                    break;
            }

            $("."+image+"_image").attr({
                "src": blobDataURL,
                "style": "visibility:visible;"+image_style
            });

            $(".form-field-image-overlay-"+image).attr({
                "style":"background-color: unset;"
            });

            $('input[name=is_changed_'+image+']').val(1);

            // base64Parts = splitBase64String(blobDataURL, 3000);
            // uploadImageSequentially('pantry', 1, base64Parts, 0, 1);

            //start clearing cropper image
            cropper = null; // always clear the cropper after cropping image. cropimage.js has no destroy() function so we need to do it manually
            image = ""; // clear the data-image value so it won't mess up the other image holders
            image_style = "";

            setTimeout(()=>{
                $("#crop_popup").modal('hide');
            },350);

          });

        },

        splitBase64String: (base64String, chunkSize) => {
            let parts = [];
            for (let i = 0; i < base64String.length; i += chunkSize) {
                parts.push(base64String.substring(i, i + chunkSize));
            }
            return parts;
        },

        uploadBase64Part: async (table, id, part, which) => {
            let parameter = {
                model: 'ingredient',
                table: table,
                action: 'upload_image_parts',
                fields: [
                    which
                ],
                parts: [
                    part
                ],
                condition: [['id', '=', id]]
            }

            try {
                    let response = await sendhttpRequest(parameter)
                    if (response['code'] == 200) return true;
                } catch (error) {
                    console.log("Error: ", error);
                }

            return false;

        },

        uploadImageSequentially: async (table, id, parts, part, which) => {

            for (let n = part; n < parts.length; n++) {
                try {
                    let response = await MSL.main.uploadBase64Part(table, id, parts[n], which);
                    if (response) {
                        if (n == (parts.length - 1)) MSL.main.cleanForm('ingredient'); 
                        console.log(`Part ${n} of ${parts.length} is uploaded`);
                    }
                } catch (error) {
                    console.log("Error: ", error);
                }
            }

        },

        closeCropperModal: async(e) => {
			console.dir("closeCropperModal begin::")

			var modal = document.getElementById	('crop_popup');
			var modalBody= modal.querySelector('.modal-body');
			modalBody.innerHTML = ''

			var cropIntance = modal.querySelector('.crop-it');
			if(cropIntance) {
				cropIntance.cropper = null;
			}

			var fileInput = document.getElementById('ingredient')
			if(fileInput) {
				fileInput.value = '';
			}

			$('#crop_popup').modal('hide');


			console.dir("closeCropperModal end::")
		},

    },

    ingredient: {

        getIngredient: async (id) => {

            let parameter = {
                model: 'ingredient',
                action: 'retrieve',
                retrieve: '*',
                condition: [['id','=', id]]
            }

            let form = $('#main-ingredient-form');

            try {
                let response = await sendhttpRequest(parameter);

                if (response['code'] == 200 && response['data'] != '') {

                    for (const item of response['data']) {

                        if (item.image.length > 0) {
                            $('.ingredient_image').attr({
                                "src": item.image,
                                "style": "visibility: visible;margin-left: 37%;"
                            });
                            $('#textarea_ingredient').html(item.image);
                            $('.form-field-image-overlay-ingredient').attr("style", "background-color: unset;");
                        }


                        //populate fields
                        form.find('input[name=name]').val(item.name);
                        form.find("input[name=item_status]").val(item.status);
                
                        if (item.status == 1) {
                            form.find('input[data-label=item_status]').attr("checked", "checked");
                        }

                    }
                }
            } catch(error) {
                console.log("Error: ", error);
            }
        },

        getDetails: async (table, pid) => {

            let parameter = {

                model: 'assoc',
                table: table,
                action: 'custom_join_query',
                id: pid,
                type: 'ingredient'
            }
            let detail_icon = "";

            try {
                let response = await sendhttpRequest(parameter);
                if (response['code'] == 200) {

                    table = table.replace("_assoc","");

                    $('.'+table+'-wrapper .form-field-tag').each(function(){

                        $.map(response['data'], (item, index) => {
                            //console.log($(this));
                            if ($(this).data("id") == item.id) {
                                $(this).addClass(" active");

                                detail_icon += `<div class="form-field-tags-selected-item ${table}-${item.id}"> \
                                                    <lord-icon src="${item.image}" colors="primary:#012928,secondary:#01dc82" trigger="hover" style="width:50px;height:50px"></lord-icon> \
                                                    <span>${item.name}</span> \
                                                </div>`;

                                if (table == "allergens") {
                                    if ($.inArray(item.id, selectedAllergen) === -1) {
                                        selectedAllergen.push(item.id);
                                        selectedAllergens = selectedAllergen;
                                    }
                                }

                                if (table == "dietary") {
                                    
                                    if ($.inArray(item.id, selectedDietary) === -1) {
                                        selectedDietary.push(item.id);
                                        selectedDietaries = selectedDietary;
                                    }
                                }

                            } else {
                                detail_icon += "";
                            }
                        });

                    });

                    $('.'+table+'-section').html(detail_icon);
                }


            } catch(error) {
                console.log("Error: ", error);
            }

        },

        saveItem: async (e) => {

            let form = $("#"+$(e).attr("id"));

            let checkFormValidity = MSL.main.checkFormValidity(form);
            
            //$('.btn_submit').text("Updating...").attr("disabled", "disabled");

            let productImage;
            let imageLength;
            let base64Parts;

            if (checkFormValidity === true) {
                MSL_GLOBAL.main.globalModal('warning', 'submission', 'Update Ingredient', 'Updating ingredient... Please wait...');
                let parameter = {

                    model: 'ingredient',
                    action: 'update',
                    update: {},
                    condition: [['id', '=', itemID]]

                }

                if ($('.ingredient_image').attr('src').length > 0 && $('input#is_changed_ingredient').val() == 1) {
                    base64Parts = MSL.main.splitBase64String($('.ingredient_image').attr('src'), 3000);
                    productImage = base64Parts[0];

                    parameter.update['name'] = form.find('input[name=name]').val();
                    parameter.update['image'] = productImage;
                    parameter.update['status'] = form.find('input[name=item_status]').val();

                } else {

                    productImage = '';

                    parameter.update['name'] = form.find('input[name=name]').val();
                    parameter.update['status'] = form.find('input[name=item_status]').val();

                }

                console.log(parameter);
                
                try {
                    let response = await sendhttpRequest(parameter);
                    
                    if (response['code'] == 200 && response['data'] != '') {

                        //updating into allergens_assoc
                        MSL.ingredient.updateAllergens('allergens_assoc',itemID,selectedAllergen);
                        if (productImage.length > 0 ) {
                            sendingIMG = await MSL.main.uploadImageSequentially('ingredient', itemID, base64Parts, 1, 'image');
                            
                        } else {
                            if (formErrors == 0) {
                                setTimeout(() => {

                                    MSL.main.cleanForm('ingredient');
                                },350);
                            }
                        }
                        MSL_GLOBAL.main.globalModal('success', 'succesful', 'Update Ingredient', 'Updated Ingredient succesfully...');
                    }
                    
                } catch(error) {
                    console.log("Error: ",error);
                    formErrors++;
                }
            }
        },
        updateAllergens: async (table,item_id,selectedAllergen) =>{
            
            let parameter = {
                model: 'assoc',
                table: table,
                action: 'custom_delete',
                condition: [ 
                        ['item_id','=',item_id],
                        ['type','=','ingredient']
                    ]
            }

            try {
                let response = await sendhttpRequest(parameter);
                if(response.code=='200'){
                    for(const aid_ of selectedAllergen){
                        saving_ll= await MSL.ingredient.insertDetails(table,item_id,aid_);
                    }
                    
                }
                
            } catch(error) {
                console.log("Error: ", error);
                formErrors++;
            }
        },
        insertDetails: async (table, item_id, id) => {

            let tid = (table == "allergens_assoc") ? "aid" : "did";
            let parameter = {
                model: 'assoc',
                table: table,
                action: 'custom_insert',
                insert: {
                    item_id: item_id,
                    [tid]: id,
                    type: 'ingredient'
                }
            }

            try {
                let response = await sendhttpRequest(parameter);
                return response;
            } catch(error) {
                console.log("Error: ", error);
                formErrors++;
            }

        },

        updateDetails: async (e) => {

            // let parameter = {
            //     model: 'assoc',
            //     action: 'custom_update_assoc',
            //     table: 'allergens_assoc',
            //     item_id: $(e).data("item_id"),
            //     id: $(e).data("id")
            // }

            // let icon;

            // try {
            //     let response = await sendhttpRequest(parameter);
            //     console.log(response['id']);

            //     if (response['code'] == 200 && typeof response['id'] !== "undefined") {
            //         $(e).addClass(" active");
            //         icon = `<div class="form-field-tags-selected-item ${$(e).data("info")}-${$(e).data("id")}"> \
            //                     <lord-icon src="${$(e).data("icon-link")}" colors="primary:#012928,secondary:#01dc82" trigger="hover" style="width:50px;height:50px"></lord-icon> \
            //                     <span>${$(e).data("name")}</span> \
            //                 </div>`;

            //         $('.'+$(e).data("info")+'-section').append(icon.replace("undefined",""));
            //     } else {
            //         $(e).removeClass(" active");
            //         $('.'+$(e).data("info")+'-section .'+$(e).data("info")+'-'+$(e).data("id")).remove();
            //     }

            // } catch(error) {
            //     console.log("Error: ", error);
            // }
            let icon = "";
            let id = $(e).data("id");
            let icon_link = $(e).data("icon-link");
            let name = $(e).data("name");
            let info = $(e).data("info");

            if ($(e).hasClass("active")) {
                //remove active state to selected allergen or dietary
                $(e).removeClass(" active");
                
                //remove icon to the allergen wrapper
                $('.'+info+'-'+id).remove();

                if (selectedAllergen.length > 0) {
                    for (let i = 0; i < selectedAllergen.length; i++) {
                        if (id == selectedAllergen[i]) {
                            selectedAllergen.splice(i, 1)
                        } 
                    }
                }
            
            } else {

                //add active state to selected allergen or dietary
                $(e).addClass(" active");
                
                //add icon to the allergen wrapper
                icon = `<div class="form-field-tags-selected-item ${info}-${id}"> \
                            <lord-icon src="${icon_link}" colors="primary:#012928,secondary:#01dc82" trigger="hover" style="width:50px;height:50px"></lord-icon><span>${name}</span> \
                        </div>`;

                $('.'+info+'-section').append(icon);

                // check if selected value is already in array. if value does not exist, push it into array. if already existing, do nothing
                if ($.inArray(id, selectedAllergen) === -1) {
                    selectedAllergen.push(id);
                    selectedAllergens = selectedAllergen;
                }

            }
            
        },

        selectDetails: async (e) => {
            let icon = "";
            let id = $(e).data("id");
            let icon_link = $(e).data("icon-link");
            let name = $(e).data("name");
            let info = $(e).data("info");

            if ($(e).hasClass("active")) {
                //remove active state to selected allergen or dietary
                $(e).removeClass(" active");
                
                //remove icon to the allergen wrapper
                $('.'+info+'-section .'+info+'-'+id).remove();

                if (selectedAllergen.length > 0) {
                    for (let i = 0; i < selectedAllergen.length; i++) {
                        if (id == selectedAllergen[i]) {
                            selectedAllergen.splice(i, 1)
                        } 
                    }
                }
            
            } else {

                //add active state to selected allergen or dietary
                $(e).addClass(" active");
                
                //add icon to the allergen wrapper
                icon = `<div class="form-field-tags-selected-item ${info}-${id}"> \
                            <lord-icon src="${icon_link}" colors="primary:#012928,secondary:#01dc82" trigger="hover" style="width:50px;height:50px"></lord-icon><span>${name}</span> \
                        </div>`;

                $('.'+info+'-section').append(icon);

                // check if selected value is already in array. if value does not exist, push it into array. if already existing, do nothing
                if ($.inArray(id, selectedAllergen) === -1) {
                    selectedAllergen.push(id);
                    selectedAllergens = selectedAllergen;
                }

            }

            console.log(selectedAllergen);
        }

    }

}

MSL.main.onLoad(); // call when page is loaded
// alert(JSON.stringify(selectedAllergen));