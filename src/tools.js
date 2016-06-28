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