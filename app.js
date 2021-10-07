const pm2 = require('pm2')
const dotenv = require('dotenv')
const axios = require('axios')
dotenv.config();
let { SLACK_GATEWAY } = process.env

class App{

    constructor(){
        this.minutes = 3
        this.mili = this.minutes * ( 60 ) * (1000)
    }

    Notify = ( data ) => axios.post( SLACK_GATEWAY, data )
    
    Every = (mili, callback) => setInterval( callback, mili )

    GetApps = () => {
        return new Promise( (done, _) => {
            pm2.list((err, list) => {
                if(err) {
                    return done([])
                }
                if(!list.length) {
                    return done([])
                }
                let temp = []
                list.forEach( proc => temp.push(proc.name) )
                return done(temp)
            })
        })
    }

    async Main(){
        let apps = await this.GetApps() 
        console.log('apps => ',apps)
        this.Every(this.mili, function () {
            apps.forEach( function(name) {
                pm2.describe(name, function (err, data){

                    if(err) {
                        console.err('ERR ->', err)
                    }
                    let { status } = data[0].pm2_env
                    if( status === 'online' ) return
                    this.Notify({
                        "attachments": [
                            {
                                "fallback": `${name} APP IS IN ${status} STATUS ⚠️`, 
                                "color": "#e61010",
                                "pretext": `${name} APP IS IN ${status} STATUS ⚠️`, 
                                "author_name": "Ming",
                                "title": name,
                                "text": name,
                                "fields": [
                                    {
                                        "title": "STATUS",
                                        "value": status,
                                        "short": false
                                    }
                                ],
                                "image_url": "http://my-website.com/path/to/image.jpg",
                                "thumb_url": "http://example.com/path/to/thumb.png",
                                "footer": "Slack API",
                                "footer_icon": "https://platform.slack-edge.com/img/default_application_icon.png",
                                "ts": new Date().getTime()
                            }
                        ]
                    })
                }.bind(this))
            }.bind(this))
        }.bind(this)) 
    }

}

let app = new App()
app.Main();


