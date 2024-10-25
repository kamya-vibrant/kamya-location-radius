
const createdUnit = [];
let createdUnits;

const selectedAllergen = [];
let selectedAllergens;

const selectedDietary = [];
let selectedDietaries;

//let imageParts;
//let formErrors = 0;
//let imageUpload = false;
//let Supplier_ = JSON.parse(localStorage.supplier);
let suppID = Supplier_[0]['id'];
document.getElementById("item_status").checked = true;

let MSL = {

    main: {

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
                $(".alert_wrapper").html("<div class='alert alert-success'>Ingredient has been added.</div>");
                window.scrollTo({
                    top: 0,
                    left: 0,
                    behavior: 'smooth' // Optional: Use 'smooth' for a smooth scrolling effect
                });
                
                setTimeout(()=>{
                    $('button.btn_submit').html('Save Changes <i class="bi bi-check"></i>').removeAttr("disabled");
                    $('#main-'+form+'-form')[0].reset();

                    //clear image
                    $('.'+form+'_image').attr({
                        "src": "",
                        "style": "visibility:hidden;margin-left:0;"
                    });
                    $('.form-field-image-overlay-'+form).removeAttr("style");
                    $('#textarea_'+form).text("");

                    //clear allergens
                    $('.allergen-wrapper .form-field-tag').removeClass(" active");
                    $('.allergen-section').html("");

                    selectedAllergen.splice(0, selectedAllergen.length);

                },500);

                //clear the alert message
                setTimeout(() => {
                    $(".alert_wrapper").html("");
                },2500);
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
                        
                        allergens += `<div class="form-field-tag " data-id="${item.id}" data-icon-link="${item.image}" data-info="allergen" data-name="${item.name}" data-task="allergens" data-create="1" data-for="ingredient" onclick="MSL.ingredient.selectDetails(this); return false;">${item.name}</div>`;

                    });

                    $('.allergen-wrapper').html(allergens.replace("undefined",""));
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

            $('#crop_popup').on('shown.bs.modal', function(){
            const cropOptions = {
              image: image_val,
              imgFormat: '200x200', // Formats: 3/2, 200x360, auto
              // circleCrop: true,
              zoomable: true
            }

            // Initiate cropper
            cropper = $('#crop_popup .modal-body').cropimage( cropOptions )

            setTimeout( () => {console.log('set-image'); cropper.setImage( image_val )}, 1000 )
          })
          .modal();

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

        saveItem: async (e) => {
            MSL_GLOBAL.main.globalModal('warning', 'submission', 'Create Ingredient', 'Submitting ingredient... Please wait...');

            let form = $("#"+$(e).attr("id"));

            let checkFormValidity = MSL.main.checkFormValidity(form);

            let productImage;
            let imageLength;
            let base64Parts;

            if (checkFormValidity === true) {

                $('.btn_submit').text("Saving...").attr("disabled", "disabled");

                if ($('.ingredient_image').attr('src')) {
                    base64Parts = MSL.main.splitBase64String($('.ingredient_image').attr('src'), 3000);
                    productImage = base64Parts[0];
                } else {
                    productImage = '';
                }

                let parameter = {

                    model: 'ingredient',
                    action: 'insert',
                    insert: {
                        'sb_id': suppID,
                        'name': form.find('input[name=name]').val(),
                        'image': productImage,
                        'status': form.find('input[name=item_status]').val()
                    }

                }
                
                try {
                    let response = await sendhttpRequest(parameter);
                    
                    if (response['code'] == 200 && response['data'] != '') {

                        //insert into allergens_assoc
                        if (selectedAllergen.length > 0) {
                            for (let i = 0; i < selectedAllergen.length; i++) {
                                MSL.ingredient.insertDetails('allergens_assoc', response['id'], selectedAllergen[i]);
                            }

                        }

                        if (productImage.length > 0) {
                            sendSL = await MSL_GLOBAL.main.uploadImageSequentially('ingredient', 'ingredient', response['id'], base64Parts, 1, 'image', 'main-ingredient-form');
                            location.href = '/ingredient';
                        } else {
                            if (formErrors == 0) {
                                setTimeout(() => {
                                    MSL_GLOBAL.main.cleanForm('main-ingredient-form');
                                },350);
                                
                            }
                        }


                    }
                    
                } catch(error) {
                    console.log("Error: ",error);
                    formErrors++;
                }

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
                
            } catch(error) {
                console.log("Error: ", error);
                formErrors++;
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

            console.log(selectedAllergen);
        }

    }

}

MSL.main.getAllergens();