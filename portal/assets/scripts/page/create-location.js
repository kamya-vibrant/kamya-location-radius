const img_banner = document.getElementById('pic-banner');
const img_logo = document.getElementById('pic-logo');
const div_banner_logo = document.getElementById('div_banner_logo');
const selectLogoBanner = document.getElementById('selectLogoBanner');
const textarealogo = document.getElementById('textarealogo');
const textareabanner = document.getElementById('textareabanner');

var use_general_banner_logo = false;
const uploadPictureBanner = document.querySelector("#banner");
const uploadPictureLogo = document.querySelector("#logo");
var bannerdisplay = false;
var imgval = 'logo';

async function supplier_dsa() {
    Supplier_ = JSON.parse(localStorage.supplier);
    if (Supplier_.length == 0) {
        console.log('log:', localStorage.loggedData);
        let parameter = {
            model: 'user',
            action: 'retrieve',
            fields: ['supplier_id'],
            condition: [
                ["id", "=", JSON.parse(localStorage.loggedData).user_id],
            ]
        }
        try {
            var response = await sendhttpRequest(parameter);
            console.log(response);
            Supplier_id_ = response.data[0].supplier_id;
        } catch (error) {
            console.log("Error: ", error);
        }
    } else Supplier_id_ = Supplier_[0].id;
}
supplier_dsa();
var getID = '';
var user_create_url = window.location.href;
var queryStart = user_create_url.indexOf("?") + 1,
    queryEnd = user_create_url.indexOf("#") + 1 || user_create_url.length + 1,
    query = user_create_url.slice(queryStart, queryEnd - 1),
    pairs = query.replace(/\+/g, " ").split("&"),
    parms = {},
    i, n, v, nv;
if (query === user_create_url || query === "") console.log(parms);;

for (i = 0; i < pairs.length; i++) {
    nv = pairs[i].split("=", 2);
    n = decodeURIComponent(nv[0]);
    v = decodeURIComponent(nv[1]);

    if (!parms.hasOwnProperty(n)) parms[n] = [];
    parms[n].push(nv.length === 2 ? v : null);
}

if (typeof parms['id'] !== 'undefined') {
    setTimeout(() => parms, 1000);
    LocationGet(parms['id']);
    getID = parms['id'][0];
}
if (users_supplier.position != 'Super admin' && users_supplier.position != 'Finance') {
    document.getElementById("bank").disabled = true;
    document.getElementById("bsb").disabled = true;
    document.getElementById("account_name").disabled = true;
    document.getElementById("account_number").disabled = true;
}
if (users_supplier.position == 'Finance') {
    document.getElementById("location_name").disabled = true;
    document.getElementById("entity_name").disabled = true;
    document.getElementById("location_address").disabled = true;
    document.getElementById("location_timezone").disabled = true;
    document.getElementById("business_description").disabled = true;
    document.getElementById("point_contact_name").disabled = true;
    document.getElementById("point_contact_email").disabled = true;
    document.getElementById("finance_contact_name").disabled = true;
    document.getElementById("is_finance_name_global").disabled = true;
    document.getElementById("is_finance_email_global").disabled = true;
    document.getElementById("acn").disabled = true;
    document.getElementById("abn").disabled = true;
    document.getElementById("orders_contact_name").disabled = true;
    document.getElementById("orders_contact_email").disabled = true;
    document.getElementById("delivery_radius").disabled = true;
    document.getElementById("delivery_method").disabled = true;
    document.getElementById("use_general_banner_logo").disabled = true;
    document.getElementById('logo').remove();
    document.getElementById('banner').remove();
}
async function LocationGet(id) {

    // alert(id);
    id = id[0];
    let parameter = {
        model: 'location',
        action: 'retrieve',
        retrieve: '*',
        condition: [
            ["id", "=", id]
        ]

    }
    try {
        var response = await sendhttpRequest(parameter);
        infoLocation = response.data;

        document.getElementById("pic-logo").src = infoLocation[0].logo;
        document.getElementById("pic-banner").src = infoLocation[0].banner;
        img_banner.style.visibility = 'visible';
        img_logo.style.visibility = 'visible';

        $('#location_address').attr('value', infoLocation[0].location_address);

        document.getElementById("location_name").value = infoLocation[0].location_name;
        document.getElementById("entity_name").value = infoLocation[0].entity_name;
        // document.getElementById("location_address").value = infoLocation[0].location_address;
        document.getElementById("location_timezone").value = infoLocation[0].location_timezone;
        document.getElementById("business_description").value = infoLocation[0].business_description;
        document.getElementById("point_contact_name").value = infoLocation[0].point_contact_name;
        document.getElementById("point_contact_email").value = infoLocation[0].point_contact_email;
        document.getElementById("finance_contact_name").value = infoLocation[0].finance_contact_name;
        if (infoLocation[0].is_finance_name_global == 1) document.getElementById("is_finance_name_global").setAttribute('Checked', "Checked");

        document.getElementById("finance_contact_email").value = infoLocation[0].finance_contact_email;
        if (infoLocation[0].is_finance_email_global == 1) document.getElementById("is_finance_email_global").setAttribute('Checked', "Checked");

        document.getElementById("acn").value = infoLocation[0].acn;
        document.getElementById("abn").value = infoLocation[0].abn;
        document.getElementById("orders_contact_name").value = infoLocation[0].orders_contact_name;
        document.getElementById("orders_contact_email").value = infoLocation[0].orders_contact_email;
        document.getElementById("delivery_radius").value = infoLocation[0].delivery_radius;
        document.getElementById("delivery_method").value = infoLocation[0].delivery_method;
        if (users_supplier.position == 'Super admin' || users_supplier.position == 'Finance') {
            document.getElementById("bank").value = infoLocation[0].bank;
            document.getElementById("bsb").value = infoLocation[0].bsb;
            document.getElementById("account_name").value = infoLocation[0].account_name;
            document.getElementById("account_number").value = infoLocation[0].account_number;
        } else {
            document.getElementById("bank").disabled = true;
            document.getElementById("bsb").disabled = true;
            document.getElementById("account_name").disabled = true;
            document.getElementById("account_number").disabled = true;
        }

        if (infoLocation[0].use_general_banner_logo == 1) {
            document.getElementById("use_general_banner_logo").setAttribute('Checked', "Checked");
            img_banner.style.visibility = 'visible';
            img_logo.style.visibility = 'visible';
            selectLogoBanner.style.visibility = 'hidden';
        }
        document.getElementById("headtitLe").innerText = "Update Location";
        document.getElementById("headtitLeP").innerText = "Update the locations of this business";
        document.getElementById("btnSubmit").innerText = "Update";
    } catch (error) {
        console.log("Error: ", error);
    }
}

function putbanner(input) {
    div_banner_logo.style.visibility = 'visible';
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function(e) {
            // img_banner.setAttribute('src', e.target.result);
            textareabanner.textContent = e.target.result;
            document.getElementById('crop').click();
        };
        reader.readAsDataURL(input.files[0]);
        img_banner.style.visibility = 'visible';

        img_logo.style.marginTop = "100px";
        img_logo.style.marginLeft = "20px";
        bannerdisplay = true;
        imgval = 'banner';
    }

}

function putlogo(input) {
    console.log(input);
    div_banner_logo.style.visibility = 'visible';
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function(e) {
            textarealogo.textContent = e.target.result;
            // img_logo.setAttribute('src', e.target.result);
            document.getElementById('crop').click();
        };

        reader.readAsDataURL(input.files[0]);
        imgval = 'logo';
        img_logo.style.visibility = 'visible';

        if (bannerdisplay == false) {
            img_logo.style.marginTop = "-10px";
            // img_logo.style.marginLeft = "376px";

        }
    }
}

uploadPictureBanner.addEventListener('change', function() {
    putbanner(this);
});
uploadPictureLogo.addEventListener('change', function() {
    putlogo(this);
});

function useDefaultBannerLogo() {
    var checkBox = document.getElementById("use_general_banner_logo");
    if (checkBox.checked == true) {
        div_banner_logo.style.visibility = 'visible';
        img_banner.setAttribute('src', "https://letscater.com.au/upload_tmp/17210931651721052000.jpeg");
        img_logo.setAttribute('src', "https://letscater.com.au/upload_tmp/17210932641721052000.jpeg");
        img_logo.style.visibility = 'visible';
        img_banner.style.visibility = 'visible';
        selectLogoBanner.style.visibility = 'hidden';
        use_general_banner_logo = true;
        document.getElementById('logo').value = "";
        document.getElementById('banner').value = "";
        img_logo.style.marginTop = "300px";
        bannerdisplay = true;
    } else {
        globalThis.scrollTo({
            top: 0,
            left: 0,
            behavior: "smooth"
        });
        img_banner.removeAttribute("src");
        img_logo.removeAttribute("src");
        div_banner_logo.style.visibility = 'hidden';
        img_logo.style.visibility = 'hidden';
        img_banner.style.visibility = 'hidden';
        selectLogoBanner.style.visibility = 'visible';
        use_general_banner_logo = false;
        bannerdisplay = false;
    }
}

/*global ActiveXObject*/
function CreateTextFile(val, filename) {
    var ts;
    var fso = new ActiveXObject("Scripting.FileSystemObject");
    var savefilepath = "saveFile.json"
    var savefile = fso.GetFile(savefilepath);

    // open for writing only, value 2, overwriting the previous
    // contents of the file
    ts = savefile.OpenAsTextStream(2);

    var myTestJson = {
        "id1": "one",
        "id2": "two"
    };

    // copy to json
    ts.WriteLine(myTestJson);

    ts.Close;
}

async function createLocation(event) {
    event.preventDefault();
    showLoading();

    let location_name = event.target['location_name'].value;
    let entity_name = event.target['entity_name'].value;
    let location_address = event.target['location_address'].value;
    let location_timezone = event.target['location_timezone'].value;
    let business_description = event.target['business_description'].value;
    let point_contact_name = event.target['point_contact_name'].value;
    let point_contact_email = event.target['point_contact_email'].value;
    let finance_contact_name = event.target['finance_contact_name'].value;
    let is_finance_name_global = event.target['is_finance_name_global'].value;
    let finance_contact_email = event.target['finance_contact_email'].value;
    let is_finance_email_global = event.target['is_finance_email_global'].value;
    let acn = event.target['acn'].value;
    let abn = event.target['abn'].value;
    let orders_contact_name = event.target['orders_contact_name'].value;
    let orders_contact_email = event.target['orders_contact_email'].value;
    let delivery_radius = event.target['delivery_radius'].value;
    let delivery_method = event.target['delivery_method'].value;
    let bank = event.target['bank'].value;
    let bsb = event.target['bsb'].value;
    let account_name = event.target['account_name'].value;
    let account_number = event.target['account_number'].value;
    logo = document.getElementById("pic-logo").src;
    banner = document.getElementById("pic-banner").src;
    if (document.getElementById("is_finance_name_global").checked == true) is_finance_name_global = 1;
    if (document.getElementById("is_finance_email_global").checked == true) is_finance_email_global = 1;
    if (use_general_banner_logo == true) {
        use_general_banner_logo = 1;
        logo = document.getElementById("pic-logo").src;
        banner = document.getElementById("pic-banner").src;
        if (users_supplier.position == 'Super admin' || users_supplier.position == 'Finance') {
            insertdata = {
                'location_name': location_name,
                'supplier_id': Supplier_id_,
                'entity_name': entity_name,
                'location_address': location_address,
                'location_timezone': location_timezone,
                'business_description': business_description,
                'point_contact_name': point_contact_name,
                'point_contact_email': point_contact_email,
                'finance_contact_name': finance_contact_name,
                'is_finance_name_global': parseInt(is_finance_name_global),
                'finance_contact_email': finance_contact_email,
                'is_finance_email_global': parseInt(is_finance_email_global),
                'acn': acn,
                'abn': acn,
                'orders_contact_name': orders_contact_name,
                'orders_contact_email': orders_contact_email,
                'delivery_radius': delivery_radius,
                'delivery_method': delivery_method,
                'bank': bank,
                'bsb': bsb,
                'account_name': account_name,
                'account_number': account_number,
                'logo': logo,
                'banner': banner,
                'use_general_banner_logo': parseInt(use_general_banner_logo),
            }
        } else {
            insertdata = {
                'location_name': location_name,
                'supplier_id': Supplier_id_,
                'entity_name': entity_name,
                'location_address': location_address,
                'location_timezone': location_timezone,
                'business_description': business_description,
                'point_contact_name': point_contact_name,
                'point_contact_email': point_contact_email,
                'finance_contact_name': finance_contact_name,
                'is_finance_name_global': parseInt(is_finance_name_global),
                'finance_contact_email': finance_contact_email,
                'is_finance_email_global': parseInt(is_finance_email_global),
                'acn': acn,
                'abn': acn,
                'orders_contact_name': orders_contact_name,
                'orders_contact_email': orders_contact_email,
                'delivery_radius': delivery_radius,
                'delivery_method': delivery_method,
                'logo': logo,
                'banner': banner,
                'use_general_banner_logo': parseInt(use_general_banner_logo),
            }
        }
        if (getID == '') {
            let parameter = {
                model: 'location',
                action: 'insert',
                insert: insertdata
            };
            try {
                var response = await sendhttpRequest(parameter);
                window.location.href = "/location";
            } catch (error) {
                console.log("Error: ", error);
            }
        } else {
            let parameter = {
                model: 'location',
                action: 'update',
                update: insertdata,
                condition: [
                    ["id", "=", getID]
                ]

            };
            try {
                var response = await sendhttpRequest(parameter);
                // console.log(response);
                // alert(response.id);
                window.location.href = "/location";
            } catch (error) {
                console.log("Error: ", error);
            }
        }
    } else if (use_general_banner_logo == false && (logo != window.location.href && banner != window.location.href)) {

        use_general_banner_logo = 0;
        Arrlogo = logo.match(/.{1,3000}/g);
        Arrbanner = banner.match(/.{1,3000}/g);
        bannerLength = Arrbanner.length;
        logoLength = Arrlogo.length;
        if (users_supplier.position == 'Super admin' || users_supplier.position == 'Finance') {
            insertdata = {
                'location_name': location_name,
                'supplier_id': Supplier_id_,
                'entity_name': entity_name,
                'location_address': location_address,
                'location_timezone': location_timezone,
                'business_description': business_description,
                'point_contact_name': point_contact_name,
                'point_contact_email': point_contact_email,
                'finance_contact_name': finance_contact_name,
                'is_finance_name_global': is_finance_name_global,
                'finance_contact_email': finance_contact_email,
                'is_finance_email_global': is_finance_email_global,
                'acn': acn,
                'abn': acn,
                'orders_contact_name': orders_contact_name,
                'orders_contact_email': orders_contact_email,
                'delivery_radius': delivery_radius,
                'delivery_method': delivery_method,
                'bank': bank,
                'bsb': bsb,
                'account_name': account_name,
                'account_number': account_number,
                'logo': Arrlogo[0],
                'banner': Arrbanner[0],
                'use_general_banner_logo': use_general_banner_logo,
            }
        } else {
            insertdata = {
                'location_name': location_name,
                'supplier_id': Supplier_id_,
                'entity_name': entity_name,
                'location_address': location_address,
                'location_timezone': location_timezone,
                'business_description': business_description,
                'point_contact_name': point_contact_name,
                'point_contact_email': point_contact_email,
                'finance_contact_name': finance_contact_name,
                'is_finance_name_global': is_finance_name_global,
                'finance_contact_email': finance_contact_email,
                'is_finance_email_global': is_finance_email_global,
                'acn': acn,
                'abn': acn,
                'orders_contact_name': orders_contact_name,
                'orders_contact_email': orders_contact_email,
                'delivery_radius': delivery_radius,
                'delivery_method': delivery_method,
                'logo': Arrlogo[0],
                'banner': Arrbanner[0],
                'use_general_banner_logo': use_general_banner_logo,
            }
        }
        if (getID == '') {
            let parameter1 = {
                model: 'location',
                action: 'insert',
                insert: insertdata
            };


            try {
                var response = await sendhttpRequest(parameter1);

                if (response['code'] == 200) {

                    i = 1;
                    while (i < logoLength) {

                        slice = Arrlogo[i];
                        var sendingIMG = await sendslice(response['id'], slice, 'logo');
                        i++;
                    }
                    i = 1;
                    while (i < bannerLength) {
                        slice = Arrbanner[i];
                        var sendingIMG = await sendslice(response['id'], slice, 'banner');
                        i++;
                    }

                    $("body").removeClass("disabledbutton");
                }

            } catch (error) {
                console.log("Error: ", error);
            }
            console.log(bannerLength);

        } else {
            let parameter1 = {
                model: 'location',
                action: 'update',
                update: insertdata,
                condition: [
                    ["id", "=", getID]
                ]

            };


            try {
                var response = await sendhttpRequest(parameter1);

                if (response['code'] == 200) {
                    i = 1;
                    while (i < logoLength) {

                        slice = Arrlogo[i];
                        var sendingIMG = await sendslice(getID, slice, 'logo');
                        i++;
                    }
                    i = 1;
                    while (i < bannerLength) {
                        slice = Arrbanner[i];
                        var sendingIMG = await sendslice(getID, slice, 'banner');
                        i++;
                    }
                    $("body").removeClass("disabledbutton");
                }

            } catch (error) {
                console.log("Error: ", error);
            }
        }
        window.location.href = "/location";
    } else {
        alert('Please upload / use general logo and banner!');
    }
    setTimeout(
        closeLoading, 50);
}

async function sendslice(id, slice, which) {
    let parameter2 = {
        model: 'location',
        action: 'insertimg',
        insert: {
            which: slice
        },
        fields: [
            which
        ],
        condition: [
            ['id', '=', id]
        ]
    };
    try {
        var response = await sendhttpRequest(parameter2);
        return response;
    } catch (error) {
        console.log("Error: ", error);
    }
}

function readFilelogo(event) {
    textarealogo.textContent = event.target.result;
}

function readFilebanner(event) {
    textareabanner.textContent = event.target.result;
}

$(document).ready(function() {
    var img
    $('#imagUpload').change(function(e) {
        img = e.target.files[0]

        $('#image_preview').attr('src', URL.createObjectURL(img))
        $('#image_preview,#crop').removeClass('d-none')
    })
    var myModal = new bootstrap.Modal(document.getElementById("crop_popup"), {});
    let cropper

    function start_cropping(imgval) {

        valimg = $('#textarea' + imgval).val();
        var img_link = valimg;
        if (imgval == 'logo') imgvalformat = 'auto';
        else imgvalformat = '600x150';
        var imgformat = imgvalformat;
        // alert(imgvalformat);


        const cropOptions = {
            image: img_link,
            imgFormat: imgvalformat, // Formats: 3/2, 200x360, auto
            // circleCrop: true,
            zoomable: true
        }

        // Initiate cropper
        cropper = $('#crop_popup .modal-body').cropimage(cropOptions);

        setTimeout(() => {
            console.log('set-image');
            cropper.setImage(img_link)
        }, 1000);
        myModal.show();

    }
    $('#crop').click(function() {
        start_cropping(imgval);
    })

    $('#crop_popup').on('click', '.crop-it', function() {
        // Get the cropped image source URL
        const blobDataURL = cropper.getImage('PNG'); // JPEG, PNG, ...
        if (!blobDataURL) return
        if (imgval == 'logo') img_logo.setAttribute('src', blobDataURL);
        else img_banner.setAttribute('src', blobDataURL);
        $('#modalclose').click();
    })
    $('#crop_popup').on('click', '.reset-it', function() {
        start_cropping(imgval);
    })
    $('#modalclose').on('click', function() {
        start_cropping(imgval);
        myModal.hide();
    })
})