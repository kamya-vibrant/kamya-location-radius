
/**
 * Select and upload image can now be found in app.js file for global use.
 * **/

const selectedDetails = [];
const selectedProducts = [];
const selectedIngredients = [];
const createdSizes = [];
let sortedOptions = [];
let selectedMenus = [];
const supp_id = Supplier_[0]['id'];
var counttblsizes=0;
let formErrors = 0;
var tempvar_rec_ing=[];
let Inventory = {

	main: {

		onLoad: async () => {

			//init the start date field to current date
			let today_date = new Date();
			$('input[name=start_date]').val(moment(today_date).format('YYYY-MM-DD'));

			//initialize search function
			$('.search_field').on('input', function(){
				Inventory.main.search($(this).val(), $(this).data('table'), $(this).data('id'), $(this).data('wrapper'));
			});

			try {

				const [getRecipes, getIngredients, getCuisines, getMenus] = await Promise.all([
					Inventory.recipe.getRecipes(),
					Inventory.ingredient.getIngredients(),
					Inventory.cuisine.getCuisines(),
					Inventory.menu.getMenus()
				]);
				x=0;
				for (const item of [getRecipes, getIngredients, getCuisines]) {
					console.log(x+': ',item);
					if(item!=null)Inventory.main.displayDetails(item.item, item.data);
					x++;
				}

			} catch (error) {
				console.log("Error: ", error);
			}

		},

		sendRequest: async (parameter) => {

			try {
				let response = await sendhttpRequest(parameter);
				console.log("sendRequest", response);
			} catch (error) {
				console.log("Error sending request: ", error);
			}

		},

		search: async (params, table, id = null, wrapper = null) => {

			let parameter, onClickFunc, result = '';

			switch (table) {

				case 'product': case 'ingredient':

					parameter = {
						model: table,
						action: 'retrieve',
						retrieve: '*',
						condition: [
							['name', 'LIKE', '%'+params+'%']
						]
					}

					break;

				case 'option' : 

					parameter = {
						model: table,
						action: 'retrieve',
						retrieve: '*',
						condition: [
							['name', 'LIKE', '%'+params+'%', 'AND'],
							['sb_id', '=', supp_id]
						]
					}

					onClickFunc = "Inventory.product.selectOption(this); return false;";

					break;
				case 'optionset':
					parameter = {
						model: table,
						action: 'retrieve',
						retrieve: '*',
						condition: [
							['name', 'LIKE', '%'+params+'%', 'AND'],
							['sb_id', '=', supp_id]
						]
					}

					onClickFunc = "Inventory.product.selectOptionset(this); return false;";

					break;

				case 'sizing':

					parameter = {
						model: table,
						action: 'retrieve',
						retrieve: '*',
						condition: [
							['name', 'LIKE', '%'+params+'%', 'AND'],
							['sb_id', '=', user_id]
						]
					}

					onClickFunc = "Inventory.sizing.selectSize(this); return false;";

					break;

				default:
					break;

			}

			try {

				let response = await sendhttpRequest(parameter);
				console.log(response);

				if (response['code'] == 200 && response['data'] && response['data'].length > 0) {

					for (const item of response['data']) {

						result += `<div class="form-field-option" data-id="${item.id}" data-name="${item.name}" data-wrapper="${wrapper}" onclick="${onClickFunc}">${item.name}</div>`;

					}

					if (params.length > 0 && response['data'].length > 0) {
						$('.'+wrapper+'-result').html(result).show();
					} else {
						$('.'+wrapper+'-result').html("").hide();
					}

				}

			} catch (error) {
				console.log("Error searching item: ", error);
			}

		},

		displayDetails: async (item, data) => {

			let details = '';

			switch (item) {

				case 'recipes':

					for (const result of data) {

						details += `<div class="form-field-tag " data-id="${result.id}" data-info="recipes" data-name="${result.name}" data-for="recipes" onclick="Inventory.main.selectDetails(this); return false;">${result.name}</div>`;
 
					}

					$('.recipes-wrapper').html(details);

					break;

				case 'ingredients':

					for (const result of data) {

						details += `<div class="form-field-tag " data-id="${result.id}" data-info="ingredient" data-name="${result.name}" data-for="ingredient" onclick="Inventory.main.selectDetails(this); return false;">${result.name}</div>`;

					}

					$('.ingredient-wrapper').html(details);


					break;

				case 'cuisine':

					for (const result of data) {

						details += `<div class="form-field-tag " data-id="${result.id}" data-info="cuisine" data-name="${result.cuisine_name}" data-for="cuisine" onclick="Inventory.main.selectDetails(this); return false;">${result.cuisine_name}</div>`;

					}

					$('.cuisine-wrapper').html(details);


					break;

				default:
					break;

			}

		},

		selectDetails: async (e) => {

			/*
				Change process to store to array first before inserting into database to prevent overload in database tables
		
			*/

			let selection = '';
			let parameter = '';

			if ($('.'+$(e).data('for')+'-section .'+$(e).data('for')+'-'+$(e).data('id')).length == 0) {

				let itemsData = [];

				if ($(e).data('for') == "cuisine") {

					if ($('.cuisine-section div').length > 0) {

						//replace the previously selected
						$('.'+$(e).data('for')+'-wrapper').find('div:not([data-id='+$(e).data('id')+'])').removeClass("active");

						$('.'+$(e).data('for')+'-wrapper').find('div[data-id='+$(e).data('id')+']').addClass(" active");

						selection = `<div class="form-field-tags-selected-item ${$(e).data('for')}-selected ${$(e).data('for')}-${$(e).data('id')}">
										<span>${$(e).data('name')}</span>
									</div>`;

						$('.'+$(e).data('for')+'-section').html(selection);

						if (selectedDetails.length > 0) {

							for (let i = 0; i < selectedDetails.length; i++) {

								if (selectedDetails[i].type == "cuisine") selectedDetails[i].id = $(e).data('id');

							}

						}


					} else {

						$('.'+$(e).data('for')+'-wrapper').find('div[data-id='+$(e).data('id')+']').addClass(" active");

						selection = `<div class="form-field-tags-selected-item ${$(e).data('for')}-selected ${$(e).data('for')}-${$(e).data('id')}">
										<span>${$(e).data('name')}</span>
									</div>`;

						$('.'+$(e).data('for')+'-section').html(selection);

						itemsData = {
							type: $(e).data('for'),
							id: $(e).data('id')
						}

						selectedDetails.push(itemsData);

					}

				} else {

					$('.'+$(e).data('for')+'-wrapper').find('div[data-id='+$(e).data('id')+']').addClass(" active");

					selection = `<div class="form-field-tags-selected-item ${$(e).data('for')}-selected ${$(e).data('for')}-${$(e).data('id')}">
									<span>${$(e).data('name')}</span>
								</div>`;

					$('.'+$(e).data('for')+'-section').append(selection);

					itemsData = {
						type: $(e).data('for'),
						id: $(e).data('id')
					}

					selectedDetails.push(itemsData);

				}


				//add the selection to assoc table in database
				// parameter = {
				// 	model: 'assoc',
				// 	action: 'custom_insert',
				// 	table: 'product_option_assoc',
				// 	insert: {}
				// }

				// parameter.insert['sb_id'] = user_id;
				// parameter.insert['item_id'] = 0; // for inital insert and update later
				// parameter.insert['opt_id'] = $(e).data('id');
				// parameter.insert['type'] = $(e).data('for');

				// try {

				// 	let response = await sendhttpRequest(parameter);

				// 	if (response['code'] == 200 && response['id'] > 0) {

				// 		let itemsData = [];

				// 		$('.'+$(e).data('for')+'-wrapper').find('div[data-id='+$(e).data('id')+']').addClass(" active").attr("data-assoc-id", response['id']);

				// 		selection = `<div class="form-field-tags-selected-item ${$(e).data('for')}-selected ${$(e).data('for')}-${$(e).data('id')}">
				// 						<span>${$(e).data('name')}</span>
				// 					</div>`;

				// 		$('.'+$(e).data('for')+'-section').append(selection);

				// 		itemsData = {
				// 			type: $(e).data('for'),
				// 			id: response['id']
				// 		}

				// 		selectedDetails.push(itemsData);

				// 	}

				// } catch (error) {
				// 	console.log("Error adding assoc: ", error);
				// }


			} else {

				$('.'+$(e).data('for')+'-wrapper').find('div[data-id='+$(e).data('id')+']').removeClass(" active").removeAttr("data-assoc-id");

				$('.'+$(e).data('for')+'-section .'+$(e).data('for')+'-'+$(e).data('id')).remove();

				for (let i = 0; i < selectedDetails.length; i++) {

					if (selectedDetails[i].id == $(e).data('id') && selectedDetails[i].type == $(e).data('for')) selectedDetails.splice(i, 1);

				}

				// let assoc_id = 	$('.'+$(e).data('for')+'-wrapper').find('div[data-id='+$(e).data('id')+']').data('assoc-id');

				// parameter = {
				// 	model: 'assoc',
				// 	action: 'custom_delete',
				// 	table: 'product_option_assoc',
				// 	condition: [['id', '=', assoc_id]]
				// }

				// try {

				// 	let response = await sendhttpRequest(parameter);

				// 	if (response['code'] == 200) {

				// 		$('.'+$(e).data('for')+'-wrapper').find('div[data-id='+$(e).data('id')+']').removeClass(" active").removeAttr("data-assoc-id");

				// 		$('.'+$(e).data('for')+'-section .'+$(e).data('for')+'-'+$(e).data('id')).remove();

				// 		for (let i = 0; i < selectedDetails.length; i++) {

				// 			if (selectedDetails[i].id == assoc_id && selectedDetails[i].type == $(e).data('for')) selectedDetails.splice(i, 1);

				// 		}

				// 	}

				// } catch (error) {
				// 	console.log("Error deleting assoc: ", error);
				// }

			}

			console.log(selectedDetails);

		},

		selectProductType: (e) => {
			console.log($(e).data('product-type'));
			$('input[name=product_type]').val($(e).data('product-type'));
			if ($(e).data('product-type') == "simple") {
				$('.simple_product_container').show();
				$('.custom_product_container').hide();
			} else {
				$('.simple_product_container').hide();
				$('.custom_product_container').show();
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

	},

	product: {

		/**
		 * Updates in the form
		 * - Menu: can select multiple menus to include the product
		 * - Price: changed to Inc GST and should compute the price to add 10% GST
		 * - Tax Inclusive: Removed the tax inclusive field from the form as the price is already GST included
		 * - End date: Removed from form as Product shouldn't have any end date.
		 * - On page load, set the start date with the current date
		 * - Set the status of the product to active/live on page load
		 * **/
		checkvalues: async (e) => {
			let form = $("#"+$(e).attr('id'));
			rt = true;
			if(form.find('input[name=item_name]').val().trim()==''){MSL_GLOBAL.main.globalModal('failed', 'danger', 'Create Product', 'item name is required'); rt=false}
			else if(form.find('input[name=price]').val().trim()==''){MSL_GLOBAL.main.globalModal('failed', 'danger', 'Create Product', 'price is required'); rt=false}
			else if(form.find('input[name=min_order]').val().trim()==''){MSL_GLOBAL.main.globalModal('failed', 'danger', 'Create Product', 'min order is required'); rt=false}
			else if(form.find('input[name=tax_class]').val().trim()==''){MSL_GLOBAL.main.globalModal('failed', 'danger', 'Create Product', 'class tax is required'); rt=false}
			else if(form.find('input[name=start_date]').val().trim()==''){MSL_GLOBAL.main.globalModal('failed', 'danger', 'Create Product', 'start date is required'); rt=false}
			
			if(form.find('input[name=product_type]').val()=='simple'){
				
				if(selectedDetails.length<1){
					rt=false;
					MSL_GLOBAL.main.globalModal('failed', 'danger', 'Create Product', 'please select recipes and/or ingredients');
				}
			}else{
				if($('.product-option-section').children().length>0) {
					
					for(as_i=0; as_i<counttblsizes; as_i++){
						for(var sze_ of tempvar_rec_ing){
							
							if($('#tbl-sizeoption-'+as_i+' > tr.opt-parent-'+sze_.pid+' > td.opt-min-size-'+sze_.pid+' input.min_val_'+sze_.pid).val()==''){MSL_GLOBAL.main.globalModal('failed', 'danger', 'Create Product', 'please complete the required fields'); rt=false}
							else if($('#tbl-sizeoption-'+as_i+' > tr.opt-parent-'+sze_.pid+' > td.opt-max-size-'+sze_.pid+' > input.max_val_'+sze_.pid).val()==''){MSL_GLOBAL.main.globalModal('failed', 'danger', 'Create Product', 'please complete the required fields'); rt=false}
							else if($('#tbl-sizeoption-'+as_i+' > tr.opt-parent-'+sze_.pid+' > td.opt-inc-qty-size-'+sze_.pid+' input.inc_qty_val_'+sze_.pid).val()==''){MSL_GLOBAL.main.globalModal('failed', 'danger', 'Create Product', 'please complete the required fields'); rt=false}
							else if($('#tbl-sizeoption-'+as_i+' > tr.opt-parent-'+sze_.pid+' > td.opt-additional-cost-'+sze_.pid+' input.additional_cost_val_'+sze_.pid).val()==''){MSL_GLOBAL.main.globalModal('failed', 'danger', 'Create Product', 'please complete the required fields'); rt=false}
							else if($('#tbl-sizeoption-'+as_i+' > tr.opt-parent-'+sze_.pid+' > td.opt-extra-cost-size-'+sze_.pid+' input.extra_cost_val_'+sze_.pid).val()==''){MSL_GLOBAL.main.globalModal('failed', 'danger', 'Create Product', 'please complete the required fields'); rt=false}
						}
					}
				}else{

					rt=false;
					MSL_GLOBAL.main.globalModal('warning', 'danger', 'Create Product', 'You need to search/add size and seach and select product option');
				} 
				
			}

			return rt;
		},
		saveProduct: async (e) => {
			checkvalues = await Inventory.product.checkvalues(e);
			if(checkvalues){
				let form = $("#"+$(e).attr('id'));

				MSL_GLOBAL.main.globalModal('warning', 'submission', 'Create Product', 'Submitting product... Please wait...');

				let productImage, base64Parts;

				//get the cuisine value from selectDetails array
				var cuisine_value = 0;

				if (selectedDetails.length > 0) {

					for (let i = 0; i < selectedDetails.length; i++) {
						if (selectedDetails[i].type == "cuisine") {
							if(cuisine_value==0)cuisine_value = selectedDetails[i].id;
							else cuisine_value = cuisine_value+','+selectedDetails[i].id;
						}
					}

				}

				let parameter = {
					model: 'listing',
					action: 'insert',
					insert: {
						sb_id: user_id,
						item_name: form.find('input[name=item_name]').val(),
						short_description: form.find('input[name=short_description]').val(),
						long_description: form.find('textarea[name=long_description]').val(),
						price: form.find('input[name=price]').val(),
						min_order: form.find('input[name=min_order]').val(),
						tax_class: form.find('input[name=tax_class]').val(),
						tax_inclusive: '', //set default to empty to avoid issue to DB
						start_date: form.find('input[name=start_date]').val(),
						end_date: '0000-00-00', // set deafult of 0000-00-00 to avoid issue to DB
						cuisine: cuisine_value,
						meal_type: form.find('input[name=meal_type]').val(),
						serving_temp: form.find('input[name=serving_temp]').val(),
						packaging_type: form.find('input[name=packaging_type]').val(),
						product_type: form.find('input[name=product_type]').val(),
						status: form.find('input[name=product_status]').val()
					}
				}

				if ($('.product_image').attr('src').length > 0) {
					base64Parts = MSL_GLOBAL.main.splitBase64String($('.product_image').attr('src'), 6000);
	                productImage = base64Parts[0];
	                parameter.insert['image'] = productImage;
				} else {
					productImage = '';
				}

				try {

					let response = await sendhttpRequest(parameter);
					// console.log(response);

					if (response['code'] == 200 && response['id'] && response['id'] > 0) {

						if (productImage.length > 0) {

		                    await Promise.all([
		                    	MSL_GLOBAL.main.uploadImageSequentially('listing', 'listing', response['id'], base64Parts, 1, 'image', 'main-listing-form')
		                    ]);

						}

						if (form.find('input[name=product_type]').val() == "simple") {

							if (selectedDetails.length > 0) {

								for (let i = 0; i < selectedDetails.length; i++) {
									let parameter = {
										model: 'assoc',
										action: 'custom_insert',
										table: 'product_option_assoc',
										insert: {
											sb_id: supp_id,
											item_id: response['id'],
											opt_id: selectedDetails[i].id,
											type: selectedDetails[i].type
										}
									}
									if(selectedDetails[i].type !== 'cuisine')Inventory.product.insertProductOptionAssoc(parameter);
								}

							}

						} else {

							// save the customized product options
							saveproductOptions_ = await Inventory.product.saveProductOptions(response['id']);

						}
						for(const mnu_item of selectedMenus){
							mnu_save_ = await Inventory.product.savemenu(mnu_item,response['id']);
						}
						MSL_GLOBAL.main.globalModal('success', 'succesful', 'Create Product', 'Product has been created succesfully.');

						// setTimeout(()=>{
							window.location.href = '/product';
						// },2500);

					}

				} catch (error) {
					console.log("Error creating product: ", error);
				}
			}	
		},
		savemenu: async (mnu_item,p_id) => {
			var getmenubyid_ = await Inventory.product.getmenubyid(mnu_item);
			let parameter = {
				model: 'menu',
				action: 'update',
				update: {
						'listings': getmenubyid_.listings + ',' + p_id
				},
				condition: [['id', '=', mnu_item]]
			}

			try {
				let response = await sendhttpRequest(parameter);
			} catch (error) {
				console.log(error);
			}

		},
		getmenubyid: async (id) => {
			let parameter = {
				model: 'menu',
				action: 'retrieve',
				condition: [['id', '=', id]]
			}

			try {
				let response = await sendhttpRequest(parameter);
				return response.data[0];
			} catch (error) {
				console.log(error);
			}
		},
		insertProductOptionAssoc: async (parameter) => {

			try {
				let response = await sendhttpRequest(parameter);
			} catch (error) {
				console.log("Error insert product option assoc: ", error);
			}

		},
		selectOptionset: async (e) =>{
			$('.search_field').val('');
			$('.optionset-result').hide();
			let sortables;

	       	if ($('.sizing-wrapper table tr.added-size').length == 0) {
	       		
	       		alert('Please select or create sizes first before adding new product options.');
	       	
	       	} else {

	       		let x = 0, colspan = 0;

		       	for (let i = 0; i < createdSizes.length; i++) {
		       		x++;
		       	}

		       	colspan = 4 + (x * createdSizes.length);

				try {

					var resp = await Inventory.product.getInformation('optionset_assoc_to_pantry', $(e).data('id'));
					console.log("resp", resp);
					// if (resp.code == 200) {

						let option_information = '';
						let option_td = '';
						// createdSizes
						for (const item of resp['data']) {
							tempvar_rec_ing.push(item);

							option_information += `<tr class="opt-parent-${item.pid} prod-opt-tr prod-opt-id-${item.pid}" data-opt-parent-id="${$(e).data('id')}" data-type="${(item.p_type == "product") ? "recipes" : item.p_type}">
			                                            <td class="opt-name-size-${item.pid}" data-opt-parent-id="${$(e).data('id')}" data-opt-item-id="${item.pid}">
			                                            	<input type="hidden" class="form-check-input opt_id_${$(e).data('id')}" value="${item.pid}">
			                                            	${item.p_name}
			                                            </td>
			                                            <td class="opt-min-size-${item.pid}" data-opt-parent-id="${$(e).data('id')}" data-opt-item-id="${item.pid}"><input type="number" class="min_val_${$(e).data('id')} form-control" style="display: block;margin: 0 auto;" required></td>
			                                            <td class="opt-max-size-${item.pid}" data-opt-parent-id="${$(e).data('id')}" data-opt-item-id="${item.pid}"><input type="number" class="max_val_${item.pid} form-control" style="display: block;margin: 0 auto;" required></td>
			                                            <td class="opt-exceed-size-${item.pid}"><input class="form-check-input exceed_chkbx_${$(e).data('id')}" type="checkbox" onchange="Inventory.product.allowExtra(this); return false;" value="0"></td>`;

			                    for (let i = 0; i < 1; i++) {
			                    	option_information += `	<td class="opt-enable-${item.pid}" data-created-size-id="${createdSizes[i].id}" data-created-size-name="${createdSizes[i].name}">
			                    								<label class="switch">
			                    									<input type="checkbox" data-opt-parent-id="${$(e).data('id')}" data-created-size-id="${createdSizes[i].id}" data-opt-id="${item.pid}" onchange="Inventory.sizing.updateStatus(this); return false;" checked="checked">
			                    									<span class="slider round"></span>
			                    								</label>
			                    							</td> \
			                    							<td class="opt-inc-qty-size-${item.pid}" data-created-size-id="${createdSizes[i].id}" data-created-size-name="${createdSizes[i].name}"><input type="hidden" class="sizing_id_${item.pid}" value="${createdSizes[i].id}"><input type="hidden" class="size_input_${createdSizes[i].id}" value="1"><input type="number" data-created-size-id="${createdSizes[i].id}" data-opt-id="${item.pid}" class="inc_qty_val_${item.pid} inc_qty_input_${createdSizes[i].id} form-control" style="display: block;margin: 0 auto;" required></td> \
			                    							<td class="opt-additional-cost-${item.pid}" data-created-size-id="${createdSizes[i].id}" data-created-size-name="${createdSizes[i].name}"><input type="number" data-created-size-id="${createdSizes[i].id}" data-opt-id="${item.pid}" class="additional_cost_val_${item.pid} additional_cost_input_${createdSizes[i].id} form-control" style="display: block;margin: 0 auto;" required></td> \
			                    							<td class="opt-extra-cost-size-${item.pid}" data-created-size-id="${createdSizes[i].id}" data-created-size-name="${createdSizes[i].name}"><input type="number" data-created-size-id="${createdSizes[i].id}" data-opt-id="${item.pid}" class="extra_cost_val_${item.pid} extra_cost_input_${createdSizes[i].id} form-control" style="display: block;margin: 0 auto;" required></td>`;
			                    }
			                option_information += `</tr>`;

						}

						sortables += option_information;

				} catch (error) {
					console.log("Error fetching information:", error);
				}
				
				// $('.product-option-table tbody').append(sortables);
				for(as_i=0; as_i<counttblsizes; as_i++){
					// alert('#tbl-sizeoption-'+as_i);
					$('#tbl-sizeoption-'+as_i).append(sortables);
				}
				
	       	}
		},
		selectOption: async (e) => {
			$('.search_field').val('');
			$('.option-result').hide();
			let sortables;

	       	if ($('.sizing-wrapper table tr.added-size').length == 0) {
	       		
	       		alert('Please select or create sizes first before adding new product options.');
	       	
	       	} else {

	       		let x = 0, colspan = 0;

		       	for (let i = 0; i < createdSizes.length; i++) {
		       		x++;
		       	}

		       	colspan = 4 + (x * createdSizes.length);

				// sortables += `<tr class="highlight product-option product-option-${$(e).data('id')}" data-id="${$(e).data('id')}" data-type="${$(e).data('wrapper')}" colspan="${colspan}"> \
				// 					<td class="section-title" style="text-align: left;display: flex;flex-direction: row;gap: 20px;align-items: center;"> \
				// 						<i class="bi bi-x-circle" style="cursor: pointer;" data-opt-id="${$(e).data('id')}" onclick="Inventory.product.removeProductOption(this); return false;"></i> \
				// 						${$(e).data('name')} \
				// 					</td> \
				// 			</tr>`;
				

				//get the products or ingredients under options or option sets
				try {

					var resp = await Inventory.product.getInformation('option_assoc_to_pantry', $(e).data('id'));
					console.log("resp", resp);
					// if (resp.code == 200) {

						let option_information = '';
						let option_td = '';
						// createdSizes
						for (const item of resp['data']) {
							tempvar_rec_ing.push(item);
							// option_information += `<tr class="opt-parent-${$(e).data('id')} prod-opt-tr prod-opt-id-${item.pid}" data-opt-parent-id="${$(e).data('id')}" data-type="${(item.p_type == "product") ? "recipes" : item.p_type}">
			                //                             <td class="opt-name-size-${$(e).data('id')}" data-opt-parent-id="${$(e).data('id')}" data-opt-item-id="${item.pid}">
			                //                             	<input type="hidden" class="form-check-input opt_id_${$(e).data('id')}" value="${item.pid}">
			                //                             	${item.p_name}
			                //                             </td>
			                //                             <td class="opt-min-size-${$(e).data('id')}" data-opt-parent-id="${$(e).data('id')}" data-opt-item-id="${item.pid}"><input type="number" class="min_val_${$(e).data('id')} form-control" style="display: block;margin: 0 auto;"></td>
			                //                             <td class="opt-max-size-${$(e).data('id')}" data-opt-parent-id="${$(e).data('id')}" data-opt-item-id="${item.pid}"><input type="number" class="max_val_${$(e).data('id')} form-control" style="display: block;margin: 0 auto;"></td>
			                //                             <td class="opt-exceed-size-${$(e).data('id')}"><input class="form-check-input exceed_chkbx_${$(e).data('id')}" type="checkbox" onchange="Inventory.product.allowExtra(this); return false;" value="0"></td>`;

			                //     for (let i = 0; i < 1; i++) {
			                //     	option_information += `<td class="opt-inc-qty-size-${$(e).data('id')}" data-created-size-id="${createdSizes[i].id}" data-created-size-name="${createdSizes[i].name}"><label class="switch"><input type="checkbox" data-opt-parent-id="${$(e).data('id')}" data-created-size-id="${createdSizes[i].id}" data-opt-id="${item.pid}" onchange="Inventory.sizing.updateStatus(this); return false;" checked="checked"><span class="slider round"></span></label></td> \
			                //     							<td class="opt-inc-qty-size-${$(e).data('id')}" data-created-size-id="${createdSizes[i].id}" data-created-size-name="${createdSizes[i].name}"><input type="hidden" class="sizing_id_${$(e).data('id')}" value="${createdSizes[i].id}"><input type="hidden" class="size_input_${createdSizes[i].id}" value="1"><input type="number" data-created-size-id="${createdSizes[i].id}" data-opt-id="${item.pid}" class="inc_qty_val_${$(e).data('id')} inc_qty_input_${createdSizes[i].id} form-control" style="display: block;margin: 0 auto;"></td> \
			                //     							<td class="opt-additional-cost-${$(e).data('id')}" data-created-size-id="${createdSizes[i].id}" data-created-size-name="${createdSizes[i].name}"><input type="number" data-created-size-id="${createdSizes[i].id}" data-opt-id="${item.pid}" class="additional_cost_val_${$(e).data('id')} additional_cost_input_${createdSizes[i].id} form-control" style="display: block;margin: 0 auto;"></td> \
			                //     							<td class="opt-extra-cost-size-${$(e).data('id')}" data-created-size-id="${createdSizes[i].id}" data-created-size-name="${createdSizes[i].name}"><input type="number" data-created-size-id="${createdSizes[i].id}" data-opt-id="${item.pid}" class="extra_cost_val_${$(e).data('id')} extra_cost_input_${createdSizes[i].id} form-control" style="display: block;margin: 0 auto;"></td>`;
			                //     }
							option_information += `<tr class="opt-parent-${item.pid} prod-opt-tr prod-opt-id-${item.pid}" data-opt-parent-id="${$(e).data('id')}" data-type="${(item.p_type == "product") ? "recipes" : item.p_type}">
			                                            <td class="opt-name-size-${item.pid}" data-opt-parent-id="${$(e).data('id')}" data-opt-item-id="${item.pid}">
			                                            	<input type="hidden" class="form-check-input opt_id_${$(e).data('id')}" value="${item.pid}">
			                                            	${item.p_name}
			                                            </td>
			                                            <td class="opt-min-size-${item.pid}" data-opt-parent-id="${$(e).data('id')}" data-opt-item-id="${item.pid}"><input type="number" class="min_val_${$(e).data('id')} form-control" style="display: block;margin: 0 auto;" required></td>
			                                            <td class="opt-max-size-${item.pid}" data-opt-parent-id="${$(e).data('id')}" data-opt-item-id="${item.pid}"><input type="number" class="max_val_${item.pid} form-control" style="display: block;margin: 0 auto;" required></td>
			                                            <td class="opt-exceed-size-${item.pid}"><input class="form-check-input exceed_chkbx_${$(e).data('id')}" type="checkbox" onchange="Inventory.product.allowExtra(this); return false;" value="0"></td>`;

			                    for (let i = 0; i < 1; i++) {
			                    	option_information += `	<td class="opt-enable-${item.pid}" data-created-size-id="${createdSizes[i].id}" data-created-size-name="${createdSizes[i].name}">
			                    								<label class="switch">
			                    									<input type="checkbox" data-opt-parent-id="${$(e).data('id')}" data-created-size-id="${createdSizes[i].id}" data-opt-id="${item.pid}" onchange="Inventory.sizing.updateStatus(this); return false;" checked="checked">
			                    									<span class="slider round"></span>
			                    								</label>
			                    							</td> \
			                    							<td class="opt-inc-qty-size-${item.pid}" data-created-size-id="${createdSizes[i].id}" data-created-size-name="${createdSizes[i].name}"><input type="hidden" class="sizing_id_${item.pid}" value="${createdSizes[i].id}"><input type="hidden" class="size_input_${createdSizes[i].id}" value="1"><input type="number" data-created-size-id="${createdSizes[i].id}" data-opt-id="${item.pid}" class="inc_qty_val_${item.pid} inc_qty_input_${createdSizes[i].id} form-control" style="display: block;margin: 0 auto;" required></td> \
			                    							<td class="opt-additional-cost-${item.pid}" data-created-size-id="${createdSizes[i].id}" data-created-size-name="${createdSizes[i].name}"><input type="number" data-created-size-id="${createdSizes[i].id}" data-opt-id="${item.pid}" class="additional_cost_val_${item.pid} additional_cost_input_${createdSizes[i].id} form-control" style="display: block;margin: 0 auto;" required></td> \
			                    							<td class="opt-extra-cost-size-${item.pid}" data-created-size-id="${createdSizes[i].id}" data-created-size-name="${createdSizes[i].name}"><input type="number" data-created-size-id="${createdSizes[i].id}" data-opt-id="${item.pid}" class="extra_cost_val_${item.pid} extra_cost_input_${createdSizes[i].id} form-control" style="display: block;margin: 0 auto;" required></td>`;
			                    }
			                option_information += `</tr>`;

						}

						sortables += option_information;

						//Inventory.product.saveProductOptionAssoc($(e).data('id'), resp['data']);					

					// }

				} catch (error) {
					console.log("Error fetching information:", error);
				}
				
				// $('.product-option-table tbody').append(sortables);
				for(as_i=0; as_i<counttblsizes; as_i++){
					// alert('#tbl-sizeoption-'+as_i);
					$('#tbl-sizeoption-'+as_i).append(sortables);
				}
				
	       	}

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

		},

		allowExtra: (e) => {

			if ($(e).is(":checked")) $(e).val(1);
			else $(e).val(0);

		},

		saveProductOptions: async (id) => {
			console.log(tempvar_rec_ing);
			for(as_i=0; as_i<counttblsizes; as_i++){
				for(var sze_ of tempvar_rec_ing){
					var enable_prod_siz=0;
					var allow_extra_val =0;
					if($('#tbl-sizeoption-'+as_i+' > tr.opt-parent-'+sze_.pid+' > td.opt-enable-'+sze_.pid+' input:checkbox').is(":checked")){
						enable_prod_siz=1;
					}
					if($('#tbl-sizeoption-'+as_i+' > tr.opt-parent-'+sze_.pid+' > td.opt-exceed-size-'+sze_.pid+' input:checkbox').is(":checked")){
						allow_extra_val=1;
					}
					parameter = {
							model: 'assoc',
							action: 'custom_insert',
							table: 'product_option_assoc',
							insert: {
								sb_id: user_id,
								item_id: id,
								opt_parent_id: $('#tbl-sizeoption-'+as_i+' > tr.opt-parent-'+sze_.pid).data('opt-parent-id'),
								opt_id: sze_.pid,
								type: $('#tbl-sizeoption-'+as_i+' > tr.opt-parent-'+sze_.pid).data('type'),
								min: $('#tbl-sizeoption-'+as_i+' > tr.opt-parent-'+sze_.pid+' > td.opt-min-size-'+sze_.pid+' input.min_val_'+sze_.pid).val(),
								max: $('#tbl-sizeoption-'+as_i+' > tr.opt-parent-'+sze_.pid+' > td.opt-max-size-'+sze_.pid+' > input.max_val_'+sze_.pid).val(),
								allow_extra: allow_extra_val
								
							}


						};
					try {
						let response = await sendhttpRequest(parameter);
							parameter1 = {
							model: 'assoc',
							action: 'custom_insert',
							table: 'sizing_assoc',
							insert: {
								sizing_id: $('.tbl-sizeoption-'+as_i).data('id'),
								item_id: id,
								opt_id: sze_.pid,
								type: $('#tbl-sizeoption-'+as_i+' > tr.opt-parent-'+sze_.pid).data('type'),
								inc_qty: $('#tbl-sizeoption-'+as_i+' > tr.opt-parent-'+sze_.pid+' > td.opt-inc-qty-size-'+sze_.pid+' input.inc_qty_val_'+sze_.pid).val(),
								additional_cost: $('#tbl-sizeoption-'+as_i+' > tr.opt-parent-'+sze_.pid+' > td.opt-additional-cost-'+sze_.pid+' input.additional_cost_val_'+sze_.pid).val(),
								extra_cost: $('#tbl-sizeoption-'+as_i+' > tr.opt-parent-'+sze_.pid+' > td.opt-extra-cost-size-'+sze_.pid+' input.extra_cost_val_'+sze_.pid).val(),
								is_enabled: enable_prod_siz,
								poa_id: response.id
							}


						};
						try {
							let response1 = await sendhttpRequest(parameter1);



						} catch (error) {
							console.log("Error adding sizing_assoc: ", error);
						}

					} catch (error) {
						console.log("Error adding sizing_assoc: ", error);
					}

					
					
					
				}
			}
			// //insert product options into product_option_assoc
			// let parameter1, parameter2, parameter3;
			// let productOptionSizing = [];

			// // get all the information from product option table
			// let table = $('.product-option-table');
			// let parent_item = table.find('tr.product-option');

			// for (let i = 0; i < parent_item.length; i++) {

			// 	const $parentItem = $(parent_item[i]);

				// parameter1 = {
				// 	model: 'assoc',
				// 	action: 'custom_insert',
				// 	table: 'product_option_assoc',
				// 	insert: {
				// 		sb_id: user_id,
				// 		item_id: id,
				// 		opt_id: parseInt($parentItem.data('id')),
				// 		type:  $parentItem.data('type'),
				// 		sort: i
				// 	}
				// }

			// 	let subItems = $('.opt-parent-'+$parentItem.data('id'));

			// 	for (let j = 0; j < subItems.length; j++) { //loop for the sub items under option

			// 		const $subItem = $(subItems[j]);
			// 		const parentID = $subItem.data('opt-parent-id');
			// 		const subItemType = $subItem.data('type');

			// 		// update sub items in product option assoc table
			// 		parameter2 = {
			// 			model: 'assoc',
			// 			action: 'custom_insert',
			// 			table: 'product_option_assoc',
			// 			insert: {
			// 				sb_id: user_id,
			// 				item_id: id,
			// 				opt_parent_id: parentID,
			// 				opt_id: $subItem.find('td input.opt_id_'+parentID).val(),
			// 				type: subItemType,
			// 				min: $subItem.find('td input.min_val_'+parentID).val(),
			// 				max: $subItem.find('td input.max_val_'+parentID).val(),
			// 				allow_extra: $subItem.find('td input.exceed_chkbx_'+parentID).val(),
			// 			}
			// 		}

			// 		// update sub items (inc qty, add cost, extra cost) in product option assoc table

			// 		const inc_qty = $subItem.find('td input.inc_qty_val_'+parentID);
			// 		const add_cost = $subItem.find('td input.additional_cost_val_'+parentID);
			// 		const extra_cost = $subItem.find('td input.extra_cost_val_'+parentID);
			// 		let itemsData = [];

			// 		//foreach sub items under option, get the input fields of inc_qty, additional_cost and extra cost

			// 		for (z = 0; z < createdSizes.length; z++) { // loop through the added/selected sizes from sizing table

			// 			//create field values to insert/update in sizing_assoc table for each sizes
			// 			// if ($subItem.find('td input.size_input_'+createdSizes[z].id).val() == 1) {

			// 			let sizing_assoc_parameter = {
			// 				model: 'assoc',
			// 				action: 'custom_update_assoc',
			// 				// table: 'sizing_assoc',
			// 				fields: {
			// 					sizing_id: createdSizes[z].id,
			// 					item_id: id,
			// 					opt_id: $subItem.find('td input.opt_id_'+parentID).val(),
			// 					type: subItemType,
			// 					inc_qty: $subItem.find('td input.inc_qty_input_'+createdSizes[z].id).val(),
			// 					additional_cost: $subItem.find('td input.additional_cost_input_'+createdSizes[z].id).val(),
			// 					extra_cost: $subItem.find('td input.extra_cost_input_'+createdSizes[z].id).val()
			// 				}
			// 			}

			// 			Inventory.main.sendRequest(sizing_assoc_parameter);

			// 		}

			// 		Inventory.main.sendRequest(parameter2);

			// 	}

			// 	Inventory.main.sendRequest(parameter1);
			// }
		},

		saveProductOptionAssoc: async () => {
			
			let parameter;

			for (const result of data) {
				parameter = {
					model: 'listing',
					action: 'custom_insert',
					table: 'product_option_assoc',
					option_type: 'product_option_assoc',
					insert: {
						sb_id: user_id,
						item_id: 0,
						opt_parent_id: opt_parent_id,
						opt_id: result.pid,
						type: result.p_type
					}
				}

				try {
					let response = await sendhttpRequest(parameter);
					//return response;
					console.log(response);
				} catch (error) {
					console.log("Error adding into product option assoc: ", error);
				}
			}

		},

		removeProductOption: (e) => {

			MSL_GLOBAL.main.confirmAlertModal('info', 'confirm', 'Remove Product Option', 'Are you sure you want to remove this product option?').then(async (confirmed) => {

				if (confirmed) {
					// alert($(e).data('opt-id'));
					$('.product-option-table tbody tr.product-option-'+$(e).data('opt-id')).remove();
					$('.product-option-table tbody tr.opt-parent-'+$(e).data('opt-id')).remove();
				}

			});

		}

	},

	cuisine: {

		getCuisines: async () => {

			let parameter = {
				model: 'assoc',
				action: 'custom_retrieve',
				table: 'cuisine',
				retrieve: '*',
				condition: [['sup_id', '=', user_id]]
			}

			try {
				let response = await sendhttpRequest(parameter);
				
				if (response['code'] == 200 ) {

					return {
						item: 'cuisine',
						data: response['data']
					}

				}

			} catch (error) {
				console.log("Error fetching cuisines: ", error);
			}

		}

	},

	menu: {

		getMenus: async() => {

			let parameter = {
				model: 'menu',
				action: 'retrieve',
				retrieve: '*',
				condition: [['sb_id', '=', user_id]]
			}

			let menus = '';

			try {
				let response = await sendhttpRequest(parameter);
				console.log(response);

				if (response['code'] == 200 && response['data'] && response['data'].length > 0) {

					for (const item of response['data']) {

						menus += `<div style="display: flex; flex-direction: row; gap: 20px;"> \
									<input type="checkbox" class="form-check-input" data-id="${item.id}" onchange="Inventory.menu.selectMenu(this); return false;" value="${item.id}" /> \
									<label>${item.name}</label>
								</div>`;

					}

					$('.menu-wrapper').html(menus);

				}

			} catch (error) {
				console.log("Error fetching menus: ", error);
			}

		},

		selectMenu: async(e) => {

			if ($(e).is(":checked")) {

				if ($.inArray($(e).data('id'), selectedMenus) === -1) selectedMenus.push($(e).data('id')); 

			} else {

				if (selectedMenus.length > 0) {

					for (let i = 0; i < selectedMenus.length; i++) {

						if ($(e).data('id') === selectedMenus[i]) selectedMenus.splice(i, 1);

					}

				}

			}

			console.log("selectedMenus", selectedMenus);

		}

	},

	// refer to the product table for recipes
	recipe: {

		getRecipes: async () => {

			let parameter = {
				model: 'product',
				action: 'retrieve',
				retrieve: '*',
				condition: [['sb_id', '=', user_id]]
			}

			try {

				let response = await sendhttpRequest(parameter);

				if (response['code'] == 200) {

					return {
						item: 'recipes',
						data: response['data']
					}

				}

			} catch (error) {
				console.log("Error fetching recipes: ", error);
			}

		}

	},

	ingredient: {

		getIngredients: async () => {

			let parameter = {
				model: 'ingredient',
				action: 'retrieve',
				retrieve: '*',
				condition: [['sb_id', '=', user_id]]
			}

			try {

				let response = await sendhttpRequest(parameter);

				if (response['code'] == 200 && response['data'] && response['data'].length > 0) {

					return {
						item: 'ingredients',
						data: response['data']
					}

				}

			} catch (error) {
				console.log("Error fetching recipes: ", error);
			}

		}

	},

	sizing: {

		initAddSize: async (e) => {
			console.log($(e).data('action'));

			if ($(e).data('action') == "create") {
				$('.overlay-sizing .custom-modal .add_size_container').show();
				$('.overlay-sizing .custom-modal .find_size_container').hide();

				$('.overlay-sizing .custom-modal .custom-modal-footer button:last').attr('data-action', 'create').show();
			} else {
				$('.overlay-sizing .custom-modal .add_size_container').hide();
				$('.overlay-sizing .custom-modal .find_size_container').show();

				$('.overlay-sizing .custom-modal .custom-modal-footer button:last').attr('data-action', 'search').hide();
			}

			$('.overlay-sizing').show();
			$('.overlay-sizing .custom-modal').show();
			$('.overlay-sizing .custom-modal .selected-options').html("");
			$('.overlay-sizing .custom-modal .sizing-result').html("").hide();

			$('.overlay-sizing .custom-modal input[name=add_size_name]').val("");
			$('.overlay-sizing .custom-modal input[name=find_size_name]').val("");

		},

		addSize: async (e) => {

			let parameter = {
				model: 'sizing',
				action: 'insert',
				insert: {
					name: $('.overlay-sizing .custom-modal input[name=add_size_name]').val(),
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

					// add the created sizes into array
					if (createdSizes.length > 0) {

			        	let exists = createdSizes.some(function(item) {
						    return item.id === response['id'] && item.name === $('.overlay-sizing .custom-modal input[name=add_size_name]').val();
						});

						if (!exists) {
							let itemsData = {
			        			id: response['id'],
			        			name: $('.overlay-sizing .custom-modal input[name=add_size_name]').val()
			        		}

			        		createdSizes.push(itemsData);
						}

			        } else {

			        	let itemsData = {
		        			id: response['id'],
		        			name: $('.overlay-sizing .custom-modal input[name=add_size_name]').val()
		        		}
		        		
		        		createdSizes.push(itemsData);
			        }

					console.log("createdSizes", createdSizes);

					let sizes = `<tr data-id="${response['id']}" class="added-size added-size-${response['id']}"> \
								<td class="size-name-${response['id']}"><input type="checkbox" class="form-check-input size_default" name="size_default" value="${response['id']}" onchange="Inventory.sizing.setDefault(this); return false;"></td> \
								<td class="size-name-${response['id']}">${$('.overlay-sizing .custom-modal input[name=add_size_name]').val()}</td> \
								<td><button class="btn red" data-id="${response['id']}" data-name="${$('.overlay-sizing .custom-modal input[name=add_size_name]').val()}" onclick="Inventory.sizing.removeSizeOption(this); return false;" style="display: block;margin: 0 auto;"><i class="bi bi-x-circle"></i></button></td> \
							</tr>`;

					// append in sizing table
					$('.sizing-wrapper table tbody').append(sizes);

					tblsizeshtml = `<div id="tbl_size_${response['id']}">
										<div style="width=100%; text-align: center;"><h3>${$('.overlay-sizing .custom-modal input[name=add_size_name]').val()}</h3></div>
										<table class="table-1 thead tbl-sizeoption-${counttblsizes}" data-id="${response['id']}}" style="width:100%; min-width: 480px;">
		                                        <thead>
		                                            <tr>
		                                                <th></th>
		                                                <th >Min</th>
		                                                <th >Max</th>
		                                                <th >Allow Extra</th>
		                                                <th></th>                                           
		                                                <th >Inc QTY</th>                                               
		                                                <th >Additional Cost</th>                                        
		                                                <th>Extra Portion Cost</th>
		                                            </tr>
		                                        </thead>
		                                        <tbody id="tbl-sizeoption-${counttblsizes}">
		                                        </tbody>
		                                    </table>
		                            </div>`;

		            $('.product-option-section').append(tblsizeshtml);
		            counttblsizes++;
					// // append new thead th in product option table
					// size_headers = `<th class="custom-size-th custom-size-th-${response['id']}" colspan="4">${$('.overlay-sizing .custom-modal input[name=add_size_name]').val()}</th>`;

					// if ($('.product-option-table thead th.custom-size-th').length == 0) {
					// 	$('.product-option-table thead th.last-default-th').after(size_headers);
					// } else {
					// 	$('.product-option-table thead th.custom-size-th:last').after(size_headers);
					// }

					// // append product option thead th sub header (RRP , Extra Portion)
					// if ($('.product-option-table thead tr.size-sub-header').length == 0) {
					// 	size_sub_headers = `<tr class="size-sub-header"> \
					// 							<th class=""></th> \
					// 							<th class=""></th> \
	                //                             <th class="size-sub-header-th-${response['id']}">Inc QTY</th> \
	                //                             <th class="last-size-sub-header size-sub-header-th-${response['id']}">Additional Cost</th> \
	                //                             <th class="last-size-sub-header size-sub-header-th-${response['id']}">Extra Portion Cost</th> \
					// 						</tr>`;

					// 	$('.product-option-table thead tr.size-main-header').after(size_sub_headers);
					// } else {
					// 	size_sub_headers = `<th class=""></th> \
					// 						<th class="size-sub-header-th-${response['id']}">Inc QTY</th> \
					// 						<th class="last-size-sub-header size-sub-header-th-${response['id']}">Additional Cost</th> \
	                //                         <th class="last-size-sub-header size-sub-header-th-${response['id']}">Extra Portion Cost</th>`;
						
					// 	$('.product-option-table thead tr.size-sub-header th.last-size-sub-header:last').after(size_sub_headers);

					// 	//append the input fields if there are product options selected
					// 	if ($('.product-option-table tbody tr.prod-opt-tr').length > 0) {

					// 		$('.product-option-table tbody tr.prod-opt-tr').each(function(){

					// 			let size_td_id = $(this).find('td[data-created-size-id='+response['id']+']');

					// 			if (size_td_id.length == 0) {

					// 				size_inputs += `<td class="opt-inc-qty-size-${$(e).data('id')}" data-created-size-id="${createdSizes[i].id}" data-created-size-name="${createdSizes[i].name}"><label class="switch"><input type="checkbox" data-opt-parent-id="${$(e).data('id')}" data-created-size-id="${createdSizes[i].id}" data-opt-id="${item.pid}" onchange="Inventory.sizing.updateStatus(this); return false;" checked="checked"><span class="slider round"></span></label></td> \
	                //     							<td class="opt-inc-qty-size-${$(e).data('id')}" data-created-size-id="${createdSizes[i].id}" data-created-size-name="${createdSizes[i].name}"><input type="hidden" class="sizing_id_${$(e).data('id')}" value="${createdSizes[i].id}"><input type="hidden" class="size_input_${createdSizes[i].id}" value="1"><input type="number" data-created-size-id="${createdSizes[i].id}" data-opt-id="${item.pid}" class="inc_qty_val_${$(e).data('id')} inc_qty_input_${createdSizes[i].id} form-control" style="display: block;margin: 0 auto;"></td> \
	                //     							<td class="opt-additional-cost-${$(e).data('id')}" data-created-size-id="${createdSizes[i].id}" data-created-size-name="${createdSizes[i].name}"><input type="number" data-created-size-id="${createdSizes[i].id}" data-opt-id="${item.pid}" class="additional_cost_val_${$(e).data('id')} additional_cost_input_${createdSizes[i].id} form-control" style="display: block;margin: 0 auto;"></td> \
	                //     							<td class="opt-extra-cost-size-${$(e).data('id')}" data-created-size-id="${createdSizes[i].id}" data-created-size-name="${createdSizes[i].name}"><input type="number" data-created-size-id="${createdSizes[i].id}" data-opt-id="${item.pid}" class="extra_cost_val_${$(e).data('id')} extra_cost_input_${createdSizes[i].id} form-control" style="display: block;margin: 0 auto;"></td>`;

					// 				$(this).find('td:last').after(size_inputs);
									
					// 			}

					// 		});

					// 	}

					// }

					MSL_GLOBAL.main.closeModal('overlay-sizing');

					// if ($.inArray(response['id'], createdSizes) === -1) {
					// 	createdSizes.push(parseInt(response['id']));
					// }

				}

			} catch(error) {
				console.log("Error: ", error)
			}

		},

		selectSize: (e) => {

			let sizes = '', size_headers = '', size_sub_headers = '', size_inputs = '';

			sizes = `<tr data-id="${$(e).data('id')}" class="added-size added-size-${$(e).data('id')}"> \
						<td class="size-name-${$(e).data('id')}"><input type="checkbox" class="form-check-input size_default" name="size_default" value="${$(e).data('id')}" onchange="Inventory.sizing.setDefault(this); return false;"></td> \
						<td class="size-name-${$(e).data('id')}">${$(e).data('name')}</td> \
						<td><button class="btn red" data-id="${$(e).data('id')}" data-name="${$(e).data('name')}" onclick="Inventory.sizing.removeSizeOption(this); return false;" style="display: block; margin: 0 auto;"><i class="bi bi-x-circle"></i></button></td> \
					</tr>`;

			// append in sizing table
			$('.sizing-wrapper table tbody').append(sizes);

      
			tblsizeshtml = `<div id="tbl_size_${$(e).data('id')}">
								<div style="width=100%; text-align: center;"><h3>${$(e).data('name')}</h3></div>
								<table class="table-1 thead tbl-sizeoption-${counttblsizes}" data-id="${$(e).data('id')}" style="width:100%; min-width: 480px;">
                                        <thead>
                                            <tr>
                                                <th></th>
                                                <th >Min</th>
                                                <th >Max</th>
                                                <th >Allow Extra</th>
                                                <th></th>                                           
                                                <th >Inc QTY</th>                                               
                                                <th >Additional Cost</th>                                        
                                                <th>Extra Portion Cost</th>
                                            </tr>
                                        </thead>
                                        <tbody id="tbl-sizeoption-${counttblsizes}">
                                        </tbody>
                                    </table>
                            </div>`;

            $('.product-option-section').append(tblsizeshtml);
            counttblsizes++;
			// // append new thead th in product option table
			// size_headers = `<th class="custom-size-th custom-size-th-${$(e).data('id')}" colspan="4">${$(e).data('name')}</th>`;

			// if ($('.product-option-table thead th.custom-size-th').length == 0) {
			// 	$('.product-option-table thead th.last-default-th').after(size_headers);
			// } else {
			// 	$('.product-option-table thead th.custom-size-th:last').after(size_headers);
			// }

			// // append product option thead th sub header (Inc QTY, Additional Cost ,Extra Portion Cost)
			// if ($('.product-option-table thead tr.size-sub-header').length == 0) {
			// 	size_sub_headers = `<tr class="size-sub-header"> \
			// 							<th class=""></th> \
			// 							<th class=""></th> \
            //                             <th class="size-sub-header-th-${$(e).data('id')}">Inc QTY</th> \
            //                             <th class="last-size-sub-header size-sub-header-th-${$(e).data('id')}">Additional Cost</th> \
            //                             <th class="last-size-sub-header size-sub-header-th-${$(e).data('id')}">Extra Portion Cost</th> \
			// 						</tr>`;

			// 	$('.product-option-table thead tr.size-main-header').after(size_sub_headers);
			// } 

			MSL_GLOBAL.main.closeModal('overlay-sizing');

			// add the created sizes into array
			if (createdSizes.length > 0) {

	        	let exists = createdSizes.some(function(item) {
				    return item.id === $(e).data('id') && item.name === $(e).data('name');
				});

				if (!exists) {
					let itemsData = {
	        			id: $(e).data('id'),
	        			name: $(e).data('name')
	        		}

	        		createdSizes.push(itemsData);
				}

	        } else {

	        	let itemsData = {
        			id: $(e).data('id'),
        			name: $(e).data('name')
        		}
        		
        		createdSizes.push(itemsData);
	        }

			console.log("createdSizes", createdSizes);

		},

		setDefault: async (e) => {
			//$('.size_default').not($(e.currentTarget)).prop('checked', false);

			let parameter;
			let x = 0;

			$('.size_default').each(function(){
				console.log($(this).val()+" - "+$(e).val());
				if ($(this).val() != $(e).val()) {

					$(this).prop('checked', false);

					parameter = {
						model: 'sizing',
						action: 'update',
						update: {
							is_default: 0
						},
						condition: [
							['id', '=',  createdSizes[x].id]
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
							['id', '=',  createdSizes[x].id]
						]
					}

				}
				//console.log(parameter);
				Inventory.sizing.updateDefault(parameter);
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

		updateStatus: (e) => {

			if ($(e).is(":checked")) {

				$('.size_input_'+$(e).data('created-size-id')).val(1);

				$('.inc_qty_val_'+$(e).data('opt-parent-id')).each(function(){

					if ($(this).data('created-size-id') === $(e).data('created-size-id') && $(this).data('opt-id') === $(e).data('opt-id')) {
						$(this).removeAttr("disabled");
					}

				});

				$('.additional_cost_val_'+$(e).data('opt-parent-id')).each(function(){

					if ($(this).data('created-size-id') === $(e).data('created-size-id') && $(this).data('opt-id') === $(e).data('opt-id')) {
						$(this).removeAttr("disabled");
					}

				});

				$('.extra_cost_val_'+$(e).data('opt-parent-id')).each(function(){

					if ($(this).data('created-size-id') === $(e).data('created-size-id') && $(this).data('opt-id') === $(e).data('opt-id')) {
						$(this).removeAttr("disabled");
					}

				});

			} else {

				$('.size_input_'+$(e).data('created-size-id')).val(0);

				$('.inc_qty_val_'+$(e).data('opt-parent-id')).each(function(){

					if ($(this).data('created-size-id') === $(e).data('created-size-id') && $(this).data('opt-id') === $(e).data('opt-id')) {
						$(this).attr("disabled", "disabled");
					}

				});

				$('.additional_cost_val_'+$(e).data('opt-parent-id')).each(function(){

					if ($(this).data('created-size-id') === $(e).data('created-size-id') && $(this).data('opt-id') === $(e).data('opt-id')) {
						$(this).attr("disabled", "disabled");
					}

				});

				$('.extra_cost_val_'+$(e).data('opt-parent-id')).each(function(){

					if ($(this).data('created-size-id') === $(e).data('created-size-id') && $(this).data('opt-id') === $(e).data('opt-id')) {
						$(this).attr("disabled", "disabled");
					}

				});

			}

		},

		removeSizeOption: async(e) => {
			
			/** Remove only the size from table but not from DB **/

			MSL_GLOBAL.main.confirmAlertModal('info', 'confirm', 'Remove Sizes', 'Are you sure you want to remove ' + $(e).data('name') + ' size?').then(async (confirmed) => {

				if (confirmed) {
					
					$('#tbl_size_'+$(e).data('id')).remove();
					$('.added-size-'+$(e).data('id')).remove();
					// $('.sizing-wrapper tbody tr.added-size-'+$(e).data('id')).remove();
					// $('.product-option-table tbody tr.custom-size-th-'+$(e).data('id')).remove();

					// //remove the size from createdSize array element
					// if (createdSizes.length > 0) {
					// 	for (let i = 0; i < createdSizes.length; i++) {
					// 		if ($(e).data("id") == createdSizes[i]) createdSizes.splice(i, 1); 
					// 	}
					// }

				}

			});
		}
	}

}

Inventory.main.onLoad();