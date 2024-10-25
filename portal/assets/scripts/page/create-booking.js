console.log('create-booking');

let Bookings = {

	main: {

		onLoad: () => {

			Bookings.booking.getSuppliers();
			Bookings.booking.getListings();

		}

	},

	booking: {

		getSuppliers: async () => {

			/*
				TODO: Filter supplier with a verified account only
				Showing all supplier for now
			*/

			let parameter = {
				model: 'supplier',
				action: 'retrieve',
				retrieve: '*'
			}

			let suppliers;

			try {
				let response = await sendhttpRequest(parameter);
				console.log(response);

				if (response['code'] == 200 & response['data'] != '') {

					$.map(response['data'], (item, index) => {

						suppliers += `<div class="menu__list-item list-item-${item.id}"> \
							            <div class="space-btwn x-start"> \
							                <div> \
							                    <div class="menu__list-item-name"> \
							                        ${item.entity_name} \
							                    </div> \
							                </div> \
							            </div> \
							            <div class="button-group top20"> \
							                <a href="/view-supplier-listing?id=${item.id}" class="btn icon-right default" >View <i class="bi bi-eye"></i></a> \
							            </div> \
							        </div>`;

					});

					suppliers = (typeof suppliers !== "undefined") ? suppliers.replace("undefined", "") : suppliers;

					$('.menu__list').html(suppliers);
				}

			} catch (error) {
				console.log("Error: ", error);
			}

		},

		getListings: async () => {

			let parameter = {
				model: 'listing',
				action: 'retrieve',
				retrieve: '*',
				condition: [['status', '=', 1]]
			}

			let listings;

			try {
				let response = await sendhttpRequest(parameter);
				console.log(response);
			} catch (error) {
				console.log("Error: ", error);
			}
		}

	}

}

Bookings.main.onLoad();