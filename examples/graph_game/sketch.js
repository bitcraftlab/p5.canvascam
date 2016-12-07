
////////////////////////////////////////////////////////////////////////////////
//                                                                            //
//           G R A P H  - G A M E                                             //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////

// this is a p5.js implementation of the Tronix Graph Game

// Original game by  Danijel Duraković
// http://pulzed.com/demo/tronix11/

// Original graph data (c) Danijel Duraković
// http://pulzed.com/demo/tronix11/data/graphs.json

// You can buy a license here:
// https://codecanyon.net/item/tronix-graph-game/7500462

// You can also play it online here:
// http://treksit.com/



var debug = false;
var level = 0;
var d = 5;
var d2 = 30;

var data;
var graph;
var cam;

function preload() {
    data = loadJSON('data/graphs.json');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  cam = new Camera();
  graph = new Graph(data[level]);
}

function draw() {
  background(255);
  if(graph) {
    graph.draw();
  }
}

////////////////////////////////////////////////////////////////////////////////

function mouseMoved() {
  if(graph) {
    graph.touch(cam.mouseX, cam.mouseY);
  }
}

function mouseDragged() {
  graph.drag(cam.pmouseX, cam.pmouseY, cam.mouseX, cam.mouseY);
}

function mouseWheel(e) {
  var factor = Math.pow(1.01, e.delta);
  cam.scale(factor, mouseX, mouseY);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function keyTyped() {
  switch(key) {
    case 'r':
      cam.reset();
      break;
    case ' ':
      level = (level + 1) % data.length;
      graph = new Graph(data[level]);
      break;
    case 'd':
      debug = !debug;
      break;
  }
}

////////////////////////////////////////////////////////////////////////////////

function Graph(data) {

  var w = 320;
  var h = 480;

  var e = data.E;
  var v = data.V;
  var edges = [];
  var verts = [];

  var selected = null;

  // display the graph
  this.draw = function() {
    push();
    // draw edges
    for(i = 0; i < edges.length; i++) {
      edges[i].draw();
    }
    // draw vertices
    for(i = 0; i < verts.length; i++) {
      verts[i].draw();
    }
    // draw cursor
    if(selected) {
      selected.drawHilight();
    }
    pop();
  };

  // select new vertex
  this.touch = function(x, y) {
    selected = null;
    for(var i = 0; i < verts.length; i++) {
      if(verts[i].touch(x, y)) {
        selected = verts[i];
      }
    }
  };

  // drag a vertex
  this.drag = function(px, py, x, y) {

    // relative motion
    var dx = x - px;
    var dy = y - py;

    if(selected) {

      // move the selected vertex to the top
      var index = verts.indexOf(selected);
      verts.splice(index, 1);
      verts.push(selected);

      // move it
      selected.drag(dx, dy);

      // update intersections
      this.collideEdges();

    } else {
      // if no vertex was selected, move the camera
      cam.translate(-dx, -dy);
    }
  };

  this.collideEdges = function() {

    // reset all collisions
    for(var i = 0; i < edges.length; i++) {
      edges[i].collisions = [];
    }
    // pick first edge to compare
    for(i = 0; i < edges.length; i++) {
      var e1 = edges[i];
      // pick second edge to compare
      for(var j = i + 1; j < edges.length; j++) {
        // collision check
        var e2 = edges[j];
        e1.collideEdge(e2);
      }
    }

  };


  //////////////////////////////////////////////////////////////////////////////

  // create vertices
  for(var i = 0; i < v.length; i++) {
    var x = v[i][0];
    var y = v[i][1];
    verts.push(new Vert(x, y));
  }

  // create edges
  for(i = 0; i < e.length; i++) {
    var v1 = verts[e[i][0]];
    var v2 = verts[e[i][1]];
    edges.push(new Edge(v1, v2));
  }

  // check collisions
  this.collideEdges();

  // reset camera
  cam.reset(1.0, w/2, h/2);


  //////////////////////////////////////////////////////////////////////////////

  function Vert(x, y) {

    this.x = x;
    this.y = y;

    this.hilite = false;

    this.draw = function() {
      noStroke();
      fill(0);
      ellipse(this.x, this.y, d, d);
    };

    this.drawHilight = function() {
      if(this === selected) {
        // draw a bigger circle
        noFill();
        fill(0);
        ellipse(this.x, this.y, d*2, d*2);
        // display activation range
        if(debug) {
          noFill();
          stroke(255, 100, 100, 100);
          ellipse(this.x, this.y, d2, d2);
        }
      }
    };

    this.touch = function(x, y) {
      return (dist(this.x, this.y, x, y) < d2/2);
    };

    this.drag = function(dx, dy) {
      this.x += dx;
      this.y += dy;
    };

  }

  //////////////////////////////////////////////////////////////////////////////

  function Edge(v1, v2) {

    this.v1 = v1;
    this.v2 = v2;
    this.collisions = [];

    // draw the edge
    this.draw = function() {

      var n = this.collisions.length;

      if(n > 0) {
        // hilight the edge in red
        stroke(255, 0, 0, 63);
        strokeWeight(d/2);
        line(v1.x, v1.y, v2.x, v2.y);
        // draw all the collisions
        // (we are currently drawing them twice, once for each edge involved)
        for(var i = 0; i < n; i++) {
          var c = this.collisions[i];
          fill(255, 0, 0, 15);
          noStroke();
          ellipse(c.x, c.y, d*2, d*2);
        }
      } else {
        // show the edge in gray
        stroke(0, 63);
        strokeWeight(d/2);
        line(v1.x, v1.y, v2.x, v2.y);
      }

    };

    // check if this edge intersects any other edge
    this.collideEdge = function(e) {
      // do not consider edges that share a vertex
      if(v1 === e.v1 || v1 === e.v2 || v2 === e.v1 || v2 === e.v2) {
        return false;
      }
      // check if the edges collide
      var collision = collideLineLine(v1.x, v1.y, v2.x, v2.y, e.v1.x, e.v1.y, e.v2.x, e.v2.y, true);
      if(collision.x && collision.y) {
        this.collisions.push(collision);
        e.collisions.push(collision);
        return true;
      }
      // otherwise, no collision
      return false;
    };

  }

}
