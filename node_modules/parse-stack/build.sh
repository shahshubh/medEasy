rm -f lib/*
coffee -cbo lib/ src/

component build -s parse-stack -o . -n parse-stack

coffee -cb src/ test/
browserify test/*.js > test/browser/tests.js
rm src/*.js test/*.js
