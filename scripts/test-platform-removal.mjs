import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
// Minimal DOM harness for row state, identity, events and focus; layout is browser-tested.
let focused;
class Node{
 constructor(tag='div'){this.tagName=tag;this.children=[];this.events={};this.attrs={};this.value='';this.hidden=false;this.style={setProperty(){}};this.classes=new Set();this.classList={add:(...v)=>v.forEach(x=>this.classes.add(x)),remove:(...v)=>v.forEach(x=>this.classes.delete(x)),toggle:(v,on)=>on?this.classes.add(v):this.classes.delete(v)};}
 append(...nodes){for(const node of nodes){node.parent=this;this.children.push(node);}}
 replaceChildren(){this.children=[];}
 remove(){this.parent.children=this.parent.children.filter(n=>n!==this);}
 removeAttribute(k){delete this.attrs[k];}
 setAttribute(k,v){this.attrs[k]=v;}
 addEventListener(k,f){(this.events[k]??=[]).push(f);}
 dispatchEvent(e){e.target??=this;for(const f of this.events[e.type]||[])f(e);if(e.bubbles)this.parent?.dispatchEvent(e);}
 focus(){focused=this;}
 click(){this.dispatchEvent({type:'click'});}
}
const ids=Object.fromEntries(['platform-list','add-platform','platform-total','platform-total-wrap','platform-limit-status','platform-overage','platform-limit-error'].map(id=>[id,new Node()]));
const sandbox={document:{getElementById:id=>ids[id],createElement:tag=>new Node(tag)},window:{addEventListener(){},matchMedia:()=>({matches:true})},Event:class{constructor(type,opts={}){this.type=type;Object.assign(this,opts);}},setTimeout,clearTimeout};vm.createContext(sandbox);vm.runInContext(await readFile(new URL('../public/platforms.js',import.meta.url),'utf8'),sandbox);const ui=vm.runInContext('setupPlatformInputs()',sandbox);
const all=(node,tag)=>node.children.flatMap(n=>[...(n.tagName===tag?[n]:[]),...all(n,tag)]);
const custom=()=>ids['platform-list'].children.filter(n=>n.classes.has('platform-custom-row'));
function buttons(row){return all(row,'button');}
function input(node,value){node.value=String(value);node.dispatchEvent({type:'input',bubbles:true});}
function add(name,minutes){ids['add-platform'].click();const row=custom().at(-1),inputs=all(row,'input');input(inputs[0],name);input(inputs[1],minutes);return row;}
function remove(row){buttons(row)[0].click();if(row.children.at(-1).hidden===false)buttons(row)[2].click();}
assert.equal(custom().length,1);buttons(custom()[0])[0].click();assert.equal(custom().length,0);assert.equal(ui.readEntries().length,15);assert.equal(focused,ids['add-platform']);assert.match(ids['platform-total'].textContent,/0m/);
const a=add('A',30),b=add('B',45),c=add('C',60);buttons(b)[0].click();assert.equal(focused,buttons(b)[1]);buttons(b)[1].click();assert.equal(custom().length,3);assert.equal(focused,buttons(b)[0]);assert.equal(all(b,'input')[1].value,'45');remove(b);assert.deepEqual(Array.from(ui.readEntries().slice(15),e=>[e.name,e.hours,e.minutes]),[['A',0,30],['C',1,0]]);assert.match(ids['platform-total'].textContent,/1h 30m/);
remove(a);const d=add('D',5);assert.equal(buttons(d)[0].attrs['aria-label'],'Remove custom platform: D');remove(c);assert.equal(custom()[0],d);
const nodes=all(ids['platform-list'],'input'),identifiers=nodes.map(n=>n.id).filter(Boolean);assert.equal(new Set(identifiers).size,identifiers.length);
ui.setEntries([{name:'Facebook',hours:12,minutes:0},{name:'Instagram',hours:11,minutes:0},{name:'Custom',hours:2,minutes:0}]);assert.equal(ids['platform-limit-error'].hidden,false);remove(custom()[0]);assert.equal(ids['platform-limit-error'].hidden,true);assert.match(ids['platform-total'].textContent,/23h/);
ui.setEntries([]);assert.equal(custom().length,0);ui.setEntries([{name:'Facebook',hours:1,minutes:0}]);assert.equal(custom().length,0);ui.reset();assert.equal(custom().length,1);assert.equal(ui.readEntries().length,16);assert.match(ids['platform-total'].textContent,/0m/);
console.log('PASS custom removal, cancel/confirm, retained values, stable IDs, total/limit updates, zero-custom restoration, focus and default reset');
