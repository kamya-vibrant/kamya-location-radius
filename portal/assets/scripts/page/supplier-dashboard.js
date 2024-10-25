

async function getSchoolName_(id){
	schools = [
		{id:'1',name:'Unversity of Australia'},
		{id:'2',name:'Unversity of Philippines'},
		{id:'3',name:'Unversity of China'}
	];
	let filteredSchool = schools.filter((school) => {
	    return school.id == id;
	});

	return filteredSchool[0].name;
}
async function tableupcoming(){
	var upcomingBookings=[
		{id:'1',school_id:'1', date: '2024-8-29', time: '1:00pm-3:30pm'},
		{id:'2',school_id:'2', date: '2024-9-29', time: '1:00pm-3:30pm'},
		{id:'3',school_id:'3', date: '2024-10-29', time: '1:00pm-3:30pm'}
	];
	const months_ = ["January","February","March","April","May","June","July","August","September","October","November","December"];
	lntbookings = upcomingBookings.length;
	for(i=0; i<lntbookings; i++){
		schoolname = await getSchoolName_(upcomingBookings[i].school_id);
		upcomingBookings[i].school_id = schoolname;
		var m = new Date(upcomingBookings[i].date);
		let month = months_[m.getMonth()];
		day = m.getDate();
		yr =m.getFullYear();
		upcomingBookings[i].date = month + ' ' + day +', '+yr;
	}
	var tableBody = document
		.getElementById("tblbookings")
		.getElementsByTagName("tbody")[0];
	var rowsHtml = upcomingBookings
	.map(
		(upcomingBookings) =>
			    `<tr>
                    <td>Booking-${upcomingBookings.id}</td>
                    <td>${upcomingBookings.school_id}</td>
                    <td>${upcomingBookings.date}</td>
                    <td>${upcomingBookings.time}</td>
                    <td>
                       <button class="btn default icon-right" onclick="window.location.href = '/supplier-viewbooking?id=${upcomingBookings.id}';">View <i class="bi bi-eye"></i></button>
                    </td>
                </tr>`
		)
	.join("");


	tableBody.innerHTML = rowsHtml;
}
if(tableupcoming_==false){
	tableupcoming();
	tableupcoming_ = true;
}