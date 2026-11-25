import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {installRenderer} from './renderer.mjs';

export async function buildInjection(root,{deferStart=false}={}){
  const [skin,video]=await Promise.all([
    readFile(join(root,'extension/wallpaper.css'),'utf8'),
    readFile(join(root,'assets/perlica-background.mp4'))
  ]);
  const payload={skin,video:'data:video/mp4;base64,'+video.toString('base64')};
  return `(${installRenderer.toString()})(${JSON.stringify(payload)})`;
}
