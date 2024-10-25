
/**
 * Select and upload image can now be found in app.js file for global use.
 * **/

const selectedDetails = [];
const selectedProducts = [];
const selectedIngredients = [];
const createdSizes = [];
let sortedOptions = [];
const supp_id = Supplier_[0]['id'];

let formErrors = 0;

let MSL = {

	main: {

		onLoad: async () => {

			MSL.listing.getDetails('serving_temp', 'serving-temp');

			//init the search product field
			// $('input[name=product_name]').on('input', function() {
			// 	MSL.main.search($(this).val(), 'product');
			// });

			// $('input[name=ingredient_name]').on('input', function() {
			// 	MSL.main.search($(this).val(), 'ingredient');
			// });

			// $('input[name=size_name]').on('input', function() {
			// 	if (selectedProducts.length > 0) {

			// 		for (let i = 0; i < selectedProducts.length; i++) {
			// 			MSL.main.search($(this).val(), 'sizing', selectedProducts[i]);
			// 		}
			// 	}
				
			// });

			$('.search_field').on('input', function() {

				if ($(this).attr('name') == "size_name") {

					//console.log(selectedProducts.length);
					for (let i = 0; i < selectedProducts.length; i++) {
						MSL.main.search($(this).val(), $(this).data('table'), selectedProducts[i], $(this).data('wrapper'));
					}

				} else {

					let id = ($(this).data('id') == "all") ? 0 : $(this).data('id');
					MSL.main.search($(this).val(), $(this).data('table'), id, $(this).data('wrapper'));

				}

			});

		},

		search: async (keyword, table, id = null, wrapper = null) => {

			if (keyword.length > 0) {

				let result;
				let parameter;
				let btn;
				let option;
				let type = "";

				switch(wrapper) {

					case 'product':

						parameter = {
							model: table,
							action: 'retrieve',
							retrieve: '*',
							condition: [['name', 'LIKE', '%'+keyword+'%']]
						}

						btn = "MSL.main.selectOption(this);";
						option = $('.'+wrapper+'-section .'+wrapper);

						break;

					case 'ingredient':

						parameter = {
							model: table,
							action: 'retrieve',
							retrieve: '*',
							condition: [['name', 'LIKE', '%'+keyword+'%']]
						}

						btn = "MSL.main.selectOption(this);";
						option = $('.'+wrapper+'-section .'+wrapper);

						break;

					case 'addon-product': case 'addon-ingredient':

						parameter = {
							model: table,
							action: 'retrieve',
							retrieve: '*',
							condition: [['name', 'LIKE', '%'+keyword+'%']]
						}

						btn = "MSL.main.selectAddOnOption(this);";
						option = $('.'+wrapper+'-wrapper tbody tr');

						break;

					case 'sizing':

						parameter = {
							model: 'assoc',
							action: 'custom_join_query',
							table: 'sizing_listing_assoc',
							keyword: keyword,
							id: id
						}

						btn = "MSL.main.selectSizeOption(this);";
						option = $('.'+wrapper+'-wrapper tbody tr');

						break;

					case 'option':

						parameter = {
							model: 'option',
							action: 'retrieve',
							retrieve: '*',
							condition: [
								['name', 'LIKE', '%'+keyword+'%']
							]
						}

						btn = "MSL.main.selectSortOptions(this);";
						option = $('.product-option-section .product-option-table tbody tr');
						type = "option";

						break;

					case 'optionset':

						parameter = {
							model: 'optionset',
							action: 'retrieve',
							retrieve: '*',
							condition: [
								['name', 'LIKE', '%'+keyword+'%', 'AND'],
								['sb_id', '=', supp_id]
							]
						}

						btn = "MSL.main.selectSortOptions(this);";
						option = $('.'+wrapper+'-section .'+wrapper);
						type = "optionset";

						break;

					default:

						//do nothing

						break;
				}

				try {
					let response = await sendhttpRequest(parameter);

					if (response['code'] == 200) {
						if (response['data'].length > 0) {

							$.map(response['data'], (item, index) => {

								let field = (typeof $(option).data("id") !== "undefined") ? $(option).data("id") : 0;

								if (field != item.id) {
									result += `<div class="form-field-option" data-id="${item.id}" data-name="${item.name}" ${(wrapper == "sizing") ? "data-pname='"+item.p_name+"'" : ""} data-type="${type}" data-table="${table}" data-wrapper="${wrapper}" onclick="${btn} return false;"> \
				                                   ${(wrapper == "sizing") ? "("+item.p_name+") - "+item.name : item.name} \
				                                </div>`;
								} else {
									$('.form-field-option').html("").hide();
								}
								
							});

							result = (typeof result !== 'undefined' ) ? result.replace("undefined","") : result;

							$('.'+wrapper+'-result').html(result).show();
						}
					}

				} catch(error) {
					console.log("Error: ", error);
				}

			} else {
				$('.form-field-option').html("").hide();
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
                $(".alert_wrapper").html("<div class='alert alert-success'>Listing has been added.</div>");
                window.scrollTo({
                    top: 0,
                    left: 0,
                    behavior: 'smooth' // Optional: Use 'smooth' for a smooth scrolling effect
                });
                
                setTimeout(()=>{
                    $('button.btn_submit').html('Save Changes <i class="bi bi-check"></i>').removeAttr("disabled");
                },500);

                //clear form
                $("#"+form)[0].reset();

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

		selectDetails: async (e) => {

			let icon;
			let lord_icon;

			switch ($(e).data("info")) {

				default:
					lord_icon = `<lord-icon src="${$(e).data("image")}" colors="primary:#012928,secondary:#01dc82" trigger="hover" style="width:50px;height:50px"></lord-icon>`;
					break;
			}

			if ($(e).hasClass("active")) {
				
				$(e).removeClass(" active");

				$('.'+$(e).data("wrapper_section")+'-section .'+$(e).data("info")+'-'+$(e).data("id")).remove();
			} else {

				$(e).addClass(" active");

				//check if selected item is already in the array list
				
				selectedDetails['serving_temp'] = $(e).data("id");
				console.log(selectedDetails['serving_temp']);
				// if (selectedDetails[]) {

				// }

				icon = `<div class="form-field-tags-selected-item ${$(e).data("info")}-${$(e).data("id")}"> \
                            ${lord_icon} \
                            <span>${$(e).data("name")}</span> \
                        </div>`;

                $('.'+$(e).data("wrapper_section")+'-section').append(icon.replace("undefined", ""));
			}

		},

		selectOption: async (e) => {

			let form_field_tag;
			let removeBtn = false;
			let isDraggable = false;

			switch($(e).data("wrapper")) {

				case 'product':

					form_field_tag = "form-field-tag-"+$(e).data("wrapper");

					if ($.inArray($(e).data("id"), selectedProducts) === -1) {
						selectedProducts.push($(e).data("id"));
					}

					console.log("selectedProducts", selectedProducts);

					//include the ingredients included in the product selected
					MSL.listing.getIngredients($(e).data("id"));

					break;

				case 'ingredient':

					form_field_tag = "form-field-tag-"+$(e).data("wrapper");

					if ($.inArray($(e).data("id"), selectedIngredients) === -1) {
						selectedIngredients.push($(e).data("id"));
					}

					console.log("selectedIngredients", selectedIngredients);

					break;

				case 'addon-product': case 'addon-ingredient':

					form_field_tag = "form-field-tag-"+$(e).data("wrapper").replace("addon-","");

					break;

				default:
					
					form_field_tag = "form-field-tag";
					removeBtn = true;
					isDraggable = true;

					//init jquery draggable function
					MSL.main.startSortable();

					break;
			}

	        let products = `<div class="${form_field_tag} ${$(e).data("wrapper")} ${$(e).data("wrapper")}-${$(e).data("id")} ${(isDraggable === true) ? 'isDraggable' : ''}" data-id="${$(e).data("id")}" data-section="${$(e).data("wrapper")}" data-item="${$(e).data("wrapper")}" data-table="${$(e).data("table")}" onclick="${(removeBtn === false) ? 'MSL.main.removeSelected(this);' : ''} return false;">${$(e).data("name")} ${(removeBtn === false) ? '<i class="bi bi-x-circle" style="margin-left: 10px;"></i>' : ''}</div>`;

	        products = (typeof products !== "undefined") ? products.replace("undefined","") : products;

	        $('.'+$(e).data("wrapper")+'-section').append(products);
	        $('.'+$(e).data("wrapper")+'-result .form-field-option[data-id='+$(e).data("id")+']').remove();
		},

		selectAddOnOption: async (e) => {

			//console.log($('.sizing-wrapper table tbody tr.added-size').length);

			let sizes = $('.sizing-wrapper table tbody tr.added-size');
			let size;

			let addons;

			let thisSize_id;

			if (sizes.length > 0) {
				for (let i = 0; i < sizes.length; i++) {
					thisSize_id = $(sizes[i]).data("id");
					console.log();
					if ($('.'+$(e).data('wrapper')+'-wrapper table thead th.size-'+thisSize_id).length == 0) {
						size += `<th class="size-${thisSize_id}">${$('.size-name-'+thisSize_id).text()}</th>`;

						if ($.inArray($('.size-name-'+thisSize_id).text(), createdSizes) === -1) {
							createdSizes.push($('.size-name-'+thisSize_id).text());
						}

					} else {
						size += ``;
					}
				}

				console.log(createdSizes);

				size = (typeof size !== "undefined") ? size.replace("undefined","") : size;
				
				$('.'+$(e).data('wrapper')+'-wrapper table thead tr').append(size);

				addons += `<tr data-id="${$(e).data("id")}" class="${$(e).data("wrapper")}-${$(e).data("id")}"> \
							<td>${$(e).data("name")}</td>`;

							for (let i = 0; i < sizes.length; i++) {
								addons += `<td> \
												<input class="addon-item ${$(e).data('wrapper')}-${$(e).data("id")} form-control col50" data-id="${$(e).data("id")}" data-type="${$(e).data("wrapper")}" data-size="${createdSizes[i]}" type="number" min="0" step=".01" placeholder="Price Difference" style="margin: 0 auto;"> \
											</td>`;
							}

				//addons += `</tr>`;

				addons += `<td><button class="btn red" data-id="${$(e).data("id")}" data-wrapper="${$(e).data("wrapper")}" onclick="MSL.main.removeCustomOption(this); return false;"><i class="bi bi-x-circle"></i></button></td> \
						</tr>`;

				addons = (typeof addons !== "undefined") ? addons.replace("undefined","") : addons;

				$('.'+$(e).data("wrapper")+'-wrapper table tbody').append(addons);
		        $('.'+$(e).data("wrapper")+'-result .form-field-option[data-id='+$(e).data("id")+']').remove();

			}

		},

		selectSizeOption: async (e) => {

			let addons = `<tr data-id="${$(e).data("id")}" class="${$(e).data("wrapper")}-${$(e).data("id")}"> \
								<td>${$(e).data("p_name")}</td> \
								<td>${$(e).data("name")}</td> \
								<td style="display:flex;align-items:center;justify-content:center;gap:20px;"> \
								<input type="hidden" class="${$(e).data("wrapper")}-input" name="" value="${$(e).data("id")}"> \
								$<input type="number" min="0" step=".01" class="form-control col50"> \
								</td> \
								<td><button class="btn red" data-id="${$(e).data("id")}" data-wrapper="${$(e).data("wrapper")}" onclick="MSL.main.removeCustomOption(this); return false;"><i class="bi bi-x-circle"></i></button></td> \
							</tr>`;

			addons = (typeof addons !== "undefined") ? addons.replace("undefined","") : addons;

			$('.'+$(e).data("wrapper")+'-wrapper table tbody').append(addons);
	        $('.'+$(e).data("wrapper")+'-result .form-field-option[data-id='+$(e).data("id")+']').remove();

		},

		selectSortOptions: async(e) => {

			let sortables;

	       	if ($('.sizing-wrapper table tr.added-size').length == 0) {
	       		
	       		alert('Please select or create sizes first before adding new product options.');
	       	
	       	} else {

	       		let x = 0, colspan = 0;

		       	for (let i = 0; i < createdSizes.length; i++) {
		       		x++;
		       	}

		       	colspan = 4 + (x * createdSizes.length);

				sortables += `<tr class="highlight product-option product-option-${$(e).data('id')}" data-id="${$(e).data('id')}" data-type="${$(e).data('wrapper')}" colspan="${colspan}"> \
									<td class="section-title" style="text-align: left;">${$(e).data('name')}</td> \
							</tr>`;
				

				//get the products or ingredients under options or option sets
				try {

					const resp = await MSL.listing.getInformation('option_assoc_to_pantry', $(e).data('id'));
					console.log("resp", resp);
					if (resp['code'] == 200 && resp['data'] != '') {

						let option_information = '';
						let option_td = '';

						for (const item of resp['data']) {

							option_information += `<tr class="opt-parent-${$(e).data('id')} prod-opt-tr prod-opt-id-${item.pid}" data-opt-parent-id="${$(e).data('id')}" data-type="${item.p_type}">
			                                            <td class="opt-name-size-${$(e).data('id')}" data-opt-parent-id="${$(e).data('id')}" data-opt-item-id="${item.pid}">
			                                            	<input type="hidden" class="opt_id_${$(e).data('id')}" value="${item.pid}">
			                                            	${item.p_name}
			                                            </td>
			                                            <td class="opt-min-size-${$(e).data('id')}" data-opt-parent-id="${$(e).data('id')}" data-opt-item-id="${item.pid}"><input type="number" class="min_val_${$(e).data('id')} form-control" style="display: block;margin: 0 auto;"></td>
			                                            <td class="opt-max-size-${$(e).data('id')}" data-opt-parent-id="${$(e).data('id')}" data-opt-item-id="${item.pid}"><input type="number" class="max_val_${$(e).data('id')} form-control" style="display: block;margin: 0 auto;"></td>
			                                            <td class="opt-exceed-size-${$(e).data('id')}"><input class="exceed_chkbx_${$(e).data('id')}" type="checkbox" onchange="MSL.listing.exceedOption(this); return false;" value="0"></td>`;

			                    for (let i = 0; i < createdSizes.length; i++) {
			                    	option_information += `<td class="opt-rrp-size-${$(e).data('id')}" data-created-size-id="${createdSizes[i].id}" data-created-size-name="${createdSizes[i].name}"><input type="number" class="rrp_val_${$(e).data('id')} form-control" style="display: block;margin: 0 auto;"></td> \
			                    							<td class="opt-extra-size-${$(e).data('id')}" data-created-size-id="${createdSizes[i].id}" data-created-size-name="${createdSizes[i].name}"><input type="number" class="extra_val_${$(e).data('id')} form-control" style="display: block;margin: 0 auto;"></td>`;
			                    }

			                option_information += `</tr>`;

						}

						sortables += option_information;					

					}

				} catch (error) {
					console.log("Error fetching information:", error);
				}

				$('.product-option-table tbody').append(sortables);

	       	}

	       	/* Old code 
			let sortables = `<div class="sortable-item" id="option-${$(e).data('id')}" data-type="${$(e).data('type')}" data-id="${$(e).data('id')}">${$(e).data('name')}</div>`;

	        //if ($.inArray("option-"+$(e).data('id'), sortedOptions) === -1) sortedOptions.push("option-"+$(e).data('id'));
	        if (sortedOptions.length > 0) {

	        	let exists = sortedOptions.some(function(item) {
				    return item.id === $(e).data('id') && item.type === $(e).data('type');
				});

				if (!exists) {
					let itemsData = {
	        			id: $(e).data('id'),
	        			type: $(e).data('type')
	        		}

	        		sortedOptions.push(itemsData);

	        		$('.'+$(e).data("wrapper")+'-section').append(sortables);
	        		$('.'+$(e).data("wrapper")+'-result .form-field-option[data-id='+$(e).data("id")+']').remove();
				}

	        } else {

	        	let itemsData = {
        			id: $(e).data('id'),
        			type: $(e).data('type')
        		}
        		
        		sortedOptions.push(itemsData);
        		$('.'+$(e).data("wrapper")+'-section').append(sortables);
	       		$('.'+$(e).data("wrapper")+'-result .form-field-option[data-id='+$(e).data("id")+']').remove();
	        }

	        console.log(sortedOptions);

	        MSL.main.startSortable();
	       	*/

		},

		removeCustomOption: async (e) => {

			if (confirm('Are yyou sure you want to remove this add on?')) {

				$('.'+$(e).data('wrapper')+'-wrapper table tbody tr.'+$(e).data("wrapper")+'-'+$(e).data("id")).remove();

			}

		},

		removeSelected: async(e) => {

			switch($(e).data("table")) {

				case 'product':

					for (let i = 0; i < selectedProducts.length; i++) {

						if ($(e).data("id") == selectedProducts[i]) selectedProducts.splice(i, 1);

					}

					$('.ingredient-section .ingredient').each(function(){
						if ($(this).data("parent") == $(e).data("id")) $(this).remove();

						for (let i = 0; i < selectedIngredients.length; i ++) {
							if ($(this).data('id') == selectedIngredients[i]) selectedIngredients.splice(i, 1);
							console.log(selectedIngredients);
						}

					});

					break;

				case 'ingredient':

					for (let i = 0; i < selectedIngredients.length; i++) {

						if ($(e).data("id") == selectedIngredients[i]) selectedIngredients.splice(i, 1);

					}

					break;

				default:
					break;

			}

			$('.'+$(e).data('section')+'-section .'+$(e).data("item")+'-'+$(e).data("id")).remove();

		},

		startSortable: async () => {
			setTimeout(() => {
				$(".option-section").sortable({
		            placeholder: "sortable-placeholder",
		            update: function(event, ui) {
		                // // This event is triggered when the user stops sorting and the DOM position has changed.
		                // let sortedIDs = $(this).sortable("toArray");

		                // // Save the new order
		               	

		               	let sortedItems = [];

		               	$('.option-section .sortable-item').each(function(index){
		               		let itemsData = {
		               			id: $(this).data('id'),
		               			type: $(this).data('type')
		               		}

		               		sortedItems.push(itemsData);
		               	});

		               	sortedOptions = sortedItems;
		            }
		        });

		        $(".option-section").disableSelection();

			},750);
			
		}

	},

	listing: {

		getDetails: async(table, wrapper_section) => {

			let parameter = {
				model: 'assoc',
				action: 'custom_retrieve',
				table: table,
				retrieve: '*'
			}

			let details;

			try {
				let response = await sendhttpRequest(parameter);

				if (response['code'] == 200 && response['data'] != '') {

					$.map(response['data'], (item, index) => {
						details += `<div class="form-field-tag " data-id="${item.id}" data-image="//${item.image}" data-info="${table}" data-name="${item.name}" data-wrapper_section="${wrapper_section}" onclick="MSL.main.selectDetails(this); return false;">${item.name}</div>`;
					});

					$('.'+wrapper_section+'-wrapper').html(details.replace("undefined", ""));
				}

			} catch(error) {
				console.log("Error: ", error);
			}

		},

		saveListing: async (e) => {

			let form = $("#"+$(e).attr("id"));

            let checkFormValidity = MSL.main.checkFormValidity(form);

            let productImage;
            let imageLength;
            let base64Parts;

			let parameter;

			MSL.listing.saveProductOptions(0);

			// if (checkFormValidity === true) {

			// 	$('.btn_submit').text("Saving...").attr("disabled", "disabled");

			// 	if ($('.product_image').attr('src')) {
	        //         base64Parts = MSL_GLOBAL.main.splitBase64String($('.product_image').attr('src'), 3000);
	        //         productImage = base64Parts[0];

	        //     } else {
	        //         productImage = '';
	        //     }

	        //     parameter = {
			// 		model: 'listing',
			// 		action: 'insert',
			// 		insert: {
			// 			sb_id: supp_id,
			// 			item_name: form.find('input[name=item_name]').val(),
			// 			short_description: form.find('input[name=short_description]').val(),
			// 			long_description: form.find('textarea[name=long_description]').val(),
			// 			price: parseFloat(form.find('input[name=price]').val()),
			// 			tax_class: form.find('input[name=tax_class').val(),
			// 			tax_inclusive: form.find('input[name=tax_inclusive').val(),
			// 			start_date: form.find('input[name=start_date').val(),
			// 			end_date: form.find('input[name=end_date').val(),
			// 			image: productImage,
			// 			status: form.find('input[name=product_status').val()
			// 		}
			// 	}

			// 	try {
			// 		let response = await sendhttpRequest(parameter);
			// 		console.log(response);

			// 		if (response['code'] == 200) {
						
			// 			//this is to insert the sizing and prices of addons - Removed
			// 			// if ($('.addon-item').length > 0) {
			// 			// 	MSL.listing.addDetails('addon-item', response['id']);
			// 			// }

			// 			// the selected options as well with sort 
			// 			// if (sortedOptions.length > 0) {
			// 			// 	MSL.listing.saveOptions(response['id']);
			// 			// }

			// 			//insert products selected
			// 			if (selectedProducts.length > 0) {
			// 				MSL.listing.addDetails('product', response['id']);
			// 			}

			// 			//insert ingredients selected
			// 			if (selectedIngredients.length > 0) {
			// 				MSL.listing.addDetails('ingredient', response['id']);
			// 			}

			// 			//upload image
			// 			if (productImage.length > 0) {
	        //                 MSL_GLOBAL.main.uploadImageSequentially('listing', 'listing', response['id'], base64Parts, 1, 'image', 'main-listing-form');
	        //             } else {
	        //                 if (formErrors == 0) {
	        //                     setTimeout(() => {
	        //                         MSL_GLOBAL.main.cleanForm('main-listing-form');
	        //                     },350);
	        //                 }
	        //             }
			// 		}

			// 	} catch(error) {
			// 		console.log("Error: ", error);
			// 		formErrors++;
			// 	}

			// }

		},

		addDetails: async (item, lid) => {

			let parameter;

			switch(item) {

				case 'addon-item':

					$('.addon-item').each(function(){

						parameter = {
							model: 'sizing',
							action: 'insert',
							insert: {
								name: $(this).data('size'),
								item_id: $(this).data('id'),
								type: $(this).data('type'),
								price: parseFloat($(this).val())
							}
						}

						MSL.listing.saveDetails(parameter);

					});

					break;

				case 'product':
					
					for (let i = 0; i < selectedProducts.length; i++) {
						parameter = {
							model: 'assoc',
							action: 'custom_insert',
							table: 'product_assoc',
							insert: {
								item_id: lid,
								pid: selectedProducts[i]
							}
						}

						console.log(parameter);

						//MSL.listing.saveDetails(parameter);
					}
					
					break;

				case 'ingredient':

					for (let i = 0; i < selectedIngredients.length; i++) {
						parameter = {
							model: 'assoc',
							action: 'custom_insert',
							table: 'ingredient_assoc',
							insert: {
								item_id: lid,
								inid: selectedIngredients[i]
							}
						}

						MSL.listing.saveDetails(parameter);
					}
					

					break;

				default:
					break;
			}

		},

		saveDetails: async (parameter) => {

			try {
				let response = await sendhttpRequest(parameter);
				return response;
			} catch(error) {
				console.log("Error: ", error);
				formErrors++;
			}

		},

		getIngredients: async (pid) => {

			let parameter = {
				model: 'assoc',
				table: 'product_to_ingredient_assoc',
				action: 'custom_join_query',
				id: pid
			}

			let ingredients;

			try {
				let response = await sendhttpRequest(parameter);
				console.log(response);

				if (response['code'] == 200 && response['data'] != '') {

					$.map(response['data'], (item, index) => {

						ingredients += `<div class="form-field-tag-ingredient ingredient ingredient-${item.id}" data-id="${item.id}" data-parent="${pid}" data-section="ingredient" data-item="ingredient" data-table="ingredient" onclick="return false;">${item.name}</div>`;
						
						if ($.inArray(item.id, selectedIngredients) === -1) selectedIngredients.push(item.id);

					});

					console.log("selectedIngredients", selectedIngredients);

					ingredients = (typeof ingredients !== "undefined") ? ingredients.replace("undefined","") : ingredients;

					$('.ingredient-section').append(ingredients);
				}

			} catch(error) {
				console.log("Error: ", error);
			}

		},

		saveOptions: async (lid) => {
			
			let parameter;

			for (let i = 0; i < sortedOptions.length; i++) {

				parameter = {
					model: 'assoc',
					action: 'custom_insert',
					table: 'option_assoc',
					insert: {
						item_id: lid,
						oid: sortedOptions[i].id,
						type: sortedOptions[i].type,
						sort: i
					}
				}

				//console.log(parameter);

				try {
					let response = await sendhttpRequest(parameter);
					console.log(response);
				} catch(error) {
					console.log("Error: ", error);
					formErrors++;
				}

			}

		},

		saveProductOptions: async (lid) => {
			
			let parameter1, parameter2, parameter3;

			const items = $('.product-option-table .product-option').get();

			for (const [index, item] of items.entries()) {

				const $item = $(item);

				console.log($item);

				parameter1 = {
					model: 'listing',
					action: 'custom_insert',
					table: 'product_option_assoc',
					option_type: $item.data('type'),
					insert: {
						sb_id: user_id,
						item_id: lid,
						opt_parent_id: $item.data('id'),
						opt_id: $item.data('id'),
						type: $item.data('type'),
						sort: index
					}
				}
				
				try {
		            const prod_opt_assoc = await MSL.listing.saveDetails(parameter1);
		            
		            if (prod_opt_assoc['code'] == 200) {

		            	// iterate through sub items
		            	const sub_items = $('.product-option-table .opt-parent-'+$item.data('id')).get();

		            	for (const sub_item of sub_items) {

		            		// insert the sub items into product_option_assoc
		            		const $sub_item = $(sub_item);

		            		parameter2 = {
		            			model: 'listing',
		            			action: 'custom_insert',
		            			table: 'product_option_assoc',
								option_type: $sub_item.data('type'),
		            			insert: {
		            				sb_id: user_id,
		            				item_id: lid,
		            				opt_parent_id: $sub_item.data('opt-parent-id'),
		            				opt_id: $sub_item.find('td input.opt_id_'+$sub_item.data('opt-parent-id')).val(),
		            				min: $sub_item.find('td input.min_val_'+$sub_item.data('opt-parent-id')).val(),
		            				max: $sub_item.find('td input.max_val_'+$sub_item.data('opt-parent-id')).val(),
		            				exceed: $sub_item.find('td input.exceed_chkbx_'+$sub_item.data('opt-parent-id')).val(),
		            				type: $sub_item.data('type')
		            			}
		            		}

		            		console.log(parameter2);

		            		MSL.listing.saveDetails(parameter2);

		            		//insert the RRP and Extra Portion prices in sizing table

		            		parameter3 = {
		            			model: 'listing',
		            			action: 'custom_insert',
		            			table: 'sizing',
								option_type: 'sizing_'+$sub_item.data('type'),
		            			insert: {
		            				sb_id: user_id,
		            				name: $sub_item.find('td.opt-rrp-size-'+$sub_item.data('opt-parent-id')).data('created-size-name'),
		            				item_id: $sub_item.find('td input.opt_id_'+$sub_item.data('opt-parent-id')).val(),
		            				type: $sub_item.data('type'),
		            				rrp: $sub_item.find('td input.rrp_val_'+$sub_item.data('opt-parent-id')).val(),
		            				extra_portion: $sub_item.find('td input.extra_val_'+$sub_item.data('opt-parent-id')).val(),
		            			}
		            		}

		            		//console.log(parameter3);

							MSL.listing.saveDetails(parameter3);

		            	}

		            }

		        } catch (error) {
		            console.log("Error:", error);
		        }

			}

			// $('.product-option-table .product-option').each(function(){

			// 	parameter1 = {
			// 		model: 'assoc',
			// 		action: 'custom_insert',
			// 		table: 'product_option_assoc',
			// 		insert: {
			// 			sb_id: user_id,
			// 			item_id: lid,
			// 			opt_parent_id: $(this).data('id'),
			// 			opt_id: $(this).data('id'),
			// 			type: $(this).data('type')
			// 		}
			// 	}

			// 	try {

			// 		const prod_opt_assoc = await MSL.listing.saveDetails(parameter1);

			// 		console.log(prod_opt_assoc);
			// 	}

			// });

		},

		exceedOption: (e) => {

			if ($(e).is(':checked')) $(e).val(1);
			else $(e).val(0);

		},

		getInformation: async (table, id) => {

			let parameter = {
				model: 'assoc',
				action: 'custom_join_query',
				table: table,
				id: id
			};

			try {
				let response = await sendhttpRequest(parameter);
				return response;
			} catch (error) {
				console.log("Error: ", error);
			}

		}

	},

	sizing: {

		initAddSize: async () => {

			$('.overlay-sizing').show();
			$('.overlay-sizing .custom-modal').show();
			$('.overlay-sizing .custom-modal .selected-options').html("");

			$('.overlay-sizing .custom-modal input[name=name]').val("");
			$('.overlay-sizing .custom-modal input[name=keyword]').show();

		},

		addSize: async () => {

			let parameter = {
				model: 'sizing',
				action: 'insert',
				insert: {
					name: $('.overlay-sizing .custom-modal input[name=name]').val(),
					sb_id: user_id,
					item_id: 0,
					type: 'listing'
				}
			}

			let sizes = '';
			let size_headers = '';
			let size_sub_headers = '';
			let size_inputs = '';

			try {
				let response = await sendhttpRequest(parameter);
				
				if (response['code'] == 200) {

					let sizes = `<tr data-id="${response['id']}" class="added-size added-size-${response['id']}"> \
								<td class="size-name-${response['id']}"><input type="checkbox" class="size_default" name="size_default" value="${response['id']}" onchange="MSL.sizing.setDefault(this); return false;"></td> \
								<td class="size-name-${response['id']}">${$('.overlay-sizing .custom-modal input[name=name]').val()}</td> \
								<td style="display:flex;align-items:center;justify-content:center;gap:20px;"> \
									$<input type="number" min="0" step=".01" class="form-control col50"> \
								</td> \
								<td><button class="btn red" data-id="${response['id']}" onclick="MSL.sizing.removeSizeOption(this); return false;"><i class="bi bi-x-circle"></i></button></td> \
							</tr>`;

					// append in sizing table
					$('.sizing-wrapper table tbody').append(sizes);

					// append new thead th in product option table
					size_headers = `<th class="custom-size-th custom-size-th-${response['id']}" colspan="2">${$('.overlay-sizing .custom-modal input[name=name]').val()}</th>`;

					if ($('.product-option-table thead th.custom-size-th').length == 0) {
						$('.product-option-table thead th.last-default-th').after(size_headers);
					} else {
						$('.product-option-table thead th.custom-size-th:last').after(size_headers);
					}

					// append product option thead th sub header (RRP , Extra Portion)
					if ($('.product-option-table thead tr.size-sub-header').length == 0) {
						size_sub_headers = `<tr class="size-sub-header"> \
												<th class=""></th> \
	                                            <th class="size-sub-header-th-${response['id']}">RRP</th> \
	                                            <th class="last-size-sub-header size-sub-header-th-${response['id']}">Extra Portion</th> \
											</tr>`;

						$('.product-option-table thead tr.size-main-header').after(size_sub_headers);
					} else {
						size_sub_headers = `<th class="size-sub-header-th-${response['id']}">RRP</th> \
	                                        <th class="last-size-sub-header size-sub-header-th-${response['id']}">Extra Portion</th>`;
						
						$('.product-option-table thead tr.size-sub-header th.last-size-sub-header:last').after(size_sub_headers);

						//append the input fields if there are product options selected
						if ($('.product-option-table tbody tr.prod-opt-tr').length > 0) {

							$('.product-option-table tbody tr.prod-opt-tr').each(function(){

								let size_td_id = $(this).find('td[data-created-size-id='+response['id']+']');

								if (size_td_id.length == 0) {

									size_inputs = `<td class="opt-extra-size-1" data-created-size-id="${response['id']}" data-created-size-name="${$('.overlay-sizing .custom-modal input[name=name]').val()}"><input type="number" class="form-control" style="display: block;margin: 0 auto;"></td> \
												<td class="opt-extra-size-1" data-created-size-id="${response['id']}" data-created-size-name="${$('.overlay-sizing .custom-modal input[name=name]').val()}"><input type="number" class="form-control" style="display: block;margin: 0 auto;"></td>`;

									$(this).find('td:last').after(size_inputs);
									
								}

							});

						}

					}

					MSL_GLOBAL.main.closeModal('overlay-sizing');

					// if ($.inArray(response['id'], createdSizes) === -1) {
					// 	createdSizes.push(parseInt(response['id']));
					// }

					// add the created sizes into array
					if (createdSizes.length > 0) {

			        	let exists = createdSizes.some(function(item) {
						    return item.id === response['id'] && item.name === $('.overlay-sizing .custom-modal input[name=name]').val();
						});

						if (!exists) {
							let itemsData = {
			        			id: response['id'],
			        			name: $('.overlay-sizing .custom-modal input[name=name]').val()
			        		}

			        		createdSizes.push(itemsData);
						}

			        } else {

			        	let itemsData = {
		        			id: response['id'],
		        			name: $('.overlay-sizing .custom-modal input[name=name]').val()
		        		}
		        		
		        		createdSizes.push(itemsData);
			        }

					console.log("createdSizes", createdSizes);

				}

			} catch(error) {
				console.log("Error: ", error)
			}

		},

		setDefault: async (e) => {
			//$('.size_default').not($(e.currentTarget)).prop('checked', false);

			let parameter;
			let x = 0;

			$('.size_default').each(function(){

				if ($(this).val() != $(e).val()) {

					$(this).prop('checked', false);

					parameter = {
						model: 'sizing',
						action: 'update',
						update: {
							is_default: 0
						},
						condition: [
							['id', '=', createdSizes[x]]
						]
					}

				} else {

					parameter = {
						model: 'sizing',
						action: 'update',
						update: {
							is_default: 1
						},
						condition: [
							['id', '=', createdSizes[x]]
						]
					}

				}
				//console.log(parameter);
				MSL.sizing.updateDefault(parameter);
			x++;
			});

		},

		updateDefault: async (parameter) => {

			try {
				let response = await sendhttpRequest(parameter);
				console.log(response);
			} catch (error) {
				console.log("Error: ", error);
			}

		},

		removeSizeOption: async(e) => {
			
			if (confirm('Are you sure you want to remove this size? This will remove the column in product option as well.')) {

				let parameter = {
					model: 'sizing',
					action: 'delete',
					condition: [['id', '=', $(e).data("id")]]
				}

				try {
					let response = await sendhttpRequest(parameter);

					if (response['code'] == 200) {
						$('.sizing-wrapper table tbody tr.added-size-'+$(e).data("id")).remove(); // remove the size from sizing table
						$('.product-option-table thead th.custom-size-th-'+$(e).data("id")).remove(); // remove the thead th from product option table
						$('.product-option-table thead tr.size-sub-header th.size-sub-header-th-'+$(e).data("id")).remove(); // remove the sub header in product option table
					}

					if (createdSizes.length > 0) {
						for (let i = 0; i < createdSizes.length; i++) {
							if ($(e).data("id") == createdSizes[i]) createdSizes.splice(i, 1); 
						}
					}

					console.log("createdSizes", createdSizes);

				} catch(error) {
					console.log("Error: ", error);
				}

			}
		}
	}

}

setTimeout(() => {
	MSL.main.onLoad();
}, 350);