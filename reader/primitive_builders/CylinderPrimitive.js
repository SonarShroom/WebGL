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
    //TODO: Add cylinder building logic.

    this.initBuffers();
}