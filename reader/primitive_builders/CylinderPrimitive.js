/**
 * Created by Shadic1910 on 22/10/2016.
 */

function CylinderPrimitive(scene, base, top, height, slices, stacks)
{

    this.scene = scene;
    this.base = base;
    this.top = top;
    this.height = height;
    this.slices = slices;
    this.stacks = stacks;
    CGFobject.call(this, scene);
    this.initBuffers();

}

CylinderPrimitive.prototype = Object.call(CGFobject.prototype);
CylinderPrimitive.prototype.constructor = CylinderPrimitive;

CylinderPrimitive.initBuffers = function()
{
    this.primitiveType = this.scene.gl.TRIANGLES;

    this.vertices = [];
    this.indices = [];
    this.normals = [];
    this.texCoords = [];

    var transition = (this.base - this.top) / this.stacks;

    for (var lat = 0; lat <= this.stacks; lat++) {
        var theta = lat * (Math.PI / 2) / this.stacks;
        var radius = top + transition * lat;

        for (var long = 0; long <= this.slices; long++) {
            var phi = long * 2 * Math.PI / this.slices;

            var x = Math.cos(phi);
            var y = Math.sin(phi);
            var z = Math.cos(theta);

            //Keep the normal vectors normalized.
            this.normals.push(x, y, z);
            this.vertices.push(radius * x, radius * y, this.height * z);
            this.texCoords.push(lat / this.stacks, long / this.slices);
        }
    }

    for (var lat = 0; lat < this.stacks; lat++) {
        for (var long = 0; long < this.slices; long++) {
            var first = (lat * (this.slices + 1)) + long;
            var second = first + this.slices + 1;
            this.indices.push(first, second, first + 1);
            this.indices.push(second, second + 1, first + 1);
        }
    }

    this.initGLBuffers();
}