console.log('product.js');

let Inventory = {

	main: {

		onLoad: async () => {

			await Promise.all([
				Inventory.product.getProducts()
			]);

		},

		sendRequest: async (parameter) => {



		}

	},

	product: {

		getProducts: async () => {

			let parameter = {
				model: 'listing',
				action: 'retrieve',
				retrieve: '*',
				condition: [['sb_id', '=', user_id]]
			}

			let products = '';

			try {
				let response = await sendhttpRequest(parameter);
				console.log(response);

				if (response['code'] == 200 && response['data'] && response['data'].length > 0) {

					for (const item of response['data']) {

						products += `<tr class="product-row-${item.id}"> \
										<td> \
			                                <div class="img-container"> \
			                                    <img src="${item.image}" /> \
			                                </div> \
			                            </td> \
										<td>${item.item_name}</td> \
										<td></td> \
										<td>$${parseFloat(item.price).toFixed(2)}</td> \
										<td class="green-text"> \
			                                <div class="pill-item ${(item.status == 1 ? "green" : "yellow")}">${(item.status == 1 ? "Active" : "Inactive")}</div> \
			                            </td> \
										<td></td> \
										<td> \
			                                <div class="button-group xy-center" style="gap: 10px;"> \
			                                    <a href="/edit-product?id=${item.id}" class="btn default icon-right" style="">Edit <i class="bi bi-pencil-fill"></i></a> \
			                                    <button type="button" class="btn red icon-right" data-id="${item.id}" onclick="Inventory.product.removeProduct(this); return false;">Remove <i class="bi bi-trash-fill"></i></button> \
			                                </div> \
			                            </td> \
									</tr>`;

					}

					$('.products_table tbody').html(products);
				}

			} catch (error) {
				console.log("Error fetching products: ", error);
				MSL_GLOBAL.main.globalModal('danger', 'failed', 'Products', 'Error fetching products: '+error);
			}

		},

		removeProduct: async (e) => {

			MSL_GLOBAL.main.confirmAlertModal('info', 'confirm', 'Remove Products', 'Are you sure you want to remove this product?').then(async (confirmed) => {

				if (confirmed) {
					
					let parameter = {
						model: 'listing',
						action: 'delete',
						condition: [['id', '=', $(e).data('id')]]
					}

					try {
						let response = await sendhttpRequest(parameter);

						if (response['code'] == 200) {

							$('.products_table tbody tr.product-row-'+$(e).data('id')).remove();
							Inventory.product.removesizing_assoc($(e).data('id'));
							Inventory.product.removePOA($(e).data('id'));
						}

					} catch (error) {
						console.log("Error deleting product: ", error);
					}

				} else {
					console.log("cancelled");
				}

			});

		},
		removesizing_assoc: async(item_id) =>{
			let parameter = {
					model: 'assoc',
					action: 'custom_delete',
					table: 'sizing_assoc',
					condition:[
							['item_id','=',item_id]
						]
			};
			try {
				let response = await sendhttpRequest(parameter);
			} catch (error) {
				console.log(error);
			}
		},
		removePOA: async (item_id)=>{
			let parameter = {
					model: 'assoc',
					action: 'custom_delete',
					table: 'product_option_assoc',
					condition:[
							['item_id','=',item_id]
						]
			};
			try {
				let response = await sendhttpRequest(parameter);
			} catch (error) {
				console.log(error);
			}
		}

	}

}

Inventory.main.onLoad();