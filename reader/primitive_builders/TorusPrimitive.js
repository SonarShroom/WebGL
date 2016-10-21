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