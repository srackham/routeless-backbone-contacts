{exec,spawn} = require 'child_process'

task 'server', 'Start mongoose server', ->
    console.log 'starting mongoose web server...'
    server = spawn 'mongoose', [],
        customFds: [process.stdin, process.stdout, process.stderr]
    process.exit()

task 'test', 'Run tests', ->
    console.log 'starting mongoose web server...'
    server = spawn 'mongoose'
    console.log 'starting tests...'
    exec 'python test/test.py', (err, stdout, stderr) ->
        throw err if err
        console.log stdout + stderr
        server.kill()   # and exit cake.

