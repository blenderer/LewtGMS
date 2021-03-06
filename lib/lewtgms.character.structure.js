define([], function(){
    return {
        "name": {
            "default": "New Character",
            "save": true
        },
        "id": {
            "callback": 0
        },
        "job": {
            "default": "Innkeeper",
            "save": true
        },
        "stats": {
            "array": [
                {
                    "stat": {
                        "save": true,
                        "default": "luk"
                    },
                    "max": {
                        "save": true,
                        "default": 0
                    },
                    "current": {
                        "save": true,
                        "default": 0
                    }

                }
            ],
            "save": true
        },
        "items": {
            "array": [
                {
                    "item": {
                        "save": true,
                        "default": "rock"
                    }
                }
            ],
            "save": true
        },
        "selected": {
            "default": false
        }
    }
});