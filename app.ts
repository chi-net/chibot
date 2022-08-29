import axios from 'axios'
import config from './config'
import { createClient, segment } from 'oicq'

const client = createClient(config.qqnumber, { platform: config.platform })

const QWEATHER_KEY = config.QWEATHER_KEY

client.on("system.login.slider", function (e) {
  console.log("输入ticket：")
  process.stdin.once("data", ticket => this.submitSlider(String(ticket).trim()))
}).login(config.password)

import maomao_quotes from './maomaoquotes'
import yddquotes from './yddquotes'

client.on('message.group', async (e) => {
  if (e.group.group_id === config.group_number) { // 香子兰定制
    // const mynickname = (await e.group.getMemberMap(true)).get(client.uin)
    if (e.atme === true) {
      if (e.sender.user_id === config.uin_numbers.bots[0] || e.sender.user_id === config.uin_numbers.bots[1] || e.sender.user_id === config.uin_numbers.bots[2]) return
      try {
        console.log(e.message[1].text.toString().split(' '))
        const order = e.message[1].text.toString().split(' ')[1] || ''
        let msg = '一个还没有实装命令功能的bot你@它干嘛，屑透了（'
        switch (order) {
          case 'getversion':
            msg = 'chibot version v0.1-alpha. Customize for ' + config.group_name
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
            msg = '帮助:\nhomo:你懂的\ngetversion:获取chibot版本信息\ngetcurrentunixtime:获取当前unix时间戳\ngetcurrenttime:获取当时时间\nmaomaoquotes:(高科技)猫猫语录\nyddquotes:ydd大佬语录\ncrnmsl:赞美陈睿叔叔\ngeturl (URL):获取一个URL地址的数据\ngetcityid (cityname):使用和风天气api获取一个城市的ID(可模糊查询)\ngetcurrentweather (city/cityid):使用和风天气API获取cityid对应的城市当前天气(模糊查询默认显示第一个天气情况)\ngetmaomaosesepic:获取(高科技)猫猫网盘中的涩图(二次元美图)\nbaiyuannekoshelp:救救柏园猫猫(x\n只要@chibot输入命令即可食用（\n部分代码已经开源于Github，欢迎star（\n地址: https://github.com/chi-net/chibot'
            break
          case 'maomaoquotes':
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
              const res = await axios.post(config.maomao_server)
              // console.log(res)
              msg = '嘿嘿 喵喵\n' + config.maomao_baseurl + encodeURI(res.data.files[Math.floor(Math.random() * res.data.files.length)].name)
            } catch (e) {
              msg = '发送请求时出现错误！'
            }
            break
          case 'baiyuannekoshelp':
              msg = '我是柏园猫，现在被高科技猫猫绑架，现在v下面这个二维码50，救我出来，等我出来一定让你当baiyuan works设计总监（x\n救救chihuo罢(bushi)\n'
              const str = '@' + e.nickname + ' ' + msg
              const res = await e.group.sendMsg([str , segment.image('payforbaiyuanneko.png')])
              console.log(res)
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
      if (e.raw_message.indexOf('ys') !== -1 && e.raw_message.indexOf('玩') !== -1 && e.member.user_id === config.uin_numbers.chihuo) {
        e.group.sendMsg('@' + e.nickname + ' chihuo今天contribute了吗（\n你看人家dependabot都比你氵的勤快，还要玩ys\n发自chibot')
      } // for chihuo2104 ys
      let name = ''
      const uin = e.member.user_id
      if (uin === config.uin_numbers.chihuo) {
        name = 'chihuo'
      } else if (uin === config.uin_numbers.lzy) {
        name = 'lzy'
      } else if (uin === config.uin_numbers.sci) {
        name = 'sci'
      } else if (uin === config.uin_numbers.mzw) {
        name = 'mzw'
      } else if (uin === config.uin_numbers.maomao) {
        name = '猫猫'
      } else if (uin === config.uin_numbers.so1ve) {
        name = 'so1ve'
      } else if (uin === config.uin_numbers.bots[0] || uin === config.uin_numbers.bots[2] || uin === config.uin_numbers.bots[3] || uin === config.uin_numbers.bots[1]) {
        return
      } else {
        name = e.nickname
      }
      if (e.raw_message.indexOf('鸟白岛') !== -1 || e.raw_message.indexOf('鳥白島') !== -1 || e.raw_message.indexOf('とりしろじま') !== -1) { // for maomao mzw lzy nbd
        if (uin ===  config.uin_numbers.ydd[0] || uin === config.uin_numbers.ydd[1]) {
          e.group.sendMsg('@' + e.nickname + 'ydd大佬，您太巨了，竟然在玩鸟白岛')
          return
        }
        e.group.sendMsg('@' + e.nickname + ' ' + name + '今天contribute了吗，还玩鸟白岛\n发自chibot')
      }
      if ((e.raw_message.toLowerCase().indexOf('mc') !== -1 || e.raw_message.toLowerCase().indexOf('minecraft') !== -1) && (e.raw_message.indexOf('服') !== -1 || e.raw_message.indexOf('玩') !== -1)) { // for everyone mc
        let name = ''
        const uin = e.member.user_id
        if (uin ===  config.uin_numbers.ydd[0] || uin === config.uin_numbers.ydd[1]) {
          e.group.sendMsg('@' + e.nickname + 'ydd大佬，您太巨了，竟然在玩mc')
          return
        }
        e.group.sendMsg('@' + e.nickname + ' ' + name + '今天contribute了吗，还玩mc\n发自chibot')
      }
      if((e.raw_message.indexOf('草') !== -1 || e.raw_message.indexOf('趴') !== -1) && (e.member.user_id === config.uin_numbers.ydd[0] || e.member.user_id === config.uin_numbers.ydd[1])) { // for ydd dalao
        e.group.sendMsg('ydd大佬，您太巨了!\n发自chibot')
      }
    }
  }
})
