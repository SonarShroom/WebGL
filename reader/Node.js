/**
 * Created by Shadic1910 on 22/10/2016.
 */

function Node(id) {
    this.id = id;
    this.indexActiveMaterial = 0;
    this.materials = [];
    this.texture = null;
    this.children = [];
    this.primitive = null;
}

Node.prototype.addMaterial = function(material) {
    this.materials.push(material);
}

Node.prototype.setTexture = function(texture) {
    this.texture = texture;
    for (var i = 0; i < this.materials.length; i++)
        this.materials[i].setTexture(texture);
}

Node.prototype.addChild = function(child) {
    this.children.push(child);
}

Node.prototype.setPrimitive = function(primitive) {
    this.primitive = primitive;
}

Node.prototype.getAllMaterials = function() {
    return this.materials;
}