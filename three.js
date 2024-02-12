/*=========================================================================================
	Item Name: Open Street Map Stand
    Module: three.js
	Version: 1.0
	Author: Sergey Patokin
    Last Update: 02.08.2024
	Author URL: https://sergeyforever.online/
    Landscape GeoJson Map: https://overpass-turbo.eu/#
    Landscape Depth Map: https://portal.opentopography.org/apidocs/#/Public/getGlobalDem
===========================================================================================*/

import * as THREE from 'https://unpkg.com/three@0.127.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.127.0/examples/jsm/controls/OrbitControls.js';
import { GUI } from 'https://unpkg.com/three@0.127.0/examples/jsm/libs/dat.gui.module.js';
import Stats from 'https://cdnjs.cloudflare.com/ajax/libs/stats.js/17/Stats.js';
import { BufferGeometryUtils } from 'https://unpkg.com/three@0.127.0/examples/jsm/utils/BufferGeometryUtils.js';
import { BokehShader, BokehDepthShader } from 'https://unpkg.com/three@0.127.0/examples/jsm/shaders/BokehShader2.js';
import { Water } from 'https://unpkg.com/three@0.127.0/examples/jsm/objects/Water.js';


// Container element for the Three.js scene
const container = document.getElementById('threejs-container');

// Scene, camera, renderer, controls, and aspect ratio
let scene, camera, renderer, controls, aspect;

// Element for displaying information
const info = document.getElementById('info');

// Camera properties
let cameraRadius = 50;
let gui, stats, gridHelper;
const gridSize = 60;
let clock = new THREE.Clock();

// IDs for camera position sliders
const cameraRotationXId = 'pips-range-camX';
const cameraRotationYId = 'pips-range-camY';

// Initial camera positions
let cameraRotationX = 40, cameraRotationY = 45;

// Materials for various objects
let buildingMaterial, roadMaterial, waterMaterial, waterNormalMaterial, treeLeavesMaterial, treeTrunkMaterial;

// buildingMeshes for objects in the scene
let buildingMesh, planeMesh, waterShaderMesh, waterSimpleMesh, groundMesh;

// Lights in the scene
let lightAmbient, lightDirectional1, lightDirectional2;

// URL for geo data
let geoDataUrl = "./data/vinest.geojson";
let geoData;

// Initial center position
let center = [-118.326019, 34.102646];

// Interactive Groups
var iR;
var iR_Road;
var iR_Line;
var iR_Water;
var iR_Water_Simple;
var iR_Tree;

// Flags for animation and growth/de-growth
let roadAnimationFlag = true;
let animatedLineSpeed = 0.004;
let animatedLineDistances = [];
let buildingGeometries = [];
let treeGeometries = [];
let buildingColliders = [];
let buildingGrowthProgress = 0;
let treeGrowthProgress = 0;
let isDegrowingBuildings = false;
let isGrowingBuildings = true;
let isDegrowingTrees = false;
let isGrowingTrees = true;
let paused = false;
let pausedTime = 0;

// Colors and opacities for different materials
let buildingsColor = '#FFFFFF';
let buildingsOpacity = 0;
let treeLeavesOpacity = 0.4, treeTrunkOpacity = 0.15;
let treeLeavesColor = '#82BF49';
let roadsColor = '#1B4686';
let roadsAnimationColor = '#00FFFF';

// Timeout for delaying actions
let delayTimeout;

// Orthographic camera
let orthographicCamera;

// Elements for switches and comboboxes
const switch1 = document.getElementById("custom-switch-1");
const switch3 = document.getElementById("custom-switch-3");
const switch4 = document.getElementById("custom-switch-4");
const switch5 = document.getElementById("custom-switch-5");
const switch6 = document.getElementById("custom-switch-6");
const switch7 = document.getElementById("custom-switch-7");
const switch8 = document.getElementById("custom-switch-8");
const combobox1 = document.getElementById("combobox1");

// Slider element for snapping
const snapSlider = document.getElementById('snap');

// Depth of Field
let DOFMaterial;
let windowHalfWidth = window.innerWidth / 2;
let windowHalfHeight = window.innerHeight / 2;

let focalDistance = 100;
let DOFController;

// Postprocessing configuration
const postProcessingConfig = { enabled: true };

// Shader settings
const shaderSettings = {
  rings: 3,
  samples: 4
};

// Mouse and raycaster for interaction
const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();

// Functions Init //

init();
animate();


/////////////////////////////////////////////////////////////////////////////////
//////////////////////////// Initialization Function ////////////////////////////
/////////////////////////////////////////////////////////////////////////////////


function init() {

  // Scene Initialization //
  
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x211a26);

  // Renderer Settings //
  
  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setClearColor( 0x000000, 0.0 );
  setTimeout(function() {
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
  }, 200);
  window.addEventListener('visibilitychange', pauseUnpause); // Pause animation when the page is hidden

  // Camera Setting //
  
  aspect = container.clientWidth / container.clientHeight;

  orthographicCamera = camera;
  camera = new THREE.PerspectiveCamera(
    10,
    aspect,
    0.1,
    100
  );

  // Control Settings //
  
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableRotate = false;
  controls.maxDistance = 35;

  controls.addEventListener('change', function () {

    if(controls.target.x > gridSize/2) controls.target.x = gridSize/2;
    else if(controls.target.x < -gridSize/2) controls.target.x = -gridSize/2;
    if(controls.target.z > gridSize/2) controls.target.z = gridSize/2;
    else if(controls.target.z < -gridSize/2) controls.target.z = -gridSize/2;

    cameraRadius = camera.position.distanceTo(controls.target); 

    var dir = new THREE.Vector3();
    dir.subVectors( controls.target, camera.position ).normalize();

    const lineStart = new THREE.Vector3(controls.target.x, 1, controls.target.z);
    const lineEnd = new THREE.Vector3(controls.target.x, 10, controls.target.z);

    const intersects = lineIntersection(lineStart, lineEnd, scene.children);

    if (intersects.length > 0 && switch8.checked) {
      controls.target.x += (controls.target.y-intersects[0].point.y) * dir.x;
      controls.target.z += (controls.target.y-intersects[0].point.y) * dir.z;
      controls.target.y = intersects[0].point.y;
    }else{
      controls.target.x += controls.target.y * dir.x;
      controls.target.z += controls.target.y * dir.z;
      controls.target.y = 0;
    }

    translateCamera(cameraRotationX, cameraRotationY);
  });


  // Init group //
  
  iR = new THREE.Group();
  iR.name = "Interactive Root";
  iR_Road = new THREE.Group();
  iR_Road.name = "Roads";
  iR_Line = new THREE.Group();
  iR_Line.name = "Animated Line on Roads";
  iR_Water  = new THREE.Group();
  iR_Water_Simple = new THREE.Group();
  iR_Tree = new THREE.Group();

  scene.add(iR);
  scene.add(iR_Road);
  scene.add(iR_Line);
  scene.add(iR_Water);
  scene.add(iR_Water_Simple);
  scene.add(iR_Tree);



  // Init Light //
  
  lightAmbient = new THREE.AmbientLight(0xfafafa, 0.25);

  lightDirectional1 = new THREE.PointLight(0xfafafa, 0.4);
  lightDirectional1.position.set(200, 90, 40);

  lightDirectional2 = new THREE.PointLight(0xfafafa, 0.4);
  lightDirectional2.position.set(200, 90, -40);

  scene.add(lightAmbient);

  if(switch5.checked){
    scene.add(lightDirectional1);
    scene.add(lightDirectional2);
  }

  gridHelper = new THREE.GridHelper(gridSize, 160, new THREE.Color(0x555555), new THREE.Color(0x333333));
  if(!switch8.checked) scene.add(gridHelper);

  buildingMaterial = new THREE.MeshPhongMaterial();

  LoadTerrain();

  if(switch8.checked){
    switch8.disabled = true;
    function GeoJsonBuilding(){
      clearTimeout(delayTimeout);
      delayTimeout = setTimeout(() => {
        if(groundMesh)GetGeoJson();
        else GeoJsonBuilding();
      }, 100);
    }
    GeoJsonBuilding();
  }else{
    GetGeoJson();
  }  

  // DOF //
  
  const depthShader = BokehDepthShader;

  DOFMaterial = new THREE.ShaderMaterial( {
    uniforms: depthShader.uniforms,
    vertexShader: depthShader.vertexShader,
    fragmentShader: depthShader.fragmentShader
  } );

  DOFMaterial.uniforms[ 'mNear' ].value = camera.near;
  DOFMaterial.uniforms[ 'mFar' ].value = camera.far;

  initPostprocessing();

  container.style.touchAction = 'none';
  container.addEventListener( 'pointermove', onPointerMove );

  DOFController = {

    enabled: true,
    jsDepthCalculation: true,
    shaderFocus: false,

    fstop: 3,
    maxblur: 1.0,

    showFocus: false,
    focalDepth: 2.8,
    manualdof: false,
    vignetting: false,
    depthblur: false,

    threshold: 0,
    gain: 0,
    bias: 0,
    fringe: 0,

    focalLength: 16,
    noise: true,
    pentagon: false,

    dithering: 0.0001

  };

  const matChanger = function () {

    for ( const e in DOFController ) {
      if ( e in postProcessingConfig.bokeh_uniforms ) {
        postProcessingConfig.bokeh_uniforms[ e ].value = DOFController[ e ];
      }
    }

    postProcessingConfig.enabled = DOFController.enabled;
    postProcessingConfig.bokeh_uniforms[ 'znear' ].value = camera.near;
    postProcessingConfig.bokeh_uniforms[ 'zfar' ].value = camera.far;
    camera.fov = DOFController.focalLength;

  };

  setTimeout(function() {
    DOFController.enabled = false;
  }, 200);

  // Stats //
  /*stats = new Stats();
    stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(stats.dom);*/

  // GUI for DOF
  /*const gui = new GUI();

    gui.add( DOFController, 'enabled' ).onChange( matChanger );
    gui.add( DOFController, 'jsDepthCalculation' ).onChange( matChanger );
    gui.add( DOFController, 'shaderFocus' ).onChange( matChanger );
    gui.add( DOFController, 'focalDepth', 0.0, 200.0 ).listen().onChange( matChanger );

    gui.add( DOFController, 'fstop', 0.1, 22, 0.001 ).onChange( matChanger );
    gui.add( DOFController, 'maxblur', 0.0, 5.0, 0.025 ).onChange( matChanger );

    gui.add( DOFController, 'showFocus' ).onChange( matChanger );
    gui.add( DOFController, 'manualdof' ).onChange( matChanger );
    gui.add( DOFController, 'vignetting' ).onChange( matChanger );

    gui.add( DOFController, 'depthblur' ).onChange( matChanger );

    gui.add( DOFController, 'threshold', 0, 1, 0.001 ).onChange( matChanger );
    gui.add( DOFController, 'gain', 0, 100, 0.001 ).onChange( matChanger );
    gui.add( DOFController, 'bias', 0, 3, 0.001 ).onChange( matChanger );
    gui.add( DOFController, 'fringe', 0, 5, 0.001 ).onChange( matChanger );

    gui.add( DOFController, 'focalLength', 16, 80, 0.001 ).onChange( matChanger );

    gui.add( DOFController, 'noise' ).onChange( matChanger );

    gui.add( DOFController, 'dithering', 0, 0.001, 0.0001 ).onChange( matChanger );

    gui.add( DOFController, 'pentagon' ).onChange( matChanger );

    gui.add( shaderSettings, 'rings', 1, 8 ).step( 1 ).onChange( shaderUpdate );
    gui.add( shaderSettings, 'samples', 1, 13 ).step( 1 ).onChange( shaderUpdate );

    const guiDom = gui.domElement;
    guiDom.style.position = 'absolute';
    guiDom.style.top = '65px';
    guiDom.style.right = '103px';

  	gui.close();*/

  matChanger();

  camera.updateProjectionMatrix();

  // Listening window resize events for perspective camera //
  
  window.addEventListener('resize', () => {

    // Update camera aspect ratio
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();

    // Update renderer size
    renderer.setSize(container.clientWidth, container.clientHeight);

  });

}



///////////////////////////////////////////////////////////////////////////
//////////////////////////// Update Functions /////////////////////////////
///////////////////////////////////////////////////////////////////////////


function animate() {

  requestAnimationFrame( animate );
  
  if(!paused){
    
    renderer.render(scene, camera);
    controls.update();
    //stats.update();

    if(iR_Tree){
      if(isDegrowingBuildings || isDegrowingTrees){
        if(treeGrowthProgress > 0.75) { 
          treeGrowthProgress -= 0.0075 - iR_Tree.scale.y/200;
          if(iR_Tree) iR_Tree.scale.y = 1 * treeGrowthProgress;
        }
        // Trees opacity degrowth
        if(iR_Tree.children[0] && iR_Tree.children[0].material.opacity > 0) iR_Tree.children[0].material.opacity -= 0.007;
        if(iR_Tree.children[1] && iR_Tree.children[1].material.opacity > 0) iR_Tree.children[1].material.opacity -= 0.007;
      }
      else if(isGrowingBuildings || isGrowingTrees){
        if(treeGrowthProgress < 1){
          treeGrowthProgress += 0.0075 - iR_Tree.scale.y/200;
          if(iR_Tree) iR_Tree.scale.y = 1 * treeGrowthProgress;
          if(treeGrowthProgress >= 1 && iR_Tree.children[0].material.opacity >= treeLeavesOpacity && 
             iR_Tree.children[1].material.opacity >= treeTrunkOpacity) isGrowingTrees = false;
        }
        // Trees opacity growth
        if(iR_Tree.children[0] && iR_Tree.children[0].material.opacity < treeLeavesOpacity) iR_Tree.children[0].material.opacity += 0.007;
        if(iR_Tree.children[1] && iR_Tree.children[1].material.opacity < treeTrunkOpacity) iR_Tree.children[1].material.opacity += 0.007;
      }
    }

    if(buildingMesh){

      if(isDegrowingBuildings) {
        if(buildingGrowthProgress > 0) { 
          buildingGrowthProgress -= 0.015 - iR_Tree.scale.y/80;
          buildingMesh.scale.y = 1 * buildingGrowthProgress;
        }
        // Bulidings opacity degrowth
        if(buildingMesh.material.opacity > 0) buildingMesh.material.opacity -= 0.0075;      
        // Roads opacity degrowth
        iR_Road.children.forEach(function (invader) {
          if(invader.material.opacity > 0) invader.material.opacity -= 0.00005;
        });
        iR_Line.children.forEach(function (invader) {
          if(invader.material.opacity > 0) invader.material.opacity -= 0.007;
        });
      }
      else if(isGrowingBuildings) {
        if(buildingGrowthProgress < 1){ 
          buildingGrowthProgress += 0.015 - buildingMesh.scale.y/80;
          buildingMesh.scale.y = 1 * buildingGrowthProgress;
          if(buildingGrowthProgress >= 1) isGrowingBuildings = false;
        }
        // Bulidings opacity growth
        if(buildingMesh.material.opacity < 1-buildingsOpacity) buildingMesh.material.opacity += 0.01;
        // Roads opacity growth
        iR_Road.children.forEach(function (invader) {
          if(invader.material.opacity < 1) invader.material.opacity += 0.00005;
        });
        if(roadAnimationFlag)
          iR_Line.children.forEach(function (invader) {
            if(invader.material.opacity < 1) invader.material.opacity += 0.005;
          });
      }

    }

    if(!isDegrowingBuildings) UpdateAniLines();
    if(DOFController.enabled) render();
    if(iR_Water.visible) UpdateWater();
  
  }
    
}



/////////////////////////////////////////////////////////////
//////////////////////////// DOF ////////////////////////////
/////////////////////////////////////////////////////////////


function onPointerMove( event ) {

  if ( event.isPrimary === false ) return;

  mouse.x = ( event.clientX - windowHalfWidth ) / windowHalfWidth*1.5;
  mouse.y = - ( event.clientY - windowHalfHeight ) / windowHalfHeight*1.5;

  postProcessingConfig.bokeh_uniforms[ 'focusCoords' ].value.set( event.clientX / window.innerWidth, 1 - ( event.clientY / window.innerHeight ) );

}

function initPostprocessing() {

  postProcessingConfig.scene = new THREE.Scene();

  postProcessingConfig.camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, - 10000, 10000 );
  postProcessingConfig.camera.position.z = 100;
  postProcessingConfig.scene.add( postProcessingConfig.camera );
  
  postProcessingConfig.rtTextureDepth = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, { type: THREE.HalfFloatType } );
  postProcessingConfig.rtTextureColor = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, { type: THREE.HalfFloatType } );

  const bokeh_shader = BokehShader;

  postProcessingConfig.bokeh_uniforms = THREE.UniformsUtils.clone( bokeh_shader.uniforms );
  postProcessingConfig.bokeh_uniforms[ 'tColor' ].value = postProcessingConfig.rtTextureColor.texture;
  postProcessingConfig.bokeh_uniforms[ 'tDepth' ].value = postProcessingConfig.rtTextureDepth.texture;
  postProcessingConfig.bokeh_uniforms[ 'textureWidth' ].value = window.innerWidth;
  postProcessingConfig.bokeh_uniforms[ 'textureHeight' ].value = window.innerHeight;

  postProcessingConfig.materialBokeh = new THREE.ShaderMaterial( {

    uniforms: postProcessingConfig.bokeh_uniforms,
    vertexShader: bokeh_shader.vertexShader,
    fragmentShader: bokeh_shader.fragmentShader,
    defines: {
      RINGS: shaderSettings.rings,
      SAMPLES: shaderSettings.samples
    }

  } );

  postProcessingConfig.quad = new THREE.Mesh( new THREE.PlaneGeometry( window.innerWidth, window.innerHeight ), postProcessingConfig.materialBokeh );
  postProcessingConfig.quad.position.z = - 500;
  postProcessingConfig.scene.add( postProcessingConfig.quad );

}

function shaderUpdate() {

  postProcessingConfig.materialBokeh.defines.RINGS = shaderSettings.rings;
  postProcessingConfig.materialBokeh.defines.SAMPLES = shaderSettings.samples;
  postProcessingConfig.materialBokeh.needsUpdate = true;

}

function linearize( depth ) {

  const zfar = camera.far;
  const znear = camera.near;
  return - zfar * znear / ( depth * ( zfar - znear ) - zfar );

}

function smoothstep( near, far, depth ) {

  const x = saturate( ( depth - near ) / ( far - near ) );
  return x * x * ( 3 - 2 * x );

}

function saturate( x ) {

  return Math.max( 0, Math.min( 1, x ) );

}

function render() {

  const time = Date.now() * 0.00015;
  camera.updateMatrixWorld();

  if ( DOFController.jsDepthCalculation ) {

    raycaster.setFromCamera( mouse, camera );
    const intersects = raycaster.intersectObjects( scene.children, true );
    const targetDistance = ( intersects.length > 0 ) ? intersects[ 0 ].distance : 1000;
    focalDistance += ( targetDistance - focalDistance ) * 0.03;
    const sdistance = smoothstep( camera.near, camera.far, focalDistance );
    const ldistance = linearize( 1 - sdistance );
    postProcessingConfig.bokeh_uniforms[ 'focalDepth' ].value = ldistance;
    DOFController[ 'focalDepth' ] = ldistance;

  }


  if ( postProcessingConfig.enabled ) {

    renderer.clear();

    // render scene into texture
    renderer.setRenderTarget( postProcessingConfig.rtTextureColor );
    renderer.clear();
    renderer.render( scene, camera );

    // render depth into texture
    scene.overrideMaterial = DOFMaterial;
    renderer.setRenderTarget( postProcessingConfig.rtTextureDepth );
    renderer.clear();
    renderer.render( scene, camera );
    scene.overrideMaterial = null;

    // render bokeh composite
    renderer.setRenderTarget( null );
    renderer.render( postProcessingConfig.scene, postProcessingConfig.camera );


  } else {

    scene.overrideMaterial = null;

    renderer.setRenderTarget( null );
    renderer.clear();
    renderer.render( scene, camera );

  }
  
  const delta = clock.getDelta();

}



/////////////////////////////////////////////////////////////////
//////////////////////////// Widgets ////////////////////////////
/////////////////////////////////////////////////////////////////


function moveGUI(top, right){
  const guiDom = gui.domElement;
  guiDom.style.position = 'absolute';
  guiDom.style.top = top;
  guiDom.style.right = right;
}



//////////////////////////////////////////////////////////////////////////////
//////////////////////////// On Change Parameters ////////////////////////////
//////////////////////////////////////////////////////////////////////////////


/****************************************************
 *				Slider Scales / Pips				*
 ****************************************************/

// Camera rotation Y
var sliderRangeCamY = {
  'min': [0,1],
  '25%': [90,1],
  '50%': [180,1],
  '75%': [270,1],
  'max': [360]
};

var pipsRangeCamY = document.getElementById(cameraRotationYId);
noUiSlider.create(pipsRangeCamY, {
  range: sliderRangeCamY,
  start: 45,
  pips: {
    mode: 'range',
    density: 2
  }
});

pipsRangeCamY.noUiSlider.on('update', function(values, handle) {
  
  var sliderValue = values[handle];
  cameraRotationY = sliderValue;

  translateCamera(cameraRotationX, cameraRotationY);
});


/********************************************
 *				Vertical Slider				*
 ********************************************/

// Camera rotation X
var sliderRangeCamX = {
  'min': [0,1],
  '50%': [40, 1],
  'max': [80]
};

var pipsRangeCamX = document.getElementById(cameraRotationXId);
noUiSlider.create(pipsRangeCamX, {
  range: sliderRangeCamX,
  start: 25,
  connect: 'lower',
  orientation: 'vertical',
  direction: 'rtl',
  pips: {
    mode: 'range',
    density: 3
  }
});

pipsRangeCamX.noUiSlider.on('update', function(values, handle) {
  
  var sliderValue = values[handle];
  cameraRotationX = sliderValue;
  
  translateCamera(cameraRotationX, cameraRotationY);
  
});


/****************************************
 *				Sliders					*
 ****************************************/


// Buildings transparency
noUiSlider.create(snapSlider, {
  start: 0,
  behaviour: 'snap',
  connect: 'lower',
  range: {
    'min': 0,
    'max': 1
  }
});

snapSlider.noUiSlider.on('update', function(values, handle) {
  
  var sliderValue = values[handle];
  
  if(buildingMesh){
    buildingsOpacity = sliderValue;
    isGrowingBuildings = true;
    buildingGrowthProgress = 0;
    buildingMaterial = new THREE.MeshPhongMaterial({
      color: buildingsColor,
      transparent: true,
      opacity: 1 - buildingsOpacity + 0.01,
    });
    buildingMesh.material = buildingMaterial;
  }
  
});


/****************************************
 *				Switchers				*
 ****************************************/

// Road animation
switch1.addEventListener('change', function() {
  
  roadAnimationFlag = switch1.checked;
  
})

// 2D map
switch3.addEventListener('change', function() {
  
  planeMesh.visible = switch3.checked;
  
})

// DOF
switch4.addEventListener('change', function() {
  
  DOFController.enabled = switch4.checked;
  
})

// Rendered mode
switch5.addEventListener('change', function() {
  
  if(switch5.checked){
    scene.add(lightDirectional1);
    scene.add(lightDirectional2);
  }else{
    scene.remove(lightDirectional1);
    scene.remove(lightDirectional2);
  }

  
})

// Rendered Water
switch6.addEventListener('change', function() {
  
  iR_Water.visible = switch6.checked;
  iR_Water_Simple.visible = !switch6.checked;
  
})

// Trees
switch7.addEventListener('change', function() {
  
  if(switch7.checked) { isGrowingTrees = true; isDegrowingTrees = false; }
  else { isDegrowingTrees = true; isGrowingTrees = false; }
  
})

// Terrain
switch8.addEventListener('change', function() {
  
  groundMesh.visible = switch8.checked;
  
  if(switch8.checked){
    scene.remove(gridHelper);
    for(let i = 0; i < buildingGeometries.length; i++){

      const geometryCenter = getBufferGeometryCenter(buildingGeometries[i]);
      var lineStart = new THREE.Vector3(geometryCenter.x, 0.01, geometryCenter.z);
      var lineEnd = new THREE.Vector3(geometryCenter.x, 10, geometryCenter.z);
      const intersects = lineIntersection(lineStart, lineEnd, scene.children);

      if (intersects.length > 0) {
        buildingGeometries[i].translate(0, intersects[0].point.y, 0);
      }

    }
  }else{
    scene.add(gridHelper);
    for(let i = 0; i < buildingGeometries.length; i++){
      
      const geometryCenter = getBufferGeometryCenter(buildingGeometries[i]);
      var boundingBox = new THREE.Box3().setFromBufferAttribute(buildingGeometries[i].getAttribute('position'));
      var height = boundingBox.max.y - boundingBox.min.y;
	  buildingGeometries[i].translate(0, -geometryCenter.y + (height/2), 0);
      
    }
  }
  
  let mergeGeometry = BufferGeometryUtils.mergeBufferGeometries(buildingGeometries);
  buildingMesh.geometry = mergeGeometry;
  buildingGrowthProgress = 0;
  isGrowingBuildings = true;
  
  scene.remove(iR_Road);
  scene.remove(iR_Line);

  iR_Road = new THREE.Group();
  iR_Road.name = "Roads";
  iR_Line = new THREE.Group();
  iR_Line.name = "Animated Line on Roads";

  scene.add(iR_Road);
  scene.add(iR_Line);

  let features = geoData.features;

  for (let i = 0; i < features.length; i++) {
  	
    let fel = features[i];
    if (!fel['properties']) return;
    
    let info = fel.properties;
    
    if(info["highway"]){
      if(fel.geometry.type == "LineString" && info["highway"] != "pedestrian" && info["highway"] != "footway" && info["highway"] != "path"){
        addRoad(fel.geometry.coordinates, info);
      }
    }
  }
  
})


/****************************************
 *				Combo Box				*
 ****************************************/

combobox1.addEventListener('change', function() {
     
  rebuild();
  
})

/************************************************
 *				Utilities Functions				*
 ************************************************/

// Function to handle camera transform
export function translateCamera(x, y) {
  
  const angleX = (x * Math.PI) / 180;
  const angleY = (y * Math.PI) / 180;
  camera.position.x = controls.target.x + cameraRadius * Math.sin(angleY) * Math.cos(angleX);
  camera.position.y = controls.target.y + cameraRadius * Math.sin(angleX);
  camera.position.z = controls.target.z + cameraRadius * Math.cos(angleY) * Math.cos(angleX);

  camera.lookAt(controls.target);
  
}

function rebuild(){
  
  isDegrowingBuildings = true;
  combobox1.disabled = true;
  switch8.disabled = true;
  const selectedOption = combobox1.options[combobox1.selectedIndex];
  setTimeout(function() { 
    if(buildingGrowthProgress > 0) rebuild();
    else{

      isDegrowingBuildings = false;

      scene.remove(iR);
      scene.remove(iR_Road);
      scene.remove(iR_Line);
      scene.remove(iR_Water);
      scene.remove(iR_Water_Simple);
      scene.remove(iR_Tree);

      iR = new THREE.Group();
      iR.name = "Interactive Root";
      iR_Road = new THREE.Group();
      iR_Road.name = "Roads";
      iR_Line = new THREE.Group();
      iR_Line.name = "Animated Line on Roads";
      iR_Water  = new THREE.Group();
      iR_Water_Simple = new THREE.Group();
      iR_Tree = new THREE.Group();

      scene.add(iR);
      scene.add(iR_Road);
      scene.add(iR_Line);
      scene.add(iR_Water);
      scene.add(iR_Water_Simple);
      scene.add(iR_Tree);

      buildingMesh = 0;

      buildingGeometries = [];
      buildingColliders = [];

      switch (selectedOption.value) {
        case 'losangeles':
          console.log("Selected Location: Los Angeles");
          geoDataUrl = "./data/vinest.geojson";
          center = [-118.326019, 34.102646]; 
          
          switch8.disabled = false;
          
          break;
        case 'paris':
          console.log("Selected Location: Paris");
          geoDataUrl = "./data/eiffelave.geojson";
          center = [2.29541, 48.85726]; 
          
          switch8.checked = false; 
          switch8.disabled = true; 
          groundMesh.visible = false;
          
          break;
        default:
          console.log("Unknown Location");
      }

      if(!switch8.checked && !scene.children.includes(gridHelper)) scene.add(gridHelper);

      GetGeoJson();
      buildingGrowthProgress = 0;

      function build(){
        setTimeout(function() {
          if(buildingMesh) isGrowingBuildings = true;
          else build();
        }, 100);
      }
      build();
    }
  }, 100);
  
}

function lineIntersection(lineStart, lineEnd, buildingMesh){

  var ray = new THREE.Raycaster(lineStart, lineEnd.clone().sub(lineStart).normalize());
  var intersects = ray.intersectObjects(buildingMesh);
  var lineMaterial = new THREE.LineBasicMaterial();
  return intersects;
  
}

function getBufferGeometryCenter(geometry){

  const boundingBox = new THREE.Box3().setFromBufferAttribute(geometry.attributes.position);

  // Calculate the center point of the bounding box
  const shapeCenter = new THREE.Vector3();
  boundingBox.getCenter(shapeCenter);

  return shapeCenter;

}



/////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////// Map Geometry Visualisation ///////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////


function GetGeoJson() {

  fetch(geoDataUrl).then((res) => {
  
    res.json().then((data) => {
      geoData = data;
      LoadBuildings(data);
      //Info
  	  info.innerText = `Map Center: ${center[1]} ${center[0]}`;
    })
  })
  
}


// Load Functions //

async function LoadTerrain(){
  
  let DEM_BBOX = {
    "east": {"latitude": center[1], "longitude": center[0]+0.080296},
    "north": {"latitude": center[1]+0.044940, "longitude": center[0]},
    "south": {"latitude": center[1]-0.044940, "longitude": center[0]},	
    "west": {"latitude": center[1], "longitude": center[0]-0.080296}	
  }
  // Landscape debug
  console.log(` east: ${center[1]} ${center[0]+0.080296}\n`,
			  `north: ${center[1]+0.044940} ${center[0]}\n`,
			  `south: ${center[1]-0.044940} ${center[0]}\n`,
			  `west: ${center[1]} ${center[0]-0.080296}\n`);
  const rawTiff = await GeoTIFF.fromUrl('./data/terrain.tif');	
  const tifImage = await rawTiff.getImage();					
  const start = [DEM_BBOX.west.longitude, DEM_BBOX.south.latitude];
  const end = [DEM_BBOX.east.longitude, DEM_BBOX.north.latitude];
  let leftBottom = GPSRelativePosition(start, center);
  let rightTop = GPSRelativePosition(end, center);
  let x = Math.abs(leftBottom[0] - rightTop[0]);
  let y = Math.abs(leftBottom [1] - rightTop[1]);
  const geometry = new THREE.PlaneGeometry(x, y, x - 1, y - 1);
  const data = await tifImage.readRasters({ width: Math.floor(x), height: Math.floor(y), resampleMethod: 'bilinear', interleave: true });

  const positionAttribute = geometry.getAttribute('position');
  
  for (let i = 0, j = 0; i < data.length; i++) {
      let el = data[i];
      positionAttribute.setZ(i, el / 30);
  }

  geometry.computeVertexNormals(); // Recalculate normals after modifying vertices
  geometry.attributes.position.needsUpdate = true; // Ensure changes take effect

  geometry.rotateX(Math.PI/ 2);
  geometry.rotateY(Math.PI/ 2);
  geometry.rotateZ(Math.PI);
  
  let plane = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color: 0x999999, side: THREE.DoubleSide, wireframe: true }));
  groundMesh = plane
  plane.position.y = -4;
  scene.add(plane);
  groundMesh.visible = switch8.checked;
  
}


function LoadBuildings(data) {

  let features = data.features;
  
  buildingMaterial = new THREE.MeshPhongMaterial({
    color: buildingsColor,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide
  });
  
  roadMaterial = new THREE.LineBasicMaterial( { 
    color: roadsColor, 
    transparent: true,
    opacity: 0
  });

  for (let i = 0; i < features.length; i++) {
  	
    let fel = features[i];
    if (!fel['properties']) return;
    
    let info = fel.properties;

    if (info['building']) {
      addBuilding(fel.geometry.coordinates, info, info["building:levels"]);
    }
    
    else if(info["highway"]){
      if(fel.geometry.type == "LineString" && info["highway"] != "pedestrian" && info["highway"] != "footway" && info["highway"] != "path"){
        addRoad(fel.geometry.coordinates, info);
      }
    }
  }

  let mergeGeometry = BufferGeometryUtils.mergeBufferGeometries(buildingGeometries);
  buildingMesh = new THREE.Mesh(mergeGeometry, buildingMaterial);
  buildingMesh.scale.y = 0;
  iR.add(buildingMesh);
  combobox1.disabled = false;
  if(combobox1.options[combobox1.selectedIndex].value == 'losangeles') switch8.disabled = false;
  snapSlider.noUiSlider.set(0);
  
  LoadWaters();
  LoadTrees(); 
  
}


function LoadTrees() {
  
  treeLeavesMaterial = new THREE.MeshPhongMaterial({
    color: treeLeavesColor,
    transparent: true,
    opacity: 0,
    shininess: 0,
    side: THREE.DoubleSide
  });

  treeTrunkMaterial = new THREE.MeshPhongMaterial({
    color: 0x4c3527,
    transparent: true,
    opacity: 0,
    shininess: 0,
    side: THREE.DoubleSide
  });
  
  let treeHeight = 0.075;
  
  let features = geoData.features;
  let leaves = new THREE.InstancedMesh(new THREE.TetrahedronGeometry( treeHeight/2, 2 ), treeLeavesMaterial, features.length);
  let trunk = new THREE.InstancedMesh(new THREE.ConeGeometry( treeHeight/10, treeHeight, 4 ), treeTrunkMaterial, features.length);
  leaves.position.y = treeHeight/4 + treeHeight/2.25;
  trunk.position.y = treeHeight/2;

  for (let i = 0; i < features.length; i++) {
    let fel = features[i];
    if (!fel['properties']) continue;
    if (fel.properties['natural'] === "tree" && fel.geometry.type === "Point") {
      addTree(trunk, leaves, fel.properties['height'], fel.geometry.coordinates, fel.properties, i);
    }
  }

  iR_Tree.add(leaves);
  iR_Tree.add(trunk);
  
}


function LoadWaters(){
  
  waterNormalMaterial = new THREE.TextureLoader().load('./textures/water/waternormals.jpg', (texture)=>{
  	texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  });
  waterNormalMaterial.repeat.set( 4, 4 );
  
  
  waterMaterial = {
    textureWidth: 512,
    textureHeight: 512,
    waterNormals: waterNormalMaterial,
    alpha: 1.0,
    sunDirection: new THREE.Vector3(),
    transparent: true,
    waterColor: 0x405070,
    distortionScale: 3.7,
    fog: scene.fog !== undefined
  }
  
  let features = geoData.features;
  for(let i = 0; i < features.length; i++){
    let fel = features[i];
    if(!fel['properties']) return;
    if(fel.properties['natural'] == "water" && fel.geometry.type == "Polygon"){
      addWater(fel.geometry.coordinates, fel.properties);
    }
  }
  
}


// Add Geometry Functions //

function addBuilding(data, info, height = 1) {

  height = height ? height : 1;
  
  let shape, geometry;
  let holes = [];

  for(let i = 0; i < data.length; i++){
    let el = data[i];

    if(i == 0){
      shape = genShape(el, center);
    } else {
      holes.push(genShape(el, center));
    }
  }

  for(let i = 0; i < holes.length; i++){
    shape.holes.push(holes[i]);
  }
  
  geometry = genGeometry(shape, {curveSegments: 1, depth: 0.05 * height, bevelEnabled: false});

  geometry.rotateX(Math.PI / 2);
  geometry.rotateZ(Math.PI);
  
  if(switch8.checked){
    const geometryCenter = getBufferGeometryCenter(geometry);
    
    // Assuming you have a line defined by start and end vectors
    var lineStart = new THREE.Vector3(geometryCenter.x, 0.01, geometryCenter.z);
    var lineEnd = new THREE.Vector3(geometryCenter.x, 10, geometryCenter.z);

    const intersects = lineIntersection(lineStart, lineEnd, scene.children);

    if (intersects.length > 0) {
        geometry.translate(0, intersects[0].point.y, 0);
    }
  }
  
  buildingGeometries.push(geometry);

  let helper = genHelper(geometry);
  if(helper){
    helper.name = info["name"] ? info["name"] : "Building";
    helper.info = info;
    buildingColliders.push(helper);
  }

}


function addTree(trunkMesh, leavesMesh, height, d, info, index) {
  
  let elp = GPSRelativePosition(d, center);
  let el = d;
  let x = elp[0];
  let y = elp[1];
  let shape = genShape(el, center);

  const points = [];
  points.push( new THREE.Vector3( x, y, 0 ) );
  points.push( new THREE.Vector3( x, y, 1 ) );
  
  // Intersaction check
  const materialLine = new THREE.LineBasicMaterial({
      color: 0xffffff
  });

  const geometryLine = new THREE.BufferGeometry().setFromPoints( points );

  const line = new THREE.Line( geometryLine, materialLine );
  line.rotation.set(-Math.PI / 2, 0, Math.PI);

  var lineStart = points[0].clone().applyEuler(line.rotation);
  var lineEnd = points[1].clone().applyEuler(line.rotation);

  var ray = new THREE.Raycaster(lineStart, lineEnd.clone().sub(lineStart).normalize());
  var intersects = ray.intersectObjects(iR.children);

  if (intersects.length > 0) {
      // There is an intersection
      return;
  }
  
  let matrix = new THREE.Matrix4();
  matrix.setPosition(points[0]);
  
  leavesMesh.setMatrixAt(index, matrix);
  leavesMesh.rotation.set(-Math.PI / 2, 0, Math.PI);

  // Set rotation for trunkMesh around its own local center
  let leavesMatrix = new THREE.Matrix4();
  leavesMatrix.makeRotationX(Math.random() * Math.PI);
  leavesMatrix.makeRotationY(Math.random() * Math.PI);
  leavesMatrix.makeTranslation(0, 0, height/600);
  let leavesInstanceMatrix = new THREE.Matrix4();
  leavesMesh.setMatrixAt(index, leavesInstanceMatrix.copy(matrix).multiply(leavesMatrix));

  trunkMesh.setMatrixAt(index, matrix);
  trunkMesh.rotation.set(-Math.PI / 2, 0, Math.PI);

  // Set rotation for trunkMesh around its own local center
  let trunkMatrix = new THREE.Matrix4();
  trunkMatrix.makeRotationX(Math.PI / 2);
  let trunkInstanceMatrix = new THREE.Matrix4();
  trunkMesh.setMatrixAt(index, trunkInstanceMatrix.copy(matrix).multiply(trunkMatrix));

  let geometry = genGeometry(shape, { curveSegments: 1, depth: 0.05 * 1, bevelEnabled: false });
  geometry.rotateX(Math.PI / 2);
  geometry.rotateZ(Math.PI);
  
  treeGeometries.push(geometry);
  
}


function addWater(d, info){
  
  let holes = [];
  let shape, geometry;
  
  for(let i = 0; i < d.length; i++){
    let el = d[i];
    if(i == 0){
    	shape = genShape(el, center);
    } else {
    	holes.push(genShape(el, center));
    }
  }
  
  for(let h = 0; h < holes.length; h++){
  	shape.holes.push(holes[h]);
  }
  
  geometry = genGeometry (shape, {
    curveSegments: 2,
    steps: 1,
    depth: 0.001,
    bevelEnabled: false
  })
  
  waterShaderMesh = new Water(geometry, waterMaterial);
  waterShaderMesh.rotation.set(Math.PI/2, Math.PI, 0);
  
  waterSimpleMesh = new Water(geometry, new THREE.LineDashedMaterial({ color: 0x252533 }));
  waterSimpleMesh.material = new THREE.LineDashedMaterial({ color: 0x252533, transparent: true });
  
  waterShaderMesh.rotation.set(Math.PI/2, Math.PI, 0);
  waterSimpleMesh.rotation.set(Math.PI/2, Math.PI, 0);
  
  waterShaderMesh.material.uniforms.size.value = 32;
  iR_Water.add(waterShaderMesh);
  iR_Water_Simple.add(waterSimpleMesh);
  if(switch6.checked) {iR_Water_Simple.visible = false;}
  else {iR_Water.visible = false;}
  
}


function addRoad(d, info){

  let points = [];

  // Loop for all nodes
  for(let i = 0; i < d.length; i++){

    if(!d[0][1]) return;

    let el = d[i];

    //Just in case
    if(!el[0] || !el[1]) return;

    let elp = [el[0], el[1]];

    //convert position from the center position
    elp = GPSRelativePosition([elp[0], elp[1]], center);

    let height = 0;
    if(switch8.checked){
      
      var lineStart = new THREE.Vector3( -elp[0], 0.01, elp[1] );
      var lineEnd = new THREE.Vector3( -elp[0], 10, elp[1] );

      const intersects = lineIntersection( lineStart, lineEnd, scene.children );
      if (intersects.length > 0){
        height = intersects[0].point.y;
      }
		
    }

    // Draw Line
    points.push( new THREE.Vector3( elp[0], 0.5 - height, elp[1] ) );
  }

  let geometry = new THREE.BufferGeometry().setFromPoints( points );

  geometry.rotateZ(Math.PI);

  let line = new THREE.Line( geometry, roadMaterial );
  line.info = info;
  line.computeLineDistances();

  iR_Road.add(line);
  line.position.set( line.position.x, 0.5, line.position.z );

  let lineLength = geometry.attributes.lineDistance.array[ geometry.attributes.lineDistance.count - 1];

  if(lineLength > 0.8){
    let aniLine = addAnimatedLine( geometry, lineLength );
    iR_Line.add(aniLine);
  }
  
}


function addAnimatedLine(geometry, length){
  
  let animatedLine = new THREE.Line(geometry, new THREE.LineDashedMaterial({ color: roadsAnimationColor }));
  animatedLine.material.transparent = true;
  animatedLine.position.y = 0.5;
  animatedLine.material.dashSize = 0;
  animatedLine.material.gapSize = 1000;

  animatedLineDistances.push(length);

  return animatedLine;
  
}



/////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////// Update Functions /////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////


function UpdateAniLines(){
  
  if(iR_Line.children.length <= 0) return;


  for(let i = 0; i < iR_Line.children.length; i++){
    let line = iR_Line.children[i];

    let dash = parseInt(line.material.dashSize);
    let length = parseInt(animatedLineDistances[i]);


    if (dash > length & roadAnimationFlag) {
      line.material.dashSize = 0;
      line.material.opacity = 1;
    } else {
      line.material.dashSize += animatedLineSpeed;
      line.material.opacity = line.material.opacity > 0 ? line.material.opacity - 0.002 : 0;
    }
  }
  
}

function UpdateWater(){
  
  for(let i = 0; i < iR_Water.children.length; i++){
    iR_Water.children[i].material.uniforms['time'].value += 1.0 / 300;
  }
  
}



/////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////// Utility Functions ////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////


function genShape(points, center) {
  
  let shape = new THREE.Shape();

  for (let i = 0; i < points.length; i++) {
    let elp = points[i];
    elp = GPSRelativePosition(elp, center);

    if (i == 0) {
      shape.moveTo(elp[0], elp[1]);
    } else {
      shape.lineTo(elp[0], elp[1]);
    }
  }

  return shape;
  
}


function genGeometry(shape, settings) {
  
  let geometry = new THREE.ExtrudeBufferGeometry(shape, settings);
  geometry.computeBoundingBox();

  return geometry;
  
}


function genHelper(geometry){

  if(!geometry.boundingBox){
    geometry.computeBoundingBox();
  }

  let box3 = geometry.boundingBox;
  if(!isFinite(box3.max.x)){
    return false;
  }

  let helper = new THREE.Box3Helper( box3, 0xffff00 );
  helper.updateMatrixWorld();
  return helper;
  
}


function GPSRelativePosition(objPosi, centerPosi) {

  let dis = window.geolib.getDistance(objPosi, centerPosi); // Get GPS focalDistance
  let bearing = window.geolib.getRhumbLineBearing(objPosi, centerPosi); // Get bearing angle
  let x = centerPosi[0] + (dis * Math.cos(bearing * Math.PI / 180)); // Calculate X by centerPosi.x + focalDistance * cos(rad)
  let y = centerPosi[1] + (dis * Math.sin(bearing * Math.PI / 180)); // Calculate Y by centerPosi.y + focalDistance * sin(rad)
  return [-x / 100, y / 100]; // Reverse X
  
}


// Pause/unpause animation //
function pauseUnpause() {
    if(paused){
        paused = false;
        pausedTime = clock.getElapsedTime();
    }else{
        paused = true;
        clock.elapsedTime += clock.getElapsedTime() - pausedTime;
    }
}
