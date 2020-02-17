const testLink = 'https://www.rightmove.co.uk/property-for-sale/find.html?locationIdentifier=REGION%5E85458&maxPrice=650000&propertyTypes=&mustHave=&dontShow=newHome&furnishTypes=&keywords='


const CurlRequest = require('curl-request');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const curl = new CurlRequest
var Promise = require("bluebird");
let freeholds = []

let val = 0


curl.setHeaders([
  'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36'
])
.get(testLink)
.then(({ body }) => {
  const dom = new JSDOM(body)
  const refs = [...dom.window.document.querySelectorAll('.propertyCard-link')].map(d => "https://www.rightmove.co.uk" + d.href)
  
  Promise.all(refs.map(ref => {
    const getHouse = new CurlRequest
    getHouse.setHeaders([
      'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36', `Content-Type: ${ref}`
    ])

    return Promise.props({ request: getHouse.get(ref), ref })
  })).then(reqs => {
    Promise.all(
      reqs.map(req => ({ body: req.request.body, ref: req.ref }))
    ).then(objects => objects.forEach(o => {

        const dom = new JSDOM(o.body)
        const tenureDescription = dom.window.document.querySelector('#tenureType')
        const list = dom.window.document.querySelector('.list-style-square')

        const squareList = list ? [...list.querySelectorAll('li')].map(li => li && li.innerHTML.trim().toLowerCase()) : []
        const isLeaseHoldFromList = squareList.filter(d => d.indexOf('leasehold') > -1 || d.indexOf('lease hold') > -1).length > 0
        const freeholdList = squareList.filter(d => d.indexOf('freehold') > -1 || d.indexOf('free hold') > -1)
        
        const isFreeHoldFromList = freeholdList.length > 0
        const freeHoldType = isFreeHoldFromList ? freeholdList[0] : null

        const tenureType = tenureDescription ? tenureDescription.innerHTML.toLowerCase() : 'unknown'

        const isLeaseHold = isLeaseHoldFromList || tenureType.indexOf('leasehold') > -1 || tenureType.indexOf('lease hold') > -1 
        
        if (isLeaseHold === false) {
          freeholds.push({ id: val + 1, link: o.ref, tenure: freeHoldType ? freeHoldType : tenureType })
          val++
        }

      })
      
  ).then(() => console.log(freeholds))
    })
})
.catch((e) => {
  console.log(e);
});