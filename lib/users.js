
var pathToFile='config/users';
var fs = require('fs');
var bufferString, bufferingStringSplit;

module.exports.Users=function Users(){
}
function verifyAdmin(token){
 return token==='test123'
}
module.exports.addUser=function addUser(name){  

    if(verifyUser(name)){
        return 'console.log("User already exits")';
    }
    else {
        fs.appendFile(pathToFile,name+'\n', function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("User "+name+ "was added");
            });
        returnString= 'console.log("User '+name+' was added")';
        return returnString;
    }
}

function verifyUser(name){
  return fs.readFileSync(pathToFile).toString().indexOf(name+'\n')>1;
}
module.exports.removeUser=function removeUser(name){}
