(function() {
    'use strict';



    var   Class         = require('ee-class')
        , log           = require('ee-log')
        , assert        = require('assert')
        , ORM           = require('../')
        , v8            = require('v8')
        , fs            = require('fs')
        , project       = require('ee-project');


    let orm = new ORM(require('../config.js').db);
    let calls = 0;
    let start;
    let last;
    let now;




    setInterval(() => {
        if (!start) start = v8.getHeapStatistics();
        last = now || v8.getHeapStatistics();
        now = v8.getHeapStatistics();


        let out = [Date.now(), now.used_heap_size/1000, (now.used_heap_size-start.used_heap_size)/1000, (now.used_heap_size-last.used_heap_size)/1000, calls, ((now.used_heap_size-start.used_heap_size)/1000)/calls];
        fs.appendFile(__dirname+'/update.csv', `${out.join(',')}\n`);


        log.warn(`--------- ${calls} calls ----------`);
        log.info(`used:       ${now.used_heap_size/1000}`);
        log.info(`diff start: ${(now.used_heap_size-start.used_heap_size)/1000}`);
        log.info(`diff last:  ${(now.used_heap_size-last.used_heap_size)/1000}`);
        //log(v8.getHeapStatistics());

        if (calls > 1000000) process.exit();
    }, 1000);








    orm.load().then((err) => {
        let db = orm.related_test_postgres;            



        let update = () => {
            db.event('*').limit(1).getVenue('*').findOne().then((data) => {

                data.startdate = new Date();
                data.title = `updated-${Math.random()}`;
                return data.save();
            }).then(() => {
                calls++;

                setTimeout(update, 20);
            }).catch(log);
        }


        update();
    }).catch(log);
})();    
