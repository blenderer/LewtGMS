define([], function(){
    return {
        "name": {
            "default": "New Spell",
            "save": true
        },
        "id": {
            "callback": 0
        },
        "selected": {
            "default": false
        },
        "description": {
            "save": true,
            "default": "",
        },
        "casted": {
            "save": true,
            "default": true
        },
        "effects": {
            "save": true,
            "array": [
                {
                    "target": {
                        "default": "enemy",
                        "save": true
                    },
                    "stat": {
                        "save": true,
                        "default": "hp"
                    },
                    "amount": {
                        "save": true,
                        "default": 0
                    },
                    "duration": {
                        "save": true,
                        "default": 0
                    }
                }
            ]
        }
    }
});