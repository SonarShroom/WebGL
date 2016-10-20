/**
 * Created by Soner on 18-10-2016.
 */

function SpherePrimitive(scene, id, radius, slices, stacks)
{
    CGFobject.call(this, scene);

    this.id = id;
    this.radius = radius;
    this.slices = slices;
    this.stacks = stacks;

    this.initBuffers();
}

SpherePrimitive.prototype = Object.call(CGFobject.prototype);
SpherePrimitive.prototype.constructor = SpherePrimitive;

SpherePrimitive.prototype.initBuffers = function()
{
    this.primitiveType = this.scene.gl.TRIANGLES;

    this.vertexData = [];
    this.indexData = [];
    this.normalData = [];
    this.texCoordsData = [];

    /**
     * Latitude Cycle, runs through the whole circle vertically.
     */
    for (var lat = 0; lat <= this.stacks; lat++) {
        var theta = lat * Math.PI / this.stacks;

        /**
         * Longitude cycle, runs through the whole circle horizontaly.
         */
        for (var long = 0; long <= this.slices; long++) {
            var phi = long * 2 * Math.PI / this.slices;

            var x = this.radius * Math.cos(phi) * Math.sin(theta);
            var y = this.radius * Math.sin(phi) * Math.sin(theta);
            var z = this.radius * Math.cos(theta);

            this.vertexData.push(x, y, z);
            this.texCoordsData.push(long / this.slices, lat / this.stacks);
        }

        //Due to being a sphere, all normals are equal to the vertices, if you're not normalizing them.
        this.normalData = this.vertices;

        for (var lat = 0; lat < this.stacks; lat++) {
            for (var long = 0; long < this.slices; long++) {
                var first = (lat * (this.slices + 1)) + long;
                var second = first + this.slices + 1;
                this.indexData.push(first, second, first + 1);
                this.indexData.push(second, second + 1, first + 1);
            }
        }

        this.initGLBuffers();
    }
};