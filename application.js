
/*globals jQuery, console */

(function($) {

  var idCounter = 0,
      maxDistance = Math.sqrt(Math.pow($(window).height(), 2) + Math.pow($(window).width(), 2)),
      Vector,
      Bird,
      System;

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
      this.current = this.current.add(this.velocity.scale(time/1000));
    },
    render: function() {
      this.output.css({
        left: this.current.x,
        top: this.current.y
      });
    }
  };

  System = function(point, birds) {
    var calculateForce;

    this.setPoint = function(p) {
      point = p;
    };
    this.ticks = function(time) {
      // console.log("Tick: " + time);
      birds.forEach(function(bird) {
        bird.updateVelocityBy(time, calculateForce(bird));
        bird.move(time);
        bird.render();
      });
    };
    calculateForce = function(bird) {
      var difference = point.minus(bird.current);
      return difference.scale(Math.PI * 2.0 * 2.0 / ( Math.max(0.1, difference.norm2())));
    };
  };

  $(function () {
    var birds = [];

    for (var i = 0; i < 1000; i++) {
      birds.push(new Bird(new Vector($(window).width() * Math.random(), $(window).height() * Math.random())));
    }

    var mousePosition = Vector.zero;
    var system = new System(mousePosition, birds);

    $(document).mousemove(function(event) {
      mousePosition = new Vector(event.pageX, event.pageY);
    });
    $(document).click(function() {
      system.setPoint(mousePosition);
    });

    var time, lastTick = new Date();
    setInterval(function() {
      time = new Date();
      system.ticks(time - lastTick);
      lastTick = time;
    }, 50);
  });

}(jQuery));
