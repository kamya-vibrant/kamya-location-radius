console.log('ingredient.js');

let Inventory = {

	main: {

		onLoad: async () => {

			let parameter = {
				model: 'ingredient',
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

			if (confirm('Are you sure you want to remove this ingredient? This action can\'t be undone.')) {

				let parameter = {
					model: 'ingredient',
					action: 'delete',
					condition: [['id','=', $(e).data("id")]]
				}

				try {
					let response = await sendhttpRequest(parameter);
					if (response['code'] == 200) {
						$('.ingredients_table tbody tr.ingredient-row-'+$(e).data("id")).remove();
						Inventory.main.removeAllergenAssocIng($(e).data("id"));
					}
				} catch (error) {
					console.log("Error: ", error);
				}

			}

		},
		removeAllergenAssocIng: async (id) =>{
			let parameter = {
                model: 'assoc',
                table: 'allergens_assoc',
                action: 'custom_delete',
                condition: [ 
                        ['item_id','=',id],
                        ['type','=','ingredient']
                    ]
            }

            try {
                let response = await sendhttpRequest(parameter);
            } catch(error) {
                console.log("Error: ", error);
            }
		}

	}

}

Inventory.main.onLoad();