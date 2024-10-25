console.log('bookings');

let Booking = {

	main: {

		onLoad: () => {

		 	Booking.booking.getBookings();

		},

		getMonthName: (month) => {

			

			return months[month];
		}

	},

	booking: {

		getBookings: async () => {

			let currentDate = new Date();
			currentDate = currentDate.toISOString().split('T')[0];

			let parameter = {
				model: 'assoc',
				action: 'custom_join_query',
				table: 'booking_to_listing',
				id: uID
			}

			let bookings;

			try {
				let response = await sendhttpRequest(parameter);
				console.log(response);

				if (response['code'] == 200 && response['data'] != '') {

					$.map(response['data'], (item, index) => {

						let delivery_date = new Date(item.delivery_date);
						delivery_date = delivery_date.toISOString().split('T')[0];

						bookings += `<tr> \
						                <td>${item.b_id}</td> \
						                <td>${item.item_name}</td> \
						                <td>${moment(delivery_date).format("MMMM D, YYYY")}</td> \
						                <td>${moment(item.delivery_time, "HH:mm:ss").format("hh:mm A")}</td> \
						                <td> \
						                    <div class="button-group"> \
						                        <button class="btn default icon-right" onclick="window.location.href = '/view-bookings?id=${item.b_id}';">View <i class="bi bi-eye"></i></button> \
						                        <button class="btn default-3 icon-right" onclick="window.location.href = '/edit-bookings';">Edit <i class="bi bi-pencil-fill"></i></button> \
						                    </div> \
						                </td> \
						            </tr>`;

						bookings = (typeof bookings !== "undefined") ? bookings.replace("undefined","") : bookings;

						if (currentDate < delivery_date) $('.upcoming_table tbody').append(bookings);
						else $('.past_table tbody').append(bookings);

					});
				}

			} catch (error) {
				console.log("Error: ", error);
			}

		}

	}

}