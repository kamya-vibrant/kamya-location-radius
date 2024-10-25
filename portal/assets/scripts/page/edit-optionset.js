let selectedDetails = [];
let itemID = '';

let Inventory = {

	main: {

		onLoad: async () => {

			let url = window.location.href;
			url = new URL(url);
			itemID = url.searchParams.get('id');

			await Promise.all([
				//show options
				Inventory.main.getDetails('option', 'options')
			]);

			try {
				const [optionSetDetails, optionSetAssoc] = await Promise.all([
					Inventory.optionset.getOptionSet(),
					Inventory.optionset.getOptionSetAssoc()
				]);

				for (const item of [optionSetDetails, optionSetAssoc]) {

					Inventory.main.displayDetails(item.item, item.data);
				}

			} catch (error) {
				console.log("Error: ", error);
			}

		},

		displayDetails: async (item, data) => {

			switch(item) {

				case 'optionset_assoc':

					let selected = '';

					for (const result of data) {

						$('.options-wrapper').find('div[data-id='+result.option_oid+']').addClass(" active").attr("data-assoc-id", result.optionset_assoc_id);

						selected = `<div class="form-field-tags-selected-item options-selected options-${result.option_oid}">
										<span>${result.option_name}</span>
									</div>`;

						$('.options-section').append(selected);

						console.log("selectedDetails", selectedDetails);
					}

					break; 

				default:

					for (const result of data) {
						console.log(result);
						$('input[name=option_set_name]').val(result.name);
						if (result.status == 1) $('input[data-label=option_set_status]').attr("checked", "checked");
						$('input[name=option_set_status]').val(result.status);
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
			console.debug("selectedDetails begin::")
			let selection = '';
			let parameter = '';

			if ($('.'+$(e).data('for')+'-section .'+$(e).data('for')+'-'+$(e).data('id')).length == 0) {
				console.debug("insert begin::")
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
					console.debug("insert end::")
				} catch (error) {
					console.log("Error adding assoc: ", error);
				}
			} else {
				console.debug("delete begin::")
				let assoc_id = 	$('.'+$(e).data('for')+'-wrapper').find('div[data-id='+$(e).data('id')+']').data('assoc-id');

				parameter = {
					model: 'assoc',
					action: 'custom_delete',
					table: 'optionset_assoc',
					condition: [['id', '=', assoc_id]]
				}

				console.dir(parameter);

				try {
					let response = await sendhttpRequest(parameter);
					console.dir(response);
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
				console.debug("delete end::")
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

		getOptionSet: async () => {

			let parameter = {
				model: 'optionset',
				action: 'retrieve',
				retrieve: '*',
				condition: [['id', '=', itemID]]
			}

			try {
				let response = await sendhttpRequest(parameter);
				return {
					item: 'optionset',
					data: response['data']
				}
			} catch (error) {
				console.log("Error fetching optionset: ", error);
			}

		},

		getOptionSetAssoc: async () => {

			let parameter = {
				model: 'assoc',
				action: 'custom_join_query_new',
				table: 'optionset_assoc_to_option',
				id: itemID,
				sb_id: user_id
			}

			try {
				let response = await sendhttpRequest(parameter);

				if (response['code'] == 200 && response['data'] && response['data'].length > 0) {

					let itemsData = [];

					for (const item of response['data']) {
						if ($.inArray(item.optionset_assoc_id, selectedDetails) === -1) selectedDetails.push(item.optionset_assoc_id);
					}

					return {
						item: 'optionset_assoc',
						data: response['data']
					}

				}

			} catch (error) {
				console.log("Error fetching optionset_assoc: ", error);
			}

		},

		saveOptionSet: async (e) => {
			console.dir("saveOptionset begin::");
			let form = $("#"+$(e).attr('id'));
			MSL_GLOBAL.main.globalModal('warning', 'submission', 'Update OptionSet', 'Updating optionset... Please wait...');
			let parameter = {
				model: 'optionset',
				action: 'update',
				update: {
					sb_id: user_id,
					name: form.find('input[name=option_set_name]').val(),
					status: form.find('input[name=option_set_status]').val()
				},
				condition: [['id', '=', itemID]]
			}

			console.dir(parameter);
			console.dir(selectedDetails);

			try {
				let response = await sendhttpRequest(parameter);
				console.dir(response);
				if (response['code'] == 200 && itemID != null && itemID > 0) {
					console.dir("proceed to updating selectedDetails...")
					if (selectedDetails.length > 0) {
						for (let i = 0; i < selectedDetails.length; i++) {
							Inventory.optionset.updateOptionSetAssoc(itemID, selectedDetails[i].id);
						}
					}
				}
				MSL_GLOBAL.main.globalModal('success', 'succesful', 'Update OptionSet', 'OptionSet successfully updated.');
			} catch (error) {
				MSL_GLOBAL.main.globalModal('danger', 'failed', 'Update OptionSet', 'Encountered an error ' + error);
				console.log("Error updating option set: ", error);
			}
			console.dir("saveOptionset end::");
		},

		updateOptionSetAssoc: async (item_id, id) => {
			console.dir(item_id + ", " + id);

			if(id==='undefined' || id == null){
				id = 0;
			}

			let parameter = {
				model: 'assoc',
				action: 'custom_update',
				table: 'optionset_assoc',
				update: {
					osid: item_id
				},
				condition: [['id', '=', id]]
			}

			console.dir(parameter);

			try {
				let response = await sendhttpRequest(parameter);

			} catch (error) {
				console.log("Error updating option set assoc: ", error);
			}

		}

	}

}

Inventory.main.onLoad();