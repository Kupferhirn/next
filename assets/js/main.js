//= require bower/jquery/dist/jquery.js
//= require bower/validator-js/validator.js
//= require bower/moment/moment.js
//= require bower/moment/lang/de.js
//= require bower/bootstrap/js/transition.js
//= require bower/bootstrap/js/collapse.js
//= require bower/bootstrap/js/dropdown.js
//= require bower/bootstrap/js/tooltip.js
//= require bower/bootstrap/js/tab.js
//= require js/lib/patchedAlert.js
//= require bower/selectize/dist/js/standalone/selectize.js
//= require bower/ExpandingTextareas/expanding.js
//= require js/lib/markdownEditor.js

!function($) {
  function checkPopulation($element) {
    $element.closest('.floating-label').toggleClass('floating-label-populated', !!$element.val())
  }

  $(document)
    .on('focus blur', '.floating-label > .form-control', function(e) {
      checkPopulation($(this).closest('.floating-label').toggleClass('floating-label-active', /^(focus|focusin)$/.test(e.type)).end())
    })
    .on('reset', 'form', function() {
      var $form = $(this)

      setTimeout(function() {
        $form.find('.floating-label-populated > input').each(function() {
          checkPopulation($(this))
        })
      }, 0)
    })

  $('.floating-label > .form-control').each(function() {
    var $this = $(this)

    $this.attr('placeholder', $this.attr('data-placeholder'))

    checkPopulation($this)
  })
}($);

!function($, moment) {
  var $timestamps = $('.js-timestamp')

  function updateTimestamps() {
    $timestamps.each(function() {
      var $this = $(this)
      $this.text(moment(parseInt($this.attr('data-unix'), 10)).fromNow($this.attr('data-suffix') === 'false'))
    })
  }

  updateTimestamps()
  setInterval(updateTimestamps, 60000)
}($, moment);


!function($) {
  var $win = $(window)

  $('.js-expander-scope').each(function() {
    var $this   = $(this)
    var $target = $this.find('.js-expander-target').eq(0)
    var $toggle = $this.find('.js-expander-toggle').eq(0)

    $toggle.on('click keydown', function(e) {
      if(e.type === 'keydown' && !/32|13/.test(e.which)) return
      e.preventDefault()
      $target.add($toggle).toggleClass('active')
      $win.trigger('resize')
    })
  })
}($);

!function($) {
  $(document)
    .on('click', '.js-copy-field', function(e) {
      e.preventDefault()
      $(this).trigger('select')
    })
    .on('mousedown', '.js-copy-field', function(e) { e.preventDefault() })
}($);

!function($) {
  $('.js-confirm').each(function() {
    var $this = $(this)

    $this.on($this.data('confirm-event') || 'click', function(e) {
      if(!confirm($this.data('confirm-text'))) e.preventDefault()
    })
  })
}($);

!function($) {
  var $win  = $(window)
  var $wrap = $('#content-wrapper')

  $win.on('scroll resize', function() {
    var scrollTop  = $win.scrollTop()
    var wrapHeight = $wrap.height()
    var winWidth   = $win.width()

    $('.js-sticky-sidebar').each(function() {
      var $this  = $(this)
      var height = $this.outerHeight()

      if(winWidth <= 992 || height >= wrapHeight)
        return $this.css({
          position: '',
          top: '',
          width: ''
        })

      if(height + scrollTop > wrapHeight)
        $this.css({
          position: 'absolute',
          top: wrapHeight - height
        })
      else
        $this.css({
          position: 'fixed',
          top: '',
          width: $this.parent().width()
        })
    })
  }).trigger('scroll')
}($);

!function($) {
  $('.js-tooltip').tooltip()
  $('.js-autosize').expanding()
  $('select').selectize()
}($);