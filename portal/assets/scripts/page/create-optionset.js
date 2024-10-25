console.dir("create-optionset.js") //oh-bug-010
let selectedDetails = [];

let Inventory = {

	main: {

		onLoad: async () => {

			await Promise.all([
				//show options
				Inventory.main.getDetails('option', 'options')
			]);

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
					table: 'optionset_assoc',
					insert: {}
				}

				parameter.insert['sb_id'] = user_id;
				parameter.insert['oid'] = $(e).data('id');

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
					table: 'optionset_assoc',
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

			const form = document.getElementById('main-optionset-form');
			if (form.checkValidity()) {
				$('#main-optionset-form').submit();
			} else {
				form.reportValidity(); // Highlights invalid fields
			}
	
		},

	},

	optionset: {

		saveOptionSet: async (e) => {
			console.dir("saveOptionSet begin:: ");
			//oh-bug-010
			MSL_GLOBAL.main.globalModal('warning', 'submission', 'Create OptionSet', 'Creating optionset... Please wait...');

			let form = $("#"+$(e).attr('id'));

			let parameter = {
				model: 'optionset',
				action: 'insert',
				insert: {
					sb_id: user_id,
					name: form.find('input[name=option_set_name]').val(),
					status: form.find('input[name=option_set_status]').val()
				}
			}

			try {
				let response = await sendhttpRequest(parameter);

				if (response['code'] == 200 && response['id'] && response['id'] > 0) {

					if (selectedDetails.length > 0) {

						for (let i = 0; i < selectedDetails.length; i++) {

							Inventory.optionset.updateOptionSetAssoc(response['id'], selectedDetails[i].id);

						}

					}

				}

				//oh-bug-010
				MSL_GLOBAL.main.globalModal('success', 'succesful', 'Create OptionSet', 'OptionSet successfully created.');
				window.location.href = '/optionset';

			} catch (error) {
				//oh-bug-010
				MSL_GLOBAL.main.globalModal('danger', 'failed', 'Create OptionSet', 'Encountered an error ' + error);
				console.log("Error creating option set: ", error);
			}

		},

		updateOptionSetAssoc: async (item_id, id) => {

			let parameter = {
				model: 'assoc',
				action: 'custom_update',
				table: 'optionset_assoc',
				update: {
					osid: item_id
				},
				condition: [['id', '=', id]]
			}

			try {
				let response = await sendhttpRequest(parameter);

			} catch (error) {
				console.log("Error updating option set assoc: ", error);
			}

		}

	}

}

Inventory.main.onLoad();