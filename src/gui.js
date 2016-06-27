//===================================================================================
//  GUI
//===================================================================================
function setGUI(){
    var files = {"Cerberus HD":"cerberus","Cerberus SD":"cerberus_SD", "Gold-Leather":"gold-leather", "Sphere":"sphere", "Sphere Matrix":"matrix"}
    var channels = {'All': 0, 'Albedo': 1, 'Roughness': 2, 'Metallic':3, 'Ambient Oclusion':4, 'Normal Map':5, 'Preintegrated BRDF': 6}
    var envs = {"Helipad SD":"helipad-sd","Helipad HD":"helipad","Stairs":"chelsea-stairs",'Milky way':"milkyway","Ocean 1":"ocean-one","Ocean 2":"ocean-two","TEST":"uv-testgrid"};

    var gui = new dat.GUI();

    var ctrl0 = gui.add(window, 'Scene', files);
    ctrl0.onFinishChange(function(value){
        loadScene(value);
    })

    gui.add(window, 'Channel', channels);
    

    var ctrl1 = gui.add(window, 'Environment', envs);
    ctrl1.onFinishChange(function(value){
        loadEnv(value);
    })

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
            a.click();

            for(var i = 1; i < 6; i++){
                console.log(Environment+'_env_'+i);
                var texture = gl.textures[Environment+'_env_'+i];
                if(!texture) return;
                var canvas = texture.toCanvas();
                var a = document.createElement("a");
                a.download = "prem_"+i+".png";
                a.href = canvas.toDataURL();
                a.title = "Download file"
                new_window.document.body.appendChild(a);
                a.click();
                
            }
            new_window.close();
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
            a.click();
            new_window.close();
        }
    };
    gui.add(obj,'download pBRDF');
    gui.add(obj,'download PREM');
    
}

