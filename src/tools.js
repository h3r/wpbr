function object2md5(config){
    if( Object.keys(config).length == 0)
        return '';
    var sortedConfig = sort(config);
    config = JSON.stringify(sortedConfig);
    if(typeof config != 'string')
        throw 'object2md5 : something went wrong';
    return md5(config);
}

function sort(object){
    if (typeof object != "object" || object instanceof Array) // Not to sort the array
        return object;
    var keys = Object.keys(object);
    keys.sort();
    var newObject = {};
    for (var i = 0; i < keys.length; i++){
        newObject[keys[i]] = sort(object[keys[i]])
    }
    return newObject;
}

function loadImages(imageSources, skyBoxImages, callback) {
    var imageCount = imageSources.length;
    var loadedCount = 0, errorCount = 0;

    var checkAllLoaded = function() {
        if (loadedCount + errorCount == imageCount ) {
            callback(skyBoxImages);
        }
    };

    var onload = function() {
        loadedCount++;
        checkAllLoaded();
    }, onerror = function() {
        errorCount++;
        checkAllLoaded();
    };

    for (var i = 0; i < imageCount; i++) {
        var img = new Image();
        skyBoxImages.push(img);
        img.onload = onload;
        img.onerror = onerror;
        img.src = imageSources[i];
    }
};

var loadiconcount = 0;
function addLoadIcon(){
    document.getElementById('loading').style.opacity = 1.0;
    loadiconcount++;
}
function endLoadIcon(){
    loadiconcount--;
    if(loadiconcount == 0)
    document.getElementById('loading').style.opacity = 0.0;
}
function hexToRgb(hex) {
    var bigint = parseInt(hex, 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;

    return r + "," + g + "," + b;
}

var colortransform = vec3.fromValues(1/255,1/255,1/255);
function parseColorInput(input){
    var color = vec3.create();
    if(typeof input == "string"){
        input = hexToRgb(input.replace('#',''));
        input = JSON.parse('{"color":['+input+']}');
        input = input.color;
    }
    vec3.multiply(color, input, colortransform);
    return color;
}

function drawLabel(placer,id,label,position,pinpos,size){
    if(!_labels[id]){
        var n = document.createElement('div');
        n.id = id;
        n.className = 'label';
        n.style.position = 'absolute';
        document.querySelector(placer).appendChild(n);
        _labels[id] = id;
    }
    var m = document.getElementById(id);
    m.innerHTML = label;
    m.style.left =  (position[0] - m.clientWidth * 0.5)+'px';
    m.style.top = position[1]+'px';
    m.style['font-size'] = 16+'px';
}