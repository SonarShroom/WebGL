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
    this.primitiveType = this.scene.gl.TRIANGLES;
    var radius = (this.outerRadius - this.innerRadius) / 2;

    for(var lat = 0; lat <= this.slices; lat++)
    {
        var theta = lat * Math.PI / this.slices; //Angle formed at the current latitude (from bottom to top)

        for (var long = 0; long <= this.loops; long++)
        {
            var phi = long * 2 * Math.PI / this.slices; //Angle formed at the current longitude (from left to right)

            /**
             * Calculated sines and cosines of theta and
             * phi to make this more efficient.
             */
            var thetaSin = Math.sin(theta);
            var phiSin = Math.sin(phi);
            var thetaCos = Math.cos(theta);
            var phiCos = Math.cos(phi);

            //Torus equations
            var x = (1 + radius * phiCos) * thetaCos;
            var y = (1 + radius * phiCos) * thetaSin;
            var z = radius * phiSin;
            //Torus equations for the texture coordinates.
            var u = 1 - (long / this.loops);
            var v = 1 - (lat / this.slices);

            this.normals.push(x, y, z);
            this.texCoords.push(u, v);
            this.vertices.push(x * this.innerRadius, y * this.innerRadius, z * this.innerRadius);
        }
    }

    //Set indices for the vertices for each triangle
    for (var latNumber = 0; latNumber < this.slices; latNumber++) {
        for (var longNumber = 0; longNumber < this.loops; longNumber++) {
            var first = (latNumber * (this.loops + 1)) + longNumber;
            var second = first + this.loops + 1;
            this.indices.push(first);
            this.indices.push(second);
            this.indices.push(first + 1);
            this.indices.push(second);
            this.indices.push(second + 1);
            this.indices.push(first + 1);
        }
    }

    this.initGLBuffers();
}