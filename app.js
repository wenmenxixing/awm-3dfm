const dialog=document.querySelector('#lightbox');
const table = (headers, rows) => '<table><thead><tr>'+headers.map(h=>`<th scope="col">${h}</th>`).join('')+'</tr></thead><tbody>'+rows.map(row=>`<tr class="${row[0].startsWith('AWM')||row[0].startsWith('Fused +')?'ours':''}">${row.map((v,i)=>i===0?`<th scope="row">${v}</th>`:`<td>${v}</td>`).join('')}</tr>`).join('')+'</tbody></table>';
document.querySelector('#pose-table').innerHTML=table(['Method','e_valley','216','2F_long_loop','mid_indoor_mono','mid_indoor_mono_2','Average'],[
['SLAM3R','2.15','1.06','12.43','0.25','0.32','3.24'],['MASt3R-SLAM','0.84','0.30','1.16','0.27','0.26','0.57'],['DROID-SLAM','3.50','2.63','8.04','0.39','0.085','2.93'],['DPVO','3.48','1.95','1.28','0.61','0.22','1.51'],['GRS-SLAM3R','1.81','1.11','11.44','0.17','0.22','2.95'],['AWM-3DFM (ours)','0.44','0.75','1.19','0.07','0.06','0.50']]);
const methods=['MonoGS','DepthGS','S3PO-GS','Flash-Mono','AWM-3DFM (ours)'];
const rendering={psnr:[[19.24,16.54,16.09,18.86,17.65,14.52,13.68,11.50,14.37,13.38,13.96],[12.29,12.42,11.76,13.64,13.17,11.11,13.65,14.85,17,15.96,16.51],[20.79,17.19,17.60,18.52,18.37,14.14,18.98,15.72,18.56,15.23,16.59],[21.73,17.83,17.75,18.52,21.60,19.51,19.03,16.48,19.50,17.10,17.63],[23.23,20.46,19.22,17.45,22.29,25.75,20.84,22.96,23.83,20.13,20.57]],ssim:[[.80,.74,.72,.77,.68,.59,.70,.39,.70,.52,.60],[.31,.32,.34,.42,.36,.26,.38,.41,.58,.56,.58],[.80,.71,.75,.78,.73,.61,.74,.64,.47,.63,.64],[.79,.66,.72,.73,.69,.66,.66,.60,.72,.69,.64],[.82,.80,.78,.77,.72,.83,.68,.73,.80,.72,.73]],lpips:[[.61,.60,.54,.66,.67,.74,.67,.82,.63,.78,.71],[.79,.78,.78,.73,.84,.81,.67,.69,.51,.62,.63],[.62,.58,.54,.55,.69,.75,.57,.71,.78,.71,.64],[.39,.41,.43,.39,.44,.45,.49,.54,.45,.50,.51],[.26,.25,.33,.32,.31,.23,.40,.41,.35,.40,.37]]};
function renderTable(){const scan=document.querySelector('#dataset').value==='scannet';const metric=document.querySelector('#metric').value;const headers=scan?['0054','0059','0106','0169','0233','0465']:['apt0','apt2','copyroom','office0','office2'];document.querySelector('#render-table').innerHTML=table(['Method',...headers],methods.map((m,i)=>[m,...rendering[metric][i].slice(scan?0:6,scan?6:11).map(v=>v.toFixed(2))]));}
document.querySelectorAll('#dataset,#metric').forEach(el=>el.addEventListener('change',renderTable));renderTable();
document.querySelector('#ablation-table').innerHTML=table(['Regulation / configuration','Accuracy ↓ (cm)','Completeness ↓ (cm)','ATE RMSE ↓ (m)'],[['No temporal or spatial cues','20.40','17.39','0.70'],['Temporal only','13.26','10.84','0.49'],['Spatial only','14.78','12.31','0.53'],['Temporal–spatial fused','9.14','7.30','0.38'],['Fused + loop closure','5.88','4.52','0.12']]);
const scenes={small:{file:'small_scene_comparison_with_boxes_enlarged.png',alt:'Indoor reconstruction comparison: CUT3R, Point3R, SLAM3R, and AWM-3DFM on redkitchen seq-06, whiteroom, and office seq-02.',caption:'Left to right: CUT3R, Point3R, SLAM3R, and ours. Top to bottom: redkitchen seq-06, whiteroom, and office seq-02. Highlighted regions compare completeness and structural detail.'},large:{file:'large_scene_comparison_with_top_enlarged.png',alt:'Large-scale reconstruction comparison: CUT3R, SLAM3R, MASt3R-SLAM, and AWM-3DFM on KITTI 03, office_loop, and mid_fir_floor_mono.',caption:'Left to right: CUT3R, SLAM3R, MASt3R-SLAM, and ours. Top to bottom: KITTI Odometry 03, office_loop, and mid_fir_floor_mono. Top-view insets reveal the global scene layout.'}};
// Placeholder resource buttons stay on the current page until real URLs are supplied.
document.querySelectorAll('[data-placeholder]').forEach(link=>link.addEventListener('click',event=>event.preventDefault()));
// Keep one set of links: interpolate their position rather than swapping headers.
const movingHeader=document.querySelector('header');
const movingBrand=document.querySelector('.moving-brand');
const movingNav=movingHeader.querySelector('nav');
const navAnchor=document.querySelector('.nav-anchor');
const heroGallery=document.querySelector('.hero-gallery');
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
let headerGeometry;
let headerFrame=0;
let displayedProgress;
let lastFrameTime=0;
function measureHeader(){
  const width=document.documentElement.clientWidth;
  const brandScale=Math.min(width<=760?3:5.4,(width-48)*.82/movingBrand.offsetWidth);
  const heroTitle=document.querySelector('.hero');
  const spaceBottom=heroTitle.getBoundingClientRect().top+window.scrollY+parseFloat(getComputedStyle(heroTitle).paddingTop);
  headerGeometry={
    brandScale,
    dockScale:1.3,
    dockX:movingBrand.offsetWidth*.15,
    dockY:width>760?movingNav.offsetTop+movingNav.offsetHeight/2-movingBrand.offsetTop-movingBrand.offsetHeight/2:0,
    brandArc:width>760?125:70,
    brandY:spaceBottom*.46-movingBrand.offsetTop-movingBrand.offsetHeight/2,
    brandX:(width-movingBrand.offsetWidth)/2-movingBrand.offsetLeft,
    navX:(width-movingNav.offsetWidth)/2-movingNav.offsetLeft,
    startY:navAnchor.getBoundingClientRect().top+window.scrollY-movingNav.offsetTop,
    imageTravel:heroGallery.offsetTop+heroGallery.offsetHeight*.3,
  };
  if(headerFrame)cancelAnimationFrame(headerFrame);
  displayedProgress=undefined;
  lastFrameTime=0;
  updateHeader(performance.now());
}
function updateHeader(now=performance.now()){
  headerFrame=0;
  if(!headerGeometry)return;
  const progress=Math.min(1,Math.max(0,window.scrollY/Math.max(1,headerGeometry.startY)));
  // A short, frame-rate-independent catch-up softens wheel steps without lagging behind touch.
  const dt=lastFrameTime?Math.min(64,now-lastFrameTime):16;
  lastFrameTime=now;
  if(displayedProgress===undefined||reducedMotion.matches)displayedProgress=progress;
  else displayedProgress+=(progress-displayedProgress)*(1-Math.exp(-dt/65));
  if(Math.abs(progress-displayedProgress)<.0001)displayedProgress=progress;
  const t=displayedProgress;
  const eased=t*t*t*(t*(t*6-15)+10);
  const position=reducedMotion.matches?(progress>=1?1:0):eased;
  // Logo and navigation arrive together, using the actual navigation anchor.
  const brandPosition=position;
  const sizePosition=brandPosition;
  const currentScale=headerGeometry.dockScale+(headerGeometry.brandScale-headerGeometry.dockScale)*(1-sizePosition);
  // Fade the material's own layers so live backdrop refraction keeps working.
  const softness=reducedMotion.matches?0:Math.pow(Math.sin(Math.PI*brandPosition),2);
  movingBrand.style.setProperty('--letter-softness',`${softness*2.8/currentScale*5}px`);
  movingBrand.style.setProperty('--fallback-softness',`${softness*2.8/currentScale}px`);
  movingBrand.style.setProperty('--letter-presence',String(1-softness*.48));
  movingBrand.style.setProperty('--brand-x',`${headerGeometry.brandX*(1-brandPosition)+headerGeometry.dockX*brandPosition}px`);
  movingBrand.style.setProperty('--brand-scale',String(headerGeometry.dockScale+(headerGeometry.brandScale-headerGeometry.dockScale)*(1-sizePosition)));
  movingBrand.style.setProperty('--brand-y',`${headerGeometry.brandY*(1-sizePosition)+headerGeometry.dockY*brandPosition+(reducedMotion.matches?0:Math.sin(Math.PI*brandPosition)*headerGeometry.brandArc)}px`);
  document.querySelector('.hero').style.setProperty('--copy-clearance','0px');
  const imageProgress=reducedMotion.matches?0:Math.min(1,Math.max(0,(window.scrollY-100)/Math.max(1,headerGeometry.imageTravel-100)));
  heroGallery.style.setProperty('--image-lift',`${reducedMotion.matches?0:-Math.min(window.scrollY,headerGeometry.imageTravel)*.22}px`);
  heroGallery.style.setProperty('--image-opacity',String(1-imageProgress*imageProgress*(3-2*imageProgress)));
  
  
  movingHeader.style.setProperty('--nav-x',`${headerGeometry.navX*(1-position)}px`);
  movingHeader.style.setProperty('--nav-y',`${Math.max(0,headerGeometry.startY-window.scrollY)}px`);
  movingHeader.style.setProperty('--dock-opacity',String(Math.min(1,progress*4)*.98));
  if(displayedProgress!==progress&&!reducedMotion.matches)headerFrame=requestAnimationFrame(updateHeader);
}
window.addEventListener('scroll',()=>{if(!headerFrame)headerFrame=requestAnimationFrame(updateHeader);},{passive:true});
window.addEventListener('resize',measureHeader);
reducedMotion.addEventListener('change',measureHeader);
new ResizeObserver(measureHeader).observe(document.querySelector('.hero'));
measureHeader();
