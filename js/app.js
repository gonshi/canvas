(function(global, doc, $, ns, undefined) {
	'use strict';
	ns = ns || {};

	function EventDispatcher() {
		this._events = {};
	}

	EventDispatcher.prototype.hasEventListener = function(eventName) {
		return !!this._events[eventName];
	};

	EventDispatcher.prototype.addEventListener = function(eventName, callback) {
		if (this.hasEventListener(eventName)) {
			var events = this._events[eventName];
      var i;
      var eventsLength = events.length;
			for ( i = 0; i < eventsLength; i++ ) {
				if (events[i] === callback) {
					return;
				}
			}
			events.push(callback);
		}
		else{
			this._events[eventName] = [callback];
		}
		return this;
	};

	EventDispatcher.prototype.removeEventListener = function(eventName, callback) {
		if (!this.hasEventListener(eventName)) {
			return;
		}
		else{
			var events = this._events[eventName],
					i      = events.length,
					index;
			while (i--) {
				if (events[i] === callback) {
					index = i;
				}
			}
			events.splice(index, 1);
		}
		return this;
	};

	EventDispatcher.prototype.fireEvent = function(eventName, opt_this) {
		if (!this.hasEventListener(eventName)) {
			return;
		}
		else{
			var events = this._events[eventName];
      var i;
      var eventsLength = events.length;
			var copyEvents = $.merge([], events);
			var arg        = $.merge([], arguments);
			arg.splice(0, 2);
			for ( i = 0; i < eventsLength; i++ ) {
				copyEvents[i].apply(opt_this || this, arg);
			}
		}
	};

	ns.EventDispatcher = EventDispatcher;
  global.canvasNamespace = ns;

})(this, document, jQuery, this.canvasNamespace);

(function(global, doc, $, ns, undefined) {
  'use strict';
  ns = ns || {};  

  function Throttle(minInterval) {
    this.interval = minInterval;
    this.prevTime = 0;
    this.timer = function(){};
  }

  Throttle.prototype.exec = function(callback) {
    var now = + new Date(),
        delta = now - this.prevTime;

    clearTimeout(this.timer);
    if( delta >= this.interval ){
      this.prevTime = now;
      callback();
    }
    else{
      this.timer = setTimeout(callback, this.interval);
    }
  };

  ns.Throttle = Throttle;
  global.canvasNamespace = ns;
})(this, document, jQuery, this.canvasNamespace);

(function(global, doc, $, ns, undefined) {
	'use strict';
	ns = ns || {};

  var originalConstructor;
  var	instance;

	/*
	*	@param {}
	*	@return {undefined}
	*/

	function ResizeHandler(){
    var that = this;
    ns.EventDispatcher.call( that );
 	}

  originalConstructor = ResizeHandler.prototype.constructor;
  ResizeHandler.prototype = new ns.EventDispatcher();
  ResizeHandler.prototype.constructor = originalConstructor;

	ResizeHandler.prototype.setEvent = function(){
		var that = this;
		var throttle = new ns.Throttle(250);
    var $wrapper = $( '#wrapper' );

		$( window ).on('load resize', function(){
			throttle.exec(function(){
				that.fireEvent( 'RESIZE', that, $wrapper.width(), $wrapper.height() );
			});
		});
	};

  function getInstance(){
    if (!instance) {
      instance = new ResizeHandler();
    }
    return instance;
  }

  ns.ResizeHandler = {
      getInstance: getInstance
  };

  global.canvasNamespace = ns;

})(this, document, jQuery, this.canvasNamespace);

(function(global, doc, $, ns, undefined) {
  'use strict';
  ns = ns || {};

  var $canvas = $( '#canvas' );
  var $win = $( window );
  var context;
  var RECT_WIDTH;
  var RECT_HEIGHT;
  var INTERVAL = 10;
  var HISTORY_LENGTH = 30;

  $(function() {
    var ellipse = [];
    var ellipse_count = -1;

    var that_i;
    var that_x;
    var that_y;
    var that_r;

    var this_x;
    var this_y;
    var this_r;

    var tmp;
    var distance;
    var i;
    var resizeHandler = ns.ResizeHandler.getInstance();

    if ( !$canvas.get( 0 ).getContext ) return;
    context = $canvas.get( 0 ).getContext( '2d' );

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
      createNextEllipse();
    });

    resizeHandler.addEventListener( 'RESIZE', function(){
      setSize();
    } );

    // init
    createNextEllipse();
    resizeHandler.setEvent();

    function createNextEllipse(){
      ellipse_count += 1;
      ellipse.push( new Ellipse() );
    }

    function collisionDetection( this_i ){
      for ( that_i = this_i + 1; that_i < ellipse_count; that_i++ ){
        this_x = ellipse[ i ].x;
        this_y = ellipse[ i ].y;
        this_r = ellipse[ i ].r;

        that_x = ellipse[ that_i ].x;
        that_y = ellipse[ that_i ].y;
        that_r = ellipse[ that_i ].r;

        distance = ( this_x - that_x ) * ( this_x - that_x ) + ( this_y - that_y ) * ( this_y - that_y ); 

        if ( distance <= ( this_r + that_r ) * ( this_r + that_r ) ){
          tmp = ellipse[ this_i ].velX; 
          ellipse[ this_i ].velX = ellipse[ that_i ].velX;
          ellipse[ that_i ].velX = tmp;
          tmp = ellipse[ this_i ].velY; 
          ellipse[ this_i ].velY = ellipse[ that_i ].velY;
          ellipse[ that_i ].velY = tmp;
        }
      }
    }

    function update(){
      resetCanvas();
      ellipse[ ellipse_count ].increaseSize();

      for ( i = 0; i < ellipse_count; i++ ){
        ellipse[ i ].move();
        collisionDetection( i );
      }
    }

    setInterval( update, INTERVAL );
  });

  function setSize(){
    RECT_WIDTH = $win.width();
    RECT_HEIGHT = $win.height();

    $canvas.get( 0 ).width = RECT_WIDTH;
    $canvas.get( 0 ).height = RECT_HEIGHT;
  }

  // Ellipse Class
  function Ellipse(){
    var red = Math.floor( Math.random() * 255 );
    var green = Math.floor( Math.random() * 255 );
    var blue = Math.floor( Math.random() * 255 );
    var i;
    this.r = 1;
    this.x = 0;
    this.y = 0;
    this.history_x = [];
    this.history_y = [];
    this.velX = 0;
    this.velY = 0;
    this.color = 'rgba(' + red + ', ' + green + ', ' + blue + ', ';
    this.is_mousedown = false;

    for( i = 0; i < HISTORY_LENGTH; i++ ){
      this.history_x.push( -255 );
      this.history_y.push( -255 );
    }
  }

  Ellipse.prototype.increaseSize = function(){
    if ( !this.is_mousedown ) return;

    this.r += 1;
    this.savePosition();
    this.draw();
  };

  Ellipse.prototype.calcVelocity = function( x, y ){ // it might be throttled by calculating the span from the last time
    var FIX_NUM = 5;
    if ( !this.is_mousedown ) return;

    this.velX = ( x - this.x ) / FIX_NUM;
    this.velY = ( y - this.y ) / FIX_NUM;
    this.x = x;
    this.y = y;
  };

  Ellipse.prototype.move = function(){
    this.savePosition();
    this.draw();

    this.x += this.velX;
    this.y += this.velY;
    if ( this.x - this.r < 0 || this.x + this.r > RECT_WIDTH ){
      this.velX = -this.velX;
    }
    if ( this.y - this.r < 0 || this.y + this.r > RECT_HEIGHT ){
      this.velY = -this.velY;
    }
  };

  Ellipse.prototype.savePosition = function(){
    // save the current position to history
    this.history_x.splice( 0, 1 );
    this.history_x.push( this.x );
    this.history_y.splice( 0, 1 );
    this.history_y.push( this.y );
  };

  Ellipse.prototype.draw = function(){
    var i;
    var alpha;
    for( i = HISTORY_LENGTH - 1; i >= 0; i-- ){
      alpha = 0.1 * ( i + 1 );
      context.beginPath();
      context.arc( this.history_x[ i ], this.history_y[ i ], this.r, 0, Math.PI * 2, true );
      context.fillStyle = this.color + alpha + ')'; 
      context.fill();
    }
  };
  //////////////////////////////////////

  function resetCanvas(){
    context.clearRect( 0, 0, RECT_WIDTH, RECT_HEIGHT );
  }

})(this, document, jQuery, this.canvasNamespace);
