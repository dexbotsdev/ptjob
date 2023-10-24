import Parse from 'parse/node.js';
import axios from 'axios'
import { getChainId } from './getScanLink.js';
import cron from 'node-cron'
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

Parse.initialize("JOOSAPPS", "K9S3H8I7T0IG6A5R4B2H1A$313#414");
Parse.serverURL = 'http://139.84.133.61:1337/parse' 
const MyTrades = Parse.Object.extend("MyTrades");

const getQuoteForToken = async(chainName,pairAddress)=>{
 
    const pricedata = await axios.get(`https://api.dexscreener.com/latest/dex/pairs/${chainName}/${pairAddress}`)

    console.log(pricedata.data);

    return pricedata.data.pair.priceUsd;
}

const runJob = async()=>{

    const query = new Parse.Query(MyTrades);
    const results = await query.findAll();
    const trades=[];
    for (let i = 0; i < results.length; i++) {
      const pairConfig = results[i]; 

      const pairAddress = pairConfig.get('pairAddress')
      const chainName = pairConfig.get('networkName')
            console.log(pairAddress)

        const priceUsd = await getQuoteForToken(chainName,pairAddress);  

        const tradeUpdate = new MyTrades();
      tradeUpdate.set("objectId", pairConfig.id); 
      tradeUpdate.set('quote', priceUsd); 
      tradeUpdate.save();  
    }
 
    
}



cron.schedule('* * * * *', () => {
    console.log('running getQuoteForToken every pairAddress');
    runJob();

  });