console.log('create-option.js');

let selectedDetails = [];

let Inventory = {

	main: {

		onLoad: () => {

			//show ingredients
			Inventory.main.getDetails('ingredient', 'ingredients');

			//show recipes
			Inventory.main.getDetails('product', 'recipes');

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

		},

		submitForm: () => {

			const form = document.getElementById('main-option-form');
			if (form.checkValidity()) {
				$('#main-option-form').submit();
			} else {
				form.reportValidity(); // Highlights invalid fields
			}
	
		},

	},

	option: {

		saveOption: async (e) => {
			console.dir('saveOption begin::');
			//oh-bug-003
			MSL_GLOBAL.main.globalModal('warning', 'submission', 'Create Option', 'Submitting option... Please wait...');

			let form = $('#'+$(e).attr("id"));

			let parameter = {
				model: 'option',
				action: 'insert',
				insert: {
					sb_id: user_id,
					name: form.find('input[name=option_name]').val(),
					status: form.find('input[name=option_status]').val()
				}
			}

			try {
				console.dir(parameter);
				let response = await sendhttpRequest(parameter);
				if (response['code'] == 200 && response['id'] > 0) {
					if (selectedDetails.length > 0) {
						for (let i = 0; i < selectedDetails.length; i++) {
							Inventory.option.updateOptionAssoc(response['id'], selectedDetails[i].id);
						}
					}
				}
				//oh-bug-003
				window.location.href = '/option';
			} catch (error) {
				//oh-bug-003
				MSL_GLOBAL.main.globalModal('danger', 'failed', 'Create Option', 'Encountered an error ' + error);
				console.log("Error creating option: ", error);
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