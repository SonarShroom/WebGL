/**
 * Created by Soner on 21-10-2016.
 */

function RectanglePrimitive(scene, id, x1, x2, y1, y2)
{
    this.scene = scene;
    this.id = id;

    this.x1 = x1;
    this.x2 = x2;
    this.y1 = y1;
    this.y2 = y2;

    CGFobject.call(this, scene);
    this.initBuffers();
}

RectanglePrimitive.prototype = Object.call(CGFobject.prototype);
RectanglePrimitive.prototype.constructor = RectanglePrimitive;

RectanglePrimitive.initBuffers = function()
{
    this.primitiveType = this.scene.gl.TRIANGLES;

    this.vertices = [];
    this.indices = [];
    this.normals = [];
    this.texCoords = [];

    this.vertices = [x1, y1, 0,
                     x2, y1, 0,
                     x2, y2, 0,
                     x1, y2, 0];

    this.indices = [0, 1, 2,
                    2, 3, 0];

    this.normals = [0, 0, 1,
                    0, 0, 1,
                    0, 0, 1,
                    0, 0, 1];

    this.texCoords = [0, 0,
                      1, 0,
                      1, 1,
                      0, 1];

    this.initGLBuffers();
}
