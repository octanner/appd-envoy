'use strict';

// AppDynamics will be configured through env vars
// 

module.exports = function(config) {
    var appdDebug = false
    var appdReuseNodePrefix = "dyno"

    if (process.platform == 'linux') {
        if (typeof config.debug != "undefined") {
            appdDebug = config.debug
        } else {
            appdDebug = false
        }
        
        console.log("appdDebug: ", appdDebug, "\n")
        if (typeof config.nodePrefix != "undefined") {
            appdReuseNodePrefix = config.nodePrefix
        }

        require("appdynamics").profile({
            debug: appdDebug,
            reuseNode: false,
            // reuseNodePrefix: appdReuseNodePrefix,
            controllerSslEnabled: true,
            dataFilters: [{
                "appliesTo": "env-vars",
                "matchPattern": "user|pass|key|secret|private|token|salt|auth|hash|key}"
            }],
            urlFilters: [{
                "delimiter": "/",
                "segment": 1,
                "matchPattern": "\@",
                "paramPattern": ""
            }],
            logging: {
                logfiles: [{
                    outputType: 'console'
                }]
            }
        });
        console.log("Started appdynamics agent for: %s-%s-%s\n", process.env.APPDYNAMICS_AGENT_APPLICATION_NAME, process.env.APPDYNAMICS_AGENT_TIER_NAME, appdReuseNodePrefix)
    }
    return this
}
