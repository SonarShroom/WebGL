/**
 * Created by Soner on 20-10-2016.
 */

function TrianglePrimitive(scene, x1, x2, x3, y1, y2, y3, z1, z2, z3)
{
    this.scene = scene;

    this.x1 = x1;
    this.x2 = x2;
    this.x3 = x3;

    this.y1 = y1;
    this.y2 = y2;
    this.y3 = y3;

    this.z1 = z1;
    this.z2 = z2;
    this.z3 = z3;

    CGFobject.call(this, scene);
    this.initBuffers();
}

TrianglePrimitive.prototype = Object.call(CGFobject.prototype);
TrianglePrimitive.prototype.constructor = TrianglePrimitive;

TrianglePrimitive.prototype.initBuffers = function()
{
    this.primitiveType = this.scene.gl.TRIANGLES;

    this.vertices = [];
    this.normals = [];
    this.indices = [];
    this.texCoords = [];

    this.vertices = [x1, y1, z1,
                     x2, y2, z2,
                     x3, y3, z3];

    /* As this is a regular suface, the normal vectors (perpendicular)
     * can be obtained by the following formula:
     */

    var xNorm = this.y1 * this.z2 - this.z1 * this.y2;
    var yNorm = this.z1 * this.x2 - this.x1 * this.z2;
    var zNorm = this.x1 * this.y2 - this.y1 * this.x2;

    this.normals = [xNorm, yNorm, zNorm,
                    xNorm, yNorm, zNorm,
                    xNorm, yNorm, zNorm];

    this.indices = [0, 1, 2];

    //Calculations to support the single triangle texture coordinates.
    var a = Math.sqrt((this.x1 - this.x3) * (this.x1 - this.x3) + (this.y1 - this.y3) * (this.y1 - this.y3) + (this.z1 - this.z3) * (this.z1 - this.z3));
    var b = Math.sqrt((this.x2 - this.x1) * (this.x2 - this.x1) + (this.y2 - this.y1) * (this.y2 - this.y1) + (this.z2 - this.z1) * (this.z2 - this.z1));
    var c = Math.sqrt((this.x3 - this.x2) * (this.x3 - this.x2) + (this.y3 - this.y2) * (this.y3 - this.y2) + (this.z3 - this.z2) * (this.z3 - this.z2));

    var B = (a * a - b * b + c * c) / (2 * a * c);

    var sinB = Math.sqrt(((a * a) - (a * a) * (B * B)) / (a * a));


    this.texCoords = [0, 0,
                      c, 0,
                      c - a * B, a * sinB];

    this.initGLBuffers();
};