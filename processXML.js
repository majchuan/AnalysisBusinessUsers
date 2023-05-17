const {XMLParser} = require("fast-xml-parser");
const fs = require("fs");

const options= {
    ignoreAttributes : false
}

const loadXmlToJson = (filePath) =>{
    try{
        const data = fs.readFileSync(filePath);
        const jsonObject = new XMLParser(options).parse(data);
        return jsonObject;
    }catch(err){
        console.log(err);
    }
}

const getRoleMappings=(jsonObject, ...propertyNames)=>{
    const result = [];
    const securityRole= jsonObject[propertyNames[0]][propertyNames[1]];
    for(let sr of securityRole){
        //console.log(sr);
        const ldapUserRole = sr[propertyNames[2]] ? sr[propertyNames[2]][propertyNames[3]].split(",")[0].split("=")[1] : null;
        const ohfsRole = sr[propertyNames[3]] ? sr[propertyNames[3]] : null;
        result.push([ohfsRole, ldapUserRole]);
    }

    return result;
}

module.exports = {
    loadXmlToJson,
    getRoleMappings
}