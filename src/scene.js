var ready,count = 0;
//===================================================================================
//  Load Scene
//===================================================================================
var scenes = {};
var shaderfiles = {};
var voidfunc = function(){};
function loadScene(sceneFile){

    var scenejson = null;
    var f1 = function(){
        if(!scenes[sceneFile])
            HttpRequest('assets/scene/' + sceneFile.replace('.json','')+'.json',null,
            function(success){
                scenejson = JSON.parse(success);
                scenes[sceneFile] = scenejson;
                f2();f2=voidfunc;
            });
        else{
            scenejson = scenes[sceneFile];
            f2();f2=voidfunc;
        }
    }
    
    var newScene = null;
    var f2 = function(){ 
        parseScene(scenes[sceneFile], function(_scene){
            newScene = _scene;
            f3();f3=voidfunc;
        });
    }    

    var f3 = function(){ 
        if(!shaderfiles['shaders/pbr_shaders.txt'])
            APP.renderer.loadShaders('shaders/pbr_shaders.txt',function(_files){
                shaderfiles['shaders/pbr_shaders.txt'] = _files;
                f4();f4=voidfunc;
            });
        else{
            f4();f4=voidfunc;
        }
    }
    var f4 = function(){ 
        childrenShadersWithMaterialMacros(shaderfiles['shaders/pbr_shaders.txt'],newScene._root.getAllChildren(),
        function(){
            f5();f5=voidfunc;
        });
    }
    var f5 = function(){ 
        loadEnv(Environment,function(){
            WB.trigger('NewScene',newScene);
        });
    }   
    f1(); 

}


//===================================================================================
//  Parse Scene
//===================================================================================
function parseScene(json, callback){
    var scene = new RD.Scene();

    //Get All Scene Materials
    if(json.materials){
        var mat;
        for(var m in json.materials){
            mat = json.materials[m];
            materials[mat.id] = materials[getMaterial(mat)];
        }
    }

    //Get All Scene Cameras
    if(json.cameras){
        scene.cameras = []; var camera,config;
        for(var n in json.cameras){ 
            config = json.cameras[n];
            camera = new RD.Camera();
            camera.perspective(config.fov || 45, config.aspect || gl.canvas.width / gl.canvas.height,config.near || 0.01, config.far || 10000.0);
            camera.lookAt(config.eye,config.center,config.up);
            camera.deltapos = camera.position;
            scene.cameras.push(camera);
        }
    }

    //Get All Scene Nodes
    var node, config;
    for(var n in json.nodes){
        config = json.nodes[n];

        node = new RD.SceneNode();
        node.configure( config.config || {} );
        node.id = config.id || node._uid;
        node.setMesh( config.mesh || 'cube' );
        if(config.texture)
            node.setTexture( 'albedo', config.texture || undefined);

        node.material = getMaterial(config.material || null );

        node.shader = config.shader || undefined;

        scene._root.addChild(node);
    }
    scene.env = new RD.SceneNode();
    scene.env.render = drawSkybox;
    scene.env.render_priority = 21;

    if(!scene.cameras || scene.cameras.length == 0){
        scene.cameras = scene.cameras || [];
        scene.cameras.push(new RD.Camera());
    }

    ready = function(){
        if(count == 0){
            if(callback)
                callback(scene);
            return scene;
        }
            
    }
    ready();

}
//===================================================================================
//  Load Scene environment map for reflections and skybox
//===================================================================================
function loadEnv(asset,callback){
    /*if(gl.textures[asset]){
        if(callback)
            callback();
        return;
    }*/

    var imageSources = [APP.renderer.assets_folder+'textures/'+asset+'/left.png'  ,
                        APP.renderer.assets_folder+'textures/'+asset+'/right.png' ,
                        APP.renderer.assets_folder+'textures/'+asset+'/top.png'   ,
                        APP.renderer.assets_folder+'textures/'+asset+'/bottom.png',
                        APP.renderer.assets_folder+'textures/'+asset+'/front.png' ,
                        APP.renderer.assets_folder+'textures/'+asset+'/back.png'];
    loadImages(imageSources, [], function(images){
        gl.textures[asset] = Texture.cubemapFromImages(images,{ minFilter : gl.LINEAR_MIPMAP_LINEAR});
        
        //Preintegrate Irradiance Map for Roughness levels
        preintegrateIrradiance(asset);
        
        if(callback)
            callback();
    });
}

//===================================================================================
//  Create shader using material properties as macros
//===================================================================================
function childrenShadersWithMaterialMacros(files, nodes, callback){
    var node,vs,fs,macros,mat,shader;

    
    

    for(var n in nodes){
        node = nodes[n];
        shader = node.shader || 'phong';
        macros = {};

        if(!materials[node.material]) continue;

        mat = sort(materials[node.material]);
        for(var p in mat){
            if(typeof mat[p] == "string")
                macros[p+'_map'] = '';
        }
        
        vs = files[shader+'.vs'];fs = files[shader+'.fs'];
        if(!vs || !fs){
            console.error('No shader '+shader+' found in URL file.');
            continue; 
        }
        node.shader = shader+object2md5(macros);
        gl.shaders[node.shader] = new Shader(vs,fs,macros);
        
    }
    if(callback)
        callback();
}
/*###################################################################################*/
var oncomplete = function(s){
    count--;
    ready();
}

function getMesh(mesh){
    if(mesh.indexOf('.obj') != -1){
        count++;
        APP.renderer.loadMesh(mesh,oncomplete);
    }
}

function getMaterial(material){
    var mymat = Object.create(materials[material.id] || {});
    
    if(Object.keys(material.mat).length == 0)
        return;
    for(var p in material.mat){
        mymat[p] = material.mat[p];
        if(typeof material.mat[p] == "string"){
            count++;
            APP.renderer.loadTexture(material.mat[p],APP.renderer.default_texture_settings,oncomplete);
        }
    }
    var uid = material.id + object2md5(mymat);
    materials[uid] = mymat;
    return uid;
}
