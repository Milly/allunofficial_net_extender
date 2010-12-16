// ==UserScript==
// @name           allunofficial.net extender
// @namespace      http://d.hatena.ne.jp/MillyC/
// @include        http://allunofficial.net/trpg/action.php*
// @require        http://ajax.googleapis.com/ajax/libs/jquery/1.3/jquery.min.js
// ==/UserScript==

(function($, unsafeWindow, document, undefined) {

// ##### Functions {{{1
function delayEvent(func, delay) {
  if (undefined === delay) delay = 20;
  return function() {
    var self = this, args = Array.prototype.slice.call(arguments);
    setTimeout(function() {
      func.apply(self, args);
    }, delay);
  };
}

// ##### Sortable skill table {{{1
if ('addLineSkill' in unsafeWindow) (function() {

  // << add style >> {{{2

  GM_addStyle([
    'a.spin-button { display:block; height:0.8em; font-size:0.8em; padding:0 0.2em; line-height:1em; }',
    '#skill_disp tr.focus input { background-color:#ddf; }',
    '#skill_disp tr input:focus { background-color:#bbd; }'
  ].join(''));

  // << events >> {{{2

  function moveUpLineSkill(event) {
    event.stopPropagation();
    event.preventDefault();
    var target = event.target;
    var row = $(target).closest('tr');
    var prev_row = row.prev('tr')[0];
    if (prev_row && 'fixed' != prev_row.getAttribute('type'))
      row[0].parentNode.insertBefore(row[0], prev_row);
    target.focus();
  }

  function moveDownLineSkill(event) {
    event.stopPropagation();
    event.preventDefault();
    var target = event.target;
    var row = $(target).closest('tr');
    var next_row = row.next('tr')[0];
    if (next_row && 'fixed' != next_row.getAttribute('type'))
      row[0].parentNode.insertBefore(next_row, row[0]);
    target.focus();
  }

  function updownKeyListener(event) {
    var target = event.target;
    var keycode = event.which;
    if (event.ctrlKey && (38 == keycode || 40 == keycode)) {
      event.stopPropagation();
      event.preventDefault();
      setTimeout(function() {
        target.blur();
        if (38 == event.which) {
          moveUpLineSkill(event);
        } else {
          moveDownLineSkill(event);
        }
      }, 50);
    }
  }

  function rowFocusListener(event) {
    var row = $(event.target).closest('tr');
    if ('focus' == event.type) {
      row.addClass('focus');
    } else {
      row.removeClass('focus');
    }
  }

  function addLineSkill(event) {
    var addedRow = $('#skill_disp').find('tr:last');
    bindLineEvent(addedRow);
  }

  // << create elements >> {{{2

  function bindLineEvent(rows) {
    rows
      .find('a.spin-button.up').click(moveUpLineSkill).end()
      .find('a.spin-button.down').click(moveDownLineSkill).end()
      .find(':input,a')
        .keydown(updownKeyListener)
        .focus(rowFocusListener)
        .blur(rowFocusListener);
  }

  var rows = $('#skill_disp').find('tr');
  rows.each(function(){
    var headers = $('th', this);
    if (1 == headers.length) {
      var col = $('<td>&nbsp;');
      if (headers[0].innerHTML.match(/<input/)) {
        col.html('<a href="#up" class="spin-button up">\u25b2</a>' +
                 '<a href="#down" class="spin-button down">\u25bc</a>');
      } else {
        $(this).attr('type', 'fixed');
      }
    } else {
      var col = $('<th>&nbsp;');
    }
    $(this).append(col);
  });
  bindLineEvent(rows);

  $('#btnAddLineSkill')
    .click(delayEvent(addLineSkill));

  // }}}2

})();

// ##### Add support class {{{1
if ($('#SL_support_class')[0]) (function() {

  // << datas >> {{{2

  var memo_format = '※サポートクラスの{like}は{name}の代替。';
  var memo_regex = new RegExp('^' + memo_format.replace(/{.*?}/g, '.*?') + '$', 'gm');
  var support_classes = [
    { name: 'メンター', value: 13, like: 'ニンジャ', class_skill: {} }
  ];
  var support_class_select = $('#SL_support_class');
  var memo_textarea = $('textarea[name="pc_making_memo"]');

  // << events >> {{{2

  function changeSupportClass(event) {
    var val = support_class_select.val();
    var index = support_class_select[0].selectedIndex;
    var prev_val = support_class_select.find('option').eq(index - 1).val();
    var text = memo_textarea.text().replace(memo_regex, '').replace(/\n+$/, '');
    var support_class = getSupportClassData(val);
    memo_textarea.text(text);
    if (val <= prev_val && support_class) {
      text += '\n' + formatSupportClassText(support_class);
      memo_textarea.text(text);
    }
  }

  // << functions >> {{{2

  function getSupportClassData(value) {
    for (var i = 0; i < support_classes.length; ++i)
      if (support_classes[i].value == val)
        return support_classes[i];
  }

  function getSupportClassDataFromText(text) {
    for (var i = 0; i < support_classes.length; ++i) {
      var support_class = support_classes[i];
      var support_class_text = formatSupportClassText(support_class);
      if (0 <= text.indexOf(support_class_text))
        return support_class;
    }
  }

  function formatSupportClassText(support_class) {
    return memo_format
      .replace('{like}', support_class.like)
      .replace('{name}', support_class.name);
  }

  function setSupportClass(support_class) {
    support_class_select[0].selectedIndex = support_class.index;
    var skill = support_class.skil || {};
    $('#s_cls_skill_name').val(skill.name || '');
    $('#s_cls_skill_lv').val(skill.level || '');
    $('#s_cls_skill_timing').val(skill.timing || '');
    $('#s_cls_skill_hantei').val(skill.call || '');
    $('#s_cls_skill_taisho').val(skill.target || '');
    $('#s_cls_skill_range').val(skill.range || '');
    $('#s_cls_skill_cost').val(skill.cost || '');
    $('#s_cls_skill_memo').val(skill.memo || '');
    $('#s_cls_skill_page').val(skill.page || '');
    $('#s_cls_skill_shozoku').val(support_class.name);
  }

  // << create elements >> {{{2

  $.each(support_classes, function() {
    var opt = $('<option>');
    opt.text(this.name);
    opt.attr('value', this.value);
    support_class_select.append(opt)
    this.index = support_class_select.find('option').length - 1;
  });
  support_class_select
    .change(delayEvent(changeSupportClass));
  var support_class = getSupportClassDataFromText(memo_textarea.text());
  if (support_class) setSupportClass(support_class);


  // }}}2

})();

// }}}1

})(jQuery, 'undefined' != typeof unsafeWindow ? unsafeWindow : window, document);
