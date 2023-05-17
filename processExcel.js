const xlsx = require("xlsx");
const fs= require("fs");

const not_business_email=["hotmail.com",
"rogers.com",
"bellnet.ca",
"cogeco.net", 
"nexicom.net",
"sympatico.ca",
"ntl.sympatico.ca",
"shaw.ca",
"gmail.com",
"yahoo.ca",
"aol.com",
"web.net",
"netsurf.net",
"web.net",
"mail.com",
"iks.net",
"ontera.net",
"i-zoom.net",
"tbaytel.net",
"lincsat.com",
"kos.net",
"knet.ca",
"jam21.net",
"netscape.net",
"outlook.com",
"teksavvy.com"
];

const allUsers = new Map();
const businessUsers = new Map();
const non_business_users = new Map();
const all_authenticated_business_users = new Map();
const all_authenticated_non_business_users = new Map();
let currLdapRoleMapings = [];

const processData = (users) =>{
    for(let [key,value] of users){
        if(currLdapRoleMapings.length >0 && currLdapRoleMapings.includes(key.trim())){
            for(let item of value){
                if(allUsers.has(item)){
                    const user = allUsers.get(item);
                    const emailHost = user.mail ? user.mail.split("@")[1] : null;
                    if(not_business_email.includes(emailHost) || emailHost == null){
                        if(non_business_users.has(key)){
                            non_business_users.get(key).push(user);
                        }else{
                            non_business_users.set(key, [user]);
                        }
                    }else{
                        if(businessUsers.has(key)){
                            businessUsers.get(key).push(user);
                        }else{
                            businessUsers.set(key, [user]);
                        }
                    }
                }
            }
        }else{
            for(let item of value){
                if(allUsers.has(item)){
                    const user = allUsers.get(item);
                    const emailHost = user.mail ? user.mail.split("@")[1] : null;
                    if(not_business_email.includes(emailHost) || emailHost == null){
                        if(all_authenticated_non_business_users.has("all_auth_non_business_users")){
                            all_authenticated_non_business_users.get("all_auth_non_business_users").push(user);
                        }else{
                            all_authenticated_non_business_users.set("all_auth_non_business_users",[user])
                        }
                    }else{
                        if(all_authenticated_business_users.has("all_auth_business_users")){
                            all_authenticated_business_users.get("all_auth_business_users").push(user);
                        }else{
                            all_authenticated_business_users.set("all_auth_business_users",[user])
                        }
                    }
                }
            }  
        }
    }

    //write to excel file
    writeExcelFile(businessUsers, "LDAP_PROD_BusinessUsersMappings.xlsx");
    writeExcelFile(non_business_users, "LDAP_PROD_Non_BusinessUsersMappings.xlsx");
    writeExcelFile(all_authenticated_business_users, "LDAP_PROD_All_Authenticated_Business_Users.xlsx");
    writeExcelFile(all_authenticated_non_business_users,"LDAP_PROD_All_Authenticated_Non_Business_Users.xlsx" );
}


const readExcelFile =(fileName, sheetName, allUsers, callBack) =>{
    const excelFile = xlsx.readFile(fileName);
    const sheet = excelFile.Sheets[sheetName];
    const temp = xlsx.utils.sheet_to_json(sheet);
    
    temp.forEach(x =>{
        /*
        const ldapUser ={
            dn : x.dn,
            cn : x.cn,
            uid: x.uid,
            ou : x.ou,
            given_name : x.givenname,
            sn : x.sn,
            mail : x.mail,
            description : x.description,
            organization : x.o,
            initials : x.initials,
            telephone_number : x.telephonenumber,
            department_number : x.departmentNumber | x.departmentnumber,
            address : x.postaladdress,
            postCode : x.postCode
        }
        allUsers.set(ldapUser.uid, ldapUser) ;
        */
       callBack(x, allUsers);
    });

    return allUsers;
}

const writeExcelFile =(hash_data, fileName)=>{
    const wb = xlsx.utils.book_new();
    for(let [key,value] of hash_data){
        const ws = xlsx.utils.json_to_sheet(value);
        xlsx.utils.book_append_sheet(wb, ws, key);
        xlsx.writeFile(wb, fileName, {
            bookType :"xlsx"
        })
    }
}

const writeFileData = (userEmails, fileName,sheetName) =>{
    let excelFile = null;
    if(fs.existsSync("./"+fileName+".xlsx")){
        excelFile = xlsx.readFile("./"+fileName+".xlsx");
    }else{
        excelFile = xlsx.utils.book_new();
    }
    const domains = userEmails.map(x =>{
        return {
            domain : x 
        }
    });
    const ws = xlsx.utils.json_to_sheet(domains);
    xlsx.utils.book_append_sheet(excelFile,ws,sheetName);
    xlsx.writeFile(excelFile,"./"+fileName+".xlsx", {
        bookType : "xlsx"
    });
}

const writeExcelData = async (fileName, sheetName,excelData, callBack) =>{
    let excelFile = null; 
    if(fs.existsSync("./"+fileName+".xlsx")){
        excelFile = xlsx.readFile("./" + fileName +".xlsx");
    }else{
        excelFile = xlsx.utils.book_new();
    }

    const data = await callBack(excelData);

    const ws = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(excelFile, ws, sheetName);
    xlsx.writeFile(excelFile, "./" + fileName + ".xlsx", {
        bookType :"xlsx"
    });
}

const loadRoleMappings = (roleMappings) =>{
    currLdapRoleMapings =  roleMappings.map(x => x[1]);
    console.log(currLdapRoleMapings);
}
module.exports = {
    processData,
    readExcelFile,
    writeExcelFile,
    loadRoleMappings,
    writeExcelData
} ; 