var $temp = {
    vec2 : vec2.create(),
    vec3 : vec3.create(),
    vec4 : vec4.create(),
    mat3 : mat3.create(),
    mat4 : mat4.create()
}
//===================================================================================
//  Event Dispatcher implementing WhiteBoard software design pattern
//===================================================================================
function ServiceDispatcher(){
    this.agents = {};
}
ServiceDispatcher.prototype.on = function(event,callback){
    if(!this.agents[event])this.agents[event] = [];
    this.agents[event].push(callback);
}
ServiceDispatcher.prototype.trigger = function(event,value){
    if(!this.agents[event]) return;
    for(var a in this.agents[event]){
        this.agents[event][a](value);
    }
}
var WB = new ServiceDispatcher();


//===================================================================================
//  Keyboard and Mouse Bindings
//===================================================================================
var speed = 1.0,autorbit = false,_dt =0.0;
function setIOBindings(){
    var mouse = [0,0];
    APP.ctx.captureKeys(true,false);
    APP.ctx.onkey = function(e){
        if(APP.ctx.keys["20"]){ speed = (speed == 1.0)? 0.1 : 1.0; }
        if(APP.ctx.keys["Q"]) { autorbit = (autorbit)? false : true;}
        if(APP.ctx.keys['96']){ var hit = testCollision(mouse[0],mouse[1]); if(hit) APP.camera._target = hit.hit;}
    }; 
   
    APP.ctx.captureMouse(true);
    APP.ctx.onmousewheel = function(e) {

        vec3.copy($temp.vec3,APP.camera._target);
        var d = vec3.distance(APP.camera._target, APP.camera.position);
        APP.camera.moveLocal([0,0,  e.wheel < 0 ? _dt*2 : -_dt*2]);
        vec3.copy(APP.camera._target,$temp.vec3);
    };
    APP.ctx.onmousemove = function(e){
        mouse = [e.canvasx, gl.canvas.height - e.canvasy];
        if (e.dragging && e.leftButton) {
            APP.camera.orbit(-e.deltax * _dt * 0.1, RD.UP,  APP.camera._target);
            APP.camera.orbit(-e.deltay * _dt * 0.1, APP.camera._right, APP.camera._target );
        }
        if (e.dragging && e.rightButton) {
            APP.camera.moveLocal([-e.deltax * 0.1 * _dt, e.deltay * 0.1 * _dt, 0]);
        }
        
    };
}
function updateIOBindings(dt){
    _dt = dt;
    if(autorbit)    APP.camera.orbit( speed * 0.3 * dt, APP.camera.up, APP.camera._target );
    
    if(APP.ctx.keys["UP"] || APP.ctx.keys["W"]){            APP.camera.moveLocal([0,0,dt * -3 * speed]);}
    else if(APP.ctx.keys["DOWN"] || APP.ctx.keys["S"]){     APP.camera.moveLocal([0,0,dt *  3 * speed]);}

    if(APP.ctx.keys["RIGHT"] || APP.ctx.keys["D"]){         APP.camera.moveLocal([dt *  3 * speed,0,0]);}
    else if(APP.ctx.keys["LEFT"] || APP.ctx.keys["A"]){     APP.camera.moveLocal([dt * -3 * speed,0,0]);}
    
    if(APP.ctx.keys["SPACE"]){                              APP.camera.moveLocal([0,dt *  1 * speed,0]);}
    else if(APP.ctx.keys["SHIFT"]){                         APP.camera.moveLocal([0,dt * -1 * speed,0]);}
}

//===================================================================================
//  Resize
//===================================================================================
var resize = function(){
    APP.ctx.canvas.width   = APP.placer.clientWidth;
    APP.ctx.canvas.height  = APP.placer.clientHeight;
    APP.ctx.viewport(0, 0, APP.ctx.canvas.width, APP.ctx.canvas.height);

    if(APP.camera){
        APP.camera.perspective(APP.camera.fov, APP.placer.clientWidth / APP.placer.clientHeight, APP.camera.near, APP.camera.far);
    }
    console.log('Resize');
}
WB.on('Resize',resize);
window.onresize = resize;


//===================================================================================
//  Find mesh collision
//===================================================================================
function testCollision(x,y)
{
    var vp   = APP.camera._viewprojection_matrix;
    var proj = APP.camera._projection_matrix;
    var view = APP.camera._view_matrix;

    mat4.multiply( vp, proj, view );

    var RT = new GL.Raytracer(vp);
    var ray = RT.getRayForPixel(x,y);

    var object,closest_object = null; closest_t = 10000;
    var objects = APP.scene._root.getAllChildren();
    for(var o in objects){
        object = objects[o];
        if(!object.mesh || !gl.meshes[object.mesh] )
            continue;

        var result = Raytracer.hitTestBox( APP.camera.position, ray, BBox.getMin(gl.meshes[object.mesh].bounding), BBox.getMax(gl.meshes[object.mesh].bounding), object._global_matrix );
        if(result && closest_t > result.t)
        {
            closest_object = object;
            closest_t = result.t;
        }
    }
    if(closest_object !== null){
        var mesh = gl.meshes[object.mesh];
        if(!mesh.octree)
            mesh.octree = new GL.Octree( mesh );
        var hit = mesh.octree.testRay( APP.camera.position, ray, 0.01, 1000 );
        if(!hit)
            return;
        return hit;
    }
}



//===================================================================================
//  Draw Skybox
//===================================================================================
function drawSkybox(){
    if( gl.shaders['_env'] && Skybox && gl.textures[Environment]){
       
        gl.textures[Environment].bind(0);
        gl.disable(gl.DEPTH_TEST);

        APP.camera.updateMatrices();
        mat4.invert($temp.mat4, APP.camera._viewprojection_matrix);
        gl.shaders['_env'].uniforms({
            u_rotation: Rotate * DEG2RAD,
            u_env_texture:0,
            u_inv_viewprojection_matrix:$temp.mat4
        }).draw(Mesh.getScreenQuad(), gl.TRIANGLES);

        gl.enable(gl.DEPTH_TEST);
        gl.textures[Environment].unbind(0);
    }
}

//===================================================================================
//  Preintegrate BRDF to 2D texture
//===================================================================================
function preintegrateBRDF(){
    var id = 'brdf_integrator';
    var tex = gl.textures[id];
    if(!tex){
        tex = new GL.Texture(512,512, { texture_type: gl.TEXTURE_2D, minFilter: gl.NEAREST, magFilter: gl.NEAREST });
    }
    tex.drawTo(function(texture, face){
        gl.shaders['_brdf'].uniforms({}).draw(Mesh.getScreenQuad(), gl.TRIANGLES);
        return;
    });
    gl.textures[id] = tex;
}

//===================================================================================
//  //Preintegrate Irradiance Map for Roughness levels
//===================================================================================
var cubemapCam = new RD.Camera();
cubemapCam.perspective( 90, 1, 0.01, 100000.0 );
function preintegrateIrradiance(asset){
    for(var i = 1; i < 6; i++){
        var id = asset+'_env_'+i;
        var tex = gl.textures[id];
        var Roughness = i/5,eye,dir,center,up,uniforms;
        if(!tex){
            tex = new GL.Texture(512,512, { texture_type: gl.TEXTURE_CUBE_MAP, minFilter: gl.NEAREST, magFilter: gl.NEAREST });
            console.log('new roughness texture created for:'+Environment)    
    }
        gl.textures[Environment].bind(0);
        gl.disable(gl.DEPTH_TEST);
        tex.drawTo(function(texture, face){

            eye = cubemapCam.position;
            dir = Texture.cubemap_camera_parameters[face].dir;
            center = vec3.add(vec3.create(),dir,eye);
            up =  Texture.cubemap_camera_parameters[face].up;

            cubemapCam.lookAt(eye,center, up);
            cubemapCam.updateMatrices();
            
            uniforms = {
                'u_rotation':0.0,
                'u_roughness':Roughness,
                'u_env_texture': 0,
                'u_inv_viewprojection_matrix':mat4.invert($temp.mat4, cubemapCam._viewprojection_matrix)            
            };
            gl.shaders['_prem'].uniforms(uniforms).draw(Mesh.getScreenQuad(), gl.TRIANGLES);
        });
        gl.textures[Environment].unbind(0);
        gl.textures[id] = tex;

    }
}