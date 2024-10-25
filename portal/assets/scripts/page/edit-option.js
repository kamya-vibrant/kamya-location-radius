console.log('edit-option.js'); //oh-bug-003

let selectedDetails = [];
let itemID = '';

let Inventory = {

	main: {

		onLoad: async () => {

			let url = window.location.href;
			url = new URL(url);
			itemID = url.searchParams.get('id');

			// Call getDetails concurrently
		    await Promise.all([
		        Inventory.main.getDetails('ingredient', 'ingredients'),
		        Inventory.main.getDetails('product', 'recipes')
		    ]);

			try {

				const [optionResponse, optionAssocResponse] = await Promise.all([
					
					Inventory.option.getOption(),
            		Inventory.option.getOptionAssoc()

				]);

				for (const item of [optionResponse, optionAssocResponse]) {
					console.log(item.item);
					Inventory.main.displayDetails(item.item, item.data);
				}

			} catch (error) {
				console.log("Error: ", error);
			}

		},

		displayDetails: (item, data) => {

			switch (item) {

				case 'option_assoc':

					let selected = '';

					for (const result of data) {
						
						$('.'+(result.option_assoc_type == "product" ? "recipes" : "ingredients")+'-wrapper').find('div[data-id='+result.option_oid+']').addClass(" active").attr("data-assoc-id", result.option_assoc_id);

						selected = `<div class="form-field-tags-selected-item ${(result.option_assoc_type == "product" ? "recipes" : "ingredients")}-selected ${(result.option_assoc_type == "product" ? "recipes" : "ingredients")}-${result.option_oid}">
										<span>${result.option_name}</span>
									</div>`;

						$('.'+(result.option_assoc_type == "product" ? "recipes" : "ingredients")+'-section').append(selected);

					}

					break;

				default:

					for (const result of data) {

						$('input[name=option_name]').val(result.name);
						if (result.status == 1) $('input[data-label=option_status]').attr("checked", "checked");
						$('input[name=option_status]').val(result.status);

					}

					break;

			}

		},

		getDetails: async (type, wrapper) => {

			let parameter = {
				model: type,
				action: 'retrieve',
				retrieve: '*',
				condition: [['sb_id', '=', user_id]]
			}

			let details = '';

			try {

				let response = await sendhttpRequest(parameter);

				if (response['code'] == 200 && response['data'] != '') {

					for (const item of response['data']) {

                        details += `<div class="form-field-tag ${wrapper}-item" data-id="${item.id}" data-info="allergen" data-name="${item.name}" data-table="${type}" data-for="${wrapper}" onclick="Inventory.main.selectDetails(this); return false;">${item.name}</div>`;

					}

					$('.'+wrapper+'-wrapper').html(details);

				}

			} catch (error) {
				console.log("Error fetching "+type+": ", error);
			}

		},

		selectDetails: async (e) => {

			let selection = '';
			let parameter = '';

			if ($('.'+$(e).data('for')+'-section .'+$(e).data('for')+'-'+$(e).data('id')).length == 0) {

				//add the selection to assoc table in database
				parameter = {
					model: 'assoc',
					action: 'custom_insert',
					table: 'option_assoc',
					insert: {}
				}

				parameter.insert['sb_id'] = user_id;
				parameter.insert['item_id'] = itemID;
				parameter.insert['oid'] = $(e).data('id');
				parameter.insert['type'] = $(e).data('table');

				try {

					let response = await sendhttpRequest(parameter);

					if (response['code'] == 200 && response['id'] > 0) {

						let itemsData = [];

						$('.'+$(e).data('for')+'-wrapper').find('div[data-id='+$(e).data('id')+']').addClass(" active");
						$('.'+$(e).data('for')+'-wrapper').find('div[data-id='+$(e).data('id')+']').attr("data-assoc-id", response['id']);

						selection = `<div class="form-field-tags-selected-item ${$(e).data('for')}-selected ${$(e).data('for')}-${$(e).data('id')}">
										<span>${$(e).data('name')}</span>
									</div>`;

						$('.'+$(e).data('for')+'-section').append(selection);

						itemsData = {
							table: $(e).data('table')+'_assoc',
							id: response['id']
						}

						selectedDetails.push(itemsData);

					}

				} catch (error) {
					console.log("Error adding assoc: ", error);
				}


			} else {
				
				let assoc_id = 	$('.'+$(e).data('for')+'-wrapper').find('div[data-id='+$(e).data('id')+']').data('assoc-id');

				parameter = {
					model: 'assoc',
					action: 'custom_delete',
					table: 'option_assoc',
					condition: [['id', '=', assoc_id]]
				}

				try {

					let response = await sendhttpRequest(parameter);

					if (response['code'] == 200) {

						$('.'+$(e).data('for')+'-wrapper').find('div[data-id='+$(e).data('id')+']').removeClass(" active");

						$('.'+$(e).data('for')+'-section .'+$(e).data('for')+'-'+$(e).data('id')).remove();

						for (let i = 0; i < selectedDetails.length; i++) {

							if (selectedDetails[i].id == assoc_id && selectedDetails[i].table == $(e).data('table')+'_assoc') selectedDetails.splice(i, 1);

						}

					}

				} catch (error) {
					console.log("Error deleting assoc: ", error);
				}

			}

		},

		setStatus: (e) => {

			if ($(e).is(':checked')) $('input[name='+$(e).data('label')+']').val(1);
			else $('input[name='+$(e).data('label')+']').val(0);

		}

	},

	option: {

		getOption: async () => {

			let parameter = {
				model: 'option',
				action: 'retrieve',
				retrieve: '*',
				condition: [['id', '=', itemID]]
			}

			try {

				let response = await sendhttpRequest(parameter);
				return {
					item: 'option',
					data: response['data']
				};

			} catch (error) {
				console.log("Error fetching option details: ", error);
			}

		},

		getOptionAssoc: async () => {

			let parameter = {
				model: 'assoc',
				action: 'custom_join_query_new',
				table: 'option_to_option_assoc',
				id: itemID
			}

			try {

				let response = await sendhttpRequest(parameter);
				return {
					item: 'option_assoc',
					data: response['data']
				};

			} catch (error) {
				console.log("Error fetching option assoc details: ", error);
			}

		},

		saveOption: async (e) => {
			console.dir("saveOption begin:: ");
			//oh-bug-003
			MSL_GLOBAL.main.globalModal('warning', 'submission', 'Update Option', 'Updating option... Please wait...');

			let form = $('#'+$(e).attr("id"));

			let parameter = {
				model: 'option',
				action: 'update',
				update: {
					sb_id: user_id,
					name: form.find('input[name=option_name]').val(),
					status: form.find('input[name=option_status]').val()
				},
				condition: [['id', '=', itemID]]
			}

			try {

				let response = await sendhttpRequest(parameter);
				console.dir(response);
				if (response['code'] == 200 && response['id'] > 0) {

					if (selectedDetails.length > 0) {
						for (let i = 0; i < selectedDetails.length; i++) {

							Inventory.option.updateOptionAssoc(response['id'], selectedDetails[i].id);

						}
					}
				}
				//oh-bug-003
				MSL_GLOBAL.main.globalModal('success', 'succesful', 'Update Option', 'Option successfully updated.');


			} catch (error) {
				//oh-bug-003
				MSL_GLOBAL.main.globalModal('danger', 'failed', 'Update Option', 'Encountered an error ' + error);
				console.log("Error updating option: ", error);
			}

		},

		updateOptionAssoc: async (item_id, id) => {

			let parameter = {
				model: 'assoc',
				action: 'custom_update',
				table: 'option_assoc',
				update: {
					item_id: item_id
				},
				condition: [['id', '=', id]]
			}

			try {
				let response = await sendhttpRequest(parameter);
			} catch (error) {
				console.log("Error updating option assoc: ", error);
			}

		}

	}

}

Inventory.main.onLoad();