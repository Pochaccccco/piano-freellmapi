import {readFile,writeFile} from 'node:fs/promises';
const file=process.argv[2];if(!file)throw new Error('Expected the pinned upstream db/index.ts path');
let text=await readFile(file,'utf8');
const getter='export function getUnifiedApiKey(): string {';
const regenerate='export function regenerateUnifiedKey(): string {';
if(!text.includes(getter)||!text.includes(regenerate))throw new Error('Pinned upstream changed: review the patch before building');
text=text.replace(getter,getter+'\n  if (process.env.FREELLMAPI_UNIFIED_API_KEY) return process.env.FREELLMAPI_UNIFIED_API_KEY;');
text=text.replace(regenerate,regenerate+'\n  if (process.env.FREELLMAPI_UNIFIED_API_KEY) throw new Error("Unified key is managed by deployment; rotate the deployment seed instead.");');
await writeFile(file,text);