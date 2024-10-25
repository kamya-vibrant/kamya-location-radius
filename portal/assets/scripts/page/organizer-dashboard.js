async function tableOupcoming(){
	var upcomingOrders=[
		{id:'1',meal_deal:'Sushi and Drink Meal Deal', date: '2024-8-27', time: '10:30 am - 11:00 am'},
		{id:'2',meal_deal:'Sushi and Drink Meal Deal1', date: '2024-9-27', time: '10:10 am - 11:00 am'},
		{id:'3',meal_deal:'Sushi and Drink Meal Deal2', date: '2024-10-27', time: '10:20 am - 11:00 am'}
	];
	const months_ = ["January","February","March","April","May","June","July","August","September","October","November","December"];
	lntorders = upcomingOrders.length;
	for(i=0; i<lntorders; i++){
		var m = new Date(upcomingOrders[i].date);
		let month = months_[m.getMonth()];
		day = m.getDate();
		yr =m.getFullYear();
		upcomingOrders[i].date = month + ' ' + day +', '+yr;
	}
	var tableBody = document
		.getElementById("tblorders")
		.getElementsByTagName("tbody")[0];
	var rowsHtml = upcomingOrders
	.map(
		(upcomingOrders) =>
			    `<tr>
			    	<td>booking-${upcomingOrders.id}</td>
                    <td>${upcomingOrders.meal_deal}</td>
                    <td>${upcomingOrders.date}</td>
                    <td>${upcomingOrders.time}</td>
                    <td>
                       	<div class="flex y-center">
                        	<button class="btn default-3 icon-right right10" onclick="window.location.href = '/view-bookings?id=${upcomingOrders.id}';">View <i class="bi bi-eye"></i></button>
                        </div>
                    </td>
                </tr>`
		)
	.join("");


	tableBody.innerHTML = rowsHtml;
	document.getElementById('totalorders').innerHTML = lntorders;
}
if(tableOupcoming_==false){
	tableOupcoming();
	tableOupcoming_ = true;
}