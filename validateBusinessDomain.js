const jsdom = require("jsdom");


const validateBusinessModel = async (userEmails) =>{
    const NotBusinessDomainUsers = [];
    try{
        for(let [userEmailKey,userEmailValue] of userEmails){
            let url = "http://www."+ userEmailKey;
            try{
                const response = await fetch(url);
                const body = await response.text();
                if(response.status != 200){
                    NotBusinessDomainUsers.push(userEmailKey);
                }else{
                        //console.log(body);
                const dom = new jsdom.JSDOM(body);
                console.log(dom.window.document.querySelector("head title").textContent);
                }
            }catch(e){
                NotBusinessDomainUsers.push(userEmailKey);
                //console.log(e.name,userValue);
            }
        }
    }catch(e){
        console.log(e);
    }
    return NotBusinessDomainUsers;
}

const filterUsersEmails = (users) =>{
    const hash_users_emails = new Map();
    
    for(let [userKey, userValue] of users){
        const userEmailDomain =  userValue.mail.split("@")[1];
        if(hash_users_emails.has(userEmailDomain)){
            hash_users_emails.set(userEmailDomain, hash_users_emails.get(userEmailDomain) + 1 );
        }else{
            hash_users_emails.set(userEmailDomain,1);
        }
    }
    return hash_users_emails;
}

const getUserOrganizationByEmailDomain = async (ldapUsers) =>{

    for(let user of ldapUsers){
        const emailDomain = user.mail.split("@")[1];
        const url = "https://www."+emailDomain ; 
        try{
            const response = await fetch(url);
            const body = await response.text();
            //console.log(body);
            const dom = new jsdom.JSDOM(body);
            const title = dom.window.document.querySelector("head title").textContent ; 
            //console.log(title);
            user.organization = title ; 
        }catch(e){
            console.log(e);
        }
    }

    return ldapUsers;
}

module.exports = {
    validateBusinessModel,
    filterUsersEmails,
    getUserOrganizationByEmailDomain
}