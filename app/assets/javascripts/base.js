(function() {
  window.flowplayer.conf = {
    key: ['$141428546790204', '#$c1ee98f7e52a995b8d9'],
    clip: {
      autoPlay: false,
      autoBuffering: true
    },
    swf: '/flowplayer.commercial-5.4.6.swf',
    analytics: 'UA-24185042-1',
    play: {
      replayLabel: null
    }
  };
})();

$(function(){
  var setup = function(){
    setup_ckeditor_video_links();
    setup_videos();
    setup_translation_videos();
    setup_slow_motion_videos();
    setup_help_videos();
    setup_search_tabs();
    setup_sign_selection();
    setup_handshapes_hover_fix();
    setup_prompt_labels();

    setup_print_view();

    setup_feedback_form();

    setup_keyword_autocomplete();
  };

  var setup_ckeditor_video_links = function(){
    var videos = $(".ckeditor_content a").filter(':contains(-video-)');
    //standard link (alphabet pages)
    if (videos){
      videos.addClass('video_replace main_video').each(function(){
        var video = $(this);
        video.html(video.html().replace(/^\s*-video-\s*/, ''));
      }).not('li a').wrap($('<div />', {'class':'videos clearfix_left'}));
    }
    //list link
    var list = $('.ckeditor_content ul').has('.video_replace');
    if (list) {
      list.wrap($('<div />', {'class':'playlist'}));
      var video_bucket = $('<div />', {'class':'videos clearfix_left'});
      list.find('a').each(function(i){
        var link = $(this);
        var link_class = link.text().toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-video';
        link.addClass(link_class);
        var video = link.clone();
        video.attr('id', link_class).addClass('hidden_video').empty().appendTo(video_bucket);
        if (i === 0){
          video.removeClass('hidden_video').addClass('selected');
          link.css({fontWeight:'bold'});
        }
        link.attr('href', 'javascript:void(0)').removeClass('video_replace main_video');
      });
      list.before(video_bucket);
    }
  };

  var setup_videos = function(){
    var videos = $('.video_replace');
    var id_offset = 0;

    if (videos) {
      videos.each(function(){
        var wrapper = $(this);
        var href = wrapper.attr('href');
        var hidden = wrapper.hasClass('hidden_video');
        wrapper.attr('id', 'video_'+id_offset);
        id_offset += 1;
        var mp4SourceElement = $('<source />', {src: href + ".mp4"});
        var webmSourceElement = $('<source />', {src: href + ".webm"});
        var flvSourceElement = $('<source />', {src: href + ".flv"});
        var videoElement  = $('<video />', {controls: "controls", preload: !hidden, loop: wrapper.data('loop')}).append(webmSourceElement, mp4SourceElement, flvSourceElement);
        wrapper.empty().append(videoElement);
      });
    }

    var flowplayer_hidden_config = $.extend(true, {}, window.flowplayer.conf);
    flowplayer_hidden_config.clip.autoBuffering = false;
    $('.video_replace_hidden_flash, .video_replace_flash, .video_replace').flowplayer();
  };

  var setup_slow_motion_videos = function(){
    $('.button.normal, .button.slow, .button.translation_button').click(function(){
      var show, hide, video;
      var videos = $(this).closest('.videos');
      if ($(this).hasClass('normal')){
        show = 'slow';
        hide = 'normal';
      } else if ($(this).hasClass('slow')) {
        show = 'normal';
        hide = 'slow';
      } else {
        show = 'translation_video';
        hide = 'translation_button';
      }
      videos.find("."+hide).hide();
      videos.find("."+show).show();
      pause_video(hide, videos);
      play_video(show, videos);
    });
  };

  var setup_translation_videos = function(){
    $('.translation_video').hide();

    $('.button.translation_button').click(function(){
      $('.button.translation_button').hide();
      $('.translation_video').show();
    });
  };

  var setup_help_videos = function(){
    var wrapper = $('.playlist');
    wrapper.find('ul a').click(function(e){
      var video_class = this.className;
      wrapper.find('ul a').css({fontWeight:'normal'});
      $(this).css({fontWeight:'bold'});
      var old_video = wrapper.find('.video_replace.selected');
      pause_video('selected', wrapper);
      old_video.hide().removeClass('selected');
      var new_video = wrapper.find('.video_replace.'+video_class);
      new_video.show().addClass('selected');
      play_video('selected', wrapper);
    });
  };

  var play_video = function(video_class, wrapper){
    var video = wrapper.find('.video_replace.'+video_class)[0];
    if (video) {
      flowplayer(video).play();
    }
  };

  var pause_video = function(video_class, wrapper){
    var video = wrapper.find('.video_replace.'+video_class)[0];
    if (video) {
      flowplayer(video).stop();
    }
  };

  var reset_menu_position = function(){
    // this is insane.
    // IE7 was getting not updating the position of the menus when we show and hid search bars
    // so I'll do it manually. This forces it to redraw.
    var bottom = $('.menu').css('bottom');
    $('.menu').css('bottom', '0').css('bottom', bottom);
  };

  var setup_search_tabs = function(){
    $('.tab, .tab_link').click(function(e){
      e.preventDefault();
      var tab = this.className.match(/(advanced|keywords|signs)/)[0];
      $('.tab, .search_field').removeClass('selected');
      $('.tab.'+tab+', .search_field.'+tab).addClass('selected');
      reset_menu_position();
    });
  };
  var setup_sign_selection = function(){
    $(document).click(function(){
      hide_all_dropdowns();
      return true; //so bubbles back up;
    });

    $('.sign_attribute_selection').click(function(e){
      e.stopPropagation();
      e.preventDefault();

      var hideOrShow = $(this).find('.dropdown').css('display') == 'none';
      hide_all_dropdowns();
      $(this).find('.dropdown').toggle(hideOrShow);
      $(this).find('.dropdown_arrow').toggleClass('selected shadow', hideOrShow);
      if (hideOrShow) {
        //for IE7 and his layering issues
        $(this).closest('.sign_attribute_selection').css('zIndex', '100');
      }
      return false;
    });

    // select sign attributes
    $('.attribute_options').find('.group, .sub, .image').each(function(){
      $(this).click(function(e){
        e.stopPropagation();
        select_sign_attribute(this);
        update_selected_signs($(this).closest('.sign_attribute_selection'));
      });
    });
    $('.search_form form').each(function(){
      toggle_clear(this);
    }).find('.text_input, .selected_field, .selected_groups_field')
      .change(function(){toggle_clear($(this).closest('form'));});

    $('.empty').click(function(){
      var tab = $(this).closest('.search_form');
      tab.find('.selected_signs').empty();
      tab.find('.dropdown .selected').removeClass('selected');
      tab.find('.default, .input_prompt').show();
      tab.find('.selected_field, .selected_groups_field, .text_input').val(null);
      tab.find('select').select('');
      tab.find('.empty').hide();
    });
  };

  var toggle_clear = function(form){
    var show = false;
    $(form).find('.text_input, .selected_field, .selected_groups_field').each(function(){
      if($(this).val()){
        show = true;
        return show;
      }
    });
    $(form).find('.empty').toggle(show);
  };

  var hide_all_dropdowns = function(){
    $('.dropdown').hide();
    $('.dropdown_arrow').removeClass('selected shadow');
    $('.sign_attribute_selection').css('zIndex', '30');
  };

  var select_sign_attribute = function(sign){
    var wrapper;
    if ($(sign).hasClass('group')) {
      wrapper = $(sign);
    } else if (!$(sign).hasClass('main_image') && !$(sign).parents('li.group').hasClass('selected')){
      // clicking on a sub image when the parent is selected
      wrapper = $(sign).parents('li').first();
    } else {
      wrapper = $(sign).closest('li:not(.sub)');
    }
    wrapper.toggleClass('selected');
  };

  var update_selected_signs = function(container) {
    var selected_container = $('<div />', {'class':'selected_signs'});
    var selected_images = container.find('.selected:not(.group.selected .selected)').children('.image');
    selected_images.clone().appendTo(selected_container);
    /* each of the images needs to be pointing to the smaller image. boom. */
    selected_container.find('img').each(function(){
      $(this).attr('src', $(this).attr('src').replace('/72/', '/42/'));
    });
    container.find('.selected_signs').replaceWith(selected_container);
    //hide "Any" unless we've deselected everything.
    container.find('.default').toggle(selected_images.length === 0);
    process_images_for_input(container, selected_images);
  };

  var process_images_for_input = function(container, images){
    var has_groups = container.find('.selected_groups_field').length;
    var output = [];
    var output_group = [];
    $(images).each(function(){
      if (has_groups && $(this).hasClass('main_image')){
        output_group.push($(this).text());
      } else {
        output.push($(this).text());
      }
    });
    if (has_groups){
      container.find('.selected_groups_field').first().val(output_group.join(' '));
    }
    container.find('.selected_field').first().val(output.join(' '));
    toggle_clear(container.closest('form'));
  };

  var setup_handshapes_hover_fix = function(){
    $('.attribute_options .row, .attribute_options .group, .attribute_options .sub').hover(function(){
      $(this).addClass('hover');
    }, function(){
      $(this).removeClass('hover');
    });
  };

  var setup_prompt_labels = function(){
    //sensible source-order, javascript-off-friendly placeholder labels.
    //overlays the label on the input on load. hides it on click/focus.
    //shows it if there's nothing in the field on blur.
    if ($('label.input_prompt').length){
      $('label.input_prompt').each(function(){
        var label = $(this);
        var input = $('#'+label.attr('for'));
        label.css({width:input.outerWidth()+'px',top:'0',left:'0',height:input.outerHeight()+'px',position:'absolute',zIndex:99,lineHeight:input.outerHeight()+'px'})
             .click(function(){
                label.hide();
             });
        input.focus(function(){ label.hide(); })
             .blur(function(){
               if (input.val() === ''){
                  label.show();
               }
             });
      });
      reset_menu_position();
    }
  };
  var setup_print_view = function(){
    //load print
    if (document.printView) {
      $('textarea, input[type="text"]').attr('readonly', true);
      $(window).bind('load', function(){
        window.print();
      });
    }
  };

  var setup_feedback_form = function(){
    $('#feedback_include_sign, #feedback_change_sign').change(function(){
      $('.if_'+$(this).attr('id')).toggle(this.checked);
    }).trigger('change');
  };
  var setup_keyword_autocomplete = function(){
    var input = $('#s');
    input.autocomplete({
      source: '/signs/autocomplete',
      delay:10,
      minLength:3,
      appendTo:input.parent()
    });
  };
  setup();
});
