import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});
const BASE='http://127.0.0.1:8765/';
const results=[];
try{
 for(const viewport of [{width:390,height:844},{width:768,height:1024},{width:1280,height:800}]){
  const page=await browser.newPage({viewport,deviceScaleFactor:1,hasTouch:viewport.width<1200});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  try{
   await page.goto(BASE+'index.html?menu-railway-test='+viewport.width,{waitUntil:'domcontentloaded'});
   await page.locator('#start:not(.hidden) #stCards .stCard').first().waitFor({timeout:12000});
   assert.equal(await page.locator('#start .dispatchHero').count(),1);
   assert.equal(await page.locator('#start .dispatchTrackDiagram').count(),1);
   assert.equal(await page.locator('#modeStellwerk').count(),1);
   assert.equal(await page.locator('#modeBuild').count(),1);
   assert.equal(await page.locator('#start .modeChoice').count(),2);
   assert.equal(await page.locator('#start button:has-text("Tycoon")').count(),0);
   assert.equal(await page.locator('#btnTycoon').count(),0);
   assert.equal(await page.locator('#modeTycoon').count(),0);
   assert.equal(await page.locator('#stGo').isVisible(),true);
   assert.equal(await page.locator('#stCards .stCard').count()>=4,true);
   const overflowInfo=await page.evaluate(()=>{
     const e=document.getElementById('start'),bounds=e.getBoundingClientRect();
     const offenders=[...e.querySelectorAll('*')].map(el=>({tag:el.tagName,cls:el.className?.baseVal??el.className,
       id:el.id,right:Math.round(el.getBoundingClientRect().right),left:Math.round(el.getBoundingClientRect().left),
       scroll:el.scrollWidth,client:el.clientWidth}))
       .filter(o=>o.right>bounds.right+5||o.left<bounds.left-5||o.scroll>o.client+5).slice(0,30);
     return {has:e.scrollWidth>e.clientWidth+5,width:e.clientWidth,scroll:e.scrollWidth,offenders};
   });
   assert.equal(overflowInfo.has,false,'Menu has horizontal overflow at '+viewport.width+': '+JSON.stringify(overflowInfo));
   assert.equal(await page.locator('#start .dispatchTrackDiagram').isVisible(),true);
   if(viewport.width===390)assert.equal(await page.locator('#start .modeChoice').first().evaluate(e=>Math.round(e.getBoundingClientRect().width)>300),true);
   await page.screenshot({path:'menu-'+viewport.width+'.png',fullPage:false});
   // Start actual station and open the in-game overlay.
   await page.locator('#stGo').click();
   await page.locator('#start.hidden').waitFor({timeout:12000});
   await page.locator('#btnMenu').click();
   await page.locator('#menu.open').waitFor({timeout:5000});
   assert.equal(await page.locator('#menu .dispatchMenuHead').count(),1);
   assert.equal(await page.locator('#menu .menuAspectLegend span').count(),3);
   assert.equal(await page.locator('#menu button:has-text("Tycoon")').count(),0);
   assert.equal(await page.locator('#btnEditor').count(),1);
   assert.equal(await page.locator('#btnHome').count(),1);
   await page.locator('#btnMenuClose').click();
   assert.equal(await page.locator('#menu.open').count(),0);
   assert.deepEqual(errors,[], 'Uncaught JS errors at '+viewport.width);
   results.push({width:viewport.width,overlay:true,menu:true,tycoonAbsent:true,overflow:false});
  }finally{await page.close();}
 }
 const legacy=await browser.newPage();
 await legacy.goto(BASE+'tycoon.html',{waitUntil:'domcontentloaded'});
 await legacy.waitForURL('**/index.html',{timeout:8000});
 assert.match(legacy.url(),/index\.html$/);
 await legacy.close();
 assert.ok(!existsSync('android-app/www/tycoon.html'));
 assert.ok(!existsSync('android-app/www/tycoon-engine.js'));
 console.log(JSON.stringify({passed:true,results,legacyRedirect:true,androidTycoonExcluded:true}));
}finally{await browser.close();}
