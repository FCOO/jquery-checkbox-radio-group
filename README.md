# jquery-checkbox-radio-group
>


## Description
Object to control elements acting as checkbox or radio elements

## Installation
### bower
`bower install https://github.com/FCOO/jquery-checkbox-radio-group.git --save`

## Demo
http://FCOO.github.io/jquery-checkbox-radio-group/demo/ 

## Usage

    $(".myClass").checkbox({ onChnage: function(id, selected){ console.log( 'Selected=',selected) }});
    
    $('<div></div>'.checkboxGroup({ 
        className: "active",
        onChange : function(id, selected){ console.log( 'Id=',id,' Selected=',selected) }
    })
        .addElement( $('<div>First</div>', {id:'first'})
        .addElement( $('<div>Second</div>', {id:'second'})        
        .addElement( $('<div>Last</div>', {id:'last'})

### $-element as single checkbox
    $.fn.checkbox( options )

### $-element as parent for a group of $-elements as checkbox
    $.fn.checkboxGroup( options )

### Object to control group of $-elements as radio-buttons
    $.radioGroup( options )


### options

#### `options.onChange = function( id, selected, $element[, radioGroupId] )` and `options.context`
The function `onChange` is called (with optional context = `options.context`) when a element is selected or deselected
 `onChange` can be set in `options` for `$.fn.checkboxGroup( options )` and `$.radioGroup( options )` and/or individual in `options` in `addElement(.., options)` 

#### `options.className` and `options.prop` and `options.modernizr`
When a element is selected it will get added class-name `options.className` and/or have property `options.prop` set to `true`. E.g. `<input type="checkbox">` will have `options.prop: "checked"` while Bootstrap buttons would have `options.className: "active"`
When a element is unselected the `options.className` is removed. If `options.modernizr: true` the class-name `"no-"+options.className` is added to 
As for `options.onChange` these options can be set *globally* in `$.fn.checkboxGroup(...) / $.radioGroup(...)` and/or individual in `addElement(...)` 


| Id | Type | Default | For | Description |
| :--: | :--: | :--: | :--: | :--- |
| `id` | String | `""` | 1 | Id for the element |
| `selected` | Boolean | `false` | 1 | If `true` the element is selected as default |
| `prop_semi`, `className_semi` | String | `""` | 2 | Same as `className` and `prop` but used when the parent-element is in semi-selected mode e.q. selected elements > 0 and < max |
| `radioGroupId` | String | `""` | 3 | Id for the group |
| `selectedId` | String | `""` | 3 | The id of the select element |
| `allowZeroSelected` | Boolean | `false` | 3 | If true the radio-buttons can be deselected |
| `allowReselect` | Boolean | `false` | 3 | If true the  `onChange` will be called when a selected item is reselected/clicked |


#### For...
1: `$.fn.checkbox( options )` and `addElement(.., options )`
2: `$.fn.checkboxGroup( options )`
3: `$.radioGroup( options )`

### Methods

### Adding elements to `$.fn.checkbox` or `$.radioGroup`
    .addElement( $element[, options] )          //Add $element (1 or more)
    .addElement( array of $element[, options] ) //Add all $-elements in array
    .addElement( $element, seletor[, options] ) //Add $element.children( selector ) 

### Setting a element selected or unselected
	.setSelected(id, dontCallOnChange )
	.setUnselected(id, dontCallOnChange ) //Only works correct on selected element/id

## Copyright and License
This plugin is licensed under the [MIT license](https://github.com/FCOO/jquery-checkbox-radio-group/LICENSE).

Copyright (c) 2017 [FCOO](https://github.com/FCOO)

## Contact information

Niels Holt nho@fcoo.dk
