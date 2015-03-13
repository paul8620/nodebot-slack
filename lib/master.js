'use strict';
var util = require('util');

module.exports = function(app) {
    var cluster = require('cluster'),
        mainWorker,
        timer = 0,
        callback;

    cluster.setupMaster({
        exec : "./lib/worker.js",     // run this script when we fork ourselves
        args : process.argv.slice(2),
        silent : false
    });

    //This will be fired when the forked process becomes online
    cluster.on("online", function(worker) {
        mainWorker = worker;

        worker.on("message", function (result) {
            clearTimeout(timer);
            // console.log(message);
            // run the callback passed along with all the messages with the result as argument
            if (typeof callback !== 'undefined') {
                callback(result);
            }
        });
    });

    cluster.on('exit', function(worker, code, signal) {
        mainWorker = undefined;
        cluster.fork();
    });

    cluster.fork();   // fork one process so if for some reason the executed code hangs it doesn't crash the server

    // Routing
    app.get('/', function(req, res) {
        res.send(401, 'Unauthorized');
    });

    app.post('/js', function(req, res) {
         console.log(req.body.user_name);
        var userName = req.body.user_name,
            jsCode = req.body.text,
            channel = req.body.channel_name;

        // Sanitize input first
        if (typeof userName === 'undefined' || typeof jsCode === 'undefined' || jsCode.indexOf('nodebot:') === -1) {
            res.send(400);
            return;
        }

        // Check if we don't have an online worker
        if (typeof mainWorker === 'undefined') {
            res.send(503);      // service unavailable
            return;
        }

        // parse jsCode
        jsCode = jsCode.split('nodebot:')[1].trim();
        if(jsCode.indexOf('Add User')!=-1){
                if(channel.indexOf('testjenkinstest')!=-1)
//todo external configuration variable instead of value
                    {
                        jsCode='console.log("You are not allowed to add users from here")';
                    }else{ 
                        var users = require('./users');
                        var user = jsCode.split('Add User')[1].trim();
                        jsCode=users.addUser(user);
                        console.log('master:'+jsCode);
                    }
            }        
        
        if(jsCode.indexOf('Remove User')!=-1)
        { 
        
        }
        console.log('Master:'+jsCode);

        if(jsCode.indexOf('Deploy')!=-1){
            var jenkins=require('./jenkins');
            var branch=jsCode.split('Deploy')[1].trim();
            jsCode=jenkins.deploy(branch);
        }

        if(jsCode.indexOf('Help')!=-1)
        {
           jsCode='console.log("This message is sent from '+channel+' Commands: Add User $username - adds users to allowed users list Remove User $username -removes users from the allowed users list Deploy $branch -- it deploys on feature4 the specified branch  Jenkins jenkinsUrl ")' 
        }
        
        

        
        if (jsCode === '') {
            res.send({'text': "@" + userName + "\n*Error:* Please specify code to run\n"});
            return;
        }

        // handle long running processes here (5 seconds tops)
        timer = setTimeout(function() {
            mainWorker.destroy();
            res.send({'text': "@" + userName + "\n*Error:* Execution time expired\n"});
        }, 5000);

        callback = function(result) {
            res.send({'text': "@" + userName + "\n" + result + "\n"});
        };
        mainWorker.send(jsCode); // Send the expression to run on the worker
    });
};
