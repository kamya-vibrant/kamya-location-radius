
const createdUnit = [];
let createdUnits;

const selectedAllergen = [];
let selectedAllergens;

const selectedIngredient = [];
let selectedIngredients;

//let imageParts;

let formErrors = 0;
// let imageUpload = false;

let suppID = Supplier_[0]['id'];

let MSL = {

	main: {
		onLoad: async () => {

			MSL.main.getIngredients();
			MSL.main.getAllergens();
		},

		getIngredients: async () => {

			let parameter = {
				model: 'ingredient',
				action: 'retrieve',
				retrieve: '*',
				condition: [['sb_id', '=', suppID]]

			}

			let ingredients;

			try {
				let response = await sendhttpRequest(parameter);
				console.log(response);

				if (response['code'] == 200 && response['data'] != '') {
					$.map(response['data'], (item, index) => {
						ingredients += `<div class="form-field-tag " data-id="${item.id}" data-image="" data-info="ingredients" data-name="${item.name}" data-task="ingredients" onclick="MSL.main.selectItem(this); return false;">${item.name}</div>`;
					});

					$('.ingredients-wrapper').html(ingredients.replace("undefined",""));
				}

			} catch(error) {
				console.log("Error: ", error);
			}

		},

		getAllergens: async () => {

			let parameter = {
				model: 'assoc',
				action: 'custom_retrieve',
				table: 'allergen',
				retrieve: '*',
				condition: [['sb_id', '=', suppID]]

			}

			let ingredients;

			try {
				let response = await sendhttpRequest(parameter);
				console.log(response);

				if (response['code'] == 200 && response['data'] != '') {
					$.map(response['data'], (item, index) => {
						ingredients += `<div class="form-field-tag " data-id="${item.id}" data-image="${item.image}" data-info="allergens" data-name="${item.name}" data-task="allergens" onclick="MSL.main.selectItem(this); return false;">${item.name}</div>`;
					});

					$('.allergens-wrapper').html(ingredients.replace("undefined",""));
				}

			} catch(error) {
				console.log("Error: ", error);
			}

		},

		selectItem: async (e) => {

			let ingredients;

			if ($(e).hasClass("active")) {
				$(e).removeClass(" active");

				$('.'+$(e).data('info')+'-section .'+$(e).data('info')+'-'+$(e).data('id')).remove();

				switch($(e).data('info')) {
	                case 'allergens':
	                	for (let i = 0; i < selectedAllergen.length; i++) {
	                		if (selectedAllergen[i] == $(e).data('id')) selectedAllergen.splice(i, 1);
	                	}
	                	console.log("selectedAllergen", selectedAllergen);
	                	break;

	                case 'ingredients':
	                	for (let i = 0; i < selectedIngredient.length; i++) {
	                		if (selectedIngredient[i] == $(e).data('id')) selectedIngredient.splice(i, 1);
	                	}
	                	console.log("selectedIngredient", selectedIngredient);
	                	break;

	                default:
	                	break;
                }

				
			} else {
				$(e).addClass(" active");

				ingredients = `<div class="form-field-tags-selected-item ${$(e).data('info')}-${$(e).data('id')}"> \
								${ ($(e).data("info") == "allergens") ? '<lord-icon src="'+$(e).data('image')+'" colors="primary:#012928,secondary:#01dc82" trigger="hover" style="width:50px;height:50px"></lord-icon> ' : '' } \
                                <span>${$(e).data('name')}</span> \
                            </div>`;

                $('.'+$(e).data('info')+'-section').append(ingredients.replace("undefined",""));

                switch($(e).data('info')) {
	                case 'allergens':
	                	if ($.inArray($(e).data('id'), selectedAllergen) === -1) selectedAllergen.push($(e).data('id'));

	                	console.log("selectedAllergen", selectedAllergen);
	                	break;

	                case 'ingredients':
	                	if ($.inArray($(e).data('id'), selectedIngredient) === -1) selectedIngredient.push($(e).data('id'));

	                	console.log("selectedIngredient", selectedIngredient);
	                	break;

	                default:
	                	break;
                }
    		}

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

                    //clear ingredients
                    $('.ingredients-wrapper .form-field-tag').removeClass(" active");
                    $('.ingredients-section').html("");

                    selectedIngredient.splice(0, selectedIngredient.length);

                    //clear allergens
                    $('.allergens-wrapper .form-field-tag').removeClass(" active");
                    $('.allergens-section').html("");

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
                model: 'product',
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
                        if (n == (parts.length - 1)) MSL.main.cleanForm('product'); 
                        console.log(`Part ${n} of ${parts.length} is uploaded`);
                    }
                } catch (error) {
                    console.log("Error: ", error);
                }
            }

        }
	},

	product: {

		saveProduct: async (e) => {

			let form = $("#"+$(e).attr('id'));

			let checkFormValidity = MSL.main.checkFormValidity(form);

			let productImage;
            let imageLength;
            let base64Parts;

			if (checkFormValidity === true) {

				$('.btn_submit').text("Saving...").attr("disabled", "disabled");
				//showLoading();

				if ($('.product_image').attr('src')) {
	                base64Parts = MSL_GLOBAL.main.splitBase64String($('.product_image').attr('src'), 3000);
	                productImage = base64Parts[0];
	            } else {
	                productImage = '';
	            }

				let parameter = {
					model: 'product',
					action: 'insert',
					insert: {
						'sb_id': suppID,
						'name': form.find('input[name=product_name]').val(),
						'image': productImage,
						'status': form.find('input[name=product_status]').val()
					}
				}

				try {
					let response = await sendhttpRequest(parameter);
					console.log(response);

					if (response['code'] == 200 && response['id'] != 0) {

						if (selectedAllergen.length > 0) {
							for (let i = 0; i < selectedAllergen.length; i++) {
								MSL.product.insertDetails('allergens_assoc', response['id'], selectedAllergen[i]);
							}
						}

						if (selectedIngredient.length > 0) {
							for (let i = 0; i < selectedIngredient.length; i++) {
								MSL.product.insertDetails('ingredient_assoc', response['id'], selectedIngredient[i]);
							}
						}

						if (productImage.length > 0) {
	                        MSL_GLOBAL.main.uploadImageSequentially('product', 'product', response['id'], base64Parts, 1, 'image', 'main-product-form');
	                    } else {
	                        if (formErrors == 0) {
	                            setTimeout(() => {
	                                MSL.main.cleanForm('product');
	                            },350);
	                        }
	                    }

					}

				} catch(error) {
					console.log("Error: ", error);
					MSL.main.cleanForm('product');
				}
			}          

		},

		insertDetails: async (table, item_id, id) => {
			
			let parameter;

			switch(table) {
				case 'allergens_assoc':

					parameter = {
						model: 'assoc',
						action: 'custom_insert',
						table: table,
						insert: {
							'item_id': item_id,
							'aid': id,
							'type': 'product'
						}
					}

					break;

				case 'ingredient_assoc':

					parameter = {
						model: 'assoc',
						action: 'custom_insert',
						table: table,
						insert: {
							'item_id': item_id,
							'inid': id
						}
					}

					break;

				default:
					break;
			}

			try {
				let response = await sendhttpRequest(parameter);
			} catch(error) {
				console.log("Error: ", error);
			}
		}
	}

}

MSL.main.onLoad();