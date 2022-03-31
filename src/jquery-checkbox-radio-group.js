/****************************************************************************
    jquery-checkbox-radio-group.js,

    (c) 2017, FCOO

    https://github.com/FCOO/jquery-checkbox-radio-group
    https://github.com/FCOO

****************************************************************************/

(function ($, window, document, undefined) {
    "use strict";

    var globalCheckboxId = 0;

    $.fn.extend({
        /***********************************************************
        $.fn.checkbox( options )
        options:
            id              (default: id of element or auto-created)
            prop            (default '')     Property set when the element is selected
            className       (default: '')    Class-name set when the element is selected
            className_semi  (default: '')    Class-name set when the element is semi-selected
            selector        (default: null)  Selector for child-element to be updated with prop and/or className
            modernizr       (default; false) If true the element get "no-"+className when unselected
            selected        (default: false)
            semiSelected    (default: false) If true the checkbox appear with className_semi and selected. Will be removed the first time the input is clicked
            onChange        = function( id, selected, $checkbox )
        ***********************************************************/
        checkbox: function( options ){
            return this.each(function() {
                var $this = $(this),
                    _options = $.extend({
                        id       : options.id || $this.prop('id') || 'checkbox_' + globalCheckboxId++,
                        prop     : '',
                        className: '',
                        selector : null,
                        modernizr: false,
                        selected : false,
                        onChange : function(){}
                    }, options);
                $this.data('cbx_options', _options );

                if (options.getSelected)
                    _options.selected = options.getSelected.apply( options.getSelectedContext, [this, _options] );

                $this._cbxSet( _options.selected, true, options.className_semi && options.semiSelected );

                $this.on('click', $.proxy( $this._cbxOnClick, $this ));
                if (options.onDblClick)
                    $this.on('dblclick', $.proxy($this._cbxCallDblClick, $this));
            });
        },

        //Internal methods. All prefixed with _cbx
        _cbxGet: function(){
            return this.data('cbx_options').selected;
        },

        _cbxSet: function( selected, dontCallOnChange, semiSelected ){
            var options = this.data('cbx_options');
            options.selected = !!selected;
            this.data('cbx_options', options );

            var $elements = options.selector ? this.children( options.selector ) : this;
            $elements.each( function(){
                var $this = $(this);
                if (options.prop)
                    $this.prop(options.prop, options.selected);

                if (options.className){
                    if (options.modernizr)
                        $this.modernizrToggle(options.className, options.selected);
                    else
                        $this.toggleClass(options.className, options.selected);
                }

            });

            if (typeof semiSelected == 'boolean')
                this.toggleClass(options.className_semi, semiSelected);

            if (!dontCallOnChange)
                this._cbxCallOnChange();

            return this;
        },

        _cbxOnClick: function(){
            var options = this.data('cbx_options');
            return this._cbxSet( !options.selected, false, false );
        },

        _cbxCallOnChange: function(){
            var options = this.data('cbx_options');
            if (options.onChange)
                $.proxy( options.onChange, options.context )(
                    options.id,
                    this._cbxGet(),
                    this
                );
            if (options.postOnChange)
                options.postOnChange( this );
        },

        _cbxCallDblClick: function(){
            var options = this.data('cbx_options');
            if (options.onDblClick)
                $.proxy( options.onDblClick, options.context )(
                    options.id,
                    this._cbxGet(),
                    this
                );
        }
    });

    /***********************************************************
    1) addElement( $element[, options])
    2) addElement( $element[, selector][, options])
    3) addElement( [] of $element[, options])
    Adds jQyery-elements to this._cbxChildList
    Can be one element (1), the children of an element (2), or
    an array of elements (3)
    ***********************************************************/
    function _addElement($element){
        this._cbxChildList = this._cbxChildList || [];
        var selector = '', options = {};

        switch (arguments.length){
            case 3 : selector = arguments[1];
                     options = arguments[2];
                     break;
            case 2 : if ($.type(arguments[1]) == "string")
                         selector = arguments[1];
                     else
                         options = arguments[1];
                     break;
            default: /*Nothing */
        }
        options = $.extend( {}, this.defaultChildOptions || {}, options );
        var _this = this;
        if ($.isArray($element))
            $.each( $element, function( index, $elem ){ _addElement.call( _this, $elem, options ); });
        else
            if (selector)
                _addElement.call( this, $element.children( selector ), options );
            else
                $element.each( function(){
                    _this._cbxChildList.push( $(this).checkbox( options ) );
                    $(this).data('cbx_owner', _this );
                });

        return this;
    }

    //_removeElement($element)
    function _removeElement($element, remove){
        this._cbxChildList = $.grep( this._cbxChildList, function( $child ){ return $child === $element; } , true );
        if (remove)
            $element.remove();

        return this;
    }

    /***********************************************************
    $.fn.checkboxGroup( options )
    The input acts as checkbox for a group of checkbokes (=parent).
    The state of the input is updated when any of the child-input are changed
    and all the child can be changed by clicking the input
    options:
        prop, className, modernizr, selector: Same as for $.fn.checkbox. Also used as default for child-checkboxes
        selected, onChange: Same as for $.fn.checkbox but only used as default for child-checkboxes
        prop_semi, className_semi: Same as for $.fn.checkbox but for the semi-selected start where selected children > 0 and < total items
    ***********************************************************/
    //function checkboxGroup_addElement
    function checkboxGroup_addElement(){
        _addElement.apply( this, arguments );
        this._cbxgUpdateParent();
        return this;
    }

    //function checkboxGroup_addElement
    function checkboxGroup_removeElement(/*$element, remove*/){
        _removeElement.apply( this, arguments );
        this._cbxgUpdateParent();
        return this;
    }

    $.fn.extend({
        checkboxGroup: function(options) {
            this.checkbox($.extend( {}, options, {
                            onChange: this._cbxgOnClickParent,
                            context : this
                         })
            );

            this.defaultChildOptions = $.extend({
                postOnChange: $.proxy( this._cbxgUpdateParent, this )
            }, options);
            this.addElement = checkboxGroup_addElement;
            this.removeElement = checkboxGroup_removeElement;
            return this;
        },

        //$.fn._cbxgUpdateParent = Update the state of the parent-checkbox
        _cbxgUpdateParent: function(){
            //Count the number of checked and unchecked children
            var childSelected = 0,
                childUnselected = 0;
            $.each( this._cbxChildList, function( index, $child ){
                if ($child._cbxGet())
                    childSelected++;
                else
                    childUnselected++;
            });
            //Update selected and semi-selectd state
            var options = this.data('cbx_options'),
                semiSelected = childSelected*childUnselected > 0;
            this._cbxSet( childSelected == this._cbxChildList.length, true, semiSelected );

            if (options.prop_semi)
                this.prop(options.prop_semi, semiSelected);
            if (options.className_semi){
                if (options.modernizr)
                    this.modernizrToggle(options.className_semi, semiSelected);
                else
                    this.toggleClass(options.className_semi, semiSelected);
            }
        },

        //$.fn._cbxgOnClickParent = Click on parent
        _cbxgOnClickParent: function(){
            //If all at least one child is selected => deselect all
            //If all child is deselected => select all
            var selected = true;
            $.each( this._cbxChildList, function( index, $child ){
                if ($child._cbxGet()){
                    selected = false;
                    return false;
                }
            });
            $.each( this._cbxChildList, function( index, $child ){
                if ($child._cbxGet() != selected)
                    $child._cbxSet( selected );
            });
            this._cbxgUpdateParent();
        }
    });


    /***********************************************************
    $.radioGroup( options )
    options:
        selector: Same as for $.fn.checkbox
        prop, className, selected, onChange: Same as for $.fn.checkbox. Used as default for child-radio-elements
        radioGroupId: Id for the group
        selectedId: The id of the select element
        allowZeroSelected: If true the radio-buttons can be deselected
    ***********************************************************/
    $.RadioGroup = function( options ) {
        this.options = $.extend({
            //Default options
            className        : '',
            prop             : 'checked',
            allowZeroSelected: false,
            allowReselect    : false,
            onChange         : function(){}
        }, options || {} );
        this.defaultChildOptions = $.extend({}, this.options );
    };

    //Extend the prototype
    $.RadioGroup.prototype = {

        //addElement
        addElement: function(){
            var firstIndex = this._cbxChildList ? this._cbxChildList.length : 0;
            _addElement.apply( this, arguments );

            //Convert all child onChange to this.onChange
            for (var i=firstIndex; i<this._cbxChildList.length; i++ ){
                var $child = this._cbxChildList[i],
                    options = $child.data('cbx_options');
                options.ownOnChange = $.proxy( options.onChange, options.context );
                options.onChange = this.onChange;
                options.context = this;
                $child.data('cbx_options', options);
            }
            if (this.options.selectedId != undefined){
                var _this = this,
                    list = $.grep(this._cbxChildList, function($elem){ return $elem.data('cbx_options').id == _this.options.selectedId; });
                if (list.length){
                    list[0]._cbxSet( true );
                    this.options.selectedId = null;
                }
            }

            return this;
        },

        //removeElement
        removeElement: function(/*$element, remove*/){
            _removeElement.apply( this, arguments );
            return this;
        },

        //_getSelectedChild: Return the selected $-element (if any)
        _getSelectedChild: function( $exclude ){
            var selectedList = $.grep(this._cbxChildList, function($elem){ return $elem._cbxGet() && (!$exclude || ($elem !== $exclude)); });
            return selectedList.length ? selectedList[0] : null;
        },

        //getSelected: Return the id of the selected item (if any)
        getSelected: function(){
            var $selectedChild = this._getSelectedChild();
            return $selectedChild ? $selectedChild.data('cbx_options').id : null;
        },

        //setSelected: function(id, dontCallOnChange, semiSelected )
        setSelected: function(id, dontCallOnChange, semiSelected ){
            this.onChange(id, true, null, dontCallOnChange, semiSelected );
        },

        //setUnselected: function(id, dontCallOnChange )
        setUnselected: function(id, dontCallOnChange ){
            this.onChange(id, false, null, dontCallOnChange );
        },

        //onChange: function(id, selected, dummy, dontCallOnChange, semiSelected )
        onChange: function(id, selected, dummy, dontCallOnChange, semiSelected ){
            //Find clicked child and other selected child
            var $child = $.grep(this._cbxChildList, function($elem){ return $elem.data('cbx_options').id == id; })[0];
            if (!$child)
                return;
            var childOptions         = $child.data('cbx_options'),
                $selectedChild       = this._getSelectedChild( $child ),
                selectedChildOptions = $selectedChild ? $selectedChild.data('cbx_options') : null;


            //Unselect the selected child
            if ($selectedChild){
                $selectedChild._cbxSet( false, true, false );
                if (this.options.allowZeroSelected)
                    selectedChildOptions.ownOnChange( selectedChildOptions.id, false, $selectedChild, this.options.radioGroupId );
            }

            //Only allow click on selected element if options.allowZeroSelected: true
            if (selected || this.options.allowZeroSelected){
                $child._cbxSet( selected, true, semiSelected);//Update element
                if (!dontCallOnChange){
                    childOptions.ownOnChange( childOptions.id, selected, $child, this.options.radioGroupId );
                    if (this.options.postOnChange)
                        this.options.postOnChange( $child );
                }
            }
            else
                //Select again
                $child._cbxSet( true, !this.options.allowReselect || dontCallOnChange, semiSelected );
        }
    };

    $.radioGroup = function( options ){
        return new $.RadioGroup( options );
    };

    /******************************************
    Initialize/ready
    *******************************************/
    $(function() {


    }); //End of initialize/ready
    //******************************************



}(jQuery, this, document));