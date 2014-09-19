(function(global, doc, $, ns, undefined) {
  'use strict';
  ns = ns || {};

  var $canvas = $( 'canvas.first' );
  var context;
  var RECT_WIDTH = $canvas.width();
  var RECT_HEIGHT = $canvas.height();
  var INTERVAL = 10;

  $(function() {
    var ellipse = [];
    var ellipse_count = -1;
    var i;
    var compared_i;
    var comparing_x;
    var comparing_y;
    var comparing_radius;
    var compared_x;
    var compared_y;
    var compared_radius;
    var tmp;

    if ( !$canvas.get( 0 ).getContext ) return;

    context = $canvas.get( 0 ).getContext( '2d' );

    // init
    createEllipse();

    $canvas.on( 'mousedown', function( event ){
      ellipse[ ellipse_count ].x = event.clientX;
      ellipse[ ellipse_count ].y = event.clientY;
      ellipse[ ellipse_count ].is_mousedown = true;
    });

    $canvas.on( 'mousemove', function( event ){
      ellipse[ ellipse_count ].calcVelocity( event.clientX, event.clientY );
    });

    $canvas.on( 'mouseup', function(){
      ellipse[ ellipse_count ].is_mousedown = false;
      createEllipse();
    });

    function createEllipse(){
      ellipse_count += 1;
      ellipse[ ellipse_count ] = new Ellipse();
    }

    function update(){
      resetCanvas();
      ellipse[ ellipse_count ].increaseSize();

      for ( i = 0; i < ellipse_count; i++ ){ // should be tryied by one liner
        ellipse[ i ].move();
        // collision detection of each balls
        for ( compared_i = i + 1; compared_i < ellipse_count; compared_i++ ){
          comparing_x = ellipse[ i ].x;
          comparing_y = ellipse[ i ].y;
          comparing_radius = ellipse[ i ].radius;
          compared_x = ellipse[ compared_i ].x;
          compared_y = ellipse[ compared_i ].y;
          compared_radius = ellipse[ compared_i ].radius;

          if ( comparing_x + comparing_radius > compared_x - compared_radius && 
              comparing_x - comparing_radius < compared_x + compared_radius && 
              comparing_y + comparing_radius > compared_y - compared_radius &&
              comparing_y - comparing_radius < compared_y + compared_radius ){
                tmp = ellipse[ i ].accX; 
                ellipse[ i ].accX = ellipse[ compared_i ].accX;
                ellipse[ compared_i ].accX = tmp;
                tmp = ellipse[ i ].accY; 
                ellipse[ i ].accY = ellipse[ compared_i ].accY;
                ellipse[ compared_i ].accY = tmp;
          }
        }
      }
    }

    setInterval( function(){
      update();
    }, INTERVAL );
  });

  // Ellipse Class
  function Ellipse(){
    var red = Math.floor( Math.random() * 255 );
    var green = Math.floor( Math.random() * 255 );
    var blue = Math.floor( Math.random() * 255 );
    this.radius = 1;
    this.x = 0;
    this.y = 0;
    this.accX = 0;
    this.accY = 0;
    this.color = 'rgb(' + red + ', ' + green + ', ' + blue + ')';
    this.is_mousedown = false;
  }

  Ellipse.prototype.increaseSize = function(){
    if ( !this.is_mousedown ) return;

    this.radius += 1;
    this.draw();
  };

  Ellipse.prototype.calcVelocity = function( x, y ){ // it might be throttled by calculating the span from the last time
    var FIX_NUM = 5;
    if ( !this.is_mousedown ) return;

    this.accX = ( x - this.x ) / FIX_NUM;
    this.accY = ( y - this.y ) / FIX_NUM;
    this.x = x;
    this.y = y;
  };

  Ellipse.prototype.move = function(){
    this.draw();
    this.x += this.accX;
    this.y += this.accY;
    if ( this.x - this.radius < 0 || this.x + this.radius > RECT_WIDTH ){
      this.accX = -this.accX;
    }
    if ( this.y - this.radius < 0 || this.y + this.radius > RECT_HEIGHT ){
      this.accY = -this.accY;
    }
  };

  Ellipse.prototype.draw = function(){
    context.beginPath();
    context.arc( this.x, this.y, this.radius, 0, Math.PI * 2, true );
    context.fillStyle = this.color; 
    context.fill();
  };
  //////////////////////////////////////

  function resetCanvas(){
    context.rect( 0, 0, RECT_WIDTH, RECT_HEIGHT );
    context.fillStyle = 'rgb(255, 255, 255)';
    context.fill();
  }

  global.namespace = ns;
})(this, document, jQuery, this.namespace);
