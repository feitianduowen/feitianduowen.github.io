import * as THREE from './vendor/three.module.js';

const stories = [
  { name:'THE TRANSFER BRIDGE', landmark:'算力之间，一桥相连。', sub:'PREFILL × KV TRANSFER × DECODE', title:'Prefill / Decode<br>推理系统', status:'竞赛 / 研究', meta:'2026 APAC AI-HPC · 队长 / 8 人<br>2026.08—10 · 创新实践 2026.09—2027.01', description:'一侧是并行处理输入的 Prefill 工厂，另一侧是逐 token 输出的 Decode 工厂；桥上流动的是 KV Cache。围绕 Qwen3-235B-A22B，探索 PD 分离、自适应批处理与调度，平衡吞吐、延迟和 GPU 利用率。', tags:['Qwen3-235B-A22B','KV transfer','Adaptive batching'], link:'https://www.hpcadvisorycouncil.com/events/2026/APAC-AI-HPC/benchmarking.php', linkLabel:'查看竞赛说明' },
  { name:'THE COMPUTE MILL', landmark:'让每一份算力，流向所需。', sub:'CPU CLUSTER × OPENFOAM × MPI', title:'CPU 集群<br>OpenFOAM 调优', status:'并行计算', meta:'APAC AI-HPC / CPU NODES<br>资源组织 · 通信 · 性能分析', description:'水车将流动转化为动力，灌溉渠将任务分配给农田。对应 CPU 集群中的进程与线程布局、绑核、NUMA 亲和性和 MPI 通信，结合通信开销、同步等待与内存带宽分析性能瓶颈。', tags:['OpenFOAM','MPI','NUMA affinity'], link:'https://www.hpcadvisorycouncil.com/events/2026/APAC-AI-HPC/benchmarking.php', linkLabel:'查看竞赛说明' },
  { name:'THE INSTRUCTION CITY', landmark:'不同路径，并行抵达。', sub:'RISC-V × OUT-OF-ORDER × MULTI-ISSUE', title:'RISC-V<br>异构智能 SoC', status:'竞赛项目', meta:'紫光同创 FPGA 开发大赛 · 队长 / 3 人<br>2026.09.03—11.22', description:'写字楼像并行执行单元，商城像共享资源枢纽。基于盘古 676 FPGA，探索五级流水 RV32I CPU、Cache、DDR3 / DMA、动态分支预测与乱序多发射，集成 INT8 AI 和图形加速单元。', tags:['RV32I','RTL / FPGA','INT8 accelerator'], link:'http://www.fpgachina.cn/index.html?page=jssm', linkLabel:'了解赛事信息' },
  { name:'THE MEMORY DESK', landmark:'让经验，成为下一笔的起点。', sub:'FEATHERDESK × MEMORY × DESKTOP AGENT', title:'FeatherDesk<br>有记忆的桌面智能体', status:'实习经历', meta:'法狗狗（深圳）科技有限公司<br>2026.06.24—07.24', description:'一支羽毛笔，一瓶墨水，一张积累经验的书桌。参与桌面智能体开发，实践涵盖大模型应用、自动化脚本、网页信息处理与视觉 Python 库。项目团队获评优秀团队，并收到继续实习的邀请。', tags:['Desktop agent','Memory','Python'], link:'https://github.com/zceeeeee/FeatherDesk', linkLabel:'查看项目仓库' },
  { name:'THE OPEN EYE', landmark:'让世界，被更清晰地看见。', sub:'OPENCV × COMPUTER VISION × OPEN SOURCE', title:'OpenCV<br>开源贡献', status:'已合并', meta:'OPEN SOURCE CONTRIBUTOR<br>OpenCV 4.x / 5.x', description:'这只眼睛观察世界，也回应你的视线。向 OpenCV 提交的代码贡献已合并至 4.x 与 5.x 分支；从问题复现、实现修改与验证，到跟进 review，在开放协作中让代码变得更好。', tags:['Computer vision','Open source','Code review'], link:'https://github.com/feitianduowen/opencv', linkLabel:'查看代码仓库' },
  { name:'THE NEXT CHAPTER', landmark:'河流的尽头，是新的入口。', sub:'AN OPEN DOOR TO WHAT COMES NEXT', title:'有趣的下一步，<br>从一次交流开始。', status:'保持开放', meta:'SIYU WANG / 王思宇<br>南方科技大学 · 计算机科学与技术', description:'欢迎交流大模型推理、并行计算、GPU / FPGA 架构与系统性能分析。下一段探索，也许从这里开始。', tags:[], contact:true }
];

const $ = selector => document.querySelector(selector);
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let paused = reduced.matches, mode = 'intro', active = 0, target = 0, progress = 0;
let transitionStart = 0, enteringTo = 0, time = 0, last = 0, raf = 0, wheelSum = 0, wheelLast = 0, wheelLock = 0, wheelConsumed = false;
let pointer = new THREE.Vector2(), smoothPointer = new THREE.Vector2();
const cards = stories.map((story,i) => {
  const card = document.createElement('article'); card.className = 'story-card'; card.setAttribute('aria-label',story.title.replace('<br>',' '));
  card.innerHTML = `<div class="card-top"><span>${String(i+1).padStart(2,'0')} / FIELD NOTES</span><span class="card-status">${story.status}</span></div><h3>${story.title}</h3><p class="card-meta">${story.meta}</p><p class="card-description">${story.description}</p>${story.contact ? '<div class="contact-links"><a href="mailto:12412639@mail.sustech.edu.cn"><span>邮箱</span>12412639@mail.sustech.edu.cn ↗</a><a href="https://github.com/feitianduowen" target="_blank" rel="noreferrer"><span>GitHub</span>feitianduowen ↗</a><a href="https://wpa.qq.com/msgrd?v=3&amp;uin=3935797227&amp;site=qq&amp;menu=yes" target="_blank" rel="noreferrer"><span>QQ</span>3935797227 ↗</a></div>' : `<div class="card-tags">${story.tags.map(tag=>`<span>${tag}</span>`).join('')}</div><a class="card-link" href="${story.link}" target="_blank" rel="noreferrer">${story.linkLabel}<span>↗</span></a>`}<span class="card-back-name">${story.name}</span>`;
  $('#card-deck').append(card); return card;
});
function syncStory(index) {
  active=index; const story=stories[index];
  cards.forEach((card,i)=>{
    const depth=(i-index+stories.length)%stories.length;
    card.classList.toggle('active',depth===0); card.inert=depth!==0;card.setAttribute('aria-hidden',String(depth!==0));card.style.zIndex=String(10-depth);
    const fan=Math.min(depth,4);
    card.style.transform=depth===0?'translate3d(0,0,45px) rotate(-1deg)':`translate3d(${fan*12}px,${fan*2}px,${-depth*17}px) rotate(${fan*5}deg)`;
    card.style.opacity=depth>3?'0':String(1-depth*.16);
  });
  $('#landmark-title').textContent=story.landmark;$('#landmark-subtitle').textContent=story.sub;
  $('#landmark-name').textContent=`${String(index+1).padStart(2,'0')} / ${story.name}`;
  $('#scene-count').textContent=`CHAPTER ${String(index+1).padStart(2,'0')} / 06`;
  $('#story-title').innerHTML=index===5?'下一段故事，<br><em>从这里开始。</em>':'每一次探索，<br><em>都有迹可循。</em>';
  $('#previous').disabled=index===0;$('#next').disabled=index===stories.length-1;
  $('#announcement').textContent=`第 ${index+1} 站，${story.title.replace('<br>',' ')}。${story.landmark}`;
}
syncStory(0);
$('#scene-count').textContent='SPACE 001 / ∞';

let renderer;
try { renderer = new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'}); }
catch(error) { showFallback(); }
function showFallback() {
  $('#scene-error').hidden=false;$('#journey').inert=true;
  $('#fallback-stories').innerHTML=cards.map(card=>`<article>${card.innerHTML}</article>`).join('');
}
if (renderer) init();

function init() {
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.7)); renderer.setClearColor(0x080f13);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.3;
  $('#world').append(renderer.domElement);
  renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();cancelAnimationFrame(raf);showFallback();});
  const scene=new THREE.Scene();scene.background=new THREE.Color(0x080f13);scene.fog=new THREE.FogExp2(0x080f13,.014);
  const introScene=new THREE.Scene();introScene.background=new THREE.Color(0x080f13);
  const camera=new THREE.PerspectiveCamera(39,innerWidth/innerHeight,.1,600);
  const introCamera=new THREE.PerspectiveCamera(38,innerWidth/innerHeight,.1,200);introCamera.position.set(0,0,25);
  const hemi=new THREE.HemisphereLight(0xb5eddf,0x15231f,2);scene.add(hemi);
  const sun=new THREE.DirectionalLight(0xdde9c4,3);sun.position.set(18,30,18);scene.add(sun);
  const cool=new THREE.DirectionalLight(0x559ccd,2);cool.position.set(-15,10,-15);scene.add(cool);
  introScene.add(new THREE.HemisphereLight(0xd7ffbe,0x122a22,3));const introLight=new THREE.PointLight(0xd7ff87,180);introLight.position.set(4,5,8);introScene.add(introLight);
  const materials=new Map();
  function mat(color,emissive=0,opacity=1){const key=`${color}/${emissive}/${opacity}`;if(!materials.has(key))materials.set(key,new THREE.MeshStandardMaterial({color,roughness:.66,metalness:.28,emissive:color,emissiveIntensity:emissive,transparent:opacity<1,opacity,flatShading:true}));return materials.get(key);}
  const palettes={stone:0x203b39,dark:0x112524,green:0xa1c98b,glow:0xaeeaa2,cyan:0x58d8cb,gold:0xdfba80,blue:0x81b5c9,ink:0x142734,cream:0xe4dfc8};
  function mesh(geometry,material,parent,x=0,y=0,z=0){const object=new THREE.Mesh(geometry,material);object.position.set(x,y,z);parent.add(object);return object;}
  function box(parent,x,y,z,w,h,d,color=palettes.stone,emissive=0){return mesh(new THREE.BoxGeometry(w,h,d),mat(color,emissive),parent,x,y,z);}
  function cylinder(parent,x,y,z,r1,r2,height,color,segments=12,emissive=0){return mesh(new THREE.CylinderGeometry(r1,r2,height,segments),mat(color,emissive),parent,x,y,z);}
  function sphere(parent,x,y,z,r,color,emissive=0){return mesh(new THREE.IcosahedronGeometry(r,1),mat(color,emissive),parent,x,y,z);}
  function line(parent,points,color=palettes.cyan,opacity=.5){const geometry=new THREE.BufferGeometry().setFromPoints(points.map(p=>new THREE.Vector3(...p)));const object=new THREE.Line(geometry,new THREE.LineBasicMaterial({color,transparent:true,opacity}));parent.add(object);return object;}
  function pipe(parent,a,b,r,color){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),v=bv.clone().sub(av);const object=cylinder(parent,...av.clone().add(bv).multiplyScalar(.5).toArray(),r,r,v.length(),color,8,.2);object.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return object;}
  function label(parent,text,x,y,z,color='#bad3b4',size=2.2){const canvas=document.createElement('canvas');canvas.width=512;canvas.height=96;const c=canvas.getContext('2d');c.font='500 29px monospace';c.textAlign='center';c.fillStyle=color;c.fillText(text,256,56);const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,depthWrite:false,opacity:.9}));sprite.position.set(x,y,z);sprite.scale.set(size*4,size*.75,1);parent.add(sprite);return sprite;}
  function platform(parent,x,z,w=12,d=16){box(parent,x,-.65,z,w,1.15,d,0x18302c);box(parent,x,-.04,z,w+.15,.12,d+.15,0x365548);line(parent,[[x-w/2,.05,z-d/2],[x+w/2,.05,z-d/2],[x+w/2,.05,z+d/2],[x-w/2,.05,z+d/2],[x-w/2,.05,z-d/2]],0x95c7a0,.4);}
  const riverX=z=>Math.sin(-z*.029)*23+Math.sin(-z*.011)*6;
  const riverSlope=z=>-Math.cos(-z*.029)*.667-Math.cos(-z*.011)*.066;
  const world=new THREE.Group();scene.add(world);
  // One unbroken, curved watercourse connects every landmark in world space.
  const vertices=[],uvs=[],indices=[],riverStart=48,riverEnd=-310.5,steps=600;
  const riverEdge=(z,offset)=>{const slope=riverSlope(z),normal=Math.sqrt(1+slope*slope);return [riverX(z)+offset/normal,z-offset*slope/normal];};
  for(let i=0;i<=steps;i++){const z=riverStart+(riverEnd-riverStart)*i/steps,[lx,lz]=riverEdge(z,-3.2),[rx,rz]=riverEdge(z,3.2);vertices.push(lx,-.1,lz,rx,-.1,rz);uvs.push(0,i/steps,1,i/steps);if(i<steps){const n=i*2;indices.push(n,n+2,n+1,n+1,n+2,n+3);}}
  const riverGeometry=new THREE.BufferGeometry();riverGeometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));riverGeometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));riverGeometry.setIndex(indices);riverGeometry.computeVertexNormals();
  const riverMaterial=new THREE.ShaderMaterial({uniforms:{uTime:{value:0}},vertexShader:`varying vec2 vUv; varying float vDepth; void main(){vUv=uv; vec4 p=modelViewMatrix*vec4(position,1.);vDepth=-p.z;gl_Position=projectionMatrix*p;}`,fragmentShader:`varying vec2 vUv; varying float vDepth;uniform float uTime;void main(){float lane=pow(.5+.5*sin(vUv.x*95.+sin(vUv.y*90.-uTime*.7)),12.);float pulse=pow(.5+.5*sin(vUv.y*1300.+uTime*4.+vUv.x*15.),15.);float edge=pow(abs(vUv.x-.5)*2.,16.);float stream=lane*(.12+pulse*.9);vec3 c=vec3(.025,.13,.15)+vec3(.12,.59,.52)*(stream+edge*.65);float fog=1.-exp(-.00022*vDepth*vDepth);gl_FragColor=vec4(mix(c,vec3(.031,.059,.075),fog),1.);}`,side:THREE.DoubleSide});
  world.add(new THREE.Mesh(riverGeometry,riverMaterial));
  for(const side of [-1,1]){const points=[];for(let i=0;i<=400;i++){const z=riverStart+(riverEnd-riverStart)*i/400,[x,zz]=riverEdge(z,side*3.3);points.push([x,.06,zz]);}line(world,points,0x69cbb7,.65);}
  const ground=mesh(new THREE.PlaneGeometry(450,600),mat(0x0d1a1a),world,0,-1.3,-150);ground.rotation.x=-Math.PI/2;
  const grid=new THREE.GridHelper(500,100,0x203b36,0x142925);grid.position.set(0,-1.25,-150);grid.material.transparent=true;grid.material.opacity=.3;world.add(grid);
  const streamParticles=[];
  for(let i=0;i<95;i++){const z=48-i*3.8;const particle=box(world,riverX(z),.02,z,.035,.025,1+Math.random()*1.6,0x8df8da,1.3);streamParticles.push({mesh:particle,phase:i/95,lane:(Math.random()-.5)*5.7});}
  // Small bank pylons give scale and guide the eye around the bends.
  for(let z=25;z>-306;z-=8){for(const side of [-1,1]){const [x,zz]=riverEdge(z,side*3.9);box(world,x,.18,zz,.13,.45,.13,0x46615a);box(world,x,.43,zz,.15,.07,.15,0x9bd6ad,.8);}}
  const stations=stories.map((story,i)=>{const group=new THREE.Group();const z=-i*62;group.position.set(riverX(z),0,z);group.rotation.y=Math.atan(riverSlope(z));world.add(group);return group;});

  // 01 — A broad prefill batch factory and slender sequential decode towers.
  const bridge=stations[0];platform(bridge,-9,0,11,17);platform(bridge,9,0,11,17);
  box(bridge,-9,1.3,0,7.5,2.6,7.5,0x477268);box(bridge,-9,2.7,0,8,.2,8,0x93b58b);
  for(let x=0;x<4;x++)for(let z=0;z<3;z++){box(bridge,-11.7+x*1.8,3.5,-2.5+z*2.5,1.25,1.5,1.7,0x749b83);box(bridge,-11.7+x*1.8,4.3,-2.5+z*2.5,1.1,.08,1.5,0xc8ed9c,.35);}
  for(let i=0;i<3;i++){const x=6.5+i*2.6;box(bridge,x,3.1,0,1.7,6.2,3,0x3c7075);for(let y=1;y<6;y+=1.3)box(bridge,x,y,1.53,1.35,.22,.07,0x9be7d7,.6);box(bridge,x,6.3,0,1.9,.18,3.2,0xa4d0c0);}
  const archHeight=x=>.85+1.65*(1-(x/5.4)**2);
  const archShape=new THREE.Shape();
  for(let i=0;i<=32;i++){const x=-5.4+i/32*10.8;if(i===0)archShape.moveTo(x,archHeight(x));else archShape.lineTo(x,archHeight(x));}
  for(let i=32;i>=0;i--){const x=-5.4+i/32*10.8;archShape.lineTo(x,archHeight(x)-.3);}archShape.closePath();
  mesh(new THREE.ExtrudeGeometry(archShape,{depth:2.5,bevelEnabled:false}),mat(0xb4b99b),bridge,0,0,-1.25);
  for(const z of [-1.25,1.25]){
    const rail=[];for(let i=0;i<=32;i++){const x=-5.4+i/32*10.8;rail.push([x,archHeight(x)+.9,z]);}
    for(let i=0;i<rail.length-1;i++)pipe(bridge,rail[i],rail[i+1],.075,0xc6cfac);
    for(let i=0;i<=12;i++){const x=-5.4+i*.9,y=archHeight(x);box(bridge,x,y+.46,z,.12,.92,.12,0xb6c49f);sphere(bridge,x,y+.95,z,.12,0xd2d6b1);}
  }
  for(const side of [-1,1]){box(bridge,side*5.5,.25,0,1.2,.5,3,0x768e76);box(bridge,side*5.15,.55,0,.65,.35,2.7,0x9fae8e);}
  const kvPackets=[];for(let i=0;i<7;i++)kvPackets.push(box(bridge,-4+i*1.3,1.4,0,.5,.35,.6,0xd7ff87,.8));
  label(bridge,'PREFILL',-9,6,-1,'#cee8a6',1.5);label(bridge,'DECODE',9,8,0,'#99e6df',1.5);label(bridge,'KV TRANSFER',0,4.5,0,'#e3dcb2',1.3);

  // 02 — A turning wheel at the water's edge irrigates a minimal field grid.
  const mill=stations[1];platform(mill,-8,0,9,12);platform(mill,-11.5,-11,13,15);
  box(mill,-8,1.7,-1,3.7,3.4,4.2,0xb7b49a);
  for(const x of [-10.2,-5.8])for(const z of [-3.4,1.4]){box(mill,x,2.1,z,.24,4.2,.24,0x71523b);box(mill,x,.2,z,.5,.4,.5,0x8b9d8b);}
  for(const z of [-3.4,1.4])box(mill,-8,4.05,z,4.8,.25,.28,0x876140);
  const roofProfile=[[-3.6,4.55],[-3,4.3],[-1.7,5.1],[0,6],[1.7,5.1],[3,4.3],[3.6,4.55]];
  const roofShape=new THREE.Shape();roofProfile.forEach(([x,y],i)=>i?roofShape.lineTo(x,y):roofShape.moveTo(x,y));[...roofProfile].reverse().forEach(([x,y])=>roofShape.lineTo(x,y-.22));roofShape.closePath();
  mesh(new THREE.ExtrudeGeometry(roofShape,{depth:6.3,bevelEnabled:false}),mat(0x40554d),mill,-8,0,-4.15);
  for(let z=-4.15;z<=2.15;z+=.43)line(mill,roofProfile.map(([x,y])=>[x-8,y+.03,z]),0x87978a,.6);
  pipe(mill,[-8,6.1,-4.45],[-8,6.1,2.45],.12,0x95a28d);
  for(const x of [-9.1,-8.4,-7.7,-7])box(mill,x,2,1.14,.055,1.6,.05,0x735940);
  const wheel=new THREE.Group();wheel.position.set(-2.55,2.32,0);mill.add(wheel);
  for(const x of [-.55,.55]){const hoop=mesh(new THREE.TorusGeometry(2.7,.15,6,32),mat(0x98734d),wheel,x,0,0);hoop.rotation.y=Math.PI/2;}
  for(let i=0;i<14;i++){const a=i*Math.PI/7;const paddle=box(wheel,0,Math.cos(a)*2.65,Math.sin(a)*2.65,1.55,.56,.18,0xb69365);paddle.rotation.x=a;for(const x of [-.5,.5])pipe(wheel,[x,0,0],[x,Math.cos(a)*2.6,Math.sin(a)*2.6],.065,0xb08d61);}
  pipe(mill,[-6.2,2.32,0],[-1.65,2.32,0],.19,0x8d6b43);
  const splashParticles=[];for(let i=0;i<12;i++)splashParticles.push(sphere(mill,-2.55,.15,1,.045,0xacefdb,.7));
  for(let x=0;x<3;x++)for(let z=0;z<4;z++){const xx=-15.3+x*3.6,zz=-16+z*3.4;box(mill,xx,.12,zz,2.8,.24,2.5,0x526b38);for(let j=0;j<3;j++){box(mill,xx-.8+j*.8,.42,zz,.17,.6,1.8,0x99c57b);}}
  for(let i=0;i<4;i++)pipe(mill,[-5.3,.36,-17.5+i*3.4],[-17,.36,-17.5+i*3.4],.09,0x72d9d1);
  pipe(mill,[-5.3,.36,-17.5],[-5.3,.36,-4],.12,0x72d9d1);
  pipe(mill,[-2.55,2.4,0],[-4.4,2.3,-2],.11,0x72d9d1);pipe(mill,[-4.4,2.3,-2],[-5.3,.36,-4],.11,0x72d9d1);
  label(mill,'COMPUTE MILL',-8,7.5,0,'#d7d8a3',1.7);label(mill,'DISTRIBUTE / MPI',-12,2,-17,'#a8d7b4',1.7);

  // 03 — Parallel execution towers and a shared-resource shopping hall.
  const city=stations[2];platform(city,-9,0,12,19);platform(city,9,0,11,19);
  const towers=[[-11,-4,8],[-6,-2,5.5],[-11,3,6.5],[-6,5,4.5],[7,-4,7],[11,1,5]];
  towers.forEach(([x,z,h],i)=>{box(city,x,h/2,z,2.8,h,3, i%2?0x57747b:0x638187);box(city,x,h+.1,z,3,.2,3.2,0xa9c4b7);for(let y=1;y<h-.4;y+=1.25){for(let xx=-.75;xx<=.75;xx+=1.5)box(city,x+xx,y,z+1.52,.52,.52,.04,0xbfe4c2,.25);}});
  box(city,9,1.3,6,7,2.6,4,0x8c8d6a);box(city,9,2.8,6,7.4,.35,4.4,0xc9ceab);for(let i=0;i<5;i++)box(city,6.3+i*1.35,1.3,8.04,.8,1.6,.04,0x8be0d3,.3);
  for(const z of [-5,4]){box(city,0,.4,z,8,.18,1,0x506b65);line(city,[[-6,.52,z],[6,.52,z]],0xbdedac,.7);}
  const instructions=[];for(let i=0;i<8;i++)instructions.push(box(city,0,.75,i%2?-5:4,.35,.18,.35,0xc7f5af,.7));
  label(city,'EXECUTE IN PARALLEL',-8,10,0,'#c4dcc0',2);label(city,'SHARED CACHE',9,4.2,6,'#cfd5ac',1.5);

  // 04 — One iconic quill and ink bottle on an uncluttered writing desk.
  const desk=stations[3];
  box(desk,-7,3.1,0,10,.5,6.5,0x9c9175);for(const x of [-11,-3])for(const z of [-2.5,2.5])box(desk,x,1.4,z,.45,2.8,.45,0x576358);
  box(desk,-4.8,3.4,1,3.5,.06,3.5,0xdbddc7);for(let i=0;i<5;i++)box(desk,-4.8,3.44,.1+i*.45,2.5,.015,.035,0x768b79);
  cylinder(desk,-9,3.9,-.2,.95,1.1,1.25,0x314a51,8);cylinder(desk,-9,4.65,-.2,.55,.8,.3,0xa4af95,8);cylinder(desk,-9,4.82,-.2,.43,.43,.08,0x101f22,12);
  const quill=new THREE.Group();quill.position.set(-9,4.7,-.2);quill.rotation.z=-.3;quill.rotation.y=.25;desk.add(quill);pipe(quill,[0,0,0],[0,6.3,0],.035,0xeee2b6);
  const featherShape=new THREE.Shape();featherShape.moveTo(0,1.3);featherShape.bezierCurveTo(-1.6,2.4,-1.6,4.9,0,6.5);featherShape.bezierCurveTo(1.25,5,1.6,3.4,0,1.3);
  mesh(new THREE.ExtrudeGeometry(featherShape,{depth:.08,bevelEnabled:false}),mat(0xd7dec2),quill);
  for(let i=0;i<7;i++){const y=2+i*.48;line(quill,[[0,y,.1],[-Math.sin((y-1.4)/5*Math.PI)*1.1,y+.6,.1]],0x728f7d,.6);line(quill,[[0,y,.1],[Math.sin((y-1.4)/5*Math.PI)*1.1,y+.6,.1]],0x728f7d,.6);}
  label(desk,'FEATHERDESK',-6,11,0,'#e1dbbe',2);

  // 05 — A sculptural eye, with a moving iris and a gentle blink.
  const vision=stations[4];
  const eyeRoot=new THREE.Group();eyeRoot.position.set(-7,5.2,0);eyeRoot.rotation.y=.48;vision.add(eyeRoot);
  const eye=new THREE.Group();eyeRoot.add(eye);
  const sclera=mesh(new THREE.SphereGeometry(1,40,24),mat(0xc8d8c0),eye);sclera.scale.set(3,2.8,2.4);
  const iris=new THREE.Group();iris.position.z=2.42;eye.add(iris);
  const irisMesh=cylinder(iris,0,0,0,1.38,1.38,.18,0x51a99d,32,.15);irisMesh.rotation.x=Math.PI/2;
  const pupil=cylinder(iris,0,0,.12,.67,.67,.13,0x10242b,32);pupil.rotation.x=Math.PI/2;
  const irisRing=mesh(new THREE.TorusGeometry(1.38,.045,6,40),mat(0xd5eab5,.3),iris,0,0,.12);
  sphere(iris,.38,.45,.25,.19,0xe3ffe2,.7);sphere(iris,-.24,-.2,.23,.07,0xd5fff3,.7);
  const eyeOrbit=mesh(new THREE.TorusGeometry(4.2,.025,4,64),mat(0x89bca2,.6),vision,-7,5.2,0);eyeOrbit.rotation.x=.9;
  label(vision,'SEE / UNDERSTAND / CONTRIBUTE',-7,9.2,0,'#cae1c4',2.3);

  // 06 — The glowing doorway closes the river and opens the next chapter.
  const gate=stations[5];
  box(gate,-4.3,5.3,-1,.6,10.6,.6,0xd1edb3,1.8);box(gate,4.3,5.3,-1,.6,10.6,.6,0xd1edb3,1.8);box(gate,0,10.3,-1,9.2,.6,.6,0xdcefc3,2);
  const gateGlow=new THREE.PointLight(0xb8ffbd,70,22,2);gateGlow.position.set(0,4,1);gate.add(gateGlow);
  for(const x of [-4.3,4.3])for(let i=1;i<=5;i++)box(gate,x,5.3,-1,.6+i*.18,10.6+i*.08,.6+i*.18,0xbcecc1,.8).material=mat(0xbcecc1,.8,.025);
  box(gate,-3.7,5.2,-.3,.09,9.6,.08,0xd7ffab,1.6);box(gate,3.7,5.2,-.3,.09,9.6,.08,0xd7ffab,1.6);box(gate,0,9.94,-.3,7.4,.09,.08,0xd7ffab,1.6);
  const portalMaterial=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,uniforms:{uTime:{value:0}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 vUv;uniform float uTime;void main(){float edge=pow(abs(vUv.x-.5)*2.,4.);float lines=pow(.5+.5*sin(vUv.y*100.-uTime),12.);gl_FragColor=vec4(.58,.83,.56,.08+edge*.32+lines*.04);}'});
  mesh(new THREE.PlaneGeometry(7.4,9.5),portalMaterial,gate,0,5.15,-.8);
  const door=new THREE.Group();door.position.set(-3.7,.4,-.4);door.rotation.y=-.62;gate.add(door);const doorPanel=box(door,3.65,4.65,0,7.3,9.3,.16,0x305647);doorPanel.material=mat(0x305647,0,.35);sphere(door,6.5,4.4,.2,.15,0xe0eac1,.8);
  function gateSign(text,y){const surface=document.createElement('canvas');surface.width=1024;surface.height=128;const c=surface.getContext('2d');c.font='400 48px "Microsoft YaHei", sans-serif';c.textAlign='center';c.fillStyle='#d7e7bc';c.fillText(text,512,82);const texture=new THREE.CanvasTexture(surface);texture.colorSpace=THREE.SRGBColorSpace;mesh(new THREE.PlaneGeometry(11,1.375),new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,side:THREE.DoubleSide}),gate,0,y,.1);}
  gateSign('有趣的下一步',12);gateSign('从一次交流开始',11.1);
  const terminalNormal=new THREE.Vector3(0,0,1).applyAxisAngle(new THREE.Vector3(0,1,0),gate.rotation.y);
  const terminalPoint=new THREE.Vector3(0,0,-1.65).applyAxisAngle(new THREE.Vector3(0,1,0),gate.rotation.y).add(gate.position);
  const terminalPlane=new THREE.Plane().setFromNormalAndCoplanarPoint(terminalNormal,terminalPoint);

  // Intro core shares the same rendering engine, before the camera enters the river.
  const core=new THREE.Group();introScene.add(core);
  const coreCube=mesh(new THREE.BoxGeometry(2.5,2.5,2.5),mat(0x618264,.05,.4),core);coreCube.rotation.set(.4,.5,.2);
  const edges=new THREE.LineSegments(new THREE.EdgesGeometry(coreCube.geometry),new THREE.LineBasicMaterial({color:0xcce89c,transparent:true,opacity:.8}));coreCube.add(edges);
  const globe=mesh(new THREE.IcosahedronGeometry(2.6,2),new THREE.MeshBasicMaterial({color:0x819d66,wireframe:true,transparent:true,opacity:.17}),core);
  const introRings=[];for(let i=0;i<3;i++){const ring=mesh(new THREE.TorusGeometry(3.7+i*.45,.009,4,120),mat(i===1?0xb8c990:0x799b7f,.5),core);ring.rotation.set(.8+i*.35,.3+i*.3,-.3);introRings.push(ring);}
  const satellites=Array.from({length:3},(_,i)=>sphere(core,0,0,0,.04+i*.013,0xd7ff87,1.5));
  const starGeo=new THREE.BufferGeometry(),starPositions=[];let seed=31;const random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
  for(let i=0;i<350;i++)starPositions.push((random()-.5)*90,(random()-.5)*45,-random()*80);
  starGeo.setAttribute('position',new THREE.Float32BufferAttribute(starPositions,3));introScene.add(new THREE.Points(starGeo,new THREE.PointsMaterial({color:0xb8d9af,size:.025,transparent:true,opacity:.65})));
  const ambientGeo=new THREE.BufferGeometry(),ambientPoints=[];for(let i=0;i<600;i++)ambientPoints.push((random()-.5)*85,random()*18,-random()*370);ambientGeo.setAttribute('position',new THREE.Float32BufferAttribute(ambientPoints,3));world.add(new THREE.Points(ambientGeo,new THREE.PointsMaterial({color:0x75baa2,size:.045,transparent:true,opacity:.5})));

  let mobile=false;
  function resize(){mobile=innerWidth<=760;renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;introCamera.aspect=camera.aspect;camera.setViewOffset(innerWidth,innerHeight,mobile?0:innerWidth*.205,mobile?innerHeight*.16:0,innerWidth,innerHeight);camera.updateProjectionMatrix();introCamera.updateProjectionMatrix();requestFrame();}
  const desiredPosition=new THREE.Vector3(),desiredLook=new THREE.Vector3(),cameraOffset=new THREE.Vector3();
  function updateCamera(){const z=-progress*62,x=riverX(z);const parallax=paused?0:1;
    cameraOffset.set(mobile?42:25,mobile?36:24,mobile?52:31).applyAxisAngle(new THREE.Vector3(0,1,0),Math.atan(riverSlope(z))*.85);
    desiredPosition.set(x+cameraOffset.x+smoothPointer.x*2.5*parallax,cameraOffset.y,z+cameraOffset.z+smoothPointer.y*1.5*parallax);
    desiredLook.set(x,1.2,z-1);camera.position.copy(desiredPosition);camera.lookAt(desiredLook);
  }
  function animate(timestamp){raf=0;if(document.hidden)return;const dt=Math.min((timestamp-(last||timestamp))/1000,.05);last=timestamp;
    if(!paused)time+=dt;smoothPointer.lerp(pointer,1-Math.exp(-dt*4));
    if(mode==='entering'){
      const t=Math.min(1,(timestamp-transitionStart)/(reduced.matches?20:1450));const e=t*t*(3-2*t);
      core.position.x=(mobile?1.4:5.4)+e*35;core.scale.setScalar(1-e*.22);
      core.traverse(object=>{if(object.material){object.material.transparent=true;object.material.opacity=Math.max(0,(object===globe ? .17 : .8)*(1-e));}});
      if(t===1){mode='journey';document.body.dataset.mode='journey';$('#intro').inert=true;$('#journey').inert=false;progress=enteringTo;target=enteringTo;syncStory(target);$('#footer-note').textContent='FOLLOW THE CURRENT';$('#next').focus({preventScroll:true});}
    }
    if(mode==='journey'){
      progress=reduced.matches?target:THREE.MathUtils.damp(progress,target,2.7,dt);if(Math.abs(progress-target)<.001)progress=target;
      const nearest=Math.round(progress);if(nearest!==active)syncStory(nearest);updateCamera();
      riverMaterial.uniforms.uTime.value=time;portalMaterial.uniforms.uTime.value=time;
      wheel.rotation.x=-time*.5;quill.rotation.z=-.3+Math.sin(time*.8)*.015;
      splashParticles.forEach((drop,i)=>{const phase=(time*1.2+i/12)%1;drop.position.set(-2.55+Math.sin(i*2.4)*phase*.55,.05+Math.sin(phase*Math.PI)*.65,1.3+phase*.7);drop.scale.setScalar(1-phase*.75);});
      iris.position.x=smoothPointer.x*.38;iris.position.y=-smoothPointer.y*.22;
      const blinkPhase=time%5.8;eye.scale.y=blinkPhase>5.35?Math.max(.06,1-Math.sin((blinkPhase-5.35)/.45*Math.PI)*.96):1;
      eyeOrbit.rotation.z=time*.1;eyeRoot.position.y=5.2+Math.sin(time*.7)*.18;eyeOrbit.position.y=eyeRoot.position.y;
      kvPackets.forEach((packet,i)=>{packet.position.x=-5.2+((time*1.1+i*1.5)%10.4);packet.position.y=archHeight(packet.position.x)+.28;});
      instructions.forEach((packet,i)=>{packet.position.x=-6+((time*(1+(i%3)*.3)+i*1.5)%12);});
      streamParticles.forEach(p=>{const length=riverStart-riverEnd,z=riverStart-((p.phase*length+time*3)%length),[x,zz]=riverEdge(z,p.lane);p.mesh.position.set(x,.02,zz);p.mesh.rotation.y=Math.atan(riverSlope(z));});
      renderer.clippingPlanes=[terminalPlane];renderer.render(scene,camera);
    } else {
      if(mode==='intro'){core.position.set((mobile?1.5:5.4)+smoothPointer.x*.25,mobile?-4:-.1,0);core.scale.setScalar(mobile?.77:1.08);}
      coreCube.rotation.y=time*.16+.5;coreCube.rotation.x=time*.08+.4;globe.rotation.y=-time*.035;core.rotation.y=smoothPointer.x*.12;core.rotation.x=smoothPointer.y*.09;
      satellites.forEach((sat,i)=>{const a=time*(.16+i*.03)+i*2.1,r=3.7+i*.45;const p=new THREE.Vector3(Math.cos(a)*r,Math.sin(a)*r,0).applyEuler(introRings[i].rotation);sat.position.copy(p);});renderer.clippingPlanes=[];renderer.render(introScene,introCamera);
    }
    if(!paused||mode==='entering'||Math.abs(progress-target)>.001)requestFrame();
  }
  function requestFrame(){if(!raf&&!document.hidden)raf=requestAnimationFrame(animate);}
  function enter(index=0){if(mode!=='intro')return;mode='entering';enteringTo=index;transitionStart=performance.now();document.body.dataset.mode='entering';$('#intro').inert=true;requestFrame();}
  function go(direction){if(mode!=='journey')return;const next=THREE.MathUtils.clamp(target+direction,0,stories.length-1);if(next===target)return;target=next;requestFrame();}
  function home(){mode='intro';document.body.dataset.mode='intro';$('#intro').inert=false;$('#journey').inert=true;target=progress=0;wheelSum=0;wheelLock=0;core.traverse(object=>{if(object.material){object.material.opacity=object===globe ? .17 : object===coreCube ? .4 : .8;}});$('#scene-count').textContent='SPACE 001 / ∞';$('#footer-note').textContent='MOVE TO SHIFT YOUR PERSPECTIVE';$('#announcement').textContent='开屏。点击任意位置，启程。';$('#enter').focus({preventScroll:true});requestFrame();}
  $('#enter').addEventListener('click',()=>enter());$('#home').addEventListener('click',home);
  document.addEventListener('click',event=>{if(mode==='intro'&&!event.target.closest('.header-actions,#home'))enter();});
  $('#contact-shortcut').addEventListener('click',()=>{if(mode==='intro')enter(5);else if(mode==='journey'){target=5;requestFrame();}});
  $('#previous').addEventListener('click',()=>go(-1));$('#next').addEventListener('click',()=>go(1));
  window.addEventListener('wheel',event=>{
    event.preventDefault();if(mode!=='journey'||event.ctrlKey||Math.abs(event.deltaX)>Math.abs(event.deltaY))return;
    const now=performance.now();if(now-wheelLast>200){wheelSum=0;wheelConsumed=false;}wheelLast=now;
    if(now<wheelLock||wheelConsumed)return;
    const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1);if(Math.sign(wheelSum)!==Math.sign(delta))wheelSum=0;wheelSum+=delta;
    if(Math.abs(wheelSum)>=42){go(wheelSum<0?1:-1);wheelSum=0;wheelConsumed=true;wheelLock=now+900;}
  },{passive:false});
  let touchStart=null;
  window.addEventListener('pointermove',event=>{pointer.set(event.clientX/innerWidth*2-1,event.clientY/innerHeight*2-1);if(!paused)requestFrame();});
  window.addEventListener('pointerdown',event=>{if(event.pointerType==='touch')touchStart={x:event.clientX,y:event.clientY};});
  window.addEventListener('pointerup',event=>{if(!touchStart)return;const delta=touchStart.y-event.clientY;if(Math.abs(delta)>45&&Math.abs(delta)>Math.abs(touchStart.x-event.clientX)){go(delta>0?1:-1);}touchStart=null;});
  window.addEventListener('pointercancel',()=>{touchStart=null;});
  document.addEventListener('keydown',event=>{
    if(event.altKey||event.ctrlKey||event.metaKey)return;
    if(mode==='intro'&&(event.key==='Enter'||event.key===' ')){if(!event.target.closest('button,a')){event.preventDefault();enter();}}
    else if(mode==='journey'&&!event.target.closest('a')){if(event.key==='ArrowUp'||event.key==='PageUp'){event.preventDefault();go(1);}else if(event.key==='ArrowDown'||event.key==='PageDown'){event.preventDefault();go(-1);}else if(event.key==='Escape')home();}
  });
  function updateMotion(){ $('#motion-toggle').setAttribute('aria-pressed',String(paused));$('#motion-toggle').setAttribute('aria-label',paused?'开启环境动效':'暂停环境动效');$('#motion-toggle').textContent=paused?'▷':'Ⅱ';last=0;requestFrame(); }
  $('#motion-toggle').addEventListener('click',()=>{paused=!paused;updateMotion();});reduced.addEventListener('change',()=>{paused=reduced.matches;updateMotion();});
  window.addEventListener('resize',resize);document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}else{last=0;requestFrame();}});
  resize();updateMotion();
}
