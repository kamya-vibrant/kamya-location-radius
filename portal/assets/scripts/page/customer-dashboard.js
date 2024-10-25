async function tableCupcoming(){
	var upcomingOrders=[
		{id:'1',meal_deal:'Sushi and Drink Meal Deal', date: '2024-8-29', student: 'Johnny Depp'},
		{id:'2',meal_deal:'Sushi and Drink Meal Deal1', date: '2024-9-29', student: 'Johnny Depp1'},
		{id:'3',meal_deal:'Sushi and Drink Meal Deal2', date: '2024-10-29', student: 'Johnny Depp2'}
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
                    <td>${upcomingOrders.meal_deal}</td>
                    <td>${upcomingOrders.date}</td>
                    <td>${upcomingOrders.student}</td>
                    <td>
                       	<div class="flex y-center">
                        	<button class="btn default-3 icon-right right10" onclick="window.location.href = '/customer-vieworders?id=${upcomingOrders.id}';">View Order<i class="bi bi-eye"></i></button>
                            <button class="btn default icon-right" onclick="window.location.href = '/customer-vieworder?id=${upcomingOrders.id}';" >View Invoice <i class="bi bi-eye"></i>
                            </button>
                        </div>
                    </td>
                </tr>`
		)
	.join("");


	tableBody.innerHTML = rowsHtml;
	document.getElementById('totalorders').innerHTML = lntorders;
}
if(tableCupcoming_==false){
	tableCupcoming();
	tableCupcoming_ = true;
}