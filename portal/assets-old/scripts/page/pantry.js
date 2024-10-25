
const supp_id = Supplier_[0]['id'];

const selectedCatOption = [];
let selectedCatOptions;

const editCatOption = [];
let editCatOptions;

tabPanes = async (e) => {

	$(".tab-item").on("click", (e) => {
		let currentTarget = $(e.currentTarget);
		showTabPane(currentTarget.data("target"));
	});

}

showTabPane = async (target) => {

	$(".tab-pane").each(function(e){
		if (target == $(this).data("id")) {
			$(this).removeClass(" fade").show();
			$('.tab-item[data-target='+target+']').addClass(" active");

			switch(target) {
				case 'products':
					Pantry.products.main();
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
			$('.tab-item').removeClass(" active");
		}
	});
}

let Pantry = {

	main: {

		closeModal: async (modal_class) => {
			$('.'+modal_class).hide();
			$('.'+modal_class+' .custom-modal').hide();
		},

		search: async (modal, keyword, table, id, insto) => {

			if (keyword.length == 0) {

				setTimeout(() => {
					$('.'+modal+' .custom-modal .form-field-options').html("").hide();
				},250);

			} else {

				let parameter = {
					model: 'assoc',
					action: 'custom_join_query',
					table: table,
					id: id,
					keyword: keyword
				}
				console.log(parameter);
				let suggestions;

				try {
					let response = await sendhttpRequest(parameter);

					if (response['code'] == 200) {
						console.log(response['data'].length);
						if (response['data'].length > 0) {
							$.map(response['data'], (item, index) => {

								suggestions += `<div class="form-field-option" data-modal="${modal}" data-value="${item.id}" data-id="${id}" data-name="${item.name}" data-image="${item.image}" data-insto="${insto}" onclick="Pantry.main.selectOption(this); return false;"> \
					                                ${item.name} \
					                            </div>`;

							});
							//console.log(suggestions);
							$('.'+modal+' .custom-modal .form-field-options').html(suggestions.replace("undefined", ""));

							setTimeout(() => {
								$('.'+modal+' .custom-modal .form-field-options').show();
							},350);
						} else {
							// setTimeout(() => {
							// 	$('.'+modal+' .custom-modal .form-field-options').html('').hide();
							// },350);
						}
					}
				} catch(error) {
					console.log("Error: ", error);
				}

			}
		},

		selectOption: async (e) => {

			let parameter;
			let action = $('.'+$(e).data("modal")+' .custom-modal input[name=action]').val();

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
					break;
			}

			let selected_option;
			let optionset_tab_cat_option;

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

			   			if (action == "add") {
			   				if ($.inArray(response['id'], selectedCatOption) === -1) {
								selectedCatOption.push(response['id']);
								selectedCatOptions = selectedCatOption;
							}

							console.log(selectedCatOptions);
			   			} else {
			   				if ($.inArray(response['id'], editCatOption) === -1) {
								editCatOption.push(parseInt(response['id']));
								editCatOptions = editCatOption;
							}
							console.log(editCatOptions);
			   			}
				   		
				   		Pantry.main.refreshTab('option-sets');
				   	}
				    
				}

			} catch(error) {
				console.log("Error: ", error);
			}

		},

		removeSelectedOption: async (e) => {
			let opt_id = String($(e).data("opt-id"));
			let action = $('.'+$(e).data("modal")+' .custom-modal input[name=action]').val();

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
							if (action == "add") {
								for (let j = 0; j < selectedCatOption.length; j++) {
									console.log(j);
									if (opt_id == selectedCatOption[j]) {
										selectedCatOption.splice(j, 1)
									}
								}

								console.log(selectedCatOption);

							} else {
								for (let j = 0; j < editCatOption.length; j++) {
									console.log(j);
									if (opt_id == editCatOption[j]) {
										editCatOption.splice(j, 1)
									}
								}

								console.log(editCatOption);
							}
					   		
					   	}
					}
				} catch(error) {
					console.log("Error: ", error);
				}
			}

		},

		refreshTab: async (tab) => {

			showTabPane(tab);

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
			    model: 'pantry',
		        action: 'retrieve',
		        retrieve:  '*',
		        condition: [
			        	["sb_id", "=", supp_id ]
			        ]
		    }

		    try {
				var response =  await sendhttpRequest(parameter);
				//console.log(response);

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
                            <td><label class="switch"> \
                                    <input type	="checkbox"> \
                                    <span class="slider round"></span> \
                                </label></td> \
                            <td> \
                                <div class="button-group" style="justify-content: center;"> \
                                    <button type="button" class="btn default icon-right" data-pid="${item.id}" onclick="window.location = '/edit-product?id=${item.id}';">Edit <i class="bi bi-pencil-fill"></i></button> \
                                    <button type="button" class="btn red icon-right" data-pid="${item.id}" onclick="Pantry.products.removeProduct(this); return false;">Remove <i class="bi bi-trash-fill"></i></button> \
                                </div> \
                            </td> \
                            <td> \
                                <div class="button-group" style="justify-content: center;"> \
                                    <button type="button" class="btn default icon-right" data-pid="${item.id}" onclick="Pantry.units.showUnits(this); return false;">Edit <i class="bi bi-pencil-fill"></i></button> \
                                    <button type="button" class="btn default-3 icon-right show-subtable" data-pid="${item.id}" onclick="Pantry.products.showSubTable(this); return false;">View <i class="bi bi-chevron-down"></i></button> \
                                </div> \
                            </td> \
                        </tr>`;

                        let pid = item.id;

                        Pantry.products.getProductUnits(pid);

					});

					$(".products_table tbody").html(products_tbl);
				}

			}catch(error) {
			    console.log("Error: ", error);
			} 
		},

		getProductUnits: async (pid) => {
					
			let parameter = {
				model: 'unit',
				action: 'retrieve',
				retrieve: '*',
				condition: [['pid', '=', pid]]
			}

			let units_tbl;

			try {
				let response = await sendhttpRequest(parameter);				

				if (response['code'] == 200 && response['data'] != '') {
					$.map(response['data'], (unit, index) => {
						units_tbl += `<tr class="subtable subtable-${unit.id} subtable-${unit.pid} parent-subtable-${pid}" style="display:none;"> \
				                        <td colspan="3"> \ 
				                            <div class="y-start x-center"> \
				                             	<div class="img-container with-text"> \
				                                    <img src="${unit.image}" /> \
				                                </div> \
				                                <div class="text-left"> \
				                                    <div class="subtable-header-text">${unit.name}</div> \
				                                    <div class="subtable-header-subtext">${unit.unit}</div> \
				                                 </div> \
				                            </div>\ 
				                        </td> \
				                        <td class="text-left"> \
				                            <div class="subtable-tb-header">Cost</div> \
				                            <div>$${parseFloat(unit.price).toFixed(2)}</div> \
				                        </td> \
				                        <td class="text-left"> \
				                           	<div class="subtable-tb-header">Status</div> \
				                           	<div class="${(unit.status == 1) ? "green-text" : "red-text"} ">${(unit.status == 1) ? "Active" : "Inactive"}</div> \
				                       	</td> \
				                    </tr>`;
					});

					$(".products_table tbody tr.product-row-"+pid).after(units_tbl);
				}

			} catch(error) {
				console.log("Error: ", error);
			}
		},

		showSubTable: async (e) => {
			if ($(e).hasClass("show-subtable")) {
				$(".products_table tbody tr.parent-subtable-"+$(e).data("pid")).show();
				$(e).removeClass(" show-subtable").addClass(" hide-subtable");
			} else {
				$(".products_table tbody tr.parent-subtable-"+$(e).data("pid")).hide();
				$(e).removeClass(" hide-subtable").addClass(" show-subtable");
			}
		},

		removeProduct: async (e) => {
			if (confirm("Are you sure you want to remove this product? This action can\t be undone.")) {
				let parameter = {
					model: 'pantry',
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

	categories: {

		main: async () => {

			let parameter = {
				model: 'category',
				action: 'retrieve',
				retrieve: '*'
			}

			let cat_item; 

			try {
				let response = await sendhttpRequest(parameter);

				$.map(response['data'], (item, index) => {

					cat_item += `<div class="card data-icon" data-cid="${item.id}" data-cname="${item.name}" onclick="Pantry.categories.editCategory(this); return false;"> \
				                    <div class="img-cont  data-icon-img" style="background-image: url('../assets/img/bagel.jpeg')"> \
				                    </div> \
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

					$('.selected-options').html(cat_assoc.replace("undefined", ""));
				}

			} catch(error) {
				console.log("Error: ", error);
			}

			$('.overlay-category .custom-modal input[name=keyword]').on('input', function() {
				Pantry.main.search('overlay-category', $(this).val(), 'pantry_to_cat_assoc', $(e).data("cid"), 'cat_assoc');
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
				   	$('.selected-options').append(cat_assoc.replace("undefined", ""));
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
						$('.selected-options .cat_assoc_item_'+$(e).data('caid')).remove();
					}
				} catch(error) {
					console.log("Error: ", error);
				}
			}

		}

	},

	optionset: {
		main: async() => {

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
				                            <td colspan="" class="text-left bold green-text">${item.name}</td> \
				                            <td> \
					                            <div class="button-group"> \
				                                    <button type="button" class="btn default icon-right" data-id="${item.id}" onclick="Pantry.optionset.setOptionSet(${item.id}); return false;">Edit <i class="bi bi-pencil-fill"></i></button> \
				                                    <button type="button" class="btn red icon-right" data-id="${item.id}" onclick="Pantry.optionset.removeOptionset(this); return false;">Delete <i class="bi bi-trash-fill"></i></button> \
				                                </div> \
				                            </td> \
				                        </tr>`;

				    Pantry.optionset.getProductOptions(item.id);
					});
				}

				$('.optionset-table tbody').html(optionset_tbl.replace("undefined",""));

			} catch(error) {
				console.log("Error: ", error);
			}
		},

		getProductOptions: async (osid) => {

			let parameter = {
				model: 'assoc',
				action: 'custom_join_query',
				table: 'optionset_assoc_to_category',
				id: osid
			}

			let optionset_subtbl;

			try {
				let response = await sendhttpRequest(parameter);
				
				if (response['code'] == 200 && response['data'] != '') {
					$.map(response['data'], (item, index) => {
						optionset_subtbl += `<tr data-parent="${item.os}" class="subtable optionset-cat-row-${item.osid}"> \
					                            <td class="text-left"> \
					                                <div class="subtable-tb-header">Category</div> \
					                                <div>Choose your ${item.name}</div> \
					                            </td> \
					                            <td> \
					                                <div class="button-group"> \
					                                    <button class="btn default icon-right">Edit <i class="bi bi-pencil-fill"></i></button> \
					                                    <button type="button" class="btn red icon-right" data-osid="${item.osid}" onclick="Pantry.optionset.removeOptionsetCategory(this); return false;">Delete <i class="bi bi-trash-fill"></i></button> \
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

		getOptionSet: async (osid) => {

			let parameter = {
				model: 'optionset',
				action: 'retrieve',
				retrieve: '*',
				condition: [['id', '=', osid]]
			}

			try {
				let response = await sendhttpRequest(parameter);

				if (response['code'] == 200 && response['data'] != '') {
					$('.overlay-optionset .custom-modal input[name=name]').val(response['data'][0]['name']);
				}

			} catch(error) {
				console.log("Error: ", error);
			}

		},

		getOptionSetCat: async (osid) => {

			let parameter = {
				model: 'assoc',
				action: 'custom_join_query',
				table: 'optionset_assoc_to_category',
				id: osid
			}

			try {
				let response = await sendhttpRequest(parameter);
				let selected_option;

				if (response['code'] == 200 && response['data'] != '') {

					$.map(response['data'], (item, index) => {
						selected_option += `<div class="form-group-row col100 flex selected_option_item_${item.osid}"> \
						                        <div class="form-field-item"> \
						                            <div class="img-container" style="background-image: url('');"></div> \
						                            <div class="form-field-value">${item.name}</div> \
						                            <div class="form-field-actions"> \ 
						                                <button type="button" class="btn red" data-modal="overlay-optionset" data-opt-id="${item.osid}" data-insto="optionset_assoc" onclick="Pantry.main.removeSelectedOption(this); return false;"> \ 
						                                    <i class="bi bi-trash-fill"></i> \
						                                </button> \
						                            </div> \ 
						                        </div> \
						                    </div>`;

						if ($.inArray(item.id, editCatOption) === -1) {
							editCatOption.push(item.id);
							editCatOptions = editCatOption;
						}

					});

					$('.overlay-optionset .custom-modal .selected-options').html(selected_option.replace("undefined","")).show();
					console.log("editCatOptions", editCatOptions);
				}

			} catch(error) {
				console.log("Error: ", error);
			}

		},

		editOptionCat: async (e) => {

		},

		setOptionSet: async(osid) => {

			//clear fields and divs
			$('.overlay-optionset .custom-modal input[name=name]').val("");
			$('.overlay-optionset .custom-modal input[name=keyword]').val("");
			$('.overlay-optionset .custom-modal .form-field-options').html('').hide();
			$('.overlay-optionset .custom-modal .selected-options').html('').hide();

			if (osid != 0) {
				//edit feature goes here
				Pantry.optionset.getOptionSet(osid);
				Pantry.optionset.getOptionSetCat(osid);

				$('.overlay-optionset .custom-modal input[name=osid]').val(osid);
				$('.overlay-optionset .custom-modal input[name=action]').val("edit");
				
			} else {

				$('.overlay-optionset .custom-modal input[name=action]').val("add");
			}

			console.log();

			$('#optionset_keyword').on('input', function() {
				//console.log($(this).val());
				Pantry.main.search('overlay-optionset', $(this).val(), 'cat_to_optionset_assoc', osid, 'optionset_assoc');
			});

			setTimeout(() => {
				$('.overlay-optionset').show();
				$('.overlay-optionset .custom-modal').show();
			},250);
		},

		saveOptionSet: async (e) => {

			let action = $('.overlay-optionset .custom-modal .form-field input[name=action]').val();
			let parameter;

			if ($('.overlay-optionset .custom-modal .form-field input[name=name]').val() != '') {

				if (action == "add") {
					parameter = {
						model: 'optionset',
						action: 'insert',
						insert: {
							sb_id: supp_id,
							name: $('.overlay-optionset .custom-modal .form-field input[name=name]').val()
						}
					}

				} else {

					parameter = {
						model: 'optionset',
						action: 'update',
						update: {
							name: $('.overlay-optionset .custom-modal .form-field input[name=name]').val()
						},
						condition: [['id', '=', $('.overlay-optionset .custom-modal .form-field input[name=osid]').val()]]
					}

				}

				try {
					let response = await sendhttpRequest(parameter);
					console.log(response);

					if (action == "add") {
						if (selectedCatOption.length > 0) {
							for (let k = 0; k < selectedCatOption.length; k++) {
								Pantry.optionset.updateOptionAssoc(response['id'], selectedCatOption[k]);
							}
						}
					}

					Pantry.main.closeModal('overlay-optionset');
					Pantry.main.refreshTab('option-sets');

				} catch(error) {
					console.log("Error: ", error);
				}

			} else {
				alert("Please fill out Option Set name.");
			}
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

					if (selectedCatOption.length > 0) {
						for (let k = 0; k < selectedCatOption.length; k++) {
							Pantry.optionset.updateOptionAssoc(response['id'], selectedCatOption[k]);
						}
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

		removeOptionset: async (e) => {

			if (confirm("Are you sure you want to remove this option set? This action can\'t be undone.")) {

				let parameter1 = {
					model: 'assoc',
					action: 'custom_delete',
					table: 'optionset_assoc',
					condition: [['osid', '=', $(e).data('id')]]
				}

				let parameter2 = {
					model: 'assoc',
					action: 'custom_delete',
					table: 'optionset',
					condition: [['id', '=', $(e).data('id')]]
				}

				try {
					let response1 = await sendhttpRequest(parameter1);

					if (response1['code'] == 200) {
						//$('.optionset-table tbody tr.optionset-cat-row-'+$(e).data('osid')).remove();

						try {
							let response2 = await sendhttpRequest(parameter2)
						} catch(err) {
							console.log("Err: ", err);
						}

					}
				} catch(error) {
					console.log("Error: ", error);
				}
			}

		},

		removeOptionsetCategory: async (e) => {

			if (confirm("Are you sure you want to remove this category from this option set? This action can\'t be undone.")) {
				let parameter = {
					model: 'assoc',
					action: 'custom_delete',
					table: 'optionset_assoc',
					condition: [['id', '=', $(e).data('osid')]]
				}

				console.log(parameter);

				try {
					let response = await sendhttpRequest(parameter);

					if (response['code'] == 200) {
						$('.optionset-table tbody tr.optionset-cat-row-'+$(e).data('osid')).remove();
					}
				} catch(error) {
					console.log("Error: ", error);
				}
			}

		}
	}

}

//load the function to switch into tab panes everytime the pantry page is loaded
tabPanes();

//for inital load of the page, load products
//Pantry.products.main();
