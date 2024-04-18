
// configuration for hoyolab hsr check in
var cookie = ""

// configuration for telegram notification
var telegram_token_bot = ""
var telegram_userid = ""

var user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0"
var act_id = "e202303301540311"

function telegram_notification(message) {
    UrlFetchApp.fetch(`https://api.telegram.org/bot${telegram_token_bot}/sendmessage`, {
        "method": "post",
        "payload": {
            "chat_id": telegram_userid,
            "text": message
        }
    })
    console.log(res)
}

function get_info() {
    var res = UrlFetchApp.fetch(`https://sg-public-api.hoyolab.com/event/luna/os/info?act_id=${act_id}`, {
        'method': 'get',
        'headers': {
            'cookie': cookie,
            'user-agent': user_agent
        }
    })
    parser = JSON.parse(res.getContentText())
    if (parser.retcode !== 0) {
        console.log(res.getContentText())
        throw new Error(`error : ${parser.message}`)
    }

    return parser
}

function get_reward() {
    var res = UrlFetchApp.fetch(`https://sg-public-api.hoyolab.com/event/luna/os/home?act_id=${act_id}`, {
        'method': 'get',
        'headers': {
            'cookie': cookie,
            'user-agent': user_agent
        }
    })
    parser = JSON.parse(res.getContentText())
    if (parser.retcode !== 0) {
        console.log(res.getContentText())
        throw new Error(`error : ${parser.message}`)

    }

    return parser.data.awards
}

function daily_checkin() {
    var data = {
        "act_id": act_id,
        "lang": "en-us"
    }
    var res = UrlFetchApp.fetch("https://sg-public-api.hoyolab.com/event/luna/os/sign", {
        "method": "post",
        "headers": {
            "cookie": cookie,
            "user-agent": user_agent
        },
        "payload": JSON.stringify(data)
    })
    parser = JSON.parse(res.getContentText())
    if (parser.retcode !== 0) {
        console.log(res.getContentText())
        throw new Error(`error : ${parser.message}`)
    }

    return true
}

function run() {
    var info = get_info()
    var today = info.data.today
    var is_sign = info.data.is_sign
    if (is_sign) {
        var text = "You already checkin today !"
    } else {
        var daily = daily_checkin()
        if (daily) {
            var total = info.data.total_sign_day
            var data = get_reward()
            var today_reward = data[total].name
            var qtt = data[total].cnt
            var text = `Checkin successfully!\nDate : ${today}\nToday Reward : ${today_reward}\nQuantity : ${qtt}`

        }
    }
    console.log(text)
    if (telegram_token_bot.length <= 0 || telegram_userid.length <= 0) {
        console.log("skip telegram notification !")
        return
    }
    telegram_notification(text)
}