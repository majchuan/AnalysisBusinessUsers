const fs = require("fs"); 
const readLine = require("readline");

const readFile = (filePath) =>{
    const file = readLine.createInterface({
        input : fs.createReadStream(filePath),
        output : process.stdout,
        terminal : false 
    });

    const records = {};

    file.on("line", (line) =>{
        const filters = line.slice(0,3);
        if(filters != "CVE"){
            records[line] ? records[line]++ : records[line] = 1 ;
        }
    });

    file.on("close",()=>{
        console.log(records);
    });
}


module.exports ={
    readFile
}
