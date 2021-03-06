!function($) {
  function checkPopulation($element) {
    $element.closest('.floating-label').toggleClass('floating-label-populated', !!$element.val())
  }

  $(document)
    .on('focus blur change', '.floating-label > .form-control', function(e) {
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

!function($) {
  var $timestamps = $('.js-timestamp')

  function updateTimestamps() {
    $timestamps.each(function() {
      var $this = $(this)
      $this.text(fromNow(parseInt($this.attr('data-unix'), 10), $this.attr('data-suffix') === 'false'))
    })
  }

  updateTimestamps()
  setInterval(updateTimestamps, 60000)
}($);


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
      Stickyfill.refreshAll()
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
  $(document).on('submit', '.js-hero-close-form', function(e) {
    var $form = $(this)
    e.preventDefault()

    var xhr = new XMLHttpRequest()
    xhr.open('POST', $form.attr('action'))
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
    xhr.send($form.serialize())

    $form.closest('.hero').remove()
  })
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
  Stickyfill.add($('.js-sticky'))
  $('.js-tooltip').tooltip()
  autosize($('.js-autosize'))
  $('.js-tablesort').each(function () {
    new Tablesort(this)
  })
  $(window).on('load', function() {
    Stickyfill.refreshAll()
  })
}($);