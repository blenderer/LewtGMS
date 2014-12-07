define([], function(){
    return {
        "name": {
            "default": "New Item",
            "save": true
        },
        "id": {
            "callback": 0
        },
        "selected": {
            "default": false
        },
        "type": {
            "save": true,
            "default": null,
        },
        "modifiers": {
            "array": [
                {
                    "stat": {
                        "save": true,
                        "default": "hp"
                    },
                    "amount": {
                        "save": true,
                        "default": 0
                    },
                    "spell": {
                        "save": true,
                        "default": null
                    }
                }
            ],
            "save": true
        }
    }
});