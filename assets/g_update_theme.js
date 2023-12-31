ThemeTools = function(){
  this.dataDemoHomepage = '//cdn.shopify.com/s/files/1/0545/3745/t/14/assets/data_demo_homepage.json?1115',
  this.currentJson = {},
  this.publishJson = {},
  this.demoJsonData = {},
  this.contentForIndex = top.window.Shopify.contentForIndex;
};

ThemeTools.prototype.init = function(){
  var t = this;
  tools.getCurrentJson();
  jQuery.get(t.dataDemoHomepage, function(data, status){
    if (status == 'success')
      t.demoJsonData = data.presets;
  });
},

ThemeTools.prototype.getCurrentJson = function(){
  var t = this, data = jQuery(top.document).find('main > form').serializeArray();
 
  data.push({
    name: 'settings[content_for_index]',
    value: '["'+ t.contentForIndex.join('","') + '"]'
  });
  t.currentJson = {};
  jQuery.map(data, function(item, index){
    var path = item.name.replace('settings', '').replace(/\]\[/g, '|').replace(/\[|\]/g, "").split('|');
    t.getJson(path, item.value, t.currentJson);
  });
},
  
ThemeTools.prototype.publishTheme = function(){
  var t = this;
  top.Shopify.ajax({
  	method	: "PATCH",
    url		: '/admin/themes/'+top.THEME_ID+'/editor/update_current',
    data	: t.publishJson
  }).done(function() {
    window.top.location.reload();
  });
},

ThemeTools.prototype.reIndexHomepageSection = function(){
  var t = this; t.contentForIndex = [];
  jQuery(top.document).find('[data-content-for-index] > li').each(function() {
    var sectionId = jQuery(this).attr('data-section-id');
    if (sectionId)
      t.contentForIndex.push(sectionId);
  });
},

ThemeTools.prototype.copyToClipboard = function(){
  var success   = true,
      range     = document.createRange(),
      input		= jQuery('.g_export_form'),
      selection;

  // For IE.
  if (window.clipboardData) {
    window.clipboardData.setData("Text", input.val());        
  } else {
    // Create a temporary element off screen.
    var tmpElem = jQuery('<div>');
    tmpElem.css({
      position: "absolute",
      left:     "-1000px",
      top:      "-1000px",
    });
    // Add the input value to the temp element.
    tmpElem.text(input.val());
    jQuery("body").append(tmpElem);
    // Select temp element.
    range.selectNodeContents(tmpElem.get(0));
    selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    // Lets copy.
    try { 
      success = document.execCommand ("copy", false, null);
    }
    catch (e) {
      window.prompt ("Copy to clipboard: Ctrl C, Enter", input.val());
    }
    if (success)
      tmpElem.remove();
  }
},
  
ThemeTools.prototype.getJson = function(path, value, obj){
  var obj = obj || {}, k = path.shift();
  if (path.length === 0) {
    obj[k] = value;
  }else{
    obj[k] = obj[k] || {};
    obj[k] = this.getJson(path, value, obj[k]);
  }
  return obj;
};

var tools = new ThemeTools();
tools.init();

jQuery(document).on('shopify:section:load', tools.reIndexHomepageSection);
jQuery(document).on('shopify:section:reorder', tools.reIndexHomepageSection);
jQuery('.btn-popup').lightcase({
  showTitle: false,
  showCaption: false,
  maxWidth: 960,
  maxHeight: 720,
});

jQuery(document).on('click','.g-btn-close', function() {
  //jQuery(".content-popup-import").niceScroll({cursorcolor:"#e9595e"});
  jQuery('body').toggleClass('popup-show');
});

jQuery('.g_update_theme').on('click',function(){
  jQuery('.g-btn-close').trigger('click');
});

jQuery(document).on('click', '.btn-popup', function() {
  jQuery(".g_export_form").val(JSON.stringify(tools.currentJson));
});

jQuery(document).on('click', '.g_export_btn', function(event) {
  event.preventDefault();
  try {
    tools.copyToClipboard();
    jQuery(this).text("Copied");
  } catch (err) {
    jQuery(this).text("ERROR").addClass('error');
  }
});

jQuery(document).on('click', '.import-btn', function(event) {
  event.preventDefault();        
  var layout = jQuery(this).data('layout');
  if (typeof(tools.demoJsonData[layout] != "undefined")){
    var jsonData = jQuery.extend({}, {"sections": {"footer": tools.currentJson.sections.footer},"accessToken": tools.currentJson.CurrentSettings}, tools.demoJsonData[layout]);
    tools.publishJson = {'settings': jsonData};
    tools.publishTheme();
  }
});

jQuery(document).on('click', '#g_import_btn', function() {
  try {
    tools.publishJson = {'settings': JSON.parse(jQuery('#g_import_form').val())};
    tools.publishTheme();
  } catch (e) {
    alert("Publish Errors");
  }
});