
////////////////////////////////////////////////////////////////////////////////
//                                                                            //
//      P 5 . J S       C A N V A S C A M                                     //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////

// @bitcraftlab 2013 - 2016

// This library provides a 2D camera for the canvas.
// Use this if you want to make your sketch zoomable and draggable
// Original java version here: https://github.com/bitcraftlab/canvascam/

// Changes by github.com/branisha
// TODO: add rotation

p5.prototype.Camera = function(zoom, tx, ty) {

  // variables for storing defaults
  var zoom0, tx0, ty0;

  // self reference
  var cam = this;

  // reset to defaults
  reset(zoom, tx, ty);

  // reset(zoon, tx, ty) will reset to new defaults
  // reset() will reset to previous defaults
  function reset(_zoom, _tx, _ty) {
    zoom = zoom0 = _zoom || zoom0 || 1.0;
    tx = tx0 = _tx || tx0 || 0;
    ty = ty0 = _ty || ty0 || 0;
  }

  var __f = p5.prototype.resetMatrix;
  p5.prototype.resetMatrix = function(){
      __f.bind(p5.instance)();
      translate(width/2, height/2);
      scale(zoom);
      translate(-tx, -ty);
    }
    window.resetMatrix = p5.prototype.resetMatrix;
  // update mouse coordinates of the camera
  var _updateNextMouseCoords = p5.prototype._updateNextMouseCoords;
  p5.prototype._updateNextMouseCoords = function(e) {
    _updateNextMouseCoords.bind(this)(e);
    cam.mouseX = camX(this.mouseX);
    cam.mouseY = camY(this.mouseY);
    // this._setProperty('camMouseX', cam.mouseX);
    // this._setProperty('camMouseY', cam.mouseY);
  };

  // update previous mouse coordinates of the camera
  var _updateMouseCoords = p5.prototype._updateMouseCoords;
  p5.prototype._updateMouseCoords = function(e) {
    _updateMouseCoords.bind(this)(e);
    cam.pmouseX = camX(this.pmouseX);
    cam.pmouseY = camY(this.pmouseY);
    // this._setProperty('pcamMouseX', cam.pmouseX);
    // this._setProperty('pcamMouseY', cam.pmouseY);
  };


  // cam x-coord to canvas x-coord
  function camX(x) {
    return tx + (x - width/2) / zoom;
  }

  // cam y-coord to canvas y-coord
  function camY(y) {
    return ty + (y - height/2) / zoom;
  }

  // expose reset function
  this.reset = reset;

  // rescale the camera relative to the center
  this.scale = function(factor, centerX, centerY) {
    var newZoom = zoom * factor;
    var dx = centerX - width/2;
    var dy = centerY - height/2;
    tx += dx/zoom - dx/newZoom;
    ty += dy/zoom - dy/newZoom;
    zoom = newZoom;
  };

  this.getX = function(){
    return tx;
  }

  this.getY = function(){
    return ty;
  }

  this.moveX = function(dx){
    tx += dx * 1/zoom;
  }

  this.moveY = function(dy){
    ty += dy * 1/zoom;
  }

  // translate the origin of the camera's coordinate system
  this.translate = function(dx, dy) {
    this.moveX(dx);
    this.moveY(dy);
  };

  this.zoom = function(factor){
    this.scale(factor, width/2, height/2);
  }

};
