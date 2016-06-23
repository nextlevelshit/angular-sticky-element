(function(namespace) {
  // set sticky module and directive
  angular.module(namespace, []).directive(namespace, function() {
    return {
      link: function(scope, angularElement, attrs) {
        var
        // get element
          element = angularElement[0],
        // get document
          document = element.ownerDocument,
        // get window
          window = document.defaultView,
        // get wrapper
          wrapper = document.createElement('span'),
        // cache style
          style = element.getAttribute('style'),
        // get options
          bottom = parseFloat(attrs['bottom']),
          top = parseFloat(attrs['top']),
          media = window.matchMedia(attrs['media'] || 'all'),
        // initialize states
          stickedToBottom = false,
          stickedToTop = false,
          offset = {};

        function stick() {
          var
            computedStyle = getComputedStyle(element),
            position = (stickedToTop) ? 'top: 0' : 'bottom: 0',
            parentNode = element.parentNode,
            nextSibling = element.nextSibling;
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
          var deltaWindowTop = offset.top < 0;
          return deltaWindowTop;
        }

        function stickedElementReachedParent() {
          var parentNode = element.parentNode;
          var parentOffset = parentNode.getBoundingClientRect();

          return parentOffset.top > 0;
        }

        function elementHeigherThanWindow() {
          return offset.height > window.innerHeight;
        }

        // window scroll listener
        function onscroll() {
          // if activated
          if (media.matches) {
            // get element offset
            offset = element.getBoundingClientRect();

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
            var position = (stickedToTop) ? 'top: 0' : 'bottom: 0';
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
