function MySceneGraph(filename, scene)
{
	this.loadedOk = null;
	
	// Establish bidirectional references between scene and graph
	this.scene = scene;
	scene.graph=this;
		
	// File reading 
	this.reader = new CGFXMLreader();

    //Elements to be determined when parsing (Excluding scene)
    this.root = null;
    this.axis_length = 0;
    this.views = [];
    //Illumination and lights
    this.illumination = [];
    this.lights = [];
    this.lights.omni = [];
    this.lights.spot = [];
    //Materials and textures
    this.textures = [];
    this.materials = [];
    //Primitives
    this.primitives = [];
    this.components = [];

	/*
	 * Read the contents of the xml file, and refer to this class for loading and error handlers.
	 * After the file is read, the reader calls onXMLReady on this object.
	 * If any error occurs, the reader calls onXMLError on this object, with an error message
	 */
	 
	this.reader.open('scenes/'+filename, this);  
}

/*
 * Callback to be executed after successful reading
 */
MySceneGraph.prototype.onXMLReady = function()
{
	console.log("XML Loading finished.");
	var rootElement = this.reader.xmlDoc.documentElement;
	
	// Here should go the calls for different functions to parse the various blocks
	var error = this.parseDocument(rootElement);

	if (error != null) {
		this.onXMLError(error);
		return;
	}

	this.loadedOk=true;
	
	// As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
	this.scene.onGraphLoaded();
};

MySceneGraph.prototype.parseDocument = function(rootElement)
{
    var err = null;

    //Parse scene
    err = this.parseScene(rootElement);
    this.checkErrors(err);

    //Parse Views
    err = this.parseViews(rootElement);
    this.checkErrors(err);

    //Parse Illumination
    err = this.parseIllumination(rootElement);
    this.checkErrors(err);

    //Parse Lights
    this.parseLights(rootElement);
    this.checkErrors(err);

    //Parse Primitives
    this.parsePrimitives(rootElement);
    this.checkErrors(err);

    //Parse Components
    this.parseComponents(rootElement);
    this.checkErrors(err);

    if(err != null)
    {
        console.error("Parse attempted anyway...");
    }

};

/**
 * Error checker
 */
MySceneGraph.prototype.checkErrors = function(errString)
{
    if(errString != null)
    {
        console.error(errString);
    }
};

/**
 * Parsers for all the non primitive elements.
 */

/**
 * Scene, views, illumination and light parsers.
 */
MySceneGraph.prototype.parseScene = function(rootElement)
{
	var elements = rootElement.getElementsByTagName('scene');
	if (elements == null) {
		return "Scene element is missing.";
	}

	if (elements.length > 1) {
		console.warn("More than one 'scene' element found. Parsing first found element only...");
	}

	var scene = elements[0];

	this.root = this.reader.getString(scene,'root') || 'root';
	this.axis_length = this.reader.getFloat(scene,'axis_length') || 1;
};

MySceneGraph.prototype.parseViews = function(rootElement)
{
    var viewsElements = rootElement.getElementsByTagName('views');

    if (viewsElements == null || viewsElements.length < 1)
    {
        return "Views element is missing.";
    }

    if (viewsElements.length > 1)
    {
        console.warn("Multiple views elements found. Parsing first found element only...");
    }

    var views = viewsElements[0];

    this.views.default = this.reader.getString(views, 'default');
    this.views.perspectives = [];

    var perspectives = views.getElementsByTagName('perspective');

    for(var i=0; i<perspectives.length; i++) {

        //Gets the camera's id, near and far planes, and the angle.
        var id = this.reader.getString(perspectives[i], 'id');
        var near = this.reader.getFloat(perspectives[i], 'near');
        var far = this.reader.getFloat(perspectives[i], 'far');
        var angle = this.reader.getFloat(perspectives[i], 'angle');

        //Gets the from and to positions for this camera
        var from = perspectives[i].getElementsByTagName('from');
        var to = perspectives[i].getElementsByTagName('to');

        //Creates the camera for this perspective element.
        var camera = new CGFcamera(angle, near, far, this.parseCoordinates(from[0], false), this.parseCoordinates(to[0], false));
        camera.id = id;
        this.views.perspectives.push(camera);
    }
};

MySceneGraph.prototype.parseIllumination = function(rootElement)
{
    var illuminationElements =  rootElement.getElementsByTagName('illumination');
    if (illuminationElements == null || illuminationElements.length < 1)
    {
        return "No illumination element found.";
    }

    if (illuminationElements.length > 1) {
        console.warn("More than one element Illumination found. Parsing first found element only...");
    }

    var illumination = illuminationElements[0];

    this.illumination = [];

    this.illumination.doublesided = this.reader.getBoolean(illumination, "doublesided");
    this.illumination.local = this.reader.getBoolean(illumination, "local");
    this.illumination.ambient = this.parseColours(illumination.getElementsByTagName("ambient"));
    this.illumination.background= this.parseColours(illumination.getElementsByTagName("background"));
};

MySceneGraph.prototype.parseLights= function(rootElement)
{
    var lightsElements =  rootElement.getElementsByTagName('lights');

    if (lightsElements == null || lightsElements.length <1)
    {
        return "No lights element found.";
    }

    if(lightsElements.length > 1)
    {
        console.warn("More than one element Lights found. Parsing first found element only...");
    }

    var lights = lightsElements[0];

    for(var i=0; i < lights.childElementCount; i++) {

        //Checks what light it is and parses it accordingly
        switch(lights.children[i].tagName) {
            case "omni":
                this.parseOmniLights(lights.children[i]);
                break;
            case "spot":
                this.parseSpotLights(lights.children[i]);
                break;
            default:
                console.warn("Unknown light type found. Proceeding to next one...");
                break;
        }

    }
};

MySceneGraph.prototype.parseOmniLights = function(omniElement)
{

    //Temporary omnidirectional light.
    var tmp_omni = [];

    var id = this.reader.getString(omniElement, "id");
    var enabled = this.reader.getBoolean(omniElement, "enabled");
    var location = omniElement.getElementsByTagName('location');
    var ambient = omniElement.getElementsByTagName('ambient');
    var diffuse = omniElement.getElementsByTagName('diffuse');
    var specular = omniElement.getElementsByTagName('specular');

    tmp_omni.id = id;
    tmp_omni.enabled = enabled;
    tmp_omni.location = this.parseCoordinates(location[0], true);
    tmp_omni.ambient = this.parseColours(ambient[0]);
    tmp_omni.diffuse = this.parseColours(diffuse[0]);
    tmp_omni.specular = this.parseColours(specular[0]);

    this.lights.omni.push(tmp_omni);

};

MySceneGraph.prototype.parseSpotLights= function(spotElement)
{

    //Temporary spot light.
    var tmp_spot = [];

    var id = this.reader.getString(spotElement,'id');
    var enabled = this.reader.getBoolean(spotElement,"enabled");
    var target = spotElement.getElementsByTagName('target');
    var location = spotElement.getElementsByTagName('location');
    var ambient = spotElement.getElementsByTagName('ambient');
    var diffuse = spotElement.getElementsByTagName('diffuse');
    var specular = spotElement.getElementsByTagName('specular');

    tmp_spot.id = id;
    tmp_spot.enabled = enabled;
    tmp_spot.target = this.parseCoordinates(target[0], false);
    tmp_spot.location = this.parseCoordinates(location[0], false);
    tmp_spot.ambient = this.parseColours(ambient[0]);
    tmp_spot.diffuse = this.parseColours(diffuse[0]);
    tmp_spot.specular = this.parseColours(specular[0]);

    this.lights.spot.push(tmp_spot);
};

/**
 * Simple vector parsers (coordinates and colors)
 */
MySceneGraph.prototype.parseCoordinates = function(coordinatesElement, hasW)
{
    var x = this.reader.getFloat(coordinatesElement, 'x');
    var y = this.reader.getFloat(coordinatesElement, 'y');
    var z = this.reader.getFloat(coordinatesElement, 'z');

    if(!hasW)
        return vec3.fromValues(x, y, z);
    else {
        var w = this.reader.getFloat(coordinatesElement, 'w');
        return vec4.fromValues(x, y, z, w);
    }

};

MySceneGraph.prototype.parseColours = function(colorElement)
{
    var r = this.reader.getFloat(colorElement, 'r');
    var g = this.reader.getFloat(colorElement, 'g');
    var b = this.reader.getFloat(colorElement, 'b');
    var a = this.reader.getFloat(colorElement, 'a');

    return vec4.fromValues(r, g, b, a);
};

/**
 * Property parsers (materials and textures)
 */

MySceneGraph.prototype.parseTextures = function(rootElement)
{
    var textureElements =  rootElement.getElementsByTagName('textures');

    var textures = textureElements[0];

    for(var i=0; i < textures.childElementCount; i++) {
        var texture = textures.children[i];

        var tmp_texture = [];

        tmp_texture.id = this.reader.getString(texture, 'id');
        tmp_texture.file = this.reader.getString(texture, 'file');
        tmp_texture.length_s = this.reader.getString(texture, 'length_s');
        tmp_texture.length_t = this.reader.getString(texture, 'length_t');

        this.textures.push(tmp_texture);
    }
};

MySceneGraph.prototype.parseMaterials = function(rootElement)
{
    var materialsElements =  rootElement.getElementsByTagName('materials');

    if (materialsElements == null || materialsElements.length <1)
    {
        return "No materials element found.";
    }

    if(materialsElements.length > 1)
    {
        console.warn("More than one element Materials found. Parsing first found element only...");
    }

    var materials = materialsElements[0];

    for(var i=0; i < materials.childElementCount; i++) {
        var material = materials.children[i];

        var tmp_material = [];

        var emission = material.getElementsByTagName('emission');
        var ambient = material.getElementsByTagName('ambient');
        var diffuse = material.getElementsByTagName('diffuse');
        var specular = material.getElementsByTagName('specular');
        var shininess = material.getElementsByTagName('shininess');

        tmp_material.id = this.reader.getString(material, 'id');
        tmp_material.emission = this.parseColours(emission[0]);
        tmp_material.ambient = this.parseColours(ambient[0]);
        tmp_material.diffuse = this.parseColours(diffuse[0]);
        tmp_material.specular = this.parseColours(specular[0]);
        tmp_material.shininess = this.reader.getFloat(shininess[0], 'value');

        this.materials.push(tmp_material);
    }
};

/**
 * Primitive parsers.
 */

MySceneGraph.prototype.parsePrimitives = function(rootElement)
{
    var primitivesElements =  rootElement.getElementsByTagName('primitives');

    if(primitivesElements.length > 1)
    {
        console.warn("More than 1 primitives element found. Parsing first found element only...");
    }

    var primitives = primitivesElements[0];

    for ( var i=0; i < primitives.child.length; i++)  {
        var primitive = primitives.children[i];

        switch(primitive.firstChild.tagName) {
            case "rectangle":
                this.parseRectangle(primitive.firstChild);
                break;
            case "triangle":
                this.parseTriangle(primitive.firstChild);
                break;
            case "cylinder":
                this.parseCylinder(primitive.firstChild);
                break;
            case "sphere":
                this.parseSphere(primitive.firstChild);
                break;
            case "torus":
                this.parseTorus(primitive.firstChild);
                break;
        }
    }
}

MySceneGraph.prototype.parseTriangle = function(triElement)
{
    var id = this.reader.getString(triElement,  'id');

    var x1 = this.reader.getFloat(triElement, 'x1');
    var y1 = this.reader.getFloat(triElement, 'y1');
    var z1 = this.reader.getFloat(triElement, 'z1');
    var x2 = this.reader.getFloat(triElement, 'x2');
    var y2 = this.reader.getFloat(triElement, 'y2');
    var z2 = this.reader.getFloat(triElement, 'z2');
    var x3 = this.reader.getFloat(triElement, 'x3');
    var y3 = this.reader.getFloat(triElement, 'y3');
    var z3 = this.reader.getFloat(triElement, 'z3');

    this.primitives.push(new TrianglePrimitive(this.scene, id, x1, x2, x3, y1, y2, y3, z1, z2, z3));
};

MySceneGraph.prototype.parseRectangle = function(rectElement)
{
    var id = this.reader.getString(rectElement,  'id');

    var x1 = this.reader.getFloat(rectElement, 'x1');
    var y1 = this.reader.getFloat(rectElement, 'y1');
    var x2 = this.reader.getFloat(rectElement, 'x2');
    var y2 = this.reader.getFloat(rectElement, 'y2');

    this.primitives.push(new RectanglePrimitive(this.scene, id, x1, x2, y1, y2));
};

MySceneGraph.prototype.parseSphere = function(sphereElement)
{
    var id = this.reader.getString(sphereElement,  'id');

    var radius = this.reader.getFloat(sphereElement, 'radius');
    var slices = this.reader.getFloat(sphereElement, 'slices');
    var stacks = this.reader.getFloat(sphereElement, 'stacks');

    this.primitives.push(new SpherePrimitive(this.scene, id, radius, slices, stacks));
};

MySceneGraph.prototype.parseTorus = function(torusElement)
{
    var id = this.reader.getString(torusElement,  'id');

    var innerRadius = this.reader.getFloat(torusElement, 'inner');
    var outerRadius = this.reader.getFloat(torusElement, 'outer');
    var slices = this.reader.getInteger(torusElement, 'slices');
    var loops = this.reader.getInteger(torusElement, 'loops');

    this.primitives.push(new TorusPrimitive(this.scene, id, innerRadius, outerRadius, slices, loops));
};

MySceneGraph.prototype.parseCylinder = function(cylinderElement)
{
    var id = this.reader.getString(cylinderElement,  'id');

    var base = this.reader.getFloat(cylinderElement, 'base');
    var top = this.reader.getFloat(cylinderElement, 'top');
    var height = this.reader.getFloat(cylinderElement, 'height');
    var slices = this.reader.getInteger(cylinderElement, 'slices');
    var stacks = this.reader.getInteger(cylinderElement, 'stacks');

    this.primitives.push(new CylinderPrimitive(this.scene, id, base, top, height, slices, stacks));
};

MySceneGraph.prototype.parseComponents = function(rootElement) {
    var componentsElements =  rootElement.getElementsByTagName('components');

    var components = componentsElements[0];

    this.components = [];

    for(var i=0; i < components.children.length; i++) {
        var component = components.children[i];
        var tmp_component = [];

        tmp_component['id'] = this.reader.getString(component,'id');

        //TRANSFORMATIONS
        var transformation = component.getElementsByTagName("transformation");

        tmp_component['transformation'] = [];

        if(transformation[0].getElementsByTagName("transformationref") != 0) {
            var transformationref = transformation[0].getElementsByTagName("transformationref");
            tmp_component['transformation']['hasRef'] = true;
            tmp_component['transformation']['transformationref'] = transformationref;
        }
        else {
            for(var j=0; j<transformation[0].childElementCount; j++) {
                var transformationElement = [];

                switch (transformation[0].children[j].tagName) {
                    case 'translate':
                        transformationElement['attributes'] = this.parseCoordinates(transformation[0].children[j], false);
                        transformationElement['type'] = 'translate';
                        tmp_component.transformation.push(transformationElement);
                        break;

                    case 'rotate':
                        transformationElement['axis'] = this.reader.getString(transformation[0].children[j], 'axis');
                        transformationElement['angle'] = this.reader.getString(transformation[0].children[j], 'angle');
                        transformationElement['type'] = 'rotate';
                        tmp_component.transformation.push(transformationElement);
                        break;

                    case 'scale':
                        transformationElement['attributes'] = this.parseCoordinates(transformation[0].children[j], false);
                        transformationElement['type'] = 'scale';
                        tmp_component.transformation.push(transformationElement);
                        break;
                }
            }
            tmp_component['transformation']['hasRef'] = false;
        }

        //MATERIALS
        var materials = component.getElementsByTagName("materials");

        tmp_component['material'] = [];
        for(var j=0; j<materials[0].childElementCount; j++) {
            var id = this.reader.getString(materials[0].children[j], "id");
            tmp_component.material.push(id);
        }

        var texture = component.getElementsByTagName("texture");

        tmp_component['texture'] = this.reader.getString(texture[0],'id');

        var children = component.getElementsByTagName("children");

        tmp_component['children'] = [];
        tmp_component['children']['componentref'] = [];
        tmp_component['children']['primitiveref'] = [];

        for(var j=0; j<children[0].childElementCount; j++) {
            var child = [];
            switch(children[0].children[j].tagName) {
                case "componentref":
                    tmp_component.children.componentref.push(this.reader.getString(children[0].children[j], "id"));
                    break;

                case "primitiveref":
                    tmp_component.children.primitiveref.push(this.reader.getString(children[0].children[j], "id"));
                    break;
            }
        }

        this.components.push(tmp_component);
        console.log("Component #"+i+" with id '"+tmp_component.id+"' added!");

    }
};

/*
 * Example of method that parses elements of one block and stores information in a specific data structure
 */
MySceneGraph.prototype.parseGlobalsExample = function(rootElement) {
	
	var elems =  rootElement.getElementsByTagName('globals');
	if (elems == null) {
		return "globals element is missing.";
	}

	if (elems.length != 1) {
		return "either zero or more than one 'globals' element found.";
	}

	// various examples of different types of access
	var globals = elems[0];
	this.background = this.reader.getRGBA(globals, 'background');
	this.drawmode = this.reader.getItem(globals, 'drawmode', ["fill","line","point"]);
	this.cullface = this.reader.getItem(globals, 'cullface', ["back","front","none", "frontandback"]);
	this.cullorder = this.reader.getItem(globals, 'cullorder', ["ccw","cw"]);

	console.log("Globals read from file: {background=" + this.background + ", drawmode=" + this.drawmode + ", cullface=" + this.cullface + ", cullorder=" + this.cullorder + "}");

	var tempList=rootElement.getElementsByTagName('list');

	if (tempList == null  || tempList.length==0) {
		return "list element is missing.";
	}
	
	this.list=[];
	// iterate over every element
	var nnodes=tempList[0].children.length;
	for (var i=0; i< nnodes; i++)
	{
		var e=tempList[0].children[i];

		// process each element and store its information
		this.list[e.id]=e.attributes.getNamedItem("coords").value;
		console.log("Read list item id "+ e.id+" with value "+this.list[e.id]);
	}

};
	
/*
 * Callback to be executed on any read error
 */
 
MySceneGraph.prototype.onXMLError=function (message) {
	console.error("XML Loading Error: "+message);	
	this.loadedOk=false;
};


