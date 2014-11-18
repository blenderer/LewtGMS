define([], function(){
    return {
        "name": {
            "default": "New Job",
            "save": true
        },
        "statpriority": {
            "array": [
                {
                    "short": {
                        "save": true
                    }
                }
            ],
            "save": true
        },
        "secondaries": {
            "array": [
                {
                    "stat": {
                        "save": true
                    },
                    "min": {
                        "save": true
                    },
                    "max": {
                        "save": true
                    }
                }
            ]
        },
        "selected": {
            "default": false
        },
        "id": {
            "callback": 0
        }
    }
});