import {createHmac,createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
const seed=process.env.FREELLMAPI_DEPLOY_SEED;
if(!seed||seed.length<24)throw new Error('Configure FREELLMAPI_DEPLOY_SEED with a stable secret of at least 24 characters.');
process.env.ENCRYPTION_KEY=createHash('sha256').update('piano-encryption:'+seed).digest('hex');
process.env.FREELLMAPI_UNIFIED_API_KEY='freellmapi-'+createHmac('sha256',seed).update('piano-unified-key').digest('hex');
const config=process.env.FREEAPI_CONFIG_JSON?JSON.parse(process.env.FREEAPI_CONFIG_JSON):{
  admin:{email:'piano-owner@example.com',password:createHmac('sha256',seed).update('piano-dashboard-password').digest('base64url')},
  keys:[{platform:'zhipu',key:process.env.FREELLMAPI_ZHIPU_KEY,label:'piano',enabled:true}],
  models:[{platform:'zhipu',modelId:'glm-4.6v-flash',enabled:true,supportsVision:true,fallbackEnabled:true}],
  routing:{strategy:'balanced'},
};
process.env.FREEAPI_CONFIG_JSON=JSON.stringify(config);
if(!config.admin?.email||!config.admin?.password||!Array.isArray(config.keys)||!config.keys.length)throw new Error('FREEAPI_CONFIG_JSON requires an admin and at least one upstream provider key.');
if(config.admin.password.length<12)throw new Error('Choose an admin password of at least 12 characters.');
if(config.keys.some(k=>!k.key?.trim()))throw new Error('Configure an upstream provider key in Render secrets.');
const child=spawn(process.execPath,['server/dist/index.js'],{stdio:'inherit',env:process.env});
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>child.kill(signal));
child.on('exit',code=>process.exit(code??1));