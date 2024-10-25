console.log('edit-product.js');
const selectedDetails = [];
const selectedProducts = [];
const selectedIngredients = [];
const createdSizes = [];
let sortedOptions = [];
let selectedMenus = [];
const supp_id = Supplier_[0]['id'];
let itemID = '';
var tempvar_rec_ing=[];
var counttblsizes=0;
var product_type;
let Inventory = {

	main: {

		onLoad: async () => {

			let url = window.location.href;
			url = new URL(url);
			itemID = url.searchParams.get('id');

			await Promise.all([
				Inventory.product.getProduct()
			]);
			$('.search_field').on('input', function(){
				Inventory.main.search($(this).val(), $(this).data('table'), $(this).data('id'), $(this).data('wrapper'));
			});

		},

		selectProductType: (e) => {
			//console.log($(e).data('product-type'));
			if ($(e).data('product-type') == "simple") {
				product_type ='simple';
				$('.simple_product_container').show();
				$('.custom_product_container').hide();

			} else {
				product_type ='custom';
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

        sendRequest: async (parameter) => {

        	try {
        		let response = await sendhttpRequest(parameter);
        		console.log(response);
        	} catch (error) {
        		console.log("Error sending request to server: ", error);
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



			} else {

				$('.'+$(e).data('for')+'-wrapper').find('div[data-id='+$(e).data('id')+']').removeClass(" active").removeAttr("data-assoc-id");

				$('.'+$(e).data('for')+'-section .'+$(e).data('for')+'-'+$(e).data('id')).remove();

				for (let i = 0; i < selectedDetails.length; i++) {

					if (selectedDetails[i].id == $(e).data('id') && selectedDetails[i].type == $(e).data('for')) selectedDetails.splice(i, 1);

				}



			}


		},

	},

	product: {

		getProduct: async () => {

			let parameter = {
				model: 'listing',
				action: 'retrieve',
				retrieve: '*',
				condition: [['id', '=', itemID]]
			}

			try {
				let response = await sendhttpRequest(parameter);

				if (response['code'] == 200 && response['data'] && response['data'].length > 0) {

					for (const item of response['data']) {

						// if (item.image.length > 0) {
                            $('.product_image').attr({
                                "src": item.image,
                                "style": "visibility: visible;margin-left: 37%;"
                            });
                            $('#textarea_product').html(item.image);
                            $('.form-field-image-overlay-product').attr("style", "background-color: unset;");
                        // }

						$('input[name=item_name]').val(item.item_name);
						$('input[name=short_description]').val(item.short_description);
						$('textarea[name=long_description]').text(item.long_description);
						$('input[name=price]').val(item.price);
						$('input[name=min_order]').val(item.min_order);
						$('input[name=tax_class]').val(item.tax_class);
						// $('input[name=tax_inclusive]').val(item.tax_inclusive);

						$('input[name=start_date]').val(item.start_date);
						$('input[name=end_date]').val(item.end_date);

						// $('input[name=cuisine]').val(item.cuisine);
						$('input[name=meal_type]').val(item.meal_type);
						$('input[name=serving_temp]').val(item.serving_temp);
						$('input[name=packaging_type]').val(item.packaging_type);
						$('input[name=product_status]').val(item.status);
						putretrievecuisine_  = await Inventory.product.putretrievecuisine(item.cuisine); 
						if (item.status == 1) $('input[data-label=product_status]').attr("checked", "checked");
						
						if (item.product_type == "simple") {
							$('input[data-product-type=simple]').attr("checked", "checked");
							$('input[data-product-type=custom]').removeAttr("checked");

							$('.simple_product_container').show();
							$('.custom_product_container').hide();
							product_type = 'simple';
							putretrieverecipes_  = await Inventory.product.putretrieverecipes(itemID); 
							putretrieveingredients_  = await Inventory.product.putretrieveingredients(itemID); 

						} else {
							$('input[data-product-type=simple]').removeAttr("checked");
							$('input[data-product-type=custom]').attr("checked", "checked");
							product_type = 'custom';
							$('.simple_product_container').hide();
							$('.custom_product_container').show();

							szingret = await Inventory.product.getProductDetails('sizing');
							poaret = await Inventory.product.getProductDetails('product-option-'+item.product_type);
						}
						
						Inventory.product.getMenus();
						

					}

				}

			} catch (error) {
				console.log("Error fetching product information: ", error);
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

					var resp = await Inventory.product.getInformation1('optionset_assoc_to_pantry', $(e).data('id'));
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
				
				
				for(as_i=0; as_i<counttblsizes; as_i++){
			
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


				

				//get the products or ingredients under options or option sets
				try {

					var resp = await Inventory.product.getInformation1('option_assoc_to_pantry', $(e).data('id'));
					console.log("resp", resp);
				

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
				

				for(as_i=0; as_i<counttblsizes; as_i++){
					$('#tbl-sizeoption-'+as_i).append(sortables);
				}
				
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

		},
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
						checked ='';
						if(item.listings!=null || item.listings!=undefined) if(item.listings.includes(itemID)) checked ='checked';
						 
						menus += `<div style="display: flex; flex-direction: row; gap: 20px;"> \
									<input type="checkbox" class="form-check-input" data-id="${item.id}" onchange="Inventory.product.selectMenu(this); return false;" value="${item.id}" ${checked}/> \
									<label>${item.name}</label>
								</div>`;

					}

					$('.menu-wrapper').html(menus);

				}

			} catch (error) {
				console.log("Error fetching menus: ", error);
			}

		},
		putretrieveingredients: async (itemID)=>{
			var IngredientsfromitemId = [];
			getIngredientsbyid_ = await Inventory.product.getIngredientsbyid();
			_from_poa = await Inventory.product.getIngredientsbyid_from_poa(itemID);
			for(const ingred of _from_poa){
				IngredientsfromitemId.push(ingred.opt_id);
			}
			details='';

			for (const result of getIngredientsbyid_) {
				if(IngredientsfromitemId.includes(result.id)){
					activecls='active';
					selection=`<div class="form-field-tags-selected-item ingredient-selected ingredient-${result.id}">
								<span>${result.name}</span>
						</div>`;
					$('.ingredient-section').append(selection);
					itemsData = {
							type: 'ingredient',
							id: result.id
						}

					selectedDetails.push(itemsData);
				}else{
					activecls='';
				}
				details += `<div class="form-field-tag ${activecls}" data-id="${result.id}" data-info="ingredient" data-name="${result.name}" data-for="ingredient" onclick="Inventory.main.selectDetails(this); return false;">${result.name}</div>`;
			}
			$('.ingredient-wrapper').html(details);
		},
		getIngredientsbyid: async ()=>{
			let parameter = {
				model: 'ingredient',
				action: 'retrieve',
				retrieve: '*',
				condition: [['sb_id', '=', user_id]]
			}

			try {

				let response = await sendhttpRequest(parameter);
				return response.data;

			} catch (error) {
				console.log("Error fetching recipes: ", error);
			}
		},
		getIngredientsbyid_from_poa: async (item_id) => {
			let parameter = {
				model: 'assoc',
				action: 'custom_retrieve',
				table: 'product_option_assoc',
				condition:[
						['sb_id','=',user_id],
						['item_id','=',item_id],
						['type','=','ingredient']
					]
			};
			try {
				let response = await sendhttpRequest(parameter);
				return response.data;

			} catch (error) {
				console.log("Error fetching ingredients: ", error);
			}
		},
		putretrieverecipes: async (itemID) => {
			var RecipesfromitemId = [];
			getRecipesbyid_ = await Inventory.product.getRecipesbyid();
			_from_poa = await Inventory.product.getRecipesbyid_from_poa(itemID);
			for(const recip of _from_poa){
				RecipesfromitemId.push(recip.opt_id);
			}
			details='';

			for (const result of getRecipesbyid_) {
				if(RecipesfromitemId.includes(result.id)){
					activecls='active';
					selection=`<div class="form-field-tags-selected-item recipes-selected recipes-${result.id}">
								<span>${result.name}</span>
						</div>`;
					$('.recipes-section').append(selection);
					itemsData = {
							type: 'recipes',
							id: result.id
						}

					selectedDetails.push(itemsData);
				}else{
					activecls='';
				}
				details += `<div class="form-field-tag ${activecls}" data-id="${result.id}" data-info="recipes" data-name="${result.name}" data-for="recipes" onclick="Inventory.main.selectDetails(this); return false;">${result.name}</div>`;
			}
			$('.recipes-wrapper').html(details);
		},
		getRecipesbyid_from_poa: async (item_id) => {
			let parameter = {
				model: 'assoc',
				action: 'custom_retrieve',
				table: 'product_option_assoc',
				condition:[
						['sb_id','=',user_id],
						['item_id','=',item_id],
						['type','=','recipes']
					]
			};
			try {
				let response = await sendhttpRequest(parameter);
				return response.data;

			} catch (error) {
				console.log("Error fetching recipes: ", error);
			}
		},
		getRecipesbyid: async () => {

			let parameter = {
				model: 'product',
				action: 'retrieve',
				retrieve: '*',
				condition: [['sb_id', '=', user_id]]
			}

			try {

				let response = await sendhttpRequest(parameter);
				return response.data;

			} catch (error) {
				console.log("Error fetching recipes: ", error);
			}

		},
		putretrievecuisine: async (cuisine_ids_) => {

			cuisine_ids = cuisine_ids_.split(',');
			details='';
			results = await Inventory.product.getCuisinebyid();
			for(var result of results){
				if(cuisine_ids.includes(result.id) || cuisine_ids==result.id){
					activecls='active';
					selection=`<div class="form-field-tags-selected-item cuisine-selected cuisine-${result.id}">
							<span>${result.cuisine_name}</span>
					</div>`;
					$('.cuisine-section').append(selection);
					itemsData = {
							type: 'cuisine',
							id: result.id
						}

					selectedDetails.push(itemsData);
				} else{
					activecls ='';
				}
				details+=`<div class="form-field-tag ${activecls}" data-id="${result.id}" data-info="cuisine" data-name="${result.cuisine_name}" data-for="cuisine" onclick="Inventory.main.selectDetails(this); return false;">${result.cuisine_name}</div>`;
			}

			$('.cuisine-wrapper').html(details);
		},
		getCuisinebyid: async () => {

			let parameter = {
				model: 'assoc',
				action: 'custom_retrieve',
				table: 'cuisine',
				retrieve: '*',
				condition: [['sup_id', '=', supp_id]]
			}

			try {
				let response = await sendhttpRequest(parameter);
				if (response['code'] == 200 ) {
					return response.data;

				}

			} catch (error) {
				console.log("Error fetching cuisines: ", error);
			}

		},
		getsizingbyID: async (id) => {
			let parameter = {
				model: 'assoc',
				action: 'custom_retrieve',
				table: 'sizing',
				retrieve: '*',
				condition: [['id', '=', id]]
			}

			try {
				let response = await sendhttpRequest(parameter);
				if (response['code'] == 200 ) {
					return response.data[0];

				}

			} catch (error) {
				console.log("Error fetching cuisines: ", error);
			}
		},
		getProductDetails: async (type) => {
			var parameter;

			switch (type) {

				case 'product-option-custom':

					parameter = {
						model: 'assoc',
						action: 'custom_join_query',
						table: 'listing_to_product_option_assoc_custom',
						id: itemID
					}

					break;

				default:

					parameter = {
						model: 'assoc',
						action: 'custom_join_query',
						table: 'sizing_from_listing',
						id: itemID
					}

					break;
			}

			let result = '';

			try {

				let response = await sendhttpRequest(parameter);
				

				if (response['code'] == 200 && response['data'] && response['data'].length > 0) {

					switch (type) {

						case 'product-option-custom':
							// alert(JSON.stringify(response['data']));
							let sortables = '';
							let option_information = '';
							console.log(response['data']);
							for (const item of response['data']) {
								tempvar_rec_ing.push(item);
								var allow_extra; var is_enabled;
								if(item.allow_extra=='1')allow_extra = 'checked';
								else allow_extra ='';
								if(item.is_enabled=='1')is_enabled ='checked';
								else is_enabled='';
								option_information = `<tr class="opt-parent-${item.pid} prod-opt-tr prod-opt-id-${item.pid}" data-opt-parent-id="${item.opt_parent_id}" data-type="${item.type}">
				                                            <td class="opt-name-size-${item.pid}" data-opt-parent-id="${item.opt_parent_id}" data-opt-item-id="${item.pid}">
				                                            	<input type="hidden" class="form-check-input opt_id_${item.opt_parent_id}" value="${item.pid}">
				                                            	${item.p_name}
				                                            </td>
				                                            <td class="opt-min-size-${item.pid}" data-opt-parent-id="${item.opt_parent_id}" data-opt-item-id="${item.pid}"><input type="number" class="min_val_${item.pid} form-control" value="${item.min}" style="display: block;margin: 0 auto;" required></td>
				                                            <td class="opt-max-size-${item.pid}" data-opt-parent-id="${item.opt_parent_id}" data-opt-item-id="${item.pid}"><input type="number" class="max_val_${item.pid} form-control" value="${item.max}" style="display: block;margin: 0 auto;" required></td>
				                                            <td class="opt-exceed-size-${item.pid}"><input class="form-check-input exceed_chkbx_${item.opt_parent_id}" type="checkbox" onchange="Inventory.product.allowExtra(this); return false;" ${allow_extra} value="0"></td>`;

				                    for (let i = 0; i < 1; i++) {
				                    	option_information += `	<td class="opt-enable-${item.pid}" data-created-size-id="${item.sizing_id}" data-created-size-name="${item.s_name}">
				                    								<label class="switch">
				                    									<input type="checkbox" data-opt-parent-id="${item.opt_parent_id}" data-created-size-id="${item.sizing_id}" data-opt-id="${item.pid}" ${is_enabled} onchange="Inventory.sizing.updateStatus(this); return false;" >
				                    									<span class="slider round"></span>
				                    								</label>
				                    							</td> \
				                    							<td class="opt-inc-qty-size-${item.pid}" data-created-size-id="${item.sizing_id}" data-created-size-name="${item.s_name}"><input type="hidden" class="sizing_id_${item.pid}" value="${item.sizing_id}"><input type="hidden" class="size_input_${item.sizing_id}" value="1"><input type="number" data-created-size-id="${item.sizing_id}" data-opt-id="${item.pid}" class="inc_qty_val_${item.pid} inc_qty_input_${item.sizing_id} form-control" value="${item.inc_qty}" style="display: block;margin: 0 auto;" required></td> \
				                    							<td class="opt-additional-cost-${item.pid}" data-created-size-id="${item.sizing_id}" data-created-size-name="${item.s_name}"><input type="number" data-created-size-id="${item.sizing_id}" data-opt-id="${item.pid}" class="additional_cost_val_${item.pid} additional_cost_input_${item.sizing_id} form-control" style="display: block;margin: 0 auto;" value ="${item.additional_cost}" required></td> \
				                    							<td class="opt-extra-cost-size-${item.pid}" data-created-size-id="${item.sizing_id}" data-created-size-name="${item.s_name}"><input type="number" data-created-size-id="${item.sizing_id}" data-opt-id="${item.pid}" class="extra_cost_val_${item.pid} extra_cost_input_${item.sizing_id} form-control" style="display: block;margin: 0 auto;" value ="${item.extra_cost}" required></td>`;
				                    }
				                option_information += `</tr>`;
				                
				                for(as_i=0; as_i<counttblsizes; as_i++){
									if($('#tbl-sizeoption-'+as_i).data('id')==item.sizing_id)$('#tbl-sizeoption-'+as_i).append(option_information);
										
								}
								// $('#tbl-sizeoption-'+item.sizing_id).append(option_information);

							
							}
							

							break;

						default:
							
							var temp_szing_ids =[];
							var temp_szing_ids_ =[];
							for(const insert_val of response['data']){
								if(!temp_szing_ids.includes(insert_val.id) && insert_val.id !=null && insert_val.id !=undefined){
									siz_name = await Inventory.product.getsizingbyID(insert_val.id);
									_size_name = siz_name.name;
									temp_szing_ids_.push({id:insert_val.id, name: _size_name});
									temp_szing_ids.push(insert_val.id);
								}
							}
							szlngth = temp_szing_ids_.length;
							counttblsizes=0;
							for(var szingItem of temp_szing_ids_){
				
								sizes = `<tr data-id="${szingItem.id}" class="added-size added-size-${szingItem.id}"> \
											<td class="size-name-${szingItem.id}"><input type="checkbox" class="form-check-input size_default" name="size_default" value="${szingItem.id}" onchange="Inventory.sizing.setDefault(this); return false;"></td> \
											<td class="size-name-${szingItem.id}">${szingItem.name}</td> \
											<td><button class="btn red" data-id="${szingItem.id}" data-name="${szingItem.name}" onclick="Inventory.sizing.removeSizeOption(this); return false;" style="display: block; margin: 0 auto;"><i class="bi bi-x-circle"></i></button></td> \
										</tr>`;

								// append in sizing table
								$('.sizing-wrapper table tbody').append(sizes);


								tblsizeshtml = `<div id="tbl_size_${szingItem.id}">
													<div style="width=100%; text-align: center;"><h3>${szingItem.name}</h3></div>
													<table class="table-1 thead tbl-sizeoption-${counttblsizes}" data-id="${szingItem.id}" style="width:100%; min-width: 480px;">
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
					                                        <tbody id="tbl-sizeoption-${counttblsizes}" data-id="${szingItem.id}">

					                                        </tbody>
					                                    </table>
					                            </div>`;

					            $('.product-option-section').append(tblsizeshtml);
					            counttblsizes++;


									if (createdSizes.length > 0) {

							        	let exists = createdSizes.some(function(item) {
										    return szingItem.id === response['id'] && szingItem.name === $('.overlay-sizing .custom-modal input[name=name]').val();
										});

										if (!exists) {
											let itemsData = {
							        			id: szingItem.id,
							        			name: szingItem.name
							        		}

							        		createdSizes.push(itemsData);
										}

							        } else {

							        	let itemsData = {
						        			id: szingItem.id,
						        			name: szingItem.name
						        		}
						        		
						        		createdSizes.push(itemsData);
							        }

								}
								
							console.log("createdSizes", createdSizes);

							break;

					}

				}

			} catch (error) {
				console.log("Error fetching product details: ", error);
			}

		},
		getInformation1: async (table, id) => {

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
		getInformation: async (table, item_id, opt_parent_id) => {

			let parameter = {
				model: 'assoc',
				action: 'custom_join_query',
				table: table,
				opt_parent_id: opt_parent_id,
				item_id: item_id
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
		saveProduct: async (e) => {

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
			if ($('.product_image').attr('src').length > 0) {
				base64Parts = MSL_GLOBAL.main.splitBase64String($('.product_image').attr('src'), 6000);
                productImage = base64Parts[0];
			} else {
				productImage = '';
			}
			let parameter = {
				model: 'listing',
				action: 'update',
				update: {
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
					product_type: product_type,
					status: form.find('input[name=product_status]').val(),
					image: productImage
				},
				condition: [
							['id','=',itemID]
					]

			}

			try {

				let response = await sendhttpRequest(parameter);
				// console.log(response);

				if (response['code'] == 200 ) {

					if (productImage.length > 0) {

	                    await Promise.all([
	                    	MSL_GLOBAL.main.uploadImageSequentially('listing', 'listing', itemID, base64Parts, 1, 'image', 'main-listing-form')
	                    ]);

					}

					if (product_type == "simple") {
						
						del_product_op_prev = await Inventory.product.deleteProductOptionAssoc(itemID);
						if (selectedDetails.length > 0) {

							for (let i = 0; i < selectedDetails.length; i++) {
								let parameter = {
									model: 'assoc',
									action: 'custom_insert',
									table: 'product_option_assoc',
									insert: {
										sb_id: supp_id,
										item_id: itemID,
										opt_id: selectedDetails[i].id,
										type: selectedDetails[i].type
									}
								}
								if(selectedDetails[i].type !== 'cuisine')Inventory.product.insertProductOptionAssoc(parameter);
							}

						}

					} else {

						// save the customized product options
						saveProductOptions_ = await Inventory.product.saveProductOptions(itemID);

					}
					
						mnu_save_ = await Inventory.product.savemenu(selectedMenus);
					
					MSL_GLOBAL.main.globalModal('success', 'succesful', 'Create Product', 'Product has been created succesfully.');

					// setTimeout(()=>{
						window.location.href = '/product';
					// },2500);

				}

			} catch (error) {
				console.log("Error creating product: ", error);
			}
		},
		savemenu: async (selectedMenus) => {
			
			var getmenubyid_;
			var allmenus = await Inventory.product.getallmenus(supp_id);
			for(var mnuItem of allmenus){
				getmenubyid_ = await Inventory.product.getmenubyid(mnuItem.id);

				if(selectedMenus.includes(mnuItem.id)){
					if(!getmenubyid_.listings.includes(itemID)){
						let parameter = {
							model: 'menu',
							action: 'update',
							update: {
									'listings': mnuItem.listings + ',' + itemID
							},
							condition: [['id', '=', mnuItem.id]]
						}

						try {
							let response = await sendhttpRequest(parameter);
						} catch (error) {
							console.log(error);
						}
					} 
				}else{
					newvalListing='';
					if(mnuItem.listings!=null || mnuItem.listings !=undefined){
						newvalListing = mnuItem.listings.replace(','+itemID,'');
						newvalListing = mnuItem.listings.replace(itemID,'');
					}
					

					let parameter = {
							model: 'menu',
							action: 'update',
							update: {
									'listings': newvalListing
							},
							condition: [['id', '=', mnuItem.id]]
						}

						try {
							let response = await sendhttpRequest(parameter);
						} catch (error) {
							console.log(error);
						}

				}
			}
			
			

		},
		getallmenus: async (supp_id) =>{
			let parameter = {
				model: 'menu',
				action: 'retrieve',
				condition: [['sb_id', '=', supp_id]]
			}

			try {
				let response = await sendhttpRequest(parameter);
				return response.data;
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
		deleteProductOptionAssoc: async (id_) => {
			let parameter = {
					model: 'assoc',
					action: 'custom_delete',
					table: 'product_option_assoc',
					condition:[
							['item_id','=',id_]
						]
			};
			try {
				let response = await sendhttpRequest(parameter);
			} catch (error) {
				console.log(error);
			}
		},
		Deletethis: async(id_) => {
			Inventory.product.deleteProductOptionAssoc(id_);
			let parameter = {
					model: 'assoc',
					action: 'custom_delete',
					table: 'sizing_assoc',
					condition:[
							['item_id','=',id_]
						]
			};
			try {
				let response = await sendhttpRequest(parameter);
				return true;
			} catch (error) {
				console.log(error);
			}
		},
		saveProductOptions: async (id) => {
			deletethis = await Inventory.product.Deletethis(id);
			for(as_i=0; as_i<counttblsizes; as_i++){
				var checkID = document.getElementById('tbl-sizeoption-'+as_i);
				if(checkID){
					for(var sze_ of tempvar_rec_ing){
						if($('#tbl-sizeoption-'+as_i).data('id')==sze_.sizing_id){
							var enable_prod_siz = 0;
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
								console.log('parameter',parameter);
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
								console.log('parameter1',parameter1);
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
				}
			}

		}

	},

	sizing: {

		updateStatus: (e) => {

			console.log($(e));

			if ($(e).is(":checked")) {

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
							['id', '=',  $(this).val()]
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
							['id', '=',  $(this).val()]
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

		removeSizeOption: async (e) => {

			MSL_GLOBAL.main.confirmAlertModal('info', 'confirm', 'Remove Sizes', 'Are you sure you want to remove this size?').then(async (confirmed) => {

				if (confirmed) {
					
					let parameter = {
						model: 'sizing',
						action: 'delete',
						condition: [['id', '=', $(e).data('id')]]
					}

					try {
						let response = await sendhttpRequest(parameter);

						if (response['code'] == 200) {

							$('.sizing-wrapper tbody tr.added-size-'+$(e).data('id')).remove();
							$('.product-option-table tbody tr.custom-size-th-'+$(e).data('id')).remove();
						}

					} catch (error) {
						console.log("Error deleting size: ", error);
					}

				} else {
					console.log("cancelled");
				}

			});

			MSL_GLOBAL.main.confirmAlertModal('info', 'confirm', 'Remove Sizes', 'Are you sure you want to remove this size?').then(async (confirmed) => {

				if (confirmed) {
					
					$('.sizing-wrapper tbody tr.added-size-'+$(e).data('id')).remove();
					$('.product-option-table tbody tr.custom-size-th-'+$(e).data('id')).remove();

				}

			});

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
                                        <tbody id="tbl-sizeoption-${counttblsizes}" data-id="${$(e).data('id')}">

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