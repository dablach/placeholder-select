/**
 * Placeholder plugin for CKEditor
 *
 * @author Sujeet <sujeetkv90@gmail.com>
 * @link https://github.com/sujeetkv/placeholder-select
 * 
 * Originally created by Troy Lutton https://github.com/troylutton/ckeditor
 */
CKEDITOR.plugins.add('placeholder_select', {
    lang: ['en', 'el', 'de'],
    requires: ['richcombo'],

    onLoad: function () {
        // Register styles for placeholder widget frame.
        CKEDITOR.addCss('.cke_placeholder_select{background-color:#ff0}');
    },

    init: function (editor) {
        //  array of placeholders to choose from that'll be inserted into the editor
        var placeholders = [];

        // init the default config - empty placeholders
        var defaultConfig = {
            placeholders: [],
            format: '[[%placeholder%]]',
        };

        // merge defaults with the passed in items        
        var config = CKEDITOR.tools.extend(defaultConfig, editor.config.placeholder_select || {}, true);

        var placeholderRegex = config.format.split('%placeholder%', 2).map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('(?<name>.+?)');
        var placeholderParseRegex = new RegExp('^'+placeholderRegex+'$');
        var placeholderReplaceRegex = new RegExp(placeholderRegex, 'g');

        // run through and create the set of items to use
        for (var i in config.placeholders) {
            var item = false;

            if ('object' === typeof config.placeholders[i] && config.placeholders[i].value) {
                item = {};
                item.value = config.placeholders[i].value;
                item.text = config.placeholders[i].text || item.value;
                item.label = config.placeholders[i].label || item.text;
            }
            else if ('string' === typeof config.placeholders[i]) {
                item = {};
                item.value = config.placeholders[i];
                item.text = config.placeholders[i];
                item.label = config.placeholders[i];
            }

            if (item) {
                placeholders.push(item);
            }
        }

        // add the menu to the editor
        editor.ui.addRichCombo('placeholder_select', {
            label: editor.lang.placeholder_select.dropdown_label,
            title: editor.lang.placeholder_select.dropdown_title,
            voiceLabel: editor.lang.placeholder_select.dropdown_voiceLabel,
            toolbar: 'placeholder_select',
            multiSelect: false,

            panel: {
                css: [CKEDITOR.skin.getPath('editor')].concat(editor.config.contentsCss),
                voiceLabel: editor.lang.placeholder_select.panelVoiceLabel,
                multiSelect: false,
                attributes: { 'aria-label': config.toolLabel }
            },

            init: function () {
                this.startGroup(this.label);
                for (var i in placeholders) {
                    this.add(placeholders[i].value, placeholders[i].label, placeholders[i].text);
                }
            },

            onClick: function (value) {
                editor.focus();
                editor.fire('saveSnapshot');
                editor.insertHtml(config.format.replace('%placeholder%', value));
                editor.fire('saveSnapshot');
            }
        });

        editor.widgets.add('placeholder_select', {
            // Widget code.
            ui: 'placeholder_select',
            pathName: 'placeholder_select',
            // We need to have wrapping element.
            template: '<span class="cke_placeholder_select">{label}</span>',

            downcast: function () {
                return new CKEDITOR.htmlParser.text('[[' + this.data.name + ']]');
            },

            init: function () {
                // Note that placeholder markup characters are stripped for the name.
                var match = this.element.getText().match(placeholderParseRegex);
                var name = match.groups.name;
                this.setData('name', name);
                this.setData('label', placeholders.find(p => p.value === name).label);
            },

            data: function () {
                this.element.setText('⟪' + this.data.label + '⟫');
            },

            getLabel: function () {
                return this.editor.lang.widget.label.replace(/%1/, this.data.name + ' placeholder_select');
            }
        });

        editor.placeholder_select = {
            placeholders: placeholders,
            placeholderReplaceRegex: placeholderReplaceRegex,
        };
    },

    afterInit: function (editor) {
        editor.dataProcessor.dataFilter.addRules({
            text: function (text, node) {
                var dtd = node.parent && CKEDITOR.dtd[node.parent.name];

                // Skip the case when placeholder is in elements like <title> or <textarea>
                // but upcast placeholder in custom elements (no DTD).
                if (dtd && !dtd.span)
                    return;

                return text.replace(editor.placeholder_select.placeholderReplaceRegex, function (match, name) {
                    if(editor.placeholder_select.placeholders.some(p => p.value === name)) {
                        // Creating widget code.
                        var widgetWrapper = null,
                            innerElement = new CKEDITOR.htmlParser.element('span', {
                                'class': 'cke_placeholder_select'
                            });

                        // Adds placeholder identifier as innertext.
                        innerElement.add(new CKEDITOR.htmlParser.text(match));
                        widgetWrapper = editor.widgets.wrapElement(innerElement, 'placeholder_select');

                        // Return outerhtml of widget wrapper so it will be placed as replacement.
                        return widgetWrapper.getOuterHtml();
                    } else {
                        return match;
                    }
                });
            }
        });
    }
});
