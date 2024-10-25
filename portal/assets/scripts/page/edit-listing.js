
/**
 * Select and upload image can now be found in app.js file for global use.
 * **/

const selectedDetails = [];
const selectedProducts = [];
const selectedIngredients = [];
const createdSizes = [];
let listingSizes = [];
let sortedOptions = [];
let lastSortOrder = 0;
const supp_id = Supplier_[0]['id'];

let formErrors = 0;

let itemID;

let MSL = {

	main: {

		onLoad: async () => {

			let url = window.location.href;
            url = new URL(url);
            itemID = url.searchParams.get("id");

			MSL.listing.getDetails('serving_temp', 'serving-temp');

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

			MSL.listing.getListing(itemID);
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
						option = $('.'+wrapper+'-section .'+wrapper);
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
			let parameter;

			switch ($(e).data("info")) {
				
				case 'serving-temp':

					lord_icon = `<lord-icon src="${$(e).data("image").replace(/^\/\//, '')}" colors="primary:#012928,secondary:#01dc82" trigger="hover" style="width:50px;height:50px"></lord-icon>`;

					parameter = {
						model: 'assoc',
						action: 'custom_update_assoc',
						table: 'serving_temp_assoc',
						item_id: itemID,
						stid: $(e).data("id")
					}

					break;

				default:
					lord_icon = `<lord-icon src="${$(e).data("image").replace(/^\/\//, '')}" colors="primary:#012928,secondary:#01dc82" trigger="hover" style="width:50px;height:50px"></lord-icon>`;
					break;
			}

			try {
				let response = await sendhttpRequest(parameter);
				console.log(response);
			} catch(error) {	
				console.log("Error: ", error);
			}

			if ($(e).hasClass("active")) {
				
				$(e).removeClass(" active");

				$('.'+$(e).data("wrapper_section")+'-section .'+$(e).data("info")+'-'+$(e).data("id")).remove();

			} else {

				$(e).addClass(" active");

				//check if selected item is already in the array list
				//selectedDetails['serving_temp'] = $(e).data("id");

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

					let parameter = {
						model: 'assoc',
						action: 'custom_update_assoc',
						table: 'product_assoc',
						pid: $(e).data("id"),
						item_id: itemID
					}

					try {
						let response = await sendhttpRequest(parameter);
						console.log(response);
					} catch(error) {
						console.log("Error: ", error);
					}

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

			let addons, size;
			console.log(listingSizes.length);

			let parameter = {
				model: 'addons',
				action: 'insert',
				insert: {
					lid: itemID,
					item_id: $(e).data('id'),
					type: $(e).data('wrapper')
				}
			}

			try {
				let response = await sendhttpRequest(parameter);
				console.log(response);

				if (response['code'] == 200 && parseInt(response['id']) > 0 ) {

					for (let i = 0; i < listingSizes.length; i++) {

						size += ($('.'+$(e).data('wrapper')+'-wrapper table thead th.size-'+listingSizes[i].id).length == 0) ? `<th class="size-${listingSizes[i].id}">${listingSizes[i].size}</th>` : ``;

						size = (typeof size !== "undefined") ? size.replace("undefined","") : size;

					}

					$('.'+$(e).data('wrapper')+'-wrapper table thead tr').append(size);

					addons += `<tr data-id="${response['id']}" class="${$(e).data("wrapper")}-${response['id']}"> \
								<td>${$(e).data("name")}</td>`;

								for (let i = 0; i < listingSizes.length; i++) {
									addons += `<td> \
													<input class="addon-item ${$(e).data('wrapper')}-${$(e).data("id")} form-control col50" data-id="${$(e).data("id")}" data-type="${$(e).data("wrapper")}" data-size="${listingSizes[i]}" type="number" min="0" step=".01" placeholder="Price Difference" style="margin: 0 auto;"> \
												</td>`;
								}

					addons += `<td><button class="btn red" data-id="${response['id']}" data-wrapper="${$(e).data("wrapper")}" onclick="MSL.main.removeCustomOption(this); return false;"><i class="bi bi-x-circle"></i></button></td> \
							</tr>`;

					addons = (typeof addons !== "undefined") ? addons.replace("undefined","") : addons;

					$('.'+$(e).data("wrapper")+'-wrapper table tbody').append(addons);
			        $('.'+$(e).data("wrapper")+'-result .form-field-option[data-id='+$(e).data("id")+']').remove();
				}

			} catch (error) {
				console.log("Error: ", error);
			}
			
		},

		/**
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

			let parameter = {
	        	model: 'addons',
	        	action: 'insert',
	        	insert: {
	        		lid: itemID,
	        		item_id: $(e).data("id"),
	        		type: $(e).data("wrapper")
	        	}
	        }

	        try {
	        	let response = await sendhttpRequest(parameter);
	        	console.log(response);
	        } catch (error) {
	        	console.log("Error: ", error);
	        }

		},
		**/

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

			let sortables = `<div class="sortable-item" id="option-${$(e).data('id')}" data-type="${$(e).data('type')}" data-id="${$(e).data('id')}">${$(e).data('name')} <button class="btn red" data-id="94" onclick="MSL.listing.removeOption(this); return false;"><i class="bi bi-x-circle"></i></button> </div>`;
		
	    	let parameter = {
    			model: 'assoc',
    			action: 'custom_insert',
    			table: 'product_option_assoc',
    			insert: {
    				sb_id: supp_id,
    				item_id: itemID,
    				opt_id: $(e).data('id'),
    				type: $(e).data('wrapper'),
    				sort: lastSortOrder + 1
    			}
    		}

    		try {
    			let response = await sendhttpRequest(parameter);
    			console.log(response);

    			if (response['code'] == 200) {

    				$('.'+$(e).data("wrapper")+'-section').append(sortables);
	    			$('.'+$(e).data("wrapper")+'-result .form-field-option[data-id='+$(e).data("id")+']').remove();

	    			lastSortOrder = lastSortOrder + 1;
    			}

    		} catch (error) {
    			console.log("Error: ", error);
    		}

	        MSL.main.startSortable();

		},

		// selectSortOptions: async(e) => {

		// 	let sortables = `<div class="sortable-item" id="option-${$(e).data('id')}" data-type="${$(e).data('type')}" data-id="${$(e).data('id')}">${$(e).data('name')} <button class="btn red" data-id="94" onclick="MSL.listing.removeOption(this); return false;"><i class="bi bi-x-circle"></i></button> </div>`;

	    //     //if ($.inArray("option-"+$(e).data('id'), sortedOptions) === -1) sortedOptions.push("option-"+$(e).data('id'));
	    //     if (sortedOptions.length > 0) {
	    //     	console.log("selectSortOptions", 0);

	    //     	let exists = sortedOptions.some(function(item) {
		// 		    return item.id === $(e).data('id') && item.type === $(e).data('type');
		// 		});

		// 		if (!exists) {
		// 			let itemsData = {
	    //     			id: $(e).data('id'),
	    //     			type: $(e).data('type')
	    //     		}

	    //     		sortedOptions.push(itemsData);

	    //     		$('.'+$(e).data("wrapper")+'-section').append(sortables);
	    //     		$('.'+$(e).data("wrapper")+'-result .form-field-option[data-id='+$(e).data("id")+']').remove();
		// 		}

	    //     } else {

	    //     	console.log("selectSortOptions", 1);

	    //     	let itemsData = {
        // 			id: $(e).data('id'),
        // 			type: $(e).data('type')
        // 		}
        		
        // 		sortedOptions.push(itemsData);
        // 		$('.'+$(e).data("wrapper")+'-section').append(sortables);
	    //    		$('.'+$(e).data("wrapper")+'-result .form-field-option[data-id='+$(e).data("id")+']').remove();

	    //    		$('.sortable-item').each(function(index){

	    //    			console.log(index);

	    //    		});
	    //     }

	    //     console.log(sortedOptions);

	    //     MSL.main.startSortable();

		// }, 

		removeCustomOption: async (e) => {

			let parameter;

			if (confirm('Are yyou sure you want to remove this add on?')) {

				switch($(e).data('wrapper')) {

					case 'addon-product': case 'addon-ingredient':

						parameter = {
							model: 'addons',
							action: 'delete',
							condition: [['id', '=', $(e).data('id')]]
						}

						break;

					default:
						break;
				}

				try {
					let response = await sendhttpRequest(parameter);
				} catch (error) {
					console.log("Error: ", error);
				}

				$('.'+$(e).data('wrapper')+'-wrapper table tbody tr.'+$(e).data("wrapper")+'-'+$(e).data("id")).remove();

			}

		},

		removeSelected: async(e) => {

			switch($(e).data("table")) {

				case 'product':

					let parameter = {
						model: 'assoc',
						action: 'custom_update_assoc',
						table: 'product_assoc',
						pid: $(e).data('id'),
						item_id: itemID
					}

					try {
						let response = await sendhttpRequest(parameter);
					} catch(error) {
						console.log("Error: ", error);
					}

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

		                // Save the new order
		               	let sortedItems = [];

		               	$('.option-section .sortable-item').each(function(index){
		               		let itemsData = {
		               			id: $(this).data('id'),
		               			type: $(this).data('type'),
		               			oid: $(this).data('oid')
		               		}

		               		sortedItems.push(itemsData);
		               	});

		               	sortedOptions = sortedItems;
		               	MSL.listing.updateOptionAssocSort();
		            }
		        });

		        $(".option-section").disableSelection();

			},750);
			
		}

	},

	listing: {

		getListing: async(id) => {

			let parameter = {
				model: 'listing',
				action: 'retrieve',
				retrieve: '*',
				condition: [['id', '=', id]]
			}

			try {
				let response = await sendhttpRequest(parameter);

				if (response['code'] == 200 && response['data'] != '') {
					$.map(response['data'], (item, index) => {
						$('.product_image').attr('src' , item.image);
						$('.product_image').css("visibility", "visible");
						$('.product_image').css("margin-left", "-95%");
						$('#textarea_product').html(item.image);
						$('#main-listing-form input[name=item_name]').val(item.item_name);
						$('#main-listing-form input[name=short_description]').val(item.short_description);
						$('#main-listing-form textarea[name=long_description]').val(item.long_description);
						$('#main-listing-form input[name=price]').val(parseFloat(item.price));
						$('#main-listing-form input[name=tax_class]').val(item.tax_class);
						$('#main-listing-form input[name=tax_inclusive]').val(item.tax_inclusive);
						$('#main-listing-form input[name=start_date]').val(item.start_date);
						$('#main-listing-form input[name=end_date]').val(item.end_date);

						$('#main-listing-form input[name=product_status]').val(item.status);
                
                        if (item.status == 1) {
                            $('#main-listing-form').find('input[data-label=product_status]').attr("checked", "checked");
                        }

                   		//get serving temps
                        MSL.listing.getInformation('serving-temp', itemID);

                   		//get packaging types

                   		//get cuisine

                   		//get meal types

                   		//get sizing
                        MSL.listing.getInformation('sizing-assoc', itemID);

                   		// get add ons
                        MSL.listing.getInformation('addon-product', itemID);

                   		//get product options
                        MSL.listing.getInformation('product-option', itemID);

                   		//get products
                   		MSL.listing.getInformation('product', itemID);

                   		//get ingredients

					});
				}

			} catch(error) {
				console.log("Error: ", error);
			}


		},

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
						details += `<div class="form-field-tag " data-id="${item.id}" data-image="//${item.image}" data-info="${wrapper_section}" data-name="${item.name}" data-wrapper_section="${wrapper_section}" onclick="MSL.main.selectDetails(this); return false;">${item.name}</div>`;
					});

					$('.'+wrapper_section+'-wrapper').html(details.replace("undefined", ""));
				}

			} catch(error) {
				console.log("Error: ", error);
			}

		},

		getInformation: async(type, id) => {

			let parameter;
			let results;
			let section;

			switch(type) {

				case 'sizing-assoc':

					parameter = {
						model: 'assoc',
						table: 'listing_to_sizing_assoc',
						action: 'custom_join_query',
						id: id
					}
					section = "sizing";

					break;

				case 'serving-temp':

					parameter = {
						model: 'assoc',
						table: 'listing_to_serving_temp',
						action: 'custom_join_query',
						id: id
					}
					section = "serving-temp";

					break;

				case 'addon-product':

					parameter = {
						model: 'assoc',
						table: 'listing_to_product_addon',
						action: 'custom_join_query',
						id: id
					}
					section = "addon-product";

					break;

				case 'product-option':

					parameter = {
						model: 'assoc',
						table: 'listing_to_product_option_assoc',
						action: 'custom_join_query',
						id: id
					}
					section = "option";

					break;

				case 'product':

					parameter = {
						model: 'assoc',
						table: 'listing_to_product_assoc',
						action: 'custom_join_query',
						id: id
					}
					section = "product";

					break;

				default:		
					break;

			}

			try {
				let response = await sendhttpRequest(parameter);
				console.log(response);

				if (response['code'] == 200 && response['data'] != '') {

					switch (type) {

						case 'sizing-assoc':
							
							let itemSize = [];

							$.map(response['data'], (item, index) => {

								results += `<tr data-id="${item.id}" class="added-size added-size-${item.id}"> \
												<td class="size-name-${item.id}">${item.name}</td> \
												<td style="display:flex;align-items:center;justify-content:center;gap:20px;"> \
													$<input type="number" min="0" step=".01" class="form-control col50 size-item" data-size_id="${item.id}" value="${parseFloat(item.price)}"> \
												</td> \
												<td> \
													<button class="btn red" data-id="${item.id}" onclick="MSL.sizing.removeSizeOption(this); return false;"><i class="bi bi-x-circle"></i></button> \
												</td> \
											</tr>`;

								let size_item = {
									id: parseInt(item.id),
									size: item.name
								}

								itemSize.push(size_item);

							});

							listingSizes = itemSize;

							results = (typeof results !== "undefined") ? results.replace("undefined","") : results;

							$('.'+section+'-wrapper table tbody').html(results);

							MSL.listing.initSizingPriceUpdate();

							break;

						case 'serving-temp':

							$.map(response['data'], (item, index) => {

								$('.serving-temp-wrapper div[data-id='+item.id+']').addClass(" active");

								results += `<div class="form-field-tags-selected-item ${section}-${item.id}"> \
												<lord-icon src="${item.image}" colors="primary:#012928,secondary:#01dc82" trigger="hover" style="width:50px;height:50px"></lord-icon> \
												<span>${item.name}</span> \
											</div>`;
							});

							results = (typeof results !== "undefined") ? results.replace("undefined","") : results;

							$('.'+section+'-section').html(results);

							break;

						case 'addon-product':

							let size;

							for (let i = 0; i < listingSizes.length; i++) {

								size += ($('.'+section+'-wrapper table thead th.size-'+listingSizes[i].id).length == 0) ? `<th class="size-${listingSizes[i].id}">${listingSizes[i].size}</th>` : ``;

								size = (typeof size !== "undefined") ? size.replace("undefined","") : size;

							}

							$('.'+section+'-wrapper table thead tr').append(size);

							$.map(response['data'], (item, index) => {

								results += `<tr data-id="${item.a_id}" class="addon-product-${item.a_id}"> \
												<td>${item.name}</td>`;

								for (let i = 0; i < listingSizes.length; i++) {
									results += `<td> \
													<input class="addon-item ${section}-${item.a_id} form-control col50" data-id="${item.a_id}" data-type="${section}" data-size="${listingSizes[i].size}" type="number" min="0" step=".01" placeholder="Price Difference" style="margin: 0 auto;"> \
												</td>`;
								}

								results += `<td> \
												<button class="btn red" data-id="${a_id}" data-wrapper="addon-product" onclick="MSL.main.removeCustomOption(this); return false;"><i class="bi bi-x-circle"></i></button> \
											</td> \
										</tr>`;

							});

							$('.'+section+'-wrapper table tbody').html(results);


							break;

						case 'product-option':
							//console.log("product-option", response);
							let item_name;
							let item_id;

							$.map(response['data'], (item, index) => {

								if (response['data'].length > 0) {
									if (index === response['data'].length - 1) lastSortOrder = item.oa_sort;
								} else {
									lastSortOrder = 0;
								}

								switch (item.oa_type) {

									case 'optionset':
										item_name = item.os_name;
										break;

									default:
										item_name = item.o_name;
										break;
								}

								results += `<div class="sortable-item ui-sortable-handle" id="option-${item.oa_id}" data-type="${item.oa_type}" data-id="${item.oa_id}" data-oid="${item.o_id}">${item_name} <button class="btn red" data-id="${item.oa_id}" data-type="${item.oa_type}" onclick="MSL.listing.removeOption(this); return false;"><i class="bi bi-x-circle"></i></button> </div>`;
							});

							MSL.main.startSortable();

							results = (typeof results !== "undefined") ? results.replace("undefined","") : results;

							$('.'+section+'-section').html(results);

							console.log("lastSortOrder", lastSortOrder);

							break;

						case 'product':

							$.map(response['data'], (item, index) => {

								results += `<div class="form-field-tag-${section} ${section} ${section}-${item.id} " data-id="${item.id}" data-pa_id="${item.pa_id}" data-section="${section}" data-item="${section}" data-table="${section}" onclick="MSL.main.removeSelected(this); return false;">${item.name} <i class="bi bi-x-circle" style="margin-left: 10px;"></i></div>`;
								MSL.listing.getIngredients(item.id);

							});

							results = (typeof results !== "undefined") ? results.replace("undefined","") : results;

							$('.'+section+'-section').html(results);

							break;


						default:
							break;

					}

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

			if (checkFormValidity === true) {

				$('.btn_submit').text("Saving...").attr("disabled", "disabled");

				if ($('.product_image').attr('src')) {
	                base64Parts = MSL_GLOBAL.main.splitBase64String($('.product_image').attr('src'), 3000);
	                productImage = base64Parts[0];

	            } else {
	                productImage = '';
	            }

	            parameter = {
					model: 'listing',
					action: 'update',
					update: {
						sb_id: supp_id,
						item_name: form.find('input[name=item_name]').val(),
						short_description: form.find('input[name=short_description]').val(),
						long_description: form.find('textarea[name=long_description]').val(),
						price: parseFloat(form.find('input[name=price]').val()),
						tax_class: form.find('input[name=tax_class').val(),
						tax_inclusive: form.find('input[name=tax_inclusive').val(),
						start_date: form.find('input[name=start_date').val(),
						end_date: form.find('input[name=end_date').val(),
						image: productImage,
						status: form.find('input[name=product_status').val()
					},
					condition: [["id","=",itemID]]
				}

				try {
					let response = await sendhttpRequest(parameter);
					console.log(response);

					if (response['code'] == 200) {
						
						//this is to insert the sizing and prices of addons
						if ($('.addon-item').length > 0) {
							MSL.listing.addDetails('addon-item', itemID);
						}

						// the selected options as well with sort
						if (sortedOptions.length > 0) {
							MSL.listing.saveOptions(itemID);
						}

						//insert products selected
						if (selectedProducts.length > 0) {
							MSL.listing.addDetails('product', itemID);
						}

						//insert ingredients selected
						if (selectedIngredients.length > 0) {
							MSL.listing.addDetails('ingredient', itemID);
						}

						//upload image
						if (productImage.length > 0) {
	                        MSL_GLOBAL.main.uploadImageSequentially('listing', 'listing', itemID, base64Parts, 1, 'image', 'main-listing-form');
	                    } else {
	                        if (formErrors == 0) {
	                            setTimeout(() => {
	                                MSL_GLOBAL.main.cleanForm('main-listing-form');
	                            },350);
	                        }
	                    }
					}

				} catch(error) {
					console.log("Error: ", error);
					formErrors++;
				}

			}

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

		updateOptionAssocSort: async () => {

			if (sortedOptions.length > 0) {

				for (let i = 0; i < sortedOptions.length; i++) {
					let parameter = {
						model: 'assoc',
						action: 'custom_update_assoc',
						table: 'option_assoc_sort',
						opt_id: sortedOptions[i].oid,
						item_id: itemID,
						sort: i
					}

					try {
						let response = await sendhttpRequest(parameter);
						console.log(response);
					} catch(error) {
						console.log("Error: ", error);
					}
				}

			}
		},

		initSizingPriceUpdate: async () => {

			let parameter;

			$('.size-item').on('input', function(){

				parameter = {
					model: 'sizing',
					action: 'update',
					update: {
						price: parseFloat($(this).val())
					},
					condition: [['id', '=', $(this).data('size_id')]]
				}

				//console.log(parameter);
				MSL.listing.saveDetails(parameter);
			});
		},

		removeOption: async (e) => {

			if (confirm('Are you sure you want to remove this option?')) {
				let parameter = {
					model: 'assoc',
					action: 'custom_delete',
					table: ($(e).data('type') == "option" ? "option_assoc" : "optionset_assoc"),
					id: $(e).data('id')
				}

				console.log(parameter);
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
					item_id: itemID,
					type: 'listing'
				}
			}

			try {
				let response = await sendhttpRequest(parameter);
				
				if (response['code'] == 200) {

					let sizes = `<tr data-id="${response['id']}" class="added-size added-size-${response['id']}"> \
								<td class="size-name-${response['id']}">${$('.overlay-sizing .custom-modal input[name=name]').val()}</td> \
								<td style="display:flex;align-items:center;justify-content:center;gap:20px;"> \
									$<input type="number" min="0" step=".01" class="form-control col50"> \
								</td> \
								<td><button class="btn red" data-id="${response['id']}" onclick="MSL.sizing.removeSizeOption(this); return false;"><i class="bi bi-x-circle"></i></button></td> \
							</tr>`;

					sizes = (typeof sizes !== "undefined") ? sizes.replace("undefined","") : sizes;

					$('.sizing-wrapper table tbody').append(sizes);

					MSL_GLOBAL.main.closeModal('overlay-sizing');

					// if ($.inArray(response['id'], createdSizes) === -1) {
					// 	createdSizes.push(parseInt(response['id']));
					// }

					// console.log("createdSizes", createdSizes);

				}

			} catch(error) {
				console.log("Error: ", error)
			}

		},

		removeSizeOption: async(e) => {
			
			if (confirm('Are you sure you want to remove this size?')) {

				let parameter = {
					model: 'sizing',
					action: 'delete',
					condition: [['id', '=', $(e).data("id")]]
				}

				try {
					let response = await sendhttpRequest(parameter);

					if (response['code'] == 200) {
						$('.sizing-wrapper table tbody tr.added-size-'+$(e).data("id")).remove();
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