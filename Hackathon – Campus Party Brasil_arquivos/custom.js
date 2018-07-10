/**
 *
 * Version: 0.3.8
 * Author:  Gianluca Guarini
 * Contact: gianluca.guarini@gmail.com
 * Website: http://www.gianlucaguarini.com/
 * Twitter: @gianlucaguarini
 *
 * Copyright (c) Gianluca Guarini
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 **/
(function ($) {
  $.fn.extend({
    BlackAndWhite: function (customOptions) {
      'use strict';
      var $el = this,

        /**
         *
         * Options
         *
         */

        options = $.extend({
          hoverEffect: true,
          webworkerPath: false,
          invertHoverEffect: false,
          speed: 500,
          onImageReady: null,
          intensity: 1,
          crossOrigin: true
        }, customOptions),

        // options shorthand
        hoverEffect = options.hoverEffect,
        webworkerPath = options.webworkerPath,
        invertHoverEffect = options.invertHoverEffect,
        intensity = (typeof options.intensity === 'number' && options.intensity < 1 && options.intensity > 0) ? options.intensity : 1,
        fadeSpeedIn = $.isPlainObject(options.speed) ? options.speed.fadeIn : options.speed,
        fadeSpeedOut = $.isPlainObject(options.speed) ? options.speed.fadeOut : options.speed,
        $window = $(window),

        /**
         *
         * Private vars
         *
         */

        _evtNamespace = '.BlackAndWhite',
        _isIE7 = (document.all && !window.opera && window.XMLHttpRequest) ? true : false,
        _browserPrefixes = ' -webkit- -moz- -o- -ms- '.split(' '),
        _cssPrefixString = {},

        /**
         *
         * features detection
         *
         */

        _cssPrefix = function (property) {
          if (_cssPrefixString[property] || _cssPrefixString[property] === '') {
            return _cssPrefixString[property] + property;
          }
          var e = document.createElement('div'),
            prefixes = ['', 'Moz', 'Webkit', 'O', 'ms', 'Khtml']; // Various supports...
          for (var i in prefixes) {
            if (typeof e.style[prefixes[i] + property] !== 'undefined') {
              _cssPrefixString[property] = prefixes[i];
              return prefixes[i] + property;
            }
          }
          return property.toLowerCase();
        },
        // https://github.com/Modernizr/Modernizr/blob/master/feature-detects/css-filters.js
        _cssfilters = (function () {
          var el = document.createElement('div');
          el.style.cssText = _browserPrefixes.join('filter' + ':blur(2px); ');
          return !!el.style.length && ((document.documentMode === undefined || document.documentMode > 9));
        }()),
        _supportsCanvas = !!document.createElement('canvas').getContext,
        /* Check if Web Workers are supported */
        _supportWebworker = (function () {
          return (typeof (Worker) !== 'undefined') ? true : false;
        }()),
        _cssFilter = _cssPrefix('Filter'),
        _imagesArray = [],
        _webWorker = _supportWebworker && webworkerPath ? new Worker(webworkerPath + 'BnWWorker.js') : false,

        /**
         *
         * Private methods
         *
         */

        /**
         * Mouse leave event callback delegated to the the images container
         * @param  { Object } e jquery event object
         */
        _onMouseLeave = function (e) {
          $(e.currentTarget)
            .find('.BWfade')
            .stop(true, true)
            .animate({
              opacity: invertHoverEffect ? 0 : 1
            }, fadeSpeedOut);
        },
        /**
         * mouseenter event callback delegated to the the images container ($el)
         * @param  { Object } e jquery event object
         */
        _onMouseEnter = function (e) {
          $(e.currentTarget)
            .find('.BWfade')
            .stop(true, true)
            .animate({
              opacity: invertHoverEffect ? 1 : 0
            }, fadeSpeedIn);
        },
        /**
         * Callback triggered anytime an image gets loaded and converted
         * @param  { Object } img: DOM image object
         */
        _onImageReady = function (img) {
          if (typeof options.onImageReady === 'function') {
            options.onImageReady(img);
          }
        },
        /**
         * Initialize the webworker loop
         * @param  { Int } imagesToLoadlength: the amount of images passed to the plugin but not loaded yet
         */
        _initWebworker = function (imagesToLoadlength) {
          // start the webworker when all the images are ready
          if (_webWorker && _supportsCanvas && !_cssfilters && !imagesToLoadlength) {
            // web worker implementation
            _webWorkerLoop();
          }
        },
        /**
         * Loop all the images converting them by using the a webworker script (this process is unobstrusive and it does not block the page loading)
         */
        _webWorkerLoop = function () {

          if (!_imagesArray.length) {
            // terminate the worker
            // the standard way - http://www.w3.org/TR/workers/#dedicated-workers-and-the-worker-interface
            if (_webWorker.terminate) {
              _webWorker.terminate();
            }
            // IE 10 specific - http://msdn.microsoft.com/en-us/library/ie/hh673568(v=vs.85).aspx
            if (_webWorker.close) {
              _webWorker.close();
            }
            return;
          }

          // dispatch the image data to the webworker
          _webWorker.postMessage({
            imgData: _imagesArray[0].imageData,
            intensity: intensity
          });

          // anytime a new image gets converted we continue the loop
          _webWorker.onmessage = function (event) {
            _imagesArray[0].ctx.putImageData(event.data, 0, 0);
            _onImageReady(_imagesArray[0].img);
            _imagesArray.splice(0, 1);
            _webWorkerLoop();
          };
        },
        /**
         * Helper function to check whether an image has been completely loaded
         * @param  { Object } img: DOM image object
         */
        _isImageLoaded = function (img) {
          return img.complete || (typeof img.naturalWidth !== 'undefined' && img.naturalWidth);
        },
        /**
         * Use the HTML5 canvas to generate a B&W image
         * @param  { Object } img: DOM image object
         * @param  { Object } canvas: canvas element where we are going to draw
         * @param  { Int } width: image width
         * @param  { Int } height: image height
         */
        _generateCanvasImage = function (img, canvas, width, height) {
          var ctx = canvas.getContext('2d'),
            currImg = img,
            i = 0,
            grey;

          ctx.drawImage(img, 0, 0, width, height);

          var imageData = ctx.getImageData(0, 0, width, height),
            px = imageData.data,
            length = px.length;

          // web worker superfast implementation
          if (_webWorker) {
            _imagesArray.push({
              imageData: imageData,
              ctx: ctx,
              img: img
            });
          } else {

            // no webworker slow implementation
            for (; i < length; i += 4) {
              var k = px[i] * 0.3 + px[i + 1] * 0.59 + px[i + 2] * 0.11;
              px[i] = ~~(k * intensity + px[i] * (1 - intensity));
              px[i + 1] = ~~(k * intensity + px[i + 1] * (1 - intensity));
              px[i + 2] = ~~(k * intensity + px[i + 2] * (1 - intensity));
            }

            ctx.putImageData(imageData, 0, 0);

            _onImageReady(img);
          }
        },
        /**
         * Print the html element needed to show the B&W image
         * @param  { Array } $img: jQuery array containing the image
         * @param  { Array } $imageWrapper: jQuery array containing the image parent element
         */
        _injectTags = function ($img, $imageWrapper) {

          var img = $img[0],
            src = img.src,
            offset = $img.position(),
            css = {
              top: offset.top,
              left: offset.left,
              position: 'absolute',
              '-webkit-transform': 'translate3d(0,0,0)', // fix for webkit browsers
              opacity: invertHoverEffect ? 0 : 1
            },
            $overlay;

          if (options.crossOrigin) {
            img.crossOrigin = 'anonymous';
          }


          if (_supportsCanvas && !_cssfilters) {
            // add the canvas
            $overlay = $('<canvas width="' + img.naturalWidth + '" height="' + img.naturalHeight + '" class="BWfade"></canvas>');

            css.width = $img.width();
            css.height = $img.height();
            _generateCanvasImage(img, $overlay.get(0), img.naturalWidth, img.naturalHeight);

          } else {

            // it's a modern browser but it doesn't support the css filters
            if (_supportsCanvas) {
              css[_cssFilter] = 'grayscale(' + intensity * 100 + '%)';
            } else {
              // it's an old IE
              css.filter = 'progid:DXImageTransform.Microsoft.BasicImage(grayscale=1)';
            }
            // clone the original image using the css filters
            $overlay = $img.clone().addClass('BWFilter BWfade');
            _onImageReady(img);

          }

          $overlay
            .css(css)
            .prependTo($imageWrapper);

          // fix opacity on the old browsers
          if (!$.support.opacity && invertHoverEffect) {
            $overlay.animate({
              opacity: 0
            }, 0);
          }
        },
        _resizeCanvases = function () {
          $el.each(function (index, currImageWrapper) {
            var img = $(currImageWrapper).find('img'),
              currWidth = $(img).width(),
              currHeight = $(img).height();

            $(this).find('canvas').css({
              width: currWidth,
              height: currHeight
            });

          });
        },
        /**
         * Init the plugin stuff
         */
        _init = function () {
          var imagesToLoadlength = $el.find('img').filter(function () {
            return !$(this).data('_b&w');
          }).length;
          // convert all the images
          $el.each(function (index, tmpImageWrapper) {
            var $imageWrapper = $(tmpImageWrapper),
              $img = $imageWrapper.find('img');
            // this image got already converted
            if ($img.data('_b&w')) {
              return;
            }
            // if this image is not loaded yet
            if (!_isImageLoaded($img[0])) {
              $img.on('load', function () {
                if ($img.data('_b&w_loaded') || !$img[0].complete) {
                  setTimeout(function () {
                    $img.load();
                  }, 20);
                  return;
                }
                _injectTags($img, $imageWrapper);
                $img.data('_b&w_loaded', true);
                imagesToLoadlength--;
                _initWebworker(imagesToLoadlength);
              }).load();
            } else {
              imagesToLoadlength--;
              _injectTags($img, $imageWrapper);
            }
            $img.data('_b&w', true);
          });

          _initWebworker(imagesToLoadlength);

          // binding the hover effect
          if (hoverEffect) {
            $el
              .unbind(_evtNamespace)
              .on('mouseleave' + _evtNamespace, _onMouseLeave)
              .on('mouseenter' + _evtNamespace, _onMouseEnter);
          }
          if (_supportsCanvas && !_cssfilters) {
            $window
              .unbind(_evtNamespace)
              .on('resize' + _evtNamespace + ' orientationchange' + _evtNamespace, _resizeCanvases);
          }

        };

      /**
       *
       * Public Api
       *
       */

      var destroy = function () {
        $el.off(_evtNamespace);
        $window.off(_evtNamespace);
      };

      _init();

      return {
        destroy: destroy
      };
    }
  });
	
	
	$('.bwWrapper').BlackAndWhite({
    hoverEffect : true, // default true
    // set the path to BnWWorker.js for a superfast implementation
    webworkerPath : false,
    // to invert the hover effect
    invertHoverEffect: false,
    // this option works only on the modern browsers ( on IE lower than 9 it remains always 1)
    intensity:1,
    // this option enables/disables the attribute crossorigin=anonymous on image tags. Default true.
    // please refer to https://github.com/GianlucaGuarini/jQuery.BlackAndWhite#important
    crossOrigin: true,
    speed: { //this property could also be just speed: value for both fadeIn and fadeOut
        fadeIn: 200, // 200ms for fadeIn animations
        fadeOut: 800 // 800ms for fadeOut animations
    },
    onImageReady:function(img) {
    	// this callback gets executed anytime an image is converted
    }
});


/** fine B&W **/

	
}(jQuery));










function counter(date) {
  var theDate = new Date(date);
  var _second = 1000;
  var _minute = _second * 60;
  var _hour = _minute * 60;
  var _day = _hour * 24;
  var timer;

  function count() {
    var now = new Date();
    if (theDate > now) {
      var distance = theDate - now;
      if (distance < 0) {
        clearInterval(timer);
        return;
      }
    } else {
      var distance = now - theDate;
      if (distance < 0) {
        clearInterval(timer);
        return;
      }
    }
    var days = Math.floor(distance / _day);
    var hours = Math.floor((distance % _day) / _hour);
    if (hours < 10) {
      hours = '0' + hours;
    }
    var minutes = Math.floor((distance % _hour) / _minute);
    if (minutes < 10) {
      minutes = '0' + minutes;
    }
    var seconds = Math.floor((distance % _minute) / _second);
    if (seconds < 10) {
      seconds = '0' + seconds;
    }
    var daytext = '';
    if (days > 1) {
      daytext = ' days ';
    } else {
      daytext = ' day ';
    }
    if (days > 0) {
      //document.getElementById('counter').innerHTML = '<span class="days">' + days + '</span>' + '<span class="hours">' + hours + '</span>' + '<i> : </i>' + '<span class="minutes">' + minutes + '</span>' + '<i> : </i>' + '<span class="seconds">' + seconds + '</span>';
    } else {
      document.getElementById('counter').innerHTML = '<span class="hours">' + hours + '</span>' + '<i> : </i>' + '<span class="minutes">' + minutes + '</span>' + '<i> : </i>' + '<span class="seconds">' + seconds + '</span>';
    }
  }
  timer = setInterval(count, 1000);
}

var d = new Date("04/30/2018 23:59:00");
var now = new Date();
//console.log(now);


if (now > d ){
  counter('05/15/2018 00:00:00');
}else {
  counter('04/30/2018 23:59:00');
}
//
//
//
// function counter2(date) {
//   var theDate = new Date(date);
//   var _second = 1000;
//   var _minute = _second * 60;
//   var _hour = _minute * 60;
//   var _day = _hour * 24;
//   var timer;
//
//   function count() {
//     var now = new Date();
//     if (theDate > now) {
//       var distance = theDate - now;
//       if (distance < 0) {
//         clearInterval(timer);
//         return;
//       }
//     } else {
//       var distance = now - theDate;
//       if (distance < 0) {
//         clearInterval(timer);
//         return;
//       }
//     }
//     var days = Math.floor(distance / _day);
//     var hours = Math.floor((distance % _day) / _hour);
//     if (hours < 10) {
//       hours = '0' + hours;
//     }
//     var minutes = Math.floor((distance % _hour) / _minute);
//     if (minutes < 10) {
//       minutes = '0' + minutes;
//     }
//     var seconds = Math.floor((distance % _minute) / _second);
//     if (seconds < 10) {
//       seconds = '0' + seconds;
//     }
//     var daytext = '';
//     if (days > 1) {
//       daytext = ' days ';
//     } else {
//       daytext = ' day ';
//     }
//     if (days > 0) {
//       document.getElementById('counter2').innerHTML = '<span class="days">' + days + '</span>' + '<span class="hours">' + hours + '</span>' + '<i> : </i>' + '<span class="minutes">' + minutes + '</span>' + '<i> : </i>' + '<span class="seconds">' + seconds + '</span>';
//     } else {
//       document.getElementById('counter2').innerHTML = '<span class="hours">' + hours + '</span>' + '<i> : </i>' + '<span class="minutes">' + minutes + '</span>' + '<i> : </i>' + '<span class="seconds">' + seconds + '</span>';
//     }
//   }
//   timer = setInterval(count, 1000);
// }
//
// counter2('05/15/2018 1:00:00 GMT-0400 (EDT)');




jQuery(document).ready(function(){

	jQuery('.jx-evont-testimonials-1 .col-sm-4').attr('class','col-sm-6');

	jQuery('form#mailchimp input[type="email"]').attr('placeholder','Email');

  jQuery('.questa-classe-non-e-acqua').click(function(){
    document.getElementById("cpform").style.height = "100%";
  });

  jQuery('#contact-form').submit(function(e) {
      e.preventDefault();

      var first_name = jQuery("#first_name").val();
      var last_name = jQuery("#last_name").val();
      var email = jQuery("#email").val();
      var type = jQuery("#type").val();
      var denomination = jQuery("#denomination").val();
      var phone = jQuery("#phone").val();
      var recaptcha = jQuery("#g-recaptcha-response").val();
      var country = jQuery("#country").val();

      if (jQuery("#trattamento_dati_personali").is(':checked') && jQuery("#informativa_privacy").is(':checked')) {
        jQuery.ajax({
            url:  'https://campuse.ro/api/v2/leads/create/',
            data: {
              first_name: first_name,
              last_name: last_name,
              email: email,
              type: type,
              denomination: denomination,
              phone: phone,
              third_part_privacy: false,
              recaptcha: recaptcha,
              country: country,
            },
            type: 'POST',
                success:function(data){
                  if (data.success == true) {
                    jQuery('#contact-form').addClass('hidden');
                    jQuery('#msg-ok').removeClass('hidden');
                    jQuery('#msg-ko').addClass('hidden');

                    setTimeout(closeNav, 3000)
                  } else {
                    jQuery('#msg-ko').removeClass('hidden');
                  }


                  // closeNav();
            },
            error:function(data){
                console.log(data);
            }
        });
        return true;
      } else {
				alert("Devi dichiarare di aver letto la normativa sulla privacy e il trattamento dei dati personali");
				window.scrollTo(0,0);
				return false;
      }
  });

});

function closeNav() {
    document.getElementById("cpform").style.height = "0%";
};





// var $input = $('.form-fieldset > input');
//
// $input.blur(function (e) {
//   jQuery(this).toggleClass('filled', !!$(this).val());
// });
