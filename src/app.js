'use strict';
var APP = {
    placer:null,
    ctx: null,
    scene : null,
    cameras : null,  
    renderer: null
};
var materials = {};
 
var Scene = 'cerberus_SD';
var Channel = 0;

var Environment = 'helipad-sd';
var Rotate = 180;
var Skybox = true;
window['Light 1 Color'] = [0.0,0.0,0.0,1.0];
window['Light 2 Color'] = [0.0,0.0,0.0,1.0];

function init(dom_id){
    APP.placer  = document.getElementById(dom_id);
    APP.ctx     = GL.create({width:APP.placer.clientWidth, height:APP.placer.clientHeight, antialias:true, alpha:true});
    APP.renderer= new RD.Renderer(APP.ctx);
    APP.renderer.canvas.addEventListener("webglcontextlost", function(event) {
        event.preventDefault();
        console.warn('context lost');
    }, false);
    APP.renderer.setDataFolder('assets/');
    APP.placer.appendChild( APP.renderer.canvas );
    gl.meshes['subsphere'] = new GL.Mesh.sphere({"subdivisions":128}); //mini patch for a concrete example
    
    WB.trigger('Resize');
    setGUI();

    loadScene(Scene);
}
var texnodes = [];
WB.on('NewScene',function(scene){
    texnodes = [];
    APP.ctx.animate(false);
    APP.scene = scene;
    APP.camera = scene.cameras[0];
    
    
    //Preintegrate BRDF to 2D texture;
    preintegrateBRDF();
    setIOBindings();

    //Update general usage uniforms
    scene.root.preRender = function(renderer, camera){
        scene.root.getAllChildren().map(function(node){
            if(Channel == 0){
                if(node._shader)node.shader = node._shader;
                delete node._shader;
            }
            $temp.obj = materials[node.material];
            if(!$temp.obj) return;
            /*Albedo*/                   if(Channel == 1){node._shader = (node._shader)?node._shader:node.shader;node.shader = '_tex';node.textures.display = node.textures.albedo;return;}
            /*Roughness*/           else if(Channel == 2){node._shader = (node._shader)?node._shader:node.shader;node.shader = '_tex';node.textures.display = node.textures.roughness;return;}
            /*Metalness*/           else if(Channel == 3){node._shader = (node._shader)?node._shader:node.shader;node.shader = '_tex';node.textures.display = node.textures.metalness;return;}
            /*Ambient Occlusion*/   else if(Channel == 4){node._shader = (node._shader)?node._shader:node.shader;node.shader = '_tex';node.textures.display = node.textures.ao;return;}
            /*Bump Mapping*/        else if(Channel == 5){node._shader = (node._shader)?node._shader:node.shader;node.shader = '_texbump';node.textures.display = node.textures.bump;return;}
            /*Preintegrated BRDF*/  else if(Channel == 6){node._shader = (node._shader)?node._shader:node.shader;node.shader = '_texbrdf';node.textures.display = node.textures.brdf;return;}
        });
        
        renderer._uniforms['u_color1'] = parseColorInput(window['Light 1 Color']);
        renderer._uniforms['u_color2'] = parseColorInput(window['Light 2 Color']);
        renderer._uniforms['u_channel'] = Channel;
        renderer._uniforms['u_eye']     = APP.camera.position;
        renderer._uniforms['u_rotation']= Rotate * DEG2RAD;

        drawSkybox();
    }

    //Update node specific uniforms
    scene.root.getAllChildren().map(function(node){
        node.preRender = function(renderer, camera){
            for(var p in materials[node.material] || {}){
                if(typeof materials[node.material][p] === 'string') 
                    node.setTexture(p,materials[node.material][p]);
                else 
                    node._uniforms['u_'+p] = materials[node.material][p];
            }
            if(gl.textures['brdf_integrator'])
                node.setTexture('brdf','brdf_integrator');
            if(gl.textures[Environment]){
                node.setTexture('env',Environment);
                node.setTexture('env_1',Environment+'_env_1');
                node.setTexture('env_2',Environment+'_env_2');
                node.setTexture('env_3',Environment+'_env_3');
                node.setTexture('env_4',Environment+'_env_4');
                node.setTexture('env_5',Environment+'_env_5');
            }
                
        }
    })

    APP.ctx.ondraw = function(){
        APP.renderer.clear([0.0,0.0,0.0,0.0]);
        APP.ctx.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
        APP.renderer.render( APP.scene,  APP.camera , APP.scene._root.getAllChildren());
    }


    APP.ctx.onupdate = function(dt){
        updateIOBindings(dt);
    }

    gl.extensions["EXT_shader_texture_lod"] = gl.getExtension("EXT_shader_texture_lod");
    APP.ctx.animate();
});

