
let Inventory = {
	
	main: {

		onLoad: async () => {

			let parameter = {
				model: 'optionset',
				action: 'retrieve',
				retrieve: '*',
				condition: [['sb_id', '=', user_id]]
			}

			let result = '';

			try {

				let response = await sendhttpRequest(parameter);

				if (response['code'] == 200 && response['data'] && response['data'].length > 0) {

					for (const item of response['data']) {

						result += `<tr class="ingredient-row-${item.id}"> \
		                            <td class="bold">${item.name}</td> \
		                            <td class="green-text"> \
		                                <div class="pill-item ${(item.status == 1 ? "green" : "yellow")}">${(item.status == 1 ? "Active" : "Inactive")}</div> \
		                            </td> \
		                            <td> \
		                                <div class="button-group xy-center" style="gap: 10px;"> \
		                                    <a href="/edit-optionset?id=${item.id}" class="btn default icon-right" style="">Edit <i class="bi bi-pencil-fill"></i></a> \
		                                    <button type="button" class="btn red icon-right" data-id="${item.id}" onclick="Inventory.main.removeItem(this); return false;">Remove <i class="bi bi-trash-fill"></i></button> \
		                                </div> \
		                            </td> \
		                        </tr>`;

					}

					$('.ingredients_table tbody').html(result);

				}


			} catch (error) {
				console.log("Error fetching option sets: ", error);
			}

		},

		removeItem: async (e) => {

			if (confirm('Are you sure you want to remove this option set? This action can\'t be undone.')) {

				let parameter = {
					model: 'optionset',
					action: 'delete',
					condition: [['id' , '=', $(e).data('id')]]
				}

				try {
					let response = await sendhttpRequest(parameter);
					if (response['code'] == 200) {

						$('.ingredients_table tbody tr.ingredient-row-'+$(e).data('id')).remove();

					}
				} catch (error) {
					console.log("Error deleting option set: ", error);
				}
			}

		}

	}

}

Inventory.main.onLoad();