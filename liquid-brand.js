import { buildGlyphDisplacementMap } from './vendor/liquid-glass/glyph-map.js';

// The material refracts the live page, clipped to the actual glyphs. The
// open-source height-field generator supplies the bevel normals and lighting.
const brand = document.querySelector('.moving-brand');
const label = brand.textContent;
brand.setAttribute('aria-label', label);
const text = document.createElement('span');
text.className = 'brand-fallback';
text.textContent = label;
brand.replaceChildren(text);
const surface = document.createElement('span');
surface.className = 'liquid-letter-surface';
surface.setAttribute('aria-hidden', 'true');
const refraction = document.createElement('span');
refraction.className = 'letter-refraction';
const light = document.createElement('span');
light.className = 'letter-light';
surface.append(refraction, light);
brand.append(surface);
const ns = 'http://www.w3.org/2000/svg';
const svg = document.createElementNS(ns,'svg');
svg.setAttribute('aria-hidden','true');
svg.style.cssText='position:absolute;width:0;height:0;pointer-events:none';
document.body.append(svg);
let generation = 0;
async function build() {
 const gen = ++generation;
 const cs = getComputedStyle(brand), factor = 5;
 const w = Math.ceil(brand.offsetWidth*factor), h = Math.ceil(brand.offsetHeight*factor);
 const size = parseFloat(cs.fontSize)*factor;
 const font = `${cs.fontWeight} ${size}px ${cs.fontFamily}`;
 const spacing = `${parseFloat(cs.letterSpacing)*factor}px`;
 const canvas = document.createElement('canvas'); canvas.width=w; canvas.height=h;
 const ctx=canvas.getContext('2d'); ctx.font=font; ctx.letterSpacing=spacing;
 const metrics=ctx.measureText(label);
 const baseline=(h-metrics.fontBoundingBoxAscent-metrics.fontBoundingBoxDescent)/2+metrics.fontBoundingBoxAscent;
 ctx.fillStyle='white'; ctx.fillText(label,0,baseline);
 const mask=canvas.toDataURL();
 const map=buildGlyphDisplacementMap({text:label,rectW:w,rectH:h,baseline,fontCss:font,
  letterSpacing:spacing,fontSizePx:size,dpr:1,bevel:1.8,dome:3,edge:1.7,glow:.15,shade:.85});
 const image=new Image(); image.src=map.url; await image.decode();
 if(gen!==generation)return;
 ctx.clearRect(0,0,w,h); ctx.drawImage(image,-map.margin,-map.margin);
 const pixels=ctx.getImageData(0,0,w,h);
 for(let i=0;i<pixels.data.length;i+=4){
  const rim=(pixels.data[i+2]-128)/127;
  const dark=rim<0;
  pixels.data[i]=dark?48:255; pixels.data[i+1]=dark?66:255; pixels.data[i+2]=dark?85:255;
  pixels.data[i+3]=Math.min(255,Math.abs(rim)*255*(dark?1.4:1.3));
 }
 ctx.putImageData(pixels,0,0);
 light.style.backgroundImage=`url(${canvas.toDataURL()})`;
 surface.style.cssText=`width:${w}px;height:${h}px;--letter-mask:url(${mask})`;
 const id=`brand-refraction-${gen}`;
 svg.innerHTML=`<defs><filter id="${id}" filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" x="0" y="0" width="${w}" height="${h}" color-interpolation-filters="sRGB"><feImage href="${map.url}" x="${-map.margin}" y="${-map.margin}" width="${map.cssW}" height="${map.cssH}" result="normals"/><feDisplacementMap in="SourceGraphic" in2="normals" scale="16" xChannelSelector="R" yChannelSelector="G"/></filter></defs>`;
 refraction.style.backdropFilter=`url(#${id}) blur(.35px) saturate(1.08)`;
 brand.classList.add('liquid-ready');
}
let resizeFrame;
new ResizeObserver(()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(build)}).observe(brand);
document.fonts.ready.then(build);
