
$('#login-modal').hide();
const imgSign = document.getElementById('sign');
const empty = document.getElementById('empty_');
function applySign(){
      canvas = document.getElementById('myCanvas');
      imgSign.setAttribute('src',canvas.toDataURL('image/png',0.7));
      alert('Signature applied!');
}
function resetSign(){
      imgSign.setAttribute('src','');
}
async function checkemail(email){
      let parameter = {
            model: 'user',
            action: 'retrieve',
            fields:  ['email'],
            condition:[
                        ['email','=',email]
                  ]
          };
      try {
            var response =  await sendhttpRequest(parameter);
            rentundata = response.data;
            return rentundata.length;
            
      }catch(error) {
          console.log("Error: ", error);
      }  
}
async function registerOrg(event){
      event.preventDefault();
      showLoading();
      let org_name = event.target['org_name'].value;
      let org_email = event.target['org_email'].value;
      let org_phone = event.target['org_phone'].value;
      // let org_position = event.target['org_position'].value;

      let school_name = event.target['school_name'].value;
      let school_phone = event.target['school_phone'].value;
      let school_address = event.target['school_address'].value;
      let school_website = event.target['school_website'].value;

      let list_of_classes = event.target['list_of_classes'].value;

      let finance_contact_person = event.target['finance_contact_person'].value;
      let finance_contact_email = event.target['finance_contact_email'].value;
      let finance_contact_number = event.target['finance_contact_number'].value;
      let bank_account_name = event.target['bank_account_name'].value;
      let bank_account_bsb = event.target['bank_account_bsb'].value;
      let bank_account_number = event.target['bank_account_number'].value;

      let terms_and_conditions = event.target['terms_and_conditions'].value;

      // let password = event.target['password'].value;
      let imgSign_ = document.getElementById("sign").src;
      Arrfile=imgSign_.match(/.{1,6000}/g);
      fileLength = Arrfile.length;
      checkEmail = await checkemail(org_email);
      if(checkEmail==0){
            let parameter = {
                  model: 'organiser',
                  action: 'register',
                  insert: { 
                              'email': org_email,
                              'phone': org_phone,
                              'position': 'Super Admin',
                              // 'password': encodePass(password),
                              'name': org_name, 
                              'finance_contact_person': finance_contact_person,
                              'finance_contact_email': finance_contact_email,
                              'finance_contact_number': finance_contact_number,
                              'bank_account_name': bank_account_name,
                              'bank_account_bsb': bank_account_bsb,
                              'bank_account_number': bank_account_number,
                              'terms_and_conditions': terms_and_conditions,
                              'imgSign_': Arrfile[0],

                              'school_name': school_name, 
                              'school_phone': school_phone,
                              'school_address': school_address,
                              'school_website': school_website,
                              'list_of_classes':list_of_classes
                        }
            };

            try {
                  var response = await sendhttpRequest(parameter);
                  if(response['code']==200){
                      i=1; 
                        while(i<fileLength){    
                              slice = Arrfile[i];
                              sendfile = await sendslice(response['id'], slice, 'signature');
                              i++;
                        }  
                      location.href = response['redirect'];
                  }
            } catch(error) {
                  console.log("Error: ", error);
            }
          
      }else alert("Email already exist.");
      setTimeout(
            closeLoading 
            , 50);     
}
async function sendslice(id, slice, which){
      let parameter2 = {
                        model: 'organiser',
                        action: 'insertfile',
                        insert: {  
                                    which: slice
                        },
                        fields: [
                              which
                        ],
                        condition: [['id', '=', id]]
                  };
      try {
                  var response = await sendhttpRequest(parameter2);
                  return response;
      } catch(error) {
            console.log("Error: ", error);
      }    
}  
$(document).ready(function() {
      $('.sigPad').signaturePad({drawOnly:true});
});