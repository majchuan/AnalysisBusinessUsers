const pe = require("./processExcel");
const pg= require("./processGroupUsers");
const px = require("./processXML");
const vbd = require("./validateBusinessDomain");
const cr = require("./countRecords");

const groupUserFilePath = "./GroupUsers_2023_04_28.txt";
const excelFilePath1 = "./LDAP_PROD_BusinessUsersMappings.xlsx";
const excelFilePath ="./LDAP_Prod_2023_04_21.xls"
const xmlFilePath = "./ibm-application-bnd.xml";
const sheetName ="Export";
const hpdbUsersSheetNames =["AHHRDBRLcolUser","AHHRDBRLcolAdm","AHHRDBRLbusLead","AHHRDBRLbusAdm"];
const filePath = "";

const app = async () =>{
    try{
        //processBusinessMappingSheet(xmlFilePath,excelFilePath,sheetName);
        //processHpdbUserSheet(hpdbUsersSheetNames);
        //await processHpdbUserOrganization();
        cr.readFile(filePath);
    }catch(e){
        console.log(e);
    }
}

const processBusinessMappingSheet = (xmlFilePath, excelFilePath,sheetName) => {
    const data = px.loadXmlToJson(xmlFilePath);
    const roleMappings = px.getRoleMappings(data,"application-bnd","security-role","group","@_name");
    pe.loadRoleMappings(roleMappings);
    pe.readExcelFile(excelFilePath, sheetName, new Map(), (x, userMap) =>{
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
        userMap.set(ldapUser.uid, ldapUser) ;
    });
    pg.loadData(groupUserFilePath, pe.processData);
}

const processHpdbUserSheet= async (hpdbUsersSheetNames)=>{
    for(let sheet of hpdbUsersSheetNames){
        const userEmails = vbd.filterUsersEmails(pe.readExcelFile(excelFilePath1,sheet));
        const notBusinessUsers = await vbd.validateBusinessModel(userEmails); 
        pe.writeExcelData("HPDB_BusinesUsers", sheetName,notBusinessUsers,(userEmails) =>{
            return userEmails.map(x =>{
                return {
                    domain : x 
                }
            });
        });
    }    
    
    process.exit(0);
}

const processHpdbUserOrganization = async() =>{
   
    // read file
    for(let sheet of hpdbUsersSheetNames){
        const ldapUsers = pe.readExcelFile(excelFilePath1, sheet, [], (x, ldapUsers)=>{
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
            ldapUsers.push(ldapUser);
        });
        
        await pe.writeExcelData("HpdbUsers",sheet, ldapUsers , vbd.getUserOrganizationByEmailDomain);
    }

}

app();
