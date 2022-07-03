/**
 * 一个自动滚动截图的脚本
 */

/**
 * Puppeteer 功能：
 *    支持分布式爬取
 *    实现了深度优先和广度优先算法
 *    支持csv和ljson line格式导出
 *    插件式的结果存储，比如支持redis
 *    自动插入jquery,可以使用jqueryi语法进行结果处理
 *    支持截图作为爬取证据
 *    支持模拟不同的设备
 */

/**
 * 步骤：
 * 1.通过 npm install pnpm -g 安装pnpm (下面的npm包因为自带浏览器，所以大小为100MB)
 * 2.在项目内通过 pnpm add puppeteer 安装Puppeteer
 * 3.执行 tsc -init 创建 tsconfig.json
 * 4.导入puppeteer包，编写代码
 * 5.通过 ts-node index.ts 运行程序，完成截图
 */

/**
 * 遇到问题：
 * 1.tsconfig.json未创建，报错
 * 2.搜索后首屏数据在截图时也未加载出来(加段延时)
 * 3.滚动时未延时，截取的图片大部分为空白(滚动间隙加延时)
 */
import puppeteer from "puppeteer";

// sleep 延时函数
const sleep = (time: number) => {
  return new Promise((resolve,reject) => {
    setTimeout(resolve, time)
  })
}

(async () => {
  /**
   * 1.launch
   * 通过launch生成一个'浏览器'实例,
   * option中的headless是个布尔值，如果是false的话就会看到一个浏览器，从打开到完成，整个任务的全过程，默认是true，也就是在后台
   * 自动完成任务
   */
    const borwser = await puppeteer.launch({
      headless: false,
      // defaultViewport、args 设置为全屏，默认不是全屏
      defaultViewport: null,
      args: ['--start-maximized']
    })

    // newPage 打开一个新的标签页
    const page = await borwser.newPage()

    // goto 默认文本跳转到对应的页面
    await page.goto('https://jd.com')

    // focus 输入框聚焦，#key输入框对应的id
    await page.focus('#key')

    // sendCharacter 往输入框输入的内容 'iphone13'
    await page.keyboard.sendCharacter('iphone13')

    // click 点击搜索按钮
    await page.click('.button')

    // waitForSelector 等待元素加载完成，为了截图全屏有数据
    await page.waitForSelector('.gl-item')

    // 首屏部分数据未加载完
    await sleep(1000)

    // 开始自动滚动
    let isScroll = true;
    // 每次滚动500
    let steep = 500;

    while(isScroll) {

      // 到底停止滚动
      // evaluate 里面的代码将会在浏览器执行, 将node环境下的参数传入进去，如：steep
      // steep 接收参数
      isScroll = await page.evaluate((steep) => {

        // 滚动条距离顶部的距离, 0兜底
        let scrollTop = document.scrollingElement?.scrollTop ?? 0;

        // ! 非空断言
        document.scrollingElement!.scrollTop = scrollTop + steep;

        // clientHeight 总高度(此处为页面总高度)
        // 766 电脑首屏高度
        // 是否滚动到底
        return document.body.clientHeight > scrollTop + 766 ? true : false

        // steep 传参
      }, steep)

      // 每次滚动延迟500ms，给数据加载时间(单页面应用)
      await sleep(500)
    }

    // screenshot 截图全屏, path 截图保存后的名称, fullPage 是否截全屏
    await page.screenshot({path: 'iphone13.png', fullPage: true})
})()
