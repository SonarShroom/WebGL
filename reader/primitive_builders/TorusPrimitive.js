/**
 * Created by Soner on 21-10-2016.
 */

function TorusPrimitive(scene, id, innerRadius, outerRadius, slices, loops)
{
    this.scene = scene;
    this.id = id;
    this.innerRadius = innerRadius;
    this.outerRadius = outerRadius;
    this.slices = slices;
    this.loops = loops;

    CGFobject.call(this, scene);
    this.initBuffers();
}

TorusPrimitive.prototype = Object.call(CGFobject.prototype);
TorusPrimitive.prototype.constructor = TorusPrimitive;

TorusPrimitive.initBuffers = function ()
{
    this.vertices = [];
    this.normals = [];
    this.texCoords = [];
    this.indices = [];

    for(var lat = 0; lat <= this.slices; lat++)
    {
        var theta = lat * Math.PI / this.stacks; //Angle formed at the current latitude (from bottom to top)

        for (var long = 0; long <= this.loops; long++)
        {
            var phi = long * 2 * Math.PI / this.slices; //Angle formed at the current longitude (from left to right)

            //Calculated sines and cosines of theta and phi to make this more efficient
            var thetaSin = Math.sin(theta);
            var phiSin = Math.sin(phi);
            var thetaCos = Math.cos(theta);
            var phiCos = Math.cos(phi);

            var x = (1 + radius * phiCos) * thetaCos;
            var y = (1 + radius * phiCos) * thetaSin;
            var z = radius * phiSin;
            var u = 1 - (longNumber / this.loops);
            var v = 1 - (latNumber / this.slices);



        }
    }

    this.initGLBuffers();
}