const testLink = 'https://www.rightmove.co.uk/property-for-sale/find.html?locationIdentifier=REGION%5E85458&maxPrice=650000&propertyTypes=&mustHave=&dontShow=newHome&furnishTypes=&keywords='

const CurlRequest = require('curl-request');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const curl = new CurlRequest

let freeholds = []


curl.setHeaders([
  'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36'
])
.get(testLink)
.then(({ statusCode, body, headers }) => {
  const dom = new JSDOM(body)
  const refs = [...dom.window.document.querySelectorAll('.propertyCard-link')].map(d => "https://www.rightmove.co.uk" + d.href)
  
  Promise.all(refs.map(ref => {
    const getHouse = new CurlRequest
    getHouse.setHeaders([
      'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36'
    ])

    return getHouse.get(ref)
  })).then(reqs => Promise.all(
      reqs.map(req => req.body)
    ).then(bodies => bodies.forEach((b, i )=> {
      const dom = new JSDOM(b) 
      const el = dom.window.document.querySelector('#tenureType')
      const tenureType = el ? el.innerHTML.toLowerCase() : 'unknown'
      
      if (tenureType.indexOf('leasehold') <= -1) {
        // PAIR EACH REF WITH TENURE TYPE AND PUSH TO FREEHOLDS ARRAY
      }

    }))
  )
})
.catch((e) => {
  console.log('error');
});