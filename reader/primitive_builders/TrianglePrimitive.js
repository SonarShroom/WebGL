/**
 * Created by Soner on 20-10-2016.
 */

function TrianglePrimitive(scene, id, x1, x2, x3, y1, y2, y3, z1, z2, z3)
{
    this.scene = scene;
    this.id = id;

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

    this.initGLBuffers();
};