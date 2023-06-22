import axios from 'axios'
import config from './config'
import express from 'express'
import sqlite3 from 'sqlite3'
import sha256 from 'sha256'
import { createClient, segment } from 'icqq'

const db = new sqlite3.Database('./chibotapp.db')

const app = express()

const client = createClient({ platform: config.platform })

const QWEATHER_KEY = config.QWEATHER_KEY

// template chi le
let le = 0
let start = new Date().toLocaleString()

app.get('/sendMsg', async (req, res) => {
  try {
    const group = client.pickGroup(req.query.groupid)
    let pwdsha256 = sha256(req.query.pwd)
    db.all('SELECT * FROM pwds WHERE uid = ' + req.query.sender, async (err, rows) => {
      if (!err) {
        if (rows.length === 0) {
          res.status(400).end(JSON.stringify({ status: 400, error: 'Not set user password'}))
        } else {
          if (pwdsha256 === rows[0].pwd) {
            await group.sendMsg(req.query.message + "\nchibot代发服务:本消息发送者为" + group.pickMember(parseInt(req.query.sender)).info?.nickname + '(' + req.query.sender + ')[已经经过认证]')
            res.end(JSON.stringify({ status: 200, message: 'success'}))
          } else {
            res.status(400).end(JSON.stringify({ status: 400, error: 'Invaild password'}))
          }
        }
      }
    })
  } catch (e) {
    res.status(400).end(JSON.stringify({ status: 400, error: e}))
  }
})
app.get('/getMsg', async (req, res) => {
  db.all('SELECT * FROM messages', (err, rows) => {
    if(!err) {
      res.set('Content-Type','application/json;charset=utf8')
      res.end(JSON.stringify({ status: 200, data: rows}))
    }
  })
})
app.listen(config.listen_port)

client.on("system.login.slider", function (e) {
  console.log("输入ticket：")
  process.stdin.once("data", ticket => this.submitSlider(String(ticket).trim()))
})

client.on("system.login.device", () => {
  client.logger.mark("输入密保手机收到的短信验证码后按下回车键继续。");
  client.sendSmsCode();
  process.stdin.once("data", (input) => {
    client.submitSmsCode(input.toString())
  })
})

client.login(config.qqnumber, config.password)

import maomao_quotes from './maomaoquotes'
import yddquotes from './yddquotes'
import chuang from './chuang'
import { Sendable, MessageElem } from 'icqq'
// import { group } from 'console'

client.on('system.online', async () => {
})

client.on('message.group', async (e) => {
  // 备份信息
  if (e.group_id === config.group_number) {
    db.run('INSERT INTO messages VALUES ("' + e.raw_message + '","' + e.nickname + '[' + e.sender.user_id + ']",' + e.time + ',' + e.group_id + ')', (err) => {
      if (err) {
        console.error(err)
      }
    })
  }

  if (e.group.group_id === config.group_number) { // 香子兰定制
    // const mynickname = (await e.group.getMemberMap(true)).get(client.uin)
    // chi：小东西
    const GS = Math.random()
    if (GS < 0.006) {
      e.group.sendMsg(e.message)
    }
    // if (GS > 0.006 && GS < 0.012) {
    //   e.group.sendMsg([segment.at(config.uin_numbers.bots[0] , 'ATRIbot', false), ' 贴贴']))
    //   // e.group.sendMsg('可惜大家都说我SPAM和ABUSE 都不给我贴 呜呜呜')
    // }
    if (GS > 0.0120 && GS < 0.0126) {
      e.group.sendMsg('猫猫:')
    }
    if (e.atme === true) {
      try {
        //@ts-ignore
        console.log(e.message[1].text.toString().split(' '))
        if (e.message[1].text.toString().split(' ').length !== 2 && e.message[1].text.toString().split(' ').length !== 3) return
        if (e.message[1].text.toString().split(' ')[2] === '') return
        const order = e.message[1].text.toString().split(' ')[1] || ''
        let msg:Sendable = '一个还没有实装命令功能的bot你@它干嘛，屑透了（'
        switch (order) {
          //@ts-ignore
          case ' ':
            return
          case 'getversion':
            msg = 'chibot version v0.1. Customize for ' + config.group_name
            break
          case 'homo':
            msg = '1145141919810'
            break
          case 'getcurrenttime':
            msg = (new Date().toLocaleString())
            break
          case 'getcurrentunixtime':
            msg = Math.floor((new Date().getTime()) / 1000) + ''
            break
          case 'crnmsl':
            msg = 'cr,nmsmshsa'
            break
          case 'help':
            msg = `
帮助:
getversion:获取版本信息
maomaoquotes:猫猫语录
yddquotes:ydd大佬语录
crnmsl:赞美陈睿叔叔
homo: yaj55 s1npai!
m$nm$l: 微小软件害人不浅
getcityid (cityname):使用和风天气api获取一个城市的ID(可模糊查询)
getcurrentweather (city/cityid):使用和风天气API获取cityid对应的城市当前天气(模糊查询默认显示第一个天气情况)
getmaomaosesepic:获取猫猫网盘中的涩图(二次元美图)
贴贴:模仿柏园猫猫和猫猫bot(? 只要@chibot输入命令即可食用（
WIP部分：
authenation 基于nahida-web(chiOpenID a.k.a 赤网通行证)的验证 输入您看到的验证码即可（仅私聊）
chuang 一起开创创卡车罢！
部分代码已经开源于Github，欢迎star（
地址: https://github.com/chi-net/chibot
`
            break
          case 'maomaoquotes':
            // const id =  Math.floor(Math.random() * 100)
            // 看在猫猫private feed和语音合成模型都没开源的情况下还是开猫猫语录全访问权（
            const id = Math.floor(Math.random() * maomao_quotes.length)
            msg = '#' + (id + 1) + ':'+ maomao_quotes[id]
            break
          case 'yddquotes':
            const id2 = Math.floor(Math.random() * yddquotes.length)
            msg = '#' + (id2 + 1) + ':'+ yddquotes[id2]
            break
          case 'geturl':
            try {
              //e.group.sendMsg('获取中......可能会出现发送不出来的问题')
              e.group.sendMsg('为防止滥用，已关闭此功能')
              //const res = await axios.get(e.message[1].text.toString().split(' ')[2])
              //msg = "结果：" + JSON.stringify({status: res.status,headers: res.headers,result: res.data})
              return
            } catch (e) {
              msg = 'geturl出现错误！\n' + e.message
            }
            break
          case 'getcityid':
            try {
              //@ts-ignore
              const city = e.message[1].text.toString().split(' ')[2]
              const res = await axios.get('https://geoapi.qweather.com/v2/city/lookup?key=' + QWEATHER_KEY + '&location=' + encodeURI(city))
              if (res.data.code === 404) {
                msg = '未寻找到城市！'
              } else {
                msg = '寻找到以下城市\n'
                res.data.location.forEach(element => {
                  msg += element.name + '(' + element.country + ' ' + element.adm1 + ' ' + element.adm2 + ') id:' + element.id +  '\n'
                });
              }
            } catch (e) {
              console.log(e)
              msg = '未寻找到城市或数据输入错误！'
            }
            break
          case 'getcurrentweather':
            try {
              //@ts-ignore
              const cityid = e.message[1].text.toString().split(' ')[2]
              const res1 = await axios.get('https://geoapi.qweather.com/v2/city/lookup?key=' + QWEATHER_KEY + '&location=' + encodeURI(cityid)) // 获取cityname
              console.log(res1.data)
              if (res1.data.code === '200') {
                const res = await axios.get('https://devapi.qweather.com/v7/weather/now?key=' + QWEATHER_KEY + '&location=' + res1.data.location[0].id)
                if (res.data.code === '200') {
                  msg = '目前' + res1.data.location[0].name + '(' + res1.data.location[0].country + ' ' + res1.data.location[0].adm1 + ' ' + res1.data.location[0].adm2 + ')的天气情况：\n温度:' + res.data.now.temp + '摄氏度\n体感温度:' + res.data.now.feelsLike + '摄氏度\n天气:' + res.data.now.text + '\n风向:' + res.data.now.windDir + '\n风速:' + res.data.now.windScale + '级\n湿度:' + res.data.now.humidity + '%\n当前小时累计降水量:' + res.data.now.precip + 'mm\n大气压强:' + res.data.now.pressure + 'hPa\n更新于' + res.data.now.obsTime
                } else {
                  msg = '未获取到天气情况！'
                }
              } else {
                msg = '获取城市信息时出现错误！'
              }
            } catch (e) {
              msg = '获取天气时出现错误！'
            }
            break
          case 'getmaomaosesepic':
            try {
              // const res = await axios.post(config.maomao_server)
              // console.log(res)
              // msg = '嘿嘿 喵喵\n' + config.maomao_baseurl + encodeURI(res.data.files[Math.floor(Math.random() * res.data.files.length)].name)
              msg = '本功能暂时无法使用'
            } catch (e) {
              msg = '发送请求时出现错误！'
            }
            break
          case '贴贴':
              msg = (Math.random() > 0.5)? '贴贴' :'(逃走)'
              break
          case 'm$nm$l':
              msg = '微 小 软 件 n m $ l'
              break
          case 'chuang':
              const idn = Math.floor(Math.random() * chuang.length)
              //@ts-ignore
              let a:MessageElem[] = ['今天你适合开的创创卡车是：' + chuang[idn].name]
              e.group.sendMsg(segment.image('./chuang/' + chuang[idn].img))
              msg = a
              break
          case '':
            msg = '一个还没有实装命令功能的bot你@它干嘛，屑透了（\n可以@chibot help来查看命令列表~'
            break
          default:
            msg = '未知命令，请@chibot help查看命令列表'
        }
        if (order === 'baiyuannekoshelp') return
        e.group.sendMsg('@' + e.nickname + ' ' + msg)
      } catch (error) {
        console.log(error)
        e.group.sendMsg('@' + e.nickname + ' 一个还没有实装命令功能的bot你@它干嘛，屑透了（\n可以@chibot help来查看命令列表~')
      }
    } else {
      // if (e.raw_message.indexOf('ys') !== -1 && e.raw_message.indexOf('玩') !== -1 && e.member.user_id === config.uin_numbers.chihuo) {
      //   e.group.sendMsg('@' + e.nickname + ' chihuo今天contribute了吗，作业写完了吗（\n你看人家dependabot都比你氵的勤快，还要玩ys\n发自chibot')
      // } // for chihuo2104 ys
      // // console.log(e.message[0])
      // if ((e.raw_message.indexOf('乐') !== -1 || (e.message[0].type === 'image' && e.message[0].file === 'd1ef847efb1e0d6a407a4a893ef893df48546-297-129.png'))&& e.member.user_id === config.uin_numbers.chihuo) {
      //   le += 1
      //   if (Math.random() < 0.02) {
      //     e.group.sendMsg('@' + e.nickname + ' chihuo你又乐了啊，ja学了吗（猫猫：我只是希望你能够好好读书）\n发自chibot')
      //     e.group.sendMsg('自从' + start + '以来，chi乐了' + le + '次')          
      //   }
      // } // for chihuo2104 乐
      // // if (e.raw_message === 'chi乐了几次') {
      //   // e.group.sendMsg('自从' + start + '以来，chi乐了' + le + '次')    
      // // }
      // // if (e.raw_message.indexOf('有钱') !== -1 && e.member.user_id !== config.uin_numbers.chihuo) {
      //   le += 1
      //   e.group.sendMsg('@' + e.nickname + ' 您！chibot和chihuo都是没钱钱的呜呜呜\n发自chibot')
      // } // for others 有钱
      // let name = ''
      // const uin = e.member.user_id
      // if (uin === config.uin_numbers.chihuo) {
      //   name = 'chihuo'
      // } else if (uin === config.uin_numbers.lzy) {
      //   name = 'byn'
      // } else if (uin === config.uin_numbers.sci) {
      //   name = 'sci'
      // } else if (uin === config.uin_numbers.mzw) {
      //   name = 'mzw'
      // } else if (uin === config.uin_numbers.maomao) {
      //   name = '猫猫'
      // } else if (uin === config.uin_numbers.so1ve) {
      //   name = 'so1ve'
      // } else if (uin === config.uin_numbers.bots[0] || uin === config.uin_numbers.bots[2] || uin === config.uin_numbers.bots[3] || uin === config.uin_numbers.bots[1]) {
      //   return
      // } else {
      //   name = e.nickname
      // }
      // if (e.raw_message.indexOf('鸟白岛') !== -1 || e.raw_message.indexOf('鳥白島') !== -1 || e.raw_message.indexOf('とりしろじま') !== -1) { // for maomao mzw lzy nbd
      //   if (uin ===  config.uin_numbers.ydd[0] || uin === config.uin_numbers.ydd[1]) {
      //     e.group.sendMsg('@' + e.nickname + 'ydd大佬，您太巨了，竟然在玩鸟白岛')
      //     return
      //   }
      //   e.group.sendMsg('@' + e.nickname + ' ' + name + '今天contribute了吗，还玩鸟白岛\n发自chibot')
      // }
      // if ((e.raw_message.toLowerCase().indexOf('mc') !== -1 || e.raw_message.toLowerCase().indexOf('minecraft') !== -1) && (e.raw_message.indexOf('服') !== -1 || e.raw_message.indexOf('玩') !== -1)) { // for everyone mc
      //   let name = ''
      //   const uin = e.member.user_id
      //   if (uin ===  config.uin_numbers.ydd[0] || uin === config.uin_numbers.ydd[1]) {
      //     e.group.sendMsg('@' + e.nickname + 'ydd大佬，您太巨了，竟然在玩mc')
      //     return
      //   }
      //   e.group.sendMsg('@' + e.nickname + ' ' + name + '今天contribute了吗，还玩mc\n发自chibot')
      // }
      // if((e.raw_message.indexOf('草') !== -1 || e.raw_message.indexOf('趴') !== -1) && (e.member.user_id === config.uin_numbers.ydd[0] || e.member.user_id === config.uin_numbers.ydd[1])) { // for ydd dalao
      //   e.group.sendMsg('ydd大佬，您太巨了!\n发自chibot')
      // }
    }
  }
})
client.on('message.private', (e) => {
  if (e.raw_message.includes('setpassword')) {
    if (e.raw_message.split(' ').length !== 2) {
      e.reply('你还没有输入密码！')
    } else {
      try {
        db.all('SELECT * FROM pwds WHERE uid =' + e.sender.user_id, (err, rows) => {
          if (!err) {
            if (rows.length === 0 ) {
              db.run('INSERT INTO pwds VALUES (' + e.sender.user_id + ',"' + e.raw_message.split(' ')[1] + '")', (err) => {
                if (!err) {
                  e.reply('密码设置成功！')
                } else throw err
              })
            } else {
              db.run('UPDATE pwds SET pwd = "' + e.raw_message.split(' ')[1] + '" WHERE uid = ' + e.sender.user_id, (err) => {
                if (!err) {
                  e.reply('密码设置成功！')
                } else throw err
              })
            }
          } else throw err
        })
      } catch (e) {
        console.error(e)
      }
    }
  }
  if (e.raw_message.includes('passwordhelp')) {
    e.reply('密码设置请使用 setpassword [您密码的sha256形式]')
  }
})