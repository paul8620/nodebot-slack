https=require('https');

module.exports.deploy=function deploy(branch){
var options ={
        hostname:'jenkins.videoplaza.org',
        port: 443,
        path:'/view/feature4/job/feature4-BUILD-DEPLOY-forecast/buildWithParameters?token=value&FORECAST_BRANCH='+branch,
        method:'GET'
    }
var req = https.request(options,function(res){
console.log('STATUS: '+res.statusCode);
});
req.on('error', function(e) {
  console.log('problem with request: ' + e.message);
});
req.end();
return 'console.log("Deploy triggered")'

}
