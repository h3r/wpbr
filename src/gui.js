//===================================================================================
//  GUI
//===================================================================================
function setGUI(){
    var files = {"Cerberus HD":"cerberus","Cerberus SD":"cerberus_SD", "Gold-Leather":"gold-leather", "Sphere":"sphere-cracks", "Sphere Matrix":"matrix"};
    var channels = {'All': 0, 'Albedo': 1, 'Roughness': 2, 'Metallic':3, 'Ambient Oclusion':4, 'Normal Map':5, 'Preintegrated BRDF': 6, 'Only Diffuse':7, 'Only Specular':8};
    var envs = {"Helipad SD":"helipad-sd","Helipad HD":"helipad","Desert Highway":"highway","Stairs":"chelsea-stairs",'Milky way':"milkyway","Ocean 1":"ocean-one","Ocean 2":"ocean-two","TEST":"uv-testgrid"};

    var gui = new dat.GUI();

    var ctrl0 = gui.add(window, 'Scene', files);
    ctrl0.onFinishChange(function(value){
        loadScene(value);
    })

    gui.add(window, 'Channel', channels);
    

    var ctrl1 = gui.add(window, 'Environment', envs);
    ctrl1.onFinishChange(function(value){
        loadEnv(value);
    });
    gui.add(window, 'Skybox');
    gui.addColor(window, 'Light 1 Color');
    gui.addColor(window, 'Light 2 Color');


    gui.add(window, 'Rotate',0,360)
    var obj = { 
        'download PREM':function(){ 
            var texture = gl.textures[Environment];
            if(!texture) return;
            var canvas = texture.toCanvas();
            var a = document.createElement("a");
            a.download = "prem_0.png";
            a.href = canvas.toDataURL();
            a.title = "Download file";
            a.appendChild(canvas);
            var new_window = window.open();
            new_window.document.body.appendChild(a);
            //a.click();

            for(var i = 1; i < 6; i++){
                var texture = gl.textures[Environment+'_env_'+i];
                if(!texture) return;
                var canvas = texture.toCanvas();
                canvas.style.width='20%';
                canvas.style.margin='0.35%';
                var a = document.createElement("a");
                a.download = "prem_"+i+".png";
                a.href = canvas.toDataURL();
                a.title = "Download file"; 
                a.appendChild(canvas);
                new_window.document.body.appendChild(a);
                //a.click();
                
            }
            //new_window.close();
        },
        'download pBRDF':function(){
            var texture = gl.textures['brdf_integrator'];
            if(!texture) return;
            var canvas = texture.toCanvas();
            var a = document.createElement("a");
            a.download = "pbrdf.png";
            a.href = canvas.toDataURL();
            a.title = "Download file";
            a.appendChild(canvas);
            var new_window = window.open();
            
            new_window.document.body.appendChild(a);
            new_window.focus();
        }
    };
    gui.add(obj,'download pBRDF');
    gui.add(obj,'download PREM');
    
}

