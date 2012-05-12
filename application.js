
/*globals jQuery, console */

(function($) {

  var idCounter = 0,
      maxDistance = Math.sqrt(Math.pow($(window).height(), 2) + Math.pow($(window).width(), 2)),
      requestAnimFrame,
      Vector,
      Bird,
      System;

  // requestAnim shim layer by Paul Irish
  requestAnimFrame = (function(){
    return  window.requestAnimationFrame       ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame    ||
      window.oRequestAnimationFrame      ||
      window.msRequestAnimationFrame     ||
      function(/* function */ callback, /* DOMElement */ element){
        window.setTimeout(callback, 1000 / 30);
      };
  }());

  Vector = function (x, y) {
    this.x = x;
    this.y = y;
  };
  Vector.prototype = {
    add: function(w) {
      return new Vector(this.x + w.x, this.y + w.y);
    },
    minus: function(w) {
      return new Vector(this.x - w.x, this.y - w.y);
    },
    scale: function(s) {
      return new Vector(this.x * s, this.y *s);
    },
    norm2: function() {
      return this.x*this.x + this.y*this.y;
    }
  };

  Vector.zero = new Vector(0, 0);

  Bird = function(initialPosition) {
    this.id = idCounter++;
    this.output = $("<div>").addClass("dot").appendTo("body");
    this.velocity = Vector.zero;
    this.target = this.current = initialPosition;
  };
  Bird.prototype = {
    updateVelocityBy: function(time, force) {
      this.velocity = this.velocity.add(force.scale(time));
    },
    move: function(time) {
      this.velocity = this.velocity.scale(0.99);
      this.current = this.current.add(this.velocity.scale(time/1000));
    },
    render: function() {
      this.output.css({
        left: this.current.x,
        top: this.current.y
      });
    }
  };

  System = function(point, birds, height, width) {
    var i,j, buckets = [],
        bucketsCount = 60,
        bucketIndexX,
        bucketIndexY,
        calculateForce,
        calculateForceBird,
        calculateForceBetween;

    this.setPoint = function(p) {
      point = p;
    };
    this.ticks = function(time) {
      console.log("Tick: " + time);
      birds.forEach(function(bird) {
        bird.updateVelocityBy(time, calculateForce(bird));

        i = bucketIndexX(bird);
        j = bucketIndexY(bird);

        if(i > 0) {
          if(j > 0) {
            calculateForceBird(bird, buckets[i - 1][j - 1], time);
          }
          calculateForceBird(bird, buckets[i - 1][j], time);
          if(j < bucketsCount - 1) {
            calculateForceBird(bird, buckets[i - 1][j], time);
          }
        }
        if(j > 0) {
          calculateForceBird(bird, buckets[i][j - 1], time);
        }
        calculateForceBird(bird, buckets[i][j], time);
        if(j < bucketsCount) {
          calculateForceBird(bird, buckets[i][j], time);
        }
        if(i < bucketsCount - 1) {
          if(j > 0) {
            calculateForceBird(bird, buckets[i + 1][j - 1], time);
          }
          calculateForceBird(bird, buckets[i + 1][j], time);
          if(j < bucketsCount - 1) {
            calculateForceBird(bird, buckets[i + 1][j], time);
          }
        }

        bird.move(time);
        bird.render();
      });

      buckets = [];
      for(i = 0; i < bucketsCount; i++) {
        buckets.push([]);
        for(j = 0; j < bucketsCount; j++) {
          buckets[i].push([]);
        }
      }

      birds.forEach(function(bird) {
        buckets[bucketIndexX(bird)][bucketIndexY(bird)].push(bird);
      });
    };
    bucketIndexX = function(bird) {
      return Math.min(bucketsCount - 1, Math.max(0, Math.floor(bucketsCount * bird.current.x / width)));
    };
    bucketIndexY = function(bird) {
      return Math.min(bucketsCount - 1, Math.max(0, Math.floor(bucketsCount * bird.current.y / height)));
    };
    calculateForce = function(bird) {
      return calculateForceBetween(point, bird.current, 2.0);
    };
    calculateForceBird = function(bird, bucket, time) {
      bucket.forEach(function(anotherBird) {
        bird.updateVelocityBy(time, calculateForceBetween(bird.current, anotherBird.current, 0.05));
      });
    };
    calculateForceBetween = function(x, y, weight) {
      var difference = x.minus(y);
      return difference.scale(Math.PI * 2.0 * weight / ( Math.max(0.1, difference.norm2())));
    };

    for(i = 0; i < bucketsCount; i++) {
      buckets.push([]);
      for(j = 0; j < bucketsCount; j++) {
        buckets[i].push([]);
      }
    }

    birds.forEach(function(bird) {
      buckets[bucketIndexX(bird)][bucketIndexY(bird)].push(bird);
    });

  };

  $(function () {
    var height = $(window).height(),
        width = $(window).width(),
        birds = [],
        animate;

    for (var i = 0; i < 100; i++) {
      birds.push(new Bird(new Vector(width * Math.random(), height * Math.random())));
    }

    var mousePosition = Vector.zero;
    var system = new System(mousePosition, birds, height, width);

    $(document).mousemove(function(event) {
      mousePosition = new Vector(event.pageX, event.pageY);
      system.setPoint(mousePosition);
    });

    var time, lastTick = new Date();
    animate = function() {
      requestAnimFrame(animate);
      time = new Date();
      system.ticks(time - lastTick);
      lastTick = time;
    };
    animate();

  });

}(jQuery));
