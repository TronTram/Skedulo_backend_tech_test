const path = require('path');
const utils = require('./utils');
async function optimalSchedule () {
    try {
        const filePath = process.argv.slice(2)[0];
        const optimalFileName = filePath.replace(".json", ".optimal.json");;
        const listActs = await utils.readFile(filePath);
        let objTimes = {};
        listActs.forEach(act => {
            const { band, start, finish, priority } = act;
            if (!objTimes.hasOwnProperty(start)) {
                objTimes[start] = {
                    band,
                    stage: 0,
                    priority,
                    time: start
                }
            }
            if (objTimes.hasOwnProperty(start) && Number(objTimes[start].priority) < Number(priority)) {
                objTimes[start].band = band;
                objTimes[start].priority = priority;
            }

            if (objTimes.hasOwnProperty(start) && Number(objTimes[start].priority) === Number(priority)) {
                objTimes[start].isSameEvent = band;
            }

            if (!objTimes.hasOwnProperty(finish)) {
                objTimes[finish] = {
                    band,
                    stage: 1,
                    priority,
                    time: finish
                }
            }
        });

        const timesSorted = Object.keys(objTimes).sort((a, b) => {
            return new Date(a).getTime() - new Date(b).getTime();
        });
        const listActsSorted = timesSorted.map(function (time) {
            return { ...objTimes[time] }
        });

        const optimalSchedule = [];
        let nextActStartTime = '';

        while (listActsSorted.length > 0) {
            const { band, stage, time, priority } = listActsSorted.shift();
            if (optimalSchedule.length === 0 ) {
                optimalSchedule.push({
                    band,
                    start: time,
                    priority
                })
            } else {
                const finalAct = optimalSchedule[optimalSchedule.length - 1];
                if (finalAct.band !== band) {
                    if (finalAct.hasOwnProperty('finish') && stage === 0) {
                        optimalSchedule.push({
                            band,
                            start: time,
                            priority
                        })
                        continue;
                    }
                    if (finalAct.hasOwnProperty('finish') && stage === 1) {
                        optimalSchedule.push({
                            band,
                            start: optimalSchedule[optimalSchedule.length - 1].finish,
                            finish: time
                        })
                    }

                    if (!finalAct.hasOwnProperty('finish') && stage === 0 && finalAct.priority < priority) {
                        optimalSchedule[optimalSchedule.length - 1].finish = time;
                        optimalSchedule.push({
                            band,
                            start: time,
                            priority
                        })
                        continue;
                    }
                    
                } else {
                    if (stage === 1) {
                        optimalSchedule[optimalSchedule.length - 1].finish = time;
                    }
                }
            }
        }
        
        const result = optimalSchedule.map(function(act) {
            if (act.hasOwnProperty('priority')) delete act.priority
            return act;
        })
        await utils.writeFile(optimalFileName, JSON.stringify(result));
    } catch (error) {
        console.log(error.message)
    }
}
optimalSchedule();


