
let Inventory = {

	main: {

		onLoad: async () => {

			let parameter = {
				model: 'sizing',
				action: 'retrieve',
				retrieve: '*',
				condition: [['sb_id', '=', user_id]]
			}

			let ingredients = '';

			try {
				let response = await sendhttpRequest(parameter);

				if (response['code'] == 200 && response['data'] != '') {

					for (const item of response['data']) {

						ingredients += `<tr class="ingredient-row-${item.id}"> \
				                            <td class="bold">${item.name}</td> \
				                            <td> \
				                                <div class="button-group xy-center" style="gap: 10px;"> \
				                                    <button type="button" class="btn default icon-right" onclick="Inventory.sizing.editSize(${item.id}); return false;">Edit <i class="bi bi-pencil-fill"></i></button> \
				                                    <button type="button" class="btn red icon-right" data-id="${item.id}" onclick="Inventory.main.removeIngredient(this); return false;">Remove <i class="bi bi-trash-fill"></i></button> \
				                                </div> \
				                            </td> \
				                        </tr>`;
					}

					$('.ingredients_table tbody').html(ingredients);

				}

			} catch(error) {
				console.log("Error: ", error);
			}

		},

		removeIngredient: async (e) => {

			if (confirm('Are you sure you want to remove this size? This action can\'t be undone.')) {

				let parameter = {
					model: 'sizing',
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

	sizing: {

		initAddSize: () => {

			$('.overlay-sizing').show();
			$('.overlay-sizing .custom-modal').show();

			// always reset input field and button onclick
			$('.overlay-sizing .custom-modal-body input[name=name]').val("");
			$('.overlay-sizing .custom-modal .custom-modal-footer button:last').attr('onclick', 'Inventory.sizing.addSize(); return false;');


		},

		addSize: async () => {

			let parameter = {
				model: 'sizing',
				action: 'insert',
				insert: {
					sb_id: user_id,
					name: $('.overlay-sizing .custom-modal-body input[name=name]').val()
				}
			}

			try {
				let response = await sendhttpRequest(parameter);

				if (response['code'] == 200 && response['id'] > 0) {

					$('.overlay-sizing').hide();
					$('.overlay-sizing .custom-modal').hide();

					Inventory.main.onLoad();

				}

			} catch (error) {
				console.log("Error: ", error);
			}

		},

		editSize: async (id) => {

			let parameter = {
				model: 'sizing',
				action: 'retrieve',
				retrieve: '*',
				condition: [['id', '=', id]]
			}

			try {
				let response = await sendhttpRequest(parameter);

				if (response['code'] == 200 && response['data'] != '') {

					for (const item of response['data']) {

						$('.overlay-sizing .custom-modal-body input[name=name]').val(item.name)

					}

					$('.overlay-sizing .custom-modal .custom-modal-footer button:last').attr('onclick', 'Inventory.sizing.updateSize('+id+'); return false;');

					$('.overlay-sizing').show();
					$('.overlay-sizing .custom-modal').show();

				}

			} catch (error) {
				console.log("Error: ", error);
			}

		},

		updateSize: async (id) => {

			let parameter = {
				model: 'sizing',
				action: 'update',
				update: {
					name: $('.overlay-sizing .custom-modal-body input[name=name]').val()
				},
				condition: [['id', '=', id]]
			}

			try {
				let response = await sendhttpRequest(parameter);

				if (response['code'] == 200) {

					$('.overlay-sizing').hide();
					$('.overlay-sizing .custom-modal').hide();

					Inventory.main.onLoad();

				}

			} catch (error) {
				console.log("Error: ", error);
			}

		}

	}

}

Inventory.main.onLoad();