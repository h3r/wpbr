//===================================================================================
//  GUI
//===================================================================================
function setGUI(){
    var gui = new dat.GUI();

    var files = {"Cerberus HD":"cerberus","Cerberus SD":"cerberus_SD", "Gold-Leather":"gold-leather", "Sphere":"sphere", "Sphere Matrix":"matrix"}
    var ctrl0 = gui.add(window, 'Scene', files);
    ctrl0.onFinishChange(function(value){
        loadScene(value);
    })

    var channels = {'All': 0, 'Albedo': 1, 'Roughness': 2, 'Metallic':3, 'Ambient Oclusion':4, 'Normal Map':5, 'Preintegrated BRDF': 6}
    gui.add(window, 'Channel', channels);
    

    var envs = {"Helipad SD":"helipad-sd","Helipad HD":"helipad","Stairs":"chelsea-stairs",'Milky way':"milkyway","Ocean 1":"ocean-one","Ocean 2":"ocean-two","TEST":"uv-testgrid"};
    var ctrl1 = gui.add(window, 'Environment', envs);
    ctrl1.onFinishChange(function(value){
        loadEnv(value);
    })

    gui.add(window, 'Rotate',0,360)

    gui.add(window,'Skybox')

    

    //setEnvironment
}

