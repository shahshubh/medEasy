var rl = require('readline-history');
rl.createInterface({
    path: "test.log",
    maxLength: 0x10,
    input: process.stdin,
    output: process.stdout,
    next: function(rl) {
        console.log("Got a history enabled readline interface!");
        rl.setPrompt("? ");
        rl.prompt();
        rl.on('line',function(line) {
            console.log("Woo woo woo "+line);
            rl.prompt();
        });
    }
});
