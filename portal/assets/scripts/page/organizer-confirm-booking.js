console.log('organizer-confirm-booking');

let tid;
let itemID;

let Booking = {

	main: {

		onLoad: () => {

			let url = window.location.href;
            url = new URL(url);
            tid = url.searchParams.get("id");

			Booking.booking.getListing(tid);

			//init location field for google map
			setTimeout(() => {
                google.maps.event.addDomListener(window, 'load', Booking.main.initDeliveryLocation());
            }, 1500);
		},

		initDeliveryLocation: () => {

            var input = document.getElementById('pac-input');
            var hidden_lat = document.getElementById('map_lat');
            var hidden_long = document.getElementById('map_lng');
            var map_name = input.value;
            var hidden_map_name = document.getElementById('map_name');
            var options = {
                componentRestrictions: { country: 'au' }
            };
            var autocomplete = new google.maps.places.Autocomplete(input, options);

            autocomplete.addListener('place_changed', function () {
                var place = autocomplete.getPlace();
                var latitude = place.geometry.location.lat();
                var longitude = place.geometry.location.lng();

                hidden_lat.value = latitude;
                hidden_long.value = longitude;
                hidden_map_name.value = map_name;
                $("#map_name").val($("#pac-input").val());

            });

        }

	},

	booking: {

		getListing: async (tid) => {
			let parameter = {
				model: 'assoc',
				action: 'custom_join_query',
				table: 'temp_booking_to_listing',
				id: tid
			}

			let selection, profit, sell_price;

			try {
				let response = await sendhttpRequest(parameter);
				console.log(response);

				if (response['code'] == 200 && response['data'] != '') {

					$.map(response['data'], (item, index) => {

						itemID = item.id;
						//compute profit

						profit = parseFloat(item.price * item.tb_price_inc).toFixed(2);
						sell_price = (parseFloat(item.price)) + (parseFloat(profit));

						selection += `<tr> \
										<td>${item.item_name}</td> \
										<td class="item-price">$${parseFloat(item.price).toFixed(2)}</td>`;

						selection += `<td class="profit">$${parseFloat(profit).toFixed(2)}</td>`;

						selection += `<td class="sell-price">$${parseFloat(sell_price).toFixed(2)}</td> \
									</tr>`;

					});

					selection = (typeof selection !== "undefined") ? selection.replace("undefined", "") : selection;

					$('.selection_table tbody').html(selection);
				}

			} catch (error) {
				console.log("Error: ", error);
			}
		},

		confirmBooking: async () => {

			if ($('#map_name').val() == "" || $("#map_lat").val() == "" || $("#map_lng").val() == "" || $("#deliver_date").val() == "" || $("#delivery_time").val() == "") {
				alert("Please select Location, Delivery Date and Time to confirm booking.");
			} else {

				let priceText = $('.sell-price').text().trim(); // Get the text and trim any whitespace
				priceText = priceText.replace(/[^0-9.-]+/g, ""); // Remove any non-numeric characters except dot and minus

				// Parse the cleaned text as a decimal
				let price = parseFloat(priceText);


				let parameter = {
					model: 'booking',
					action: 'insert',
					insert: {
						org_id: uID,
						item_id: itemID,
						delivery_location: $('#map_name').val(),
						delivery_lat: $('#map_lat').val(),
						delivery_lng: $('#map_lng').val(),
						delivery_date: $('#delivery_date').val(),
						delivery_time: $('#delivery_time').val(),
						price: price
					}
				}

				console.log(parameter);

				try {
					let response = await sendhttpRequest(parameter);
					console.log(response);

					if (response['code'] == 200 && response['id'] > 0) {
						Booking.booking.confirmBookingDetails(response['id']).then(() => {
							setTimeout(()=>{
								window.location.href = '/bookings';
							},500);
						});
					}

				} catch (error) {
					console.log("Error: ", error);
				}

			}
		},

		confirmBookingDetails: async (booking_id) => {

			let parameter = {
				model: 'booking',
				action: 'custom_update',
				table: 'booking_assoc',
				update: { booking_id: booking_id },
				condition: [['temp_booking_id', '=', tid]]
			}

			try {
				let response = await sendhttpRequest(parameter);
				console.log(response);
			} catch (error) {
				console.log("Error: ", error);
			}
		}

	}

}

Booking.main.onLoad();