# placeholder-select
Placeholder plugin for CKEditor

Usage Examples:

```javascript
config.toolbar = [ [ 'Source', 'Bold', 'Italic' ], ['placeholder_select'] ];
config.extraPlugins = 'placeholder_select';
config.placeholder_select = {
    placeholders: ["placeholder1_value", "placeholder2_value", "placeholder3_value"],
    toolLabel: 'Toolbar Label',
    toolTitle: 'Toolbar Title',
    listGroup: 'List Group Name'
};

// placeholders list can also have additional info
config.placeholder_select = {
    placeholders: [
        {value: "placeholder1_value", text: "placeholder1_text", label: "placeholder1_label"},
        {value: "placeholder2_value", text: "placeholder2_text", label: "placeholder2_label"}
    ]
};
```
