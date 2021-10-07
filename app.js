const pm2 = require('pm2')
const dotenv = require('dotenv')
const axios = require('axios')
dotenv.config();
let { SLACK_GATEWAY } = process.env

class App{

    constructor(){
        this.minutes = 5
        this.mili = 1000 //this.minutes * ( 60 ) * (1000)
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
        this.Every(this.mili, function () {
            apps.forEach( function(name) {
                pm2.describe(name, function (err, data){
                    if(err) {
                        console.err('ERR ->', err)
                    }
                    let { status } = data[0].pm2_env
                    this.Notify( JSON.stringify({ 'text' : 'ola' }) )

                }.bind(this))

            }.bind(this))
        }.bind(this)) 
    }


}

let app = new App()
app.Main();


