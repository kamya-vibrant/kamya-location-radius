
console.log(user_id);
const supp_id = Supplier_[0]['id'];

const selectedCatOption = [];
let selectedCatOptions;

let selectedOptions = [];

let Pantry = {

	main: {

		onLoad: () => {

			//enable switching of tabs
			Pantry.main.tabPanes();

		},

		tabPanes: async (e) => {

			$(".tab-item").on("click", (e) => {
				let currentTarget = $(e.currentTarget);
				Pantry.main.showTabPane(currentTarget.data("target"));
			});

		},

		showTabPane: async (target) => {
	
			$('.tab-item').removeClass(" active");

			$(".tab-pane").each(function(e){
				if (target == $(this).data("id")) {
					$(this).removeClass(" fade").show();
					$('.tab-item[data-target='+target+']').addClass(" active");

					switch(target) {

					case 'ingredients':
							Pantry.ingredients.main();
							break;

						case 'products':
							Pantry.products.main();
							break;

						case 'sizing':
							Pantry.sizing.main();
							break;

						case 'listings':
							Pantry.listings.main();
							break;

						case 'units':
							Pantry.units.main();
							break;

						case 'categories':
							Pantry.categories.main();
							break;
						case 'option-sets':
							Pantry.optionset.main();
							break;

						default:
							break;
					}

				} else {
					$(this).addClass(" fade").hide();
				}
			});
		},

		closeModal: async (modal_class) => {
			$('.'+modal_class).hide();
			$('.'+modal_class+' .custom-modal').hide();
		},

		search: async (modal, keyword, table, id, insto) => {

			let parameter;
			let item_type = 0;
			let onclick_event;

			if (keyword.length == 0) {

				setTimeout(() => {
					$('.'+modal+' .custom-modal .form-field-options').html("").hide();
				},250);

			} else {

				switch(insto) {

					case 'sizing':

						parameter = {
							model: 'assoc',
							action: 'custom_join_query',
							table: table,
							id: id,
							name: $('.'+modal+' .custom-modal input[name=name]').val(),
							keyword: keyword
						}

						onclick_event = "Pantry.main.customSelectOption(this);";

						break;

					case 'options':

						parameter = {
							model: 'assoc',
							action: 'custom_join_query',
							table: table,
							id: id,
							keyword: keyword
						}

						onclick_event = "Pantry.options.selectOption(this);";
						
						item_type = 1;

						break;

					case 'optionset':

						parameter = {
							model: 'assoc',
							action: 'custom_join_query',
							table: table,
							id: id,
							keyword: keyword
						}

						onclick_event = "Pantry.optionset.selectOptionSet(this);";

						break;

					default:

						parameter = {
							model: 'assoc',
							action: 'custom_join_query',
							table: table,
							id: id,
							keyword: keyword
						}

						onclick_event = "Pantry.main.selectOption(this);";

						break;

				}
				
				let suggestions;

				try {
					let response = await sendhttpRequest(parameter);

					if (response['code'] == 200) {
						console.log(response['data'].length);
						if (response['data'].length > 0) {
							$.map(response['data'], (item, index) => {

								suggestions += `<div class="form-field-option" data-modal="${modal}" data-value="${item.id}" data-id="${id}" data-name="${item.name}" ${(item_type == 1) ? "data-item_type='"+item.type+"'" : ""} data-image="${item.image}" data-insto="${insto}" onclick="${onclick_event} return false;"> \
					                                ${item.name} \
					                            </div>`;

							});
							//console.log(suggestions);
							$('.'+modal+' .custom-modal .form-field-options').html(suggestions.replace("undefined", ""));

							setTimeout(() => {
								$('.'+modal+' .custom-modal .form-field-options').show();
							},350);
						} else {
							setTimeout(() => {
								$('.'+modal+' .custom-modal .form-field-options').html('').hide();
							},350);
						}
					}
				} catch(error) {
					console.log("Error: ", error);
				}

			}
		},

		selectOption: async (e) => {

			let parameter;

			switch ($(e).data("insto")) {

				case 'cat_assoc':
					parameter = {
						model : 'assoc',
						action: 'custom_insert',
						table: 'cat_assoc',
						insert: {
							'pid': $(e).data("value"),
							'cid': $(e).data("id")
						}
					}

					break;

				case 'optionset_assoc':

					parameter = {
						model : 'assoc',
						action: 'custom_insert',
						table: 'optionset_assoc',
						insert: {
							'cid': $(e).data("value"),
							'osid': $(e).data("id")
						}
					}

					break;

				default:
					
					return;

					break;
			}

			let selected_option;

			try {
				let response = await sendhttpRequest(parameter);
				console.log(response);

				if (response['code'] == 200 && response['id'].length > 0) {
					selected_option = `<div class="form-group-row col100 flex selected_option_item_${response['id']}"> \
				                        <div class="form-field-item"> \
				                            <div class="img-container" style="background-image: url('${$(e).data("image")}');"></div> \
				                            <div class="form-field-value">${$(e).data("name")}</div> \
				                            <div class="form-field-actions"> \ 
				                                <button type="button" class="btn red" data-modal="${$(e).data("modal")}" data-opt-id="${response['id']}" data-insto="${$(e).data("insto")}" onclick="Pantry.main.removeSelectedOption(this); return false;"> \ 
				                                    <i class="bi bi-trash-fill"></i> \
				                                </button> \
				                            </div> \ 
				                        </div> \
				                    </div>`;

				    $('.'+$(e).data("modal")+' .custom-modal .form-field-options .form-field-option[data-value='+$(e).data("value")+']').remove();
				   	$('.'+$(e).data("modal")+' .custom-modal .selected-options').append(selected_option.replace("undefined", ""));

				   	if ($(e).data("insto") == "optionset_assoc") {
				   		if ($.inArray(response['id'], selectedCatOption) === -1) {
							selectedCatOption.push(response['id']);
							selectedCatOptions = selectedCatOption;
						}

						console.log(selectedCatOptions);
				   	}
				}

			} catch(error) {
				console.log("Error: ", error);
			}

		},

		customSelectOption: async (e) => {

			$('.'+$(e).data("modal")+' .custom-modal input[name=pid]').val($(e).data("value"));
			$('.'+$(e).data("modal")+' .custom-modal input[name=keyword]').val($(e).data("name"));
			$('.'+$(e).data("modal")+' .custom-modal .form-field-options .form-field-option[data-value='+$(e).data("value")+']').remove();

		},

		removeSelectedOption: async (e) => {
			let opt_id = String($(e).data("opt-id"));

			if (confirm("Are you sure you want to remove this option? This action can\'t be undone.")) {
				
				let parameter = {
					model: 'assoc',
					action: 'custom_delete',
					table: $(e).data("insto"),
					condition: [['id', '=', $(e).data('opt-id')]]
				}

				try {
					let response = await sendhttpRequest(parameter);

					if (response['code'] == 200) {
						$('.'+$(e).data("modal")+' .selected-options .selected_option_item_'+$(e).data('opt-id')).remove();

						if ($(e).data("insto") == "optionset_assoc") {
					   		for (let j = 0; j < selectedCatOption.length; j++) {
								console.log(j);
								if (opt_id == selectedCatOption[j]) {
									selectedCatOption.splice(j, 1)
								}
							}

							console.log(selectedCatOption);
					   	}
					}
				} catch(error) {
					console.log("Error: ", error);
				}
			}

		}

	},

	ingredients: {
		main: async () => {
			console.log('ingredients');

			let parameter = {
				model: 'ingredient',
				action: 'retrieve',
				retrieve: '*',
				condition: [['sb_id', '=', supp_id]]
			}

			let ingredients;

			try {
				let response = await sendhttpRequest(parameter);
				console.log(response);

				if (response['code'] == 200 && response['data'] != '') {

					$.map(response['data'], (item, index) => {

						ingredients += `<tr class="ingredient-row-${item.id}"> \
				                            <td> \
				                                <div class="img-container"> \
				                                    <img src="${item.image}" /> \
				                                </div> \
				                            </td> \
				                            <td class="bold">${item.name}</td> \
				                            <td class="green-text"> \
				                                <div class="pill-item ${(item.status == 1 ? "green" : "yellow")}">${(item.status == 1 ? "Active" : "Inactive")}</div> \
				                            </td> \
				                            <td> \
				                                <div class="button-group xy-center" style="gap: 10px;"> \
				                                    <a href="/edit-ingredient?id=${item.id}" class="btn default icon-right" style="">Edit <i class="bi bi-pencil-fill"></i></a> \
				                                    <button type="button" class="btn red icon-right" data-id="${item.id}" onclick="Pantry.ingredients.removeIngredient(this); return false;">Remove <i class="bi bi-trash-fill"></i></button> \
				                                </div> \
				                            </td> \
				                        </tr>`;

					});

					$('.ingredients_table tbody').html(ingredients.replace("undefined",""));

				}

			} catch(error) {
				console.log("Error: ", error);
			}

		},

		removeIngredient: async (e) => {

			if (confirm('Are you sure you want to remove this ingredient? Thi action can\'t be undone.')) {

				let parameter = {
					model: 'ingredient',
					action: 'delete',
					condition: [['id','=', $(e).data("id")]]
				}

				try {
					let response = await sendhttpRequest(parameter);
					if (response['code'] == 200) {
						$('.ingredients_table tbody tr.ingredient-row-'+$(e).data("id")).remove();
					}
				} catch (error) {
					console.log("Error: ", error);
				}

			}

		}
	},

	products: {

		main: async () => {
			//fetch data from DB
			let products_tbl;
			let units_tbl;
			let units;
			let isAppended = false;

			let parameter = {
			    model: 'product',
		        action: 'retrieve',
		        retrieve:  '*',
		        condition: [
			        	["sb_id", "=", supp_id ]
			        ]
		    }

		    try {
				var response =  await sendhttpRequest(parameter);
				console.log(response);

				if (response["code"] == 200) {
					$.map(response['data'], (item, index) => {

						products_tbl += `<tr class="product-row-${item.id}"> \
                            <td> \
                                <div class="img-container"> \
                                    <img src="${item.image}" /> \
                                </div> \
                            </td> \
                            <td class="bold">${item.name}</td> \
                            <td class="green-text"> \
                                <div class="pill-item ${(item.status == 1 ? "green" : "yellow")}">${(item.status == 1 ? "Active" : "Inactive")}</div> \
                            </td> \
                            <td> \
                                <div class="button-group" style="justify-content: center;"> \
                                    <button type="button" class="btn default icon-right" data-pid="${item.id}" onclick="window.location = '/edit-product?id=${item.id}';">Edit <i class="bi bi-pencil-fill"></i></button> \
                                    <button type="button" class="btn red icon-right" data-id="${item.id}" onclick="Pantry.products.removeProduct(this); return false;">Remove <i class="bi bi-trash-fill"></i></button> \
                                </div> \
                            </td> \
                        </tr>`;

					});

					$(".products_table tbody").html(products_tbl);
				}

			} catch(error) {
			    console.log("Error: ", error);
			} 
		},

		removeProduct: async (e) => {
			if (confirm("Are you sure you want to remove this product? This action can\t be undone.")) {
				let parameter = {
					model: 'product',
					action: 'delete',
					condition: [
			        	["id", "=", $(e).data('pid')]
			        ]
			    };

			    console.log(parameter);

			    try {
			    	var response = await sendhttpRequest(parameter);
			    	console.log(response);
			    	if (response['code'] == 200) {
			    		$(".products_table tr.product-row-"+$(e).data('pid')).remove();
			    	}
			    } catch(error) {
			        console.log("Error: ", error);
			    } 
			}
		}

	},

	units: {

		main: async (p_id) => {
			
			let units_tbl;

			let parameter = {
				model: 'unit',
				action: 'custom_join_query',
				table: 'pantry_to_unit',
				pid: (typeof p_id === "undefined") ? 0 : p_id
			}

			try {
				let response = await sendhttpRequest(parameter);

				if (response['code'] == 200 && response['data'] != '') {
					$.map(response['data'], (item, index) => {
						units_tbl += `<tr> \
			                            <td> \
			                                <div class="img-container"> \
			                                    <img src="${item.image}"> \
			                                </div> \
			                            </td> \
			                            <td>${item.name}</td> \
			                            <td>${item.unit}</td> \
			                            <td>$${parseFloat(item.price).toFixed(2)}</td> \
			                            <td> \
			                                <a href="/edit-product?id=${item.p_id}" class="text-link">${item.p_name}</a> \
			                            </td> \
			                            <td> \
			                            	<label class="switch"> \
			                                    <input name="unit_item_${item.id}" data-uid="${item.id}" onchange="Pantry.units.updateStatus(this); return false;" type="checkbox" ${(item.status == 1) ? "checked" : "" }> \
			                                    <span class="slider round"></span> \
			                                </label> \
			                            </td> \
			                        </tr>`;
					});

					$('.units_table tbody').html(units_tbl);
				}

			} catch(error) {
				console.log("Error: ", error);
			}
			
		},

		updateStatus: async (e) => {
			let status;
			if ($(e).is(":checked")) {
				console.log(1);
				status = 1;
			} else{
				console.log(0);
				status = 0;
			}

			let parameter = {
				model: 'unit',
				action: 'update',
				update: {
					'status': status
				},
				condition: [['id', '=', $(e).data("uid")]]
			}

			try {
				let response = await sendhttpRequest(parameter);
			} catch(error) {
				console.log("Error: ", error);
			}

		},

		showUnits: async (e) => {

			Pantry.units.main($(e).data("pid"));

			// force to add active state units menu
			$('.tab-item').removeClass(" active");
			$('.tab-item[data-target=units]').addClass(" active");

			// force to show units tab
			$('.tab-pane').addClass(" fade").hide();
			$('.tab-pane[data-id=units]').removeClass(" fade").show();
		}

	},

	sizing: {

		main: async () => {

			let parameter = {
				model: 'assoc',
				action: 'custom_join_query',
				table: 'sizing_assoc'
			}

			let sizes;

			try {
				let response = await sendhttpRequest(parameter);
				
				if (response['code'] == 200 && response['data'] != '') {

					$.map(response['data'], (item, index) => {

						sizes += `<tr class="sizes-row-${item.id}"> \
									<td>${item.name}</td> \
									<td>${item.p_name}</td> \
									<td> \
		                                <div class="button-group" style="justify-content: center;"> \
		                                    <button type="button" class="btn default icon-right" data-pid="${item.id}" onclick="return false;">Edit <i class="bi bi-pencil-fill"></i></button> \
		                                    <button type="button" class="btn red icon-right" data-id="${item.id}" onclick="Pantry.sizing.removeSize(this); return false;">Remove <i class="bi bi-trash-fill"></i></button> \
		                                </div> \
		                            </td> \
								</tr>`;

					});

					$('.sizing_table tbody').html(sizes.replace("undefined",""));

				}

			} catch(error) {
				console.log("Error: ", error);
			}

		},

		initAddSize: async () => {

			$('.overlay-sizing').show();
			$('.overlay-sizing .custom-modal').show();
			$('.overlay-sizing .custom-modal .selected-options').html("");

			$('.overlay-sizing .custom-modal input[name=name]').val("");
			$('.overlay-sizing .custom-modal input[name=keyword]').show();

			$('.overlay-sizing .custom-modal input[name=keyword]').on('input', function() {
				//console.log($(this).val());
				Pantry.main.search('overlay-sizing', $(this).val(), 'sizing', 0, 'sizing');
			});
		},

		addSize: async () => {

			let form_body = $('.overlay-sizing .custom-modal')

			if (form_body.find('input[name=pid]').val() == 0) {

				$('.div_alert').html("<div class='alert alert-danger'>Please select a product.</div>");

				setTimeout(()=>{
					$('.div_alert').html("");
				},2000);

			} else if (form_body.find('input[name=name]').val().length == 0) {
				
				$('.div_alert').html("<div class='alert alert-danger'>Please enter a size.</div>");

				setTimeout(()=>{
					$('.div_alert').html("");
				},2000);

			} else {

				let parameter = {
					model: 'sizing',
					action: 'custom_insert',
					name: form_body.find('input[name=name]').val(),
					pid: form_body.find('input[name=pid]').val()
				}

				try {
					let response = await sendhttpRequest(parameter);
					console.log(response);

					if (response['code'] == 200 && response['data'] != '') {

						$('.div_alert').html("<div class='alert alert-success'>Size has been added to this product.</div>");

						setTimeout(()=>{
							$('.div_alert').html("");
							form_body.find('input[name=name]').val("");
							form_body.find('input[name=pid]').val("0");

							Pantry.main.closeModal('overlay-sizing');
						},2000);

					}

				} catch(error) {
					console.log("Error: ", error);
					$('.div_alert').html("<div class='alert alert-danger'>Size for this product is already existing.</div>");

					setTimeout(()=>{
						$('.div_alert').html("");
					},2000);
				}

			}

		},

		removeSize: async (e) => {

			if (confirm('Are you sure you want to remove this size for this product?')) {

				let parameter = {
					model: 'sizing',
					action: 'delete',
					condition: [['id', '=', $(e).data("id")]]
				}

				try {
					let response = await sendhttpRequest(parameter);

					if (response['code'] == 200) {

						$('.sizing_table tbody tr.sizes-row-'+$(e).data("id")).remove();

					}
				} catch(error) {
					console.log("Error: ", error);
				}

			}

		}

	},

	listings: {

		main: async () => {

			let parameter = {
				model: 'listing',
				action: 'retrieve',
				retrieve: '*',
				condition: [['sb_id', '=', supp_id]]
			}

			let listings;

			try {
				let response = await sendhttpRequest(parameter);
				console.log(response);

				if (response['code'] == 200 && response['data'] != '') {
					$.map(response['data'], (item, index) => {

						listings += `<tr class="listing-row-${item.id}"> \
			                            <td> \
			                                <div class="img-container"> \
			                                    <img src="${item.image}"> \
			                                </div> \
			                            </td> \
			                            <td>${item.item_name}</td> \
			                            <td>${item.brand}</td> \
			                            <td>$${parseFloat(item.price).toFixed(2)}</td> \
			                            <td>${item.tax_class}</td> \
			                            <td class="green-text"> \
			                                <div class="pill-item ${(item.status == 1 ? "green" : "yellow")}">${(item.status == 1 ? "Active" : "Inactive")}</div> \
			                            </td> \
			                            <td> \
			                                <div class="button-group" style="justify-content: center;"> \
			                                    <button type="button" class="btn default icon-right" data-pid="${item.id}" onclick="window.location = '/edit-listing?id=${item.id}';">Edit <i class="bi bi-pencil-fill"></i></button> \
			                                    <button type="button" class="btn red icon-right" data-id="${item.id}" onclick="Pantry.listings.removeListing(this); return false;">Remove <i class="bi bi-trash-fill"></i></button> \
			                                </div> \
			                            </td> \
			                        </tr>`;

					});

					listings = (typeof listings !== "undefined") ? listings.replace("undefined", "") : listings;

					$('.listings_table tbody').html(listings);
				}

			} catch(error) {
				console.log("Error: ", error);
			}

		},

		removeListing: async (e) => {

			if (confirm('Are you sure you want to remove this listing? This action can\'t be undone.')) {

				let parameter = {
					model: 'listing',
					action: 'delete',
					condition: [['id', '=', $(e).data('id')]]
				}

				try {
					let response = await sendhttpRequest(parameter);
					console.log(parameter);

					if (response['code'] == 200) {
						$('.listings_table tbody tr.listing-row-'+$(e).data('id')).remove();
					}

				} catch(error) {
					console.log("Error: ", error);
				}
			}

		}

	},

	categories: {

		main: async () => {

			let parameter = {
				model: 'option',
				action: 'retrieve',
				retrieve: '*'
			}

			let cat_item; 

			try {
				let response = await sendhttpRequest(parameter);

				$.map(response['data'], (item, index) => {

					cat_item += `<div class="card data-icon" data-oid="${item.id}" data-cname="${item.name}" onclick="Pantry.options.editOptions(this); return false;"> \
				                    <!--div class="img-cont  data-icon-img" style="background-image: url('../assets/img/bagel.jpeg')"></div--> \
				                    <div class="data-icon-text"> \
				                        <div class="header-1  data-iconm-text-name">${item.name}</div> \
				                        <div class=" data-icon-text-desc">12 products</div> \
				                    </div> \
				                </div>`;

				});

				$(".categories-cont").html(cat_item.replace("undefined",""));

			} catch(error) {
				console.log("Error: ", error);
			}
		},

		editCategory: async (e) => {

			//clear fields and divs
			$('.overlay-category .custom-modal input[name=keyword]').val("");
			$('.overlay-category .custom-modal .form-field-options').html('').hide();
			$('.overlay-category .custom-modal .cat_assocs').html('');

			$('.overlay-category .custom-modal .custom-modal-header-1').html($(e).data("cname"));

			let parameter = {
				model: 'assoc',
				action: 'custom_join_query',
				table: 'cat_assoc_to_pantry',
				id: $(e).data("cid")
			}

			let cat_assoc;

			try {
				let response = await sendhttpRequest(parameter);
				console.log(response);

				if (response['code'] == 200 && response['data'].length > 0) {
					$.map(response['data'], (item, index) => {
						cat_assoc += `<div class="form-group-row col100 flex cat_assoc_item_${item.caid}"> \
				                        <div class="form-field-item"> \
				                            <div class="img-container" style="background-image: url('${item.image}');"></div> \
				                            <div class="form-field-value">${item.name}</div> \
				                            <div class="form-field-actions"> \ 
				                                <button type="button" class="btn red" data-caid="${item.caid}" onclick="Pantry.categories.removeProductCategory(this); return false;"> \ 
				                                    <i class="bi bi-trash-fill"></i> \
				                                </button> \
				                            </div> \ 
				                        </div> \
				                    </div>`;
					});

					$('.cat_assocs').html(cat_assoc.replace("undefined", ""));
				}

			} catch(error) {
				console.log("Error: ", error);
			}

			$('.overlay-category .custom-modal input[name=keyword]').on('input', function() {
				Pantry.main.search('overlay-category', $(this).val(), 'pantry_to_cat_assoc', $(e).data("cid"));
			});
			

			setTimeout(() => {
				$('.overlay-category').show();
				$('.overlay-category .custom-modal').show();
			},250);
			
		},

		selectProduct: async (e) => {

			let parameter = {
				model : 'assoc',
				action: 'custom_insert',
				table: 'cat_assoc',
				insert: {
					'pid': $(e).data("value"),
					'cid': $(e).data("cid")
				}
			}

			let cat_assoc;

			try {
				let response = await sendhttpRequest(parameter);
				console.log(response);

				if (response['code'] == 200 && response['id'].length > 0) {
					cat_assoc = `<div class="form-group-row col100 flex cat_assoc_item_${response['id']}"> \
				                        <div class="form-field-item"> \
				                            <div class="img-container" style="background-image: url('${$(e).data("image")}');"></div> \
				                            <div class="form-field-value">${$(e).data("name")}</div> \
				                            <div class="form-field-actions"> \ 
				                                <button type="button" class="btn red" data-caid="${response['id']}" onclick="Pantry.categories.removeProductCategory(this); return false;"> \ 
				                                    <i class="bi bi-trash-fill"></i> \
				                                </button> \
				                            </div> \ 
				                        </div> \
				                    </div>`;

				    $('.form-field-options .form-field-option[data-value='+$(e).data("value")+']').remove();
				   	$('.cat_assocs').append(cat_assoc.replace("undefined", ""));
				}

			} catch(error) {
				console.log("Error: ", error);
			}
		},

		removeProductCategory: async (e) => {

			if (confirm("Are you sure you want to remove this product from this category? This action can\'t be undone.")) {
				let parameter = {
					model: 'assoc',
					action: 'custom_delete',
					table: 'cat_assoc',
					condition: [['id', '=', $(e).data('caid')]]
				}

				console.log(parameter);

				try {
					let response = await sendhttpRequest(parameter);

					if (response['code'] == 200) {
						$('.cat_assocs .cat_assoc_item_'+$(e).data('caid')).remove();
					}
				} catch(error) {
					console.log("Error: ", error);
				}
			}

		}

	},

	options: {

		editOptions: async (e) => {

			// let parameter = {
			// 	model: 'assoc',
			// 	action: 'custom_join_query',
			// 	table: 'cat_assoc_to_pantry',
			// 	id: $(e).data("oid")
			// }

			// try {
			// 	let response = await sendhttpRequest(parameter);
			// 	console.log(response);
			// } catch (error) {
			// 	console.log("Error: ", error);
			// }

			console.log('$(e).data("oid")', $(e).data("oid"));

			//clear fields and divs
			$('.overlay-category .custom-modal input[name=keyword]').val("");
			$('.overlay-category .custom-modal .form-field-options').html('').hide();
			$('.overlay-category .custom-modal .cat_assocs').html('');

			$('.overlay-category .custom-modal .custom-modal-header-1').html($(e).data("cname"));

			let parameter = {
				model: 'assoc',
				action: 'custom_join_query',
				table: 'option_assoc_to_pantry',
				id: $(e).data("oid")
			}

			let cat_assoc;

			try {
				let response = await sendhttpRequest(parameter);
				console.log(response['data'].length);

				if (response['code'] == 200 && response['data'].length > 0) {
					$.map(response['data'], (item, index) => {
						cat_assoc += `<div class="form-group-row col100 flex cat_assoc_item_${item.caid}"> \
				                        <div class="form-field-item"> \
				                            <div class="img-container" style="background-image: url('${item.image}');"></div> \
				                            <div class="form-field-value">${item.name}</div> \
				                            <div class="form-field-actions"> \ 
				                                <button type="button" class="btn red" data-caid="${item.caid}" onclick="Pantry.categories.removeProductCategory(this); return false;"> \ 
				                                    <i class="bi bi-trash-fill"></i> \
				                                </button> \
				                            </div> \ 
				                        </div> \
				                    </div>`;
					});

					$('.cat_assoc_item').html(cat_assoc.replace("undefined", ""));
				} else {
					$('.cat_assoc_item').html('');
				}

			} catch(error) {
				console.log("Error: ", error);
			}

			//fixed
			$('.overlay-category .custom-modal input[name=keyword]').on('input', function() {
				Pantry.main.search('overlay-category', $(this).val(), 'pantry_to_option_assoc', $(e).data("oid"), 'options');
			});
			

			setTimeout(() => {
				$('.overlay-category').show();
				$('.overlay-category .custom-modal').show();
			},250);

		},
		
		selectOption: async (e) => {

			let parameter = {
				model: 'assoc',
				action: 'custom_insert',
				table: 'option_assoc',
				insert: {
					sb_id: supp_id,
					item_id: $(e).data('id'),
					oid: $(e).data('value'),
					type: $(e).data('item_type')
				}
			}

			try {
				let response = await sendhttpRequest(parameter);
				console.log(response);
			} catch (error) {
				console.log("Error: ", error);
			}

		}

	},

	optionset: {
		main: async() => {
			console.log("optionset");

			let parameter = {
				model: 'optionset',
				action: 'retrieve',
				retrieve: '*',
				condition: [['sb_id', '=', supp_id]]
			}

			let optionset_tbl;

			try {
				let response = await sendhttpRequest(parameter);
				
				if (response['code'] == 200 && response['data'] != '') {
					$.map(response['data'], (item, index) => {
						optionset_tbl += `<tr class="show-subtable optionset-row-${item.id}"> \
				                            <td colspan="2" class="text-left bold green-text">${item.name}</td> \
				                        </tr>`;

				    Pantry.optionset.getProductOptions(item.id);
					});
				}

				$('.optionset-table tbody').html(optionset_tbl.replace("undefined",""));

			} catch(error) {
				console.log("Error: ", error);
			}
		},

		setOptionSet: async (e) => {

			$('.overlay-optionset').show();
			$('.overlay-optionset .custom-modal').show();


			//searching of options
			$('.overlay-optionset .custom-modal input[name=keyword]').on('input', function() {
				console.log($(this).val());
				Pantry.main.search('overlay-optionset', $(this).val(), 'options_to_optionset_assoc', 0, 'optionset');
			});
		},

		getProductOptions: async (osid) => {

			let parameter = {
				model: 'assoc',
				action: 'custom_join_query',
				table: 'optionset_assoc_to_option',
				id: osid
			}

			let optionset_subtbl;

			try {
				let response = await sendhttpRequest(parameter);
				
				if (response['code'] == 200 && response['data'] != '') {
					$.map(response['data'], (item, index) => {
						optionset_subtbl += `<tr class="subtable"> \
					                            <td class="text-left"> \
					                                <div class="subtable-tb-header">Category</div> \
					                                <div>Choose your ${item.name}</div> \
					                            </td> \
					                            <td> \
					                                <div class="button-group"> \
					                                    <button class="btn default icon-right">Edit <i class="bi bi-pencil-fill"></i></button> \
					                                    <button class="btn red icon-right">Delete <i class="bi bi-trash-fill"></i></button> \
					                                </div> \
					                            </td> \
					                        </tr>`;

					});

					$(".optionset-table tbody tr.optionset-row-"+osid).after(optionset_subtbl);
				}
			} catch(error) {
				console.log("Error: ", error);
			}

		},

		selectOptionSet: async (e) => {

			let option;

			let parameter = {
				model : 'assoc',
				action: 'custom_insert',
				table: 'optionset_assoc',
				insert: {
					'oid': $(e).data("value"),
					'osid': $(e).data("id")
				}
			}

			try {
				let response = await sendhttpRequest(parameter);
				console.log(response);
				if (response['code'] == 200 && response['id'] != 0) {

					if ($.inArray(response['id'], selectedCatOption) === -1) selectedCatOption.push(parseInt(response['id']));

					option = `<div class="form-group-row col100 flex optionset_item-${response['id']}">
								<div class="form-field-item"> \
		                            <div class="img-container" style=""></div> \
		                            <div class="form-field-value">${$(e).data('name')}</div> \
		                            <div class="form-field-actions"> \
		                                <button class="btn red" data-id="${response['id']}" onclick="Pantry.optionset.removeOptionSet(this); return false;"> \
		                                    <i class="bi bi-trash-fill"></i> \
		                                </button> \
		                            </div> \
		                        </div> \
		                     </div>`;

		            option = (typeof option !== "undefined") ? option.replace("undefined") : option;
		            $('.selected-options').append(option);
					$('.overlay-optionset .form-field-options .form-field-option[data-value='+$(e).data("value")+']').remove();
				}

			} catch (error) {
				console.log("Error: ", error);
			}

			console.log("selectedCatOption", selectedCatOption);

		},

		addOptionSet: async() => {

			//clear fields and divs
			$('.overlay-optionset .custom-modal input[name=keyword]').val("");
			//$('.overlay-optionset .custom-modal .form-field-options').html('').hide();

			$('#optionset_keyword').on('input', function() {
				//console.log($(this).val());
				Pantry.main.search('overlay-optionset', $(this).val(), 'cat_to_optionset_assoc', 0, 'optionset_assoc');
			});

			setTimeout(() => {
				$('.overlay-optionset').show();
				$('.overlay-optionset .custom-modal').show();
			},250);
		},

		createOptionSet: async (e) => {

			if ($('.overlay-optionset .custom-modal .form-field input[name=name]').val() != '') {
				let parameter = {
					model: 'optionset',
					action: 'insert',
					insert: {
						sb_id: supp_id,
						name: $('.overlay-optionset .custom-modal .form-field input[name=name]').val()
					}
				}

				try {
					let response = await sendhttpRequest(parameter);
					console.log(response);

					if (response['code'] == 200 && response['id'] > 0) {
						if (selectedCatOption.length > 0) {
							for (let k = 0; k < selectedCatOption.length; k++) {
								Pantry.optionset.updateOptionAssoc(response['id'], selectedCatOption[k]);
							}
						}

						$('.overlay-optionset .custom-modal').hide();
						$('.overlay-optionset').hide();

						showTabPane('option-sets');

					}

				} catch(error) {
					console.log("Error: ", error);
				}
			} else {
				alert("Please fill out Option Set name.");
			}
		},

		updateOptionAssoc: async (osid, id) => {

			let parameter = {
				model: 'assoc',
				action: 'custom_update_assoc',
				table: 'optionset_assoc',
				id: id,
				osid: osid
			}

			try {
				let response = await sendhttpRequest(parameter);
				console.log(response);
			} catch(error) {
				console.log("Error: ", error);
			}

		},

		removeOptionSet: async (e) => {

			if (confirm('Are you sure you want remove this option?')) {

				let parameter = {
					model: 'assoc',
					action: 'custom_delete',
					table: 'optionset_assoc',
					condition: [['id', '=', $(e).data('id')]]
				}

				try {
					let response = await sendhttpRequest(parameter);
					
					if (response['code'] == 200) {

						for (let i = 0; i < selectedCatOption.length; i++) {
							if ($(e).data('id') == selectedCatOption[i]) selectedCatOption.splice(i, 1);
						}

						$('.overlay-optionset .custom-modal .selected-options .optionset_item-'+$(e).data('id')).remove();
					}

				} catch (error) {
					console.log("Error: ", error);
				}
			}
		}
	}

}

//load the function to switch into tab panes everytime the pantry page is loaded
Pantry.main.tabPanes();

//for inital load of the page, load products
//Pantry.products.main();
