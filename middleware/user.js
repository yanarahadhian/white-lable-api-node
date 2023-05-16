exports.getAllUsername = function (users) {
    let usernames = []

    users.forEach(user => {
        usernames.push(user.username)
    })

    return usernames
}

exports.randomString = function () {
    let str = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"
    let randomString = ""
    let stringLength = 8

    for(var x=0;x<stringLength;x++){
    	randomIndex = Math.floor(Math.random()*str.length)
    	randomString += str.charAt(randomIndex)
    }

    return randomString
}