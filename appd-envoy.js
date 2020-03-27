'use strict';

// AppDynamics will be configured through env vars
// 

module.exports = function(config) {
    var appdDebug = false
    // var appdReuseNodePrefix = "droid"

    if (process.env.PREVIEW_APP == "true") {
        console.log("appd-envoy: preview app, appdynamics agent not enabled")
    } else {
        if (process.env.APPDYNAMICS_AGENT_ENABLED == 'true' )
        {
            if ( typeof process.env.OCT_VAULT_SHARED_READ_APPDYNAMICS_ACCOUNTNAME == "undefined" ) {
                console.log("appd-envoy: OCT_VAULT_SHARED_READ_APPDYNAMICS_ACCOUNTNAME not set")
            } else {
                if (typeof process.env.APPDYNAMICS_AGENT_DEBUG != "undefined") {
                    appdDebug = process.env.APPDYNAMICS_AGENT_DEBUG
                }
                else if (typeof config.debug != "undefined") {
                    appdDebug = config.debug
                }

                if (appdDebug) { console.log("appdDebug: ", appdDebug, "\n") }

                const fs = require('fs')
                const os = require('os')
            
                try {
                    var containerId = fs.readFileSync('/proc/self/cgroup').toString().split("\n").sort(function (a, b) {
                        return parseInt(a.split(":")[0]) - parseInt(b.split(":")[0])
                    })[0].split("/")[2].substr(0, 12)
                    process.env.APPDYNAMICS_AGENT_UNIQUE_HOST_ID = containerId
                    process.env.UNIQUE_HOST_ID = containerId
                    if (appdDebug) {
                        console.log("[appd-envoy] APPDYNAMICS_AGENT_UNIQUE_HOST_ID:", process.env.APPDYNAMICS_AGENT_UNIQUE_HOST_ID)
                        console.log("[appd-envoy] UNIQUE_HOST_ID:", process.env.UNIQUE_HOST_ID)
                    }
                    var nodeName = os.hostname().split(".")[0]

                    var re = "/user|pass|key|secret|private|token|salt|auth|hash/i"
                    require("appdynamics").profile({
                        controllerHostName: process.env.OCT_VAULT_SHARED_READ_APPDYNAMICS_CONTROLLERHOSTNAME,
                        controllerPort: process.env.OCT_VAULT_SHARED_READ_APPDYNAMICS_CONTROLLERPORT,
                        controllerSslEnabled: process.env.OCT_VAULT_SHARED_READ_APPDYNAMICS_CONTROLLERSSLENABLED,
                        accountName: process.env.OCT_VAULT_SHARED_READ_APPDYNAMICS_ACCOUNTNAME,
                        accountAccessKey: process.env.OCT_VAULT_SHARED_READ_APPDYNAMICS_ACCOUNTACCESSKEY,
                        tierName: process.env.AKKERIS_DEPLOYMENT,
                        nodeName: nodeName,
                        uniqueHostId: containerId,
                        debug: appdDebug,
                        reuseNode: false,
                        noNodeNameSuffix: true,
                        dataFilters: [
                            {
                                "appliesTo": "env-vars",
                                "matchPattern": re
                            },
                            {
                                "appliesTo": "http-headers",
                                "matchPattern": re
                            }
                        ],
                        urlFilters: [{
                            "delimiter": "/",
                            "segment": 1,
                            "matchPattern": "/\@/",
                            "paramPattern": re
                        }],
                        logging: {
                            logfiles: [{
                                outputType: 'console'
                            }]
                        }
                    });
                    console.log("Started appdynamics agent for: %s-%s-%s\n", process.env.APPDYNAMICS_AGENT_APPLICATION_NAME, process.env.AKKERIS_DEPLOYMENT, nodeName)
                } catch (err) {
                    console.error("error configuring appdynamics agent")
                    console.error(err)
                }
            }
        }
    }
    return this
}
