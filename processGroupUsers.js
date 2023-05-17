const fs = require("fs");
const readLine = require("readline");

const loadData=(filePath, callBack)=>{

    const file = readLine.createInterface({
        input : fs.createReadStream(filePath),
        output : process.stdout,
        terminal:false
    });
    
    //const groups = [];
    const users = new Map();
    let groupId = "";
    
    file.on('line', (line) =>{
    
        const keyValuePairs = line.split(":");
        const key = keyValuePairs[0];
        const value = keyValuePairs[1];
    
    
    
        if(key == "cn"){
            //groups.push(value);
            groupId =value // groups[groups.length -1];
        }
    
        if(key == "member"){
            let uid = value.split(",")[0].split("=")[1];
            if(users.has(groupId)){
                users.get(groupId).push(uid);
            }else{
                users.set(groupId, [uid]);
            }
        }
    });

    file.on('close', ()=>{
        callBack(users);
    })
}

module.exports = {
    loadData
}