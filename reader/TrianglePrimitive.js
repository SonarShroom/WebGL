/**
 * Created by Soner on 20-10-2016.
 */

function TrianglePrimitive(scene, id, x1, x2, x3, y1, y2, y3, z1, z2, z3)
{
    CGFobject.call(this, scene);

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

    this.initBuffers();
}

TrianglePrimitive.prototype = Object.call(CGFobject.prototype);
TrianglePrimitive.prototype.constructor = TrianglePrimitive;

TrianglePrimitive.prototype.initBuffers = function()
{
    this.primitiveType = this.scene.gl.TRIANGLES;

    this.vertexData = [];
    this.normalData = [];
    this.indexData = [];

    this.vertexData = [x1, y1, z1,
                       x2, y2, z2,
                       x3, y3, z3];

    this.normalData = [0, 0, 1,
                       0, 0, 1,
                       0, 0, 1];

    this.indexData = [0, 1, 2];

    this.initGLBuffers();
};