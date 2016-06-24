(function (namespace) {
  // set sticky module and directive
  angular.module(namespace, []).directive(namespace, function () {
    return {
      link: function (scope, angularElement, attrs) {
        var element = angularElement[0];
        var document = element.ownerDocument;
        var window = document.defaultView;
        var wrapper = document.createElement('span');
        var style = element.getAttribute('style');
        var container = element.parentNode;
        // get options
        var top = parseFloat(attrs['top']);
        var media = window.matchMedia(attrs['media'] || 'all');
        var stickToContainer = attrs['stickToContainer'] ? true : false;
        // initialize states
        var stickedToBottom = false;
        var stickedToTop = false;
        var bottom = 0;
        var offset = {};

        function stick() {
          var computedStyle = getComputedStyle(element);
          var position = (stickedToTop) ? 'top: ' + top : 'bottom: 0';
          var parentNode = element.parentNode;
          var nextSibling = element.nextSibling;
          // replace element with wrapper containing element
          wrapper.appendChild(element);

          if (parentNode) {
            parentNode.insertBefore(wrapper, nextSibling);
          }
          // style wrapper
          wrapper.setAttribute('style',
            'display:' + computedStyle.display + ';' +
            'height:' + element.offsetHeight + 'px;' +
            'margin:' + computedStyle.margin + ';');
          // style element
          element.setAttribute('style',
            'left: ' + offset.left + 'px;' +
            'margin: 0;' +
            'position: fixed;' +
            'transition:none;' +
            position + 'px;' +
            'width:' + computedStyle.width);
        }

        function unStick() {
          var parentNode = wrapper.parentNode;
          var nextSibling = wrapper.nextSibling;
          // replace wrapper with element
          parentNode.removeChild(wrapper);
          parentNode.insertBefore(element, nextSibling);
          // unstyle element
          if (style === null) {
            element.removeAttribute('style');
          } else {
            element.setAttribute('style', style);
          }
          // unstyle wrapper
          wrapper.removeAttribute('style');
        }

        function elementReachedWindowBottom() {
          var deltaWindowBottom = element.offsetHeight + offset.top < window.innerHeight;
          return deltaWindowBottom;
        }

        function elementReachedWindowTop() {
          var deltaWindowTop = offset.top < top;
          return deltaWindowTop;
        }

        function stickedElementReachedParent() {
          var parentNode = element.parentNode;
          var parentOffset = parentNode.getBoundingClientRect();

          console.log(parentOffset.top);

          return (stickedToTop) ? parentOffset.top > top : parentOffset.top > 0;
        }

        function elementHeigherThanWindow() {
          return offset.height + top > window.innerHeight;
        }

        function containerBottomReached() {
          var containerOffset = container.getBoundingClientRect();
          return (stickedToTop) ? (containerOffset.bottom - offset.height - top) < 0 : (containerOffset.bottom - window.innerHeight) < 0;
        }

        function deltaContainerBottom() {
          var containerOffset = container.getBoundingClientRect();

          var delta = (stickedToTop) ? (containerOffset.bottom - offset.height) : window.innerHeight - containerOffset.bottom;
          return delta;
        }

        // window scroll listener
        function onscroll() {
          // if activated
          if (media.matches) {
            // get element offset
            offset = element.getBoundingClientRect();

            if (stickToContainer) {
              if (stickedToBottom || stickedToTop) {
                if (containerBottomReached()) {
                  var parentNode = element.parentNode;
                  var parentOffset = parentNode.getBoundingClientRect();
                  var position = (stickedToTop) ? 'top: ' + (deltaContainerBottom()) + 'px;' : 'bottom: ' + (deltaContainerBottom()) + 'px';
                  // style element
                  element.setAttribute('style',
                    'left: ' + parentOffset.left + 'px;' +
                    'margin: 0;' +
                    'position: fixed;' +
                    'transition: none;' +
                    'width: ' + parentOffset.width + 'px;' +
                    position);
                }
              }
            }

            if (elementHeigherThanWindow()) {
              // element to high to be sticked to top
              if (stickedToBottom) {
                // element already sticking to window bottom
                if (stickedElementReachedParent()) {
                  unStick();
                  stickedToBottom = false;
                }
              } else if (elementReachedWindowBottom()) {
                // element not sticked and reached window bottom
                stickedToBottom = true;
                stick();
              }
            } else {
              // element can be sticked to top
              if (stickedToTop) {
                // element already sticking to window top
                if (stickedElementReachedParent()) {
                  unStick();
                  stickedToTop = false;
                }
              } else if (elementReachedWindowTop() || stickedToBottom) {
                // element not sticked and reached window top
                stickedToTop = true;
                stick();
              }
            }
          } else {
            // destroy because of media specification not passed
            if (stickedToBottom || stickedToTop) {
              unStick();
            }
          }
        }

        // window resize listener
        function onresize() {
          if (stickedToTop || stickedToBottom) {
            var position = (stickedToTop) ? 'top: ' + top : 'bottom: 0';
            var parentNode = element.parentNode;
            var parentOffset = parentNode.getBoundingClientRect();
            // style element
            element.setAttribute('style',
              'left: ' + parentOffset.left + 'px;' +
              'margin: 0;' +
              'position: fixed;' +
              'transition:none;' +
              position + 'px;' +
              'width:' + parentOffset.width + 'px');
          }
          // re-initialize sticky
          onscroll();
        }

        // destroy listener
        function ondestroy() {
          onresize();
          window.removeEventListener('scroll', onscroll);
          window.removeEventListener('resize', onresize);
        }

        // bind listeners
        window.addEventListener('scroll', onscroll);
        window.addEventListener('resize', onresize);

        scope.$on('$destroy', ondestroy);
        // initialize sticky
        onscroll();
      }
    };
  });
})('angularStickyElement');
