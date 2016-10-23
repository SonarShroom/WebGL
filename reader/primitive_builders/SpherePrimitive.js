/**
 * Created by Soner on 18-10-2016.
 */

function SpherePrimitive(scene, id, radius, slices, stacks)
{
    this.scene = scene;
    this.id = id;

    this.radius = radius;

    this.slices = slices;
    this.stacks = stacks;

    CGFobject.call(this, scene);
    this.initBuffers();
}

SpherePrimitive.prototype = Object.call(CGFobject.prototype);
SpherePrimitive.prototype.constructor = SpherePrimitive;

SpherePrimitive.prototype.initBuffers = function()
{
    this.primitiveType = this.scene.gl.TRIANGLES;

    this.vertices = [];
    this.indices = [];
    this.normals = [];
    this.texCoords = [];

    /**
     * Latitude Cycle, runs through the whole circle vertically.
     */
    for (var lat = 0; lat <= this.stacks; lat++) {
        var theta = lat * Math.PI / this.stacks; //Angle formed at the current latitude (from bottom to top)

        /**
         * Longitude cycle, runs through the whole circle horizontally.
         */
        for (var long = 0; long <= this.slices; long++) {
            var phi = long * 2 * Math.PI / this.slices; //Angle formed at the current longitude (from left to right)

            /**
             * Calculated sines and cosines of theta and
             * phi to make this more efficient.
             */
            var thetaSin = Math.sin(theta);
            var phiSin = Math.sin(phi);
            var thetaCos = Math.cos(theta);
            var phiCos = Math.cos(phi);

            /**
             * We calculate x y and z first without taking the radius into account
             * to save on processing power. This is because the normalized normal
             * is always equal to the vector without being multiplied by the radius.
             */
            var x = phiCos * thetaSin;
            var y = phiSin * thetaSin;
            var z = thetaCos;

            this.vertices.push(this.radius * x, this.radius * y, this.radius * z);
            this.normals.push(x, y, z);
            this.texCoords.push(long / this.slices, lat / this.stacks);
        }

        /**
         * Sweeps the circle starting from the latitude
         * to set the indices.
         */
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
};