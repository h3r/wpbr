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
var Rotate = 0;
var Skybox = true;

function init(dom_id){
    APP.placer  = document.getElementById(dom_id);
    APP.ctx     = GL.create({width:APP.placer.clientWidth, height:APP.placer.clientHeight, antialias:true, alpha:true});
    APP.renderer= new RD.Renderer(APP.ctx);
    APP.renderer.setDataFolder('assets/');
    APP.placer.appendChild( APP.renderer.canvas );
    WB.trigger('Resize');
    setGUI();

    loadScene(Scene);
}

WB.on('NewScene',function(scene){
    APP.ctx.animate(false);
    APP.scene = scene;
    APP.camera = scene.cameras[0];
    
    //Preintegrate BRDF to 2D texture;
    preintegrateBRDF();
    setIOBindings();


    //Update general usage uniforms
    scene.root.preRender = function(renderer, camera){
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

        APP.renderer.render( APP.scene,  APP.camera );
        
    }

    APP.ctx.onupdate = function(dt){
        updateIOBindings(dt);

    }

    gl.extensions["EXT_shader_texture_lod"] = gl.getExtension("EXT_shader_texture_lod");
    APP.ctx.animate();
});

