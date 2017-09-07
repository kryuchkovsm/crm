/**
Core script to handle the entire theme and core functions
**/
Storage.prototype.setObject = function(key, value) {
  this.setItem(key, JSON.stringify(value));
}
jQuery.fn.onPositionChanged = function (trigger, millis) {
  if (millis == null) millis = 100;
  var o = $(this[0]); // our jquery object
  if (o.length < 1) return o;

  var lastPos = null;
  var lastOff = null;
  setInterval(function () {
    if (o == null || o.length < 1) return o; // abort if element is non existend eny more
    if (lastPos == null) lastPos = o.position();
    if (lastOff == null) lastOff = o.offset();
    var newPos = o.position();
    var newOff = o.offset();
    if (lastPos.top != newPos.top || lastPos.left != newPos.left) {
      $(this).trigger('onPositionChanged', { lastPos: lastPos, newPos: newPos });
      if (typeof (trigger) == "function") trigger(lastPos, newPos);
      lastPos = o.position();
    }
    if (lastOff.top != newOff.top || lastOff.left != newOff.left) {
      $(this).trigger('onOffsetChanged', { lastOff: lastOff, newOff: newOff});
      if (typeof (trigger) == "function") trigger(lastOff, newOff);
      lastOff= o.offset();
    }
  }, millis);

  return o;
};

var Layout = function () {
  if (Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0)
    document.body.className += " safari";
  var resBreakpointMd = Metronic.getResponsiveBreakpoint('md');

    //* BEGIN:CORE HANDLERS *//
    // this function handles responsive layout on screen size resize or mobile device rotate.

    // Handles header
    var handleHeader = function () {
        // handle search box expand/collapse
        $('body').on('click', '.search-form', function (e) {
            $(this).addClass("open");
            $(this).find('.form-control').focus();

            $('body').on('blur', '.page-header .search-form .form-control', function (e) {
                $(this).closest('.search-form').removeClass("open");
                $(this).unbind("blur");
            });
        });

        // handle hor menu search form on enter press
        $('body').on('keypress', '.hor-menu .search-form .form-control', function (e) {
            if (e.which == 13) {
                $(this).closest('.search-form').submit();
                return false;
            }
        });

        // handle header search button click
        $('body').on('mousedown', '.search-form.open .submit', function (e) {
            e.preventDefault();
            e.stopPropagation();
            $(this).closest('.search-form').submit();
        });
    };

    // Handles main menu
    var handleMainMenu = function () {
        // handle menu toggler icon click
        $("body").on("click", ".page-header .menu-toggler", function(event) {
            //if (Metronic.getViewPort().width < resBreakpointMd) {
                var menu = $(".page-header .page-header-menu").not('.example-div');
                if (menu.hasClass("page-header-menu-opened")) {
                    menu.slideUp(300);
                    menu.removeClass("page-header-menu-opened");
                } else {
                    menu.slideDown(300);
                    menu.addClass("page-header-menu-opened");
                }

                if ($('body').hasClass('page-header-top-fixed')) {
                    Metronic.scrollTop();
                }
            //}
        });
      $("body").on("hover", ".mega-menu-dropdown", function(e) { $('select').hide(); })

        // handle sub dropdown menu click for mobile devices only
        $("body").on("click", ".dropdown-submenu > a", function(e) {
            if (Metronic.getViewPort().width < resBreakpointMd) {
                if ($(this).next().hasClass('dropdown-menu')) {
                    e.stopPropagation();
                    if ($(this).parent().hasClass("open")) {
                        $(this).parent().removeClass("open");
                        $(this).next().hide();
                    } else {
                        $(this).parent().addClass("open");
                        $(this).next().show();
                    }
                }
            }
        });
        // handle hover dropdown menu for desktop devices only
        if (Metronic.getViewPort().width >= resBreakpointMd) {
          $('[data-hover="megamenu-dropdown"]').not('.hover-initialized').each(function() {
                $(this).dropdownHover();
                $(this).addClass('hover-initialized');
            });
        }

        $(document).on('click', '.mega-menu-dropdown .dropdown-menu', function (e) {
            e.stopPropagation();
        });

        // handle fixed mega menu(minimized)
        $(window).scroll(function() {
            var offset = 75;
            if ($('body').hasClass('page-header-menu-fixed')) {
                if ($(window).scrollTop() > offset){
                    $(".page-header-menu").addClass("fixed");
                } else {
                    $(".page-header-menu").removeClass("fixed");
                }
            }

            if ($('body').hasClass('page-header-top-fixed')) {
                if ($(window).scrollTop() > offset){
                    $(".page-header-top").addClass("fixed");
                } else {
                    $(".page-header-top").removeClass("fixed");
                }
            }
        });
    };

    // Handle SiteIDebar menu links
    var handleMainMenuActiveLink = function(mode, el) {

        var url = location.hash.toLowerCase();

        var menu = $('.hor-menu');

        if (mode === 'click' || mode === 'set') {
            el = $(el);
        } else if (mode === 'match') {
            menu.find("li > a").each(function() {
              if ($(this).attr("href")){
                var path = $(this).attr("href").toLowerCase();
                // url match condition
                if (path.length > 1 && url.substr(1, path.length - 1) == path.substr(1)) {
                  el = $(this);
                  return;
                }
              }
            });
        }

        if (!el || el.size() == 0) {
            return;
        }

        if (el.attr('href').toLowerCase() === 'javascript:;' || el.attr('href').toLowerCase() === '#') {
            return;
        }

        // disable active states
        //menu.find('li.active').removeClass('active');
        menu.find('li > a > .selected').remove();
        menu.find('li.open').removeClass('open');

        el.parents('li').each(function () {
            //$(this).addClass('active');

            if ($(this).parent('ul.navbar-nav').size() === 1) {
                $(this).find('> a').append('<span class="selected"></span>');
            }
        });

    };

    // Handles main menu on window resize
    var handleMainMenuOnResize = function() {
        // handle hover dropdown menu for desktop devices only
        var width = Metronic.getViewPort().width;
        var menu = $(".page-header-menu");

        if (width >= resBreakpointMd && menu.data('breakpoint') !== 'desktop') {
            menu.data('breakpoint', 'desktop');
            $('.hor-menu [data-hover="megamenu-dropdown"]').not('.hover-initialized').each(function() {
                $(this).dropdownHover();
                $(this).addClass('hover-initialized');
            });
            $('.hor-menu .navbar-nav li.open').removeClass('open');
            $(".page-header-menu").css("display", "block").removeClass('page-header-menu-opened');
        } else if (width < resBreakpointMd && menu.data('breakpoint') !== 'mobile') {
            menu.data('breakpoint', 'mobile');
            // disable hover bootstrap dropdowns plugin
            $('.hor-menu [data-hover="megamenu-dropdown"].hover-initialized').each(function() {
                $(this).unbind('hover');
                $(this).parent().unbind('hover').find('.dropdown-submenu').each(function() {
                    $(this).unbind('hover');
                });
                $(this).removeClass('hover-initialized');
            });
        }
    };

    var handleContentHeight = function() {
        var height;

        if ($('body').height() < Metronic.getViewPort().height) {
            height = Metronic.getViewPort().height -
                $('.page-header').outerHeight() -
                ($('.page-container').outerHeight() - $('.page-content').outerHeight()) -
                $('.page-prefooter').outerHeight() -
                $('.page-footer').outerHeight();

            $('.page-content').css('min-height', height);
        }
    };

    // Handles the go to top button at the footer
    var handleGoTop = function () {
        var offset = 100;
        var duration = 500;

        if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {  // ios supported
            $(window).bind("touchend touchcancel touchleave", function(e){
               if ($(this).scrollTop() > offset) {
                    $('.scroll-to-top').fadeIn(duration);
                } else {
                    $('.scroll-to-top').fadeOut(duration);
                }
            });
        } else {  // general
            $(window).scroll(function() {
                if ($(this).scrollTop() > offset) {
                    $('.scroll-to-top').fadeIn(duration);
                } else {
                    $('.scroll-to-top').fadeOut(duration);
                }
            });
        }

        $('.scroll-to-top').click(function(e) {
            e.preventDefault();
            $('html, body').animate({scrollTop: 0}, duration);
            return false;
        });
    };

    return {
        initHeader: function() {
            handleHeader(); // handles horizontal menu
            handleMainMenu(); // handles menu toggle for mobile
            Metronic.addResizeHandler(handleMainMenuOnResize); // handle main menu on window resize

            if (Metronic.isAngularJsApp()) {
                handleMainMenuActiveLink('match'); // init SiteIDebar active links
            }
        },

        initContent: function() {
            handleContentHeight(); // handles content height
        },

        initFooter: function() {
            handleGoTop(); //handles scroll to top functionality in the footer
        },

        init: function () {
            this.initHeader();
            this.initContent();
            this.initFooter();
        }
    };

}();
