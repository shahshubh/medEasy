/* Monkey-patching history support into readline.
 * Usage: createInterface is like readline's createInterface, but also takes a path and 
 * a maximum (in-memory) history length. Also it's async, so use CPS.
 *
 * maxDiskSize is maximum bytes that can go in disk history
 * before a rotation. Rotation is super simple, removes previous .old, renames to .old
 *
 * console.log(module.example) to see an example of how to use.
 */

function example() {
    var rl = require('readline-history');
    rl.createInterface({
        path: "/tmp/history",
        maxLength: 1234,
        input: process.input,
        output: process.output,
        next: function(rli) {
            rli.setPrompt("? ");
            rli.prompt();
            rli.on('line',function(line) {
                console.log("Got line "+line);
                rli.prompt();
            });
        }
    });
};

var readline = require('readline');
var fs = require('fs');

var loadedHistory;
var histories = [];

var maxDiskSize = 0x1000000;

function loadHistory(path,maxLength, gotHistory) {
    function onOpen(err,fd) {
        function onLoad(offset) {
            var tail = "";
            function ondata(chunk) {
                tail += chunk;
            }
            function onend() {
                tail = tail.slice(0,-1); // history file always ends in newline
                tail = tail.split("\n");
                if(offset > 0 && tail.length < maxLength) {
                    onLoad(offset-(0x100*maxLength));
                } else {
                    tail = tail.slice(-maxLength);
                    tail.reverse();
                    gotHistory(tail,fd);
                }
            }
            var rs = fs.createReadStream(path,{
                encoding: 'utf-8', fd: fd, 
                start: offset, autoClose: false});
            rs.on('data',ondata);
            rs.on('end',onend);
        }

        fs.fstat(fd, function (err,stat) {
            var totalSize = stat.size;
            if(totalSize > maxDiskSize) {
                function rename() {
                    fs.rename(path,path+".old",function () {
                        fs.open(path,"a+",onOpen);
                    });
                }
                fs.close(fd, function () {
                    fs.exists(path+".old",function(exists) {
                        if(exists) {
                            fs.unlink(path+".old",rename);
                        } else {
                            rename();
                        }
                    })
                });
            } else {
                onLoad(totalSize);
            }
        });
    }

    fs.open(path,"a+",onOpen);
}

function max(a,b) {
    if (a > b) {
        return a;
    } 
    return b;
}

function createInterface(info) {
    loadHistory(info['path'],info['maxLength'],function(history,histfile) {
        // XXX: stupid globals...
        readline.kHistorySize = max(readline.kHistorySize,info['maxLength']);
        var rl = readline.createInterface(info);

        var oldaddhist = rl._addHistory;
        rl._addHistory = function() {
            var last = rl.history[0];
            var line = oldaddhist.call(rl);
            if(line.length > 0 && line != last) {
                fs.writeSync(histfile,line+"\n");
            }
            return line;
        }

        rl.history.push.apply(rl.history,history);        
        info['next'](rl);
    });
}

exports.createInterface = createInterface;
