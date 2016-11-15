var news_page_scrolling_functions = null;
var active_cart_request = false;
var lock_num = 0;
var allow_unlock = true;
var loader     = new prototypeLoader('http://b2c.pcaskin.com/skin/frontend/mw2consulting/consumers/images/prototype_loader/ajax-loader.gif');
var quickview  = new Quickview({"media":"quickviewpro_media_default","add_to_cart":1,"navigation":0,"navigation_preview":0,"review":1,"share":1,"product_page_link":1,"overlay_show":1,"overlay_color":"#000000","quickview_scroll":1,"max_height":350,"overlay_opacity":0.6}, 'aHR0cDovL2Zhc3Rlci5hbHBpbmVzdGFycy5jb20v');
quickview.init();
(function($) {
	
    $(document).ready(function() {


        //Product page "Read More" show/hide functionality
        $('#continue-reading').click(function(){
            var this_link = $(this);
            var full_desc = this_link.prev();
            var preview_desc = this_link.prev().prev();

            var hide_speed = 500;
            var show_speed = 800;
            var full_hide_speed = 500;
            var full_show_speed = 800;

            if (!this_link.is('.active'))
            {
                preview_desc
                    .animate({opacity: 0}, {queue: false, duration: hide_speed})
                    .slideUp(hide_speed-(full_hide_speed*.05), function(){
                        full_desc
                            .animate({opacity: 1}, {queue: false, duration: show_speed})
                            .slideDown(show_speed);
                        this_link
                            .addClass('active')
                            .html('Read Less &raquo;');
                    });
            }
            else
            {
                $('html, body').animate({scrollTop: 0}, {
                    duration: (full_show_speed+full_hide_speed)*0.6,
                    queue: false
                });
                full_desc
                    .animate({opacity: 0}, {queue: false, duration: full_hide_speed})
                    .slideUp(full_hide_speed-(full_hide_speed*.05), function(){
                        preview_desc
                            .animate({opacity: 1}, {queue: false, duration: full_show_speed})
                            .slideDown(full_show_speed);
                        this_link
                            .removeClass('active')
                            .html("Read More &raquo;");
                    });
            }

            return false;
        });

        //Ajax cart add-to-cart event
        $("body")
            .on('click', '.btn-cart.use-ajax',function (e) {
                var this_form = $(this).parents('form');
                var add_to_cart = new miniCartAjax(this_form);

                if (add_to_cart.beginAddToCart())
                {
                    //We have validation to submit the form, so let's start the animations
                    $('.add-to-wishlist').hide();
                    $(this).animate({
                        width: "+=50px"
                    }, "fast" );
                    $(this).find('.load-spinner').show("slow").delay(500).fadeOut();
                }

                //Prevent default click events
                return false;
            });

        //Remove from cart link
        $('#topCartContent').on('click','.remove-link', function(){
            var remove_from_cart = new miniCartAjax();
            remove_from_cart.beginRemoveFromCart($(this));
            return false;
        });
        //Category page filter fixes
        var category_page = $('.catalog-category-view');
        if (category_page.length)
        {
            //Filters
            var toolbars = category_page.find('ul.toolbar');
            var filters = category_page.find('ul.toolbar.filters');

            //Force colors to be first
            filters
                .find('.top-filter-size')
                .prependTo(filters);

            //Move filter bar to the correct place
            $('#sort-by-bar').insertBefore('.toolbar.filters');

            //Show toolbars
            toolbars.show();
        }

        /**
         *  Product Page Lightbox functionality
         */
        
        var check_lightbox_image = true;
        var image_index = 0;

        var lightbox_open_actions = function(){
            //Set proper HTML titles
            $("#colorbox").addClass("sizing-guide");
            $("#cboxNext").attr("title","Next Image");
            $("#cboxPrevious").attr("title","Previous Image");
            $('#cboxClose').attr('title','Close Window');

            //Remove elements temporarily while we work with them
            //$('#cboxLoadedContent, #cboxCurrent, #cboxPrevious, #cboxNext')
            //    .css({display: 'block'});

            //Set that we need to check the lightbox image
            check_lightbox_image = true;
        }

        var get_last_src_segment = function(src){
            segments = src.split('/');
            return segments.length ? segments[segments.length-1] : "";
        }

        var rebuild_lightbox_images = function(lightbox_id){
            var new_html = "";
            var container = $('.images-block[data-lightbox-id="'+lightbox_id+'"]');
            container.find('.thumb-list li img').each(function(){
                new_html += '<a rel="zoomed-in-product-view" href="'+$(this).attr('rel')+'"></a>';
            });
            container.find('.lightbox-images[data-lightbox-id="'+lightbox_id+'"]').html(new_html);
        }

        var get_initial_lightbox_index = function(lightbox_id){
            //Get variables
            var container = $('.images-block[data-lightbox-id="'+lightbox_id+'"]');
            var main_src = get_last_src_segment(container.find('.main-image').attr('src'));
            var lightbox_images = container.find('.lightbox-images a');

            if (!lightbox_images.length)
            {
                return false;
            }

            var image_index = 0;

            //Were we supposed to start on something other than the first image?
            if (main_src != get_last_src_segment($(lightbox_images[0]).attr('href')))
            {
                //Loop through each zoomed image until we find the right one
                for(image_index = 0; image_index < lightbox_images.length; image_index++)
                {
                    if (get_last_src_segment($(lightbox_images[image_index]).attr('href')) == main_src)
                    {
                        //Found it!
                        break;
                    }
                }
            }

            return image_index;
        }

        var lightbox_close_actions = function(){
            //Remove all traces of colorbox
            //$.colorbox.remove();
        }  

        $('.altview-lightbox-trigger').on('click', function() {
            var lightbox_id = $(this).attr('data-lightbox-id');

            //Rebuild #lightbox-images
            rebuild_lightbox_images(lightbox_id);

            //Trigger lightbox
            $('.lightbox-images[data-lightbox-id="'+lightbox_id+'"] a').colorbox({
                open:true,
                close:'X',
                next: "&rsaquo;",
                previous: "&lsaquo;",
                current: "Image {current} of {total}",
                initialIndex : get_initial_lightbox_index(lightbox_id),
                onOpen: lightbox_open_actions,
                onClosed : lightbox_close_actions
            });
            return false;
        });
        $('.product-view, #popup').on('click', 'img.change-view', function(){
            var imgSource = $(this).attr('rel');
            $(this).parents('.product-view').find('.main-image').attr('src', imgSource);  
            return false;
        });
        $('.thumb-list').hide();
        $('.more-views h3').click(function() {
            $('.thumb-list').slideToggle('slow');
        });
        $('.header-menu > li').hover(function() {
            $(this).children('.header-dropdown').toggleClass('active');
			$('.header-dropdown-right-col').hide();
            $('.nav-results0').addClass('active');
			$('.header-dropdown-right-col.first').show();
        });
        $('.header-dropdown').hover(function() {
            $(this).parent('.header-menu > li').toggleClass('active');
        });
        $('.header-dropdown-middle-col').hover(function() {
            $(this).toggleClass('active');
            $(this).prev().toggleClass('active');
		});
		
		$('.header-dropdown-nav-list > li > a').click(function(e) {
			if (is_touch_device()){
				e.preventDefault();
			}
		});
		
		function is_touch_device() {
			return !!('ontouchstart' in window) // works on most browsers 
				|| !!('onmsgesturechange' in window); // works on ie10
		};
        
		$('.header-dropdown-nav-list li.subcategory').hover(function() {
            var liClass = $(this).attr('class');
			liClass = liClass.replace("subcategory ",""); 
			$('.header-dropdown-right-col').each(function(){
				$(this).hide();
			});
			$('.header-dropdown-right-col'+'.'+liClass).show();
		});
		//add link between left nav links and right blocks on the top nav
        $('.header-dropdown-right-col').hover(function() {
			
			var subcategoryClass = $(this).attr('class');
			subcategoryClass = subcategoryClass.replace("nav-content header-dropdown-right-col ",""); 
			subcategoryClass = subcategoryClass.replace(" first",""); 

			$('.header-dropdown-nav-list li.'+subcategoryClass).toggleClass('active');
			$('.header-dropdown-nav-list li.'+subcategoryClass + ' .header-dropdown-middle-col').toggleClass('active');
			$('.header-dropdown-nav-list li.'+subcategoryClass + ' .header-dropdown-middle-col').prev().toggleClass('active');
		});

		
        var slide_controllers = $('.slide-controller');
        if (slide_controllers)
        {
            var slides = $('.product-slider-slides');
            slide_controllers.each(function(k,v){
                $(this).data('number', k+1);
            });
            $('.slide-controller').click(function(){
                var self = $(this);
                self.siblings().removeClass('active');
                self.addClass('active');
                //
                //The crazy cool CSS that was required for the above JS
                //to work is not IE8 compatible, thus here is a re-written
                //version that only uses JS to accomplish showing/hiding

                var slide_num = self.data('number');
                var slide_to_show = slides.filter('.slide'+slide_num);

                slides.each(function(){
                    $(this).animate({
                        opacity : 0
                    }, {
                        duration: 500,
                        queue : false
                    });
                });

                slide_to_show.animate({
                    opacity : 1
                }, {
                    duration: 500,
                    queue : false
                });

            });
        }
        // get breadcrumbing to get smaller, if needed, to avoid collisions on certain pages
        setTimeout(function() {
            var breadcrumb = $(".breadcrumbs .crumbs"),
                breadcrumbWidth = parseInt(breadcrumb.width()),
                defaultBreadcrumbSize = parseInt(breadcrumb.find("h1").eq(0).css("font-size")),
                maxBreadcrumbWidth = $(".catalog-category-view").length > 0 ? 285 : ($(".catalog-product-view").length > 0 ? 725 : 960);
            if (breadcrumbWidth > maxBreadcrumbWidth) {
                //console.log(breadcrumbWidth, maxBreadcrumbWidth);
                //breadcrumb.find("h1, .bullet").css("font-size", defaultBreadcrumbSize * maxBreadcrumbWidth / breadcrumbWidth * 0.9);
            }
        }, 125);
        $(".messages").click(function() {
            $(this).slideUp();
        });

        //Make sure all quantity boxes are >=1 and <=100
        $('body').delegate('.input-text.qty', 'change', function(){
            var this_field = $(this);
            var this_quantity = parseInt(this_field.val());
            if (isNaN(this_quantity) || this_quantity <= 0)
            {
                this_quantity = 1;
            }
            if (this_quantity >= 100)
            {
                this_quantity = 100;
            }
            this_field.val(this_quantity);
        });

        //Quickviewpro hover hack
        $('body')
            .on('mouseenter','.quickviewpro-block .product-image img', function(e){
                //Just in case an event missfired (it's happened),
                //we should remove every .hover-state class
                $('.quickviewpro-block.hover-state')
                    .removeClass('hover-state');    
                // Now show this one...
                $(this)
                    .parents('.quickviewpro-block')
                    .addClass('hover-state');
            }).on('mouseleave','.quickviewpro-block .product-image img', function(e){
                var target = typeof e.relatedTarget !== undefined ? e.relatedTarget : false;
                if (target === false || !$(target).is('a.quickviewpro-button'))
                {
                    //Just in case an event missfired (it's happened),
                    //we should remove every .hover-state class
                    $('.quickviewpro-block.hover-state')
                        .removeClass('hover-state');
                }
            }).on('mouseenter', '#quickviewpro-hider',function(){
                //Just in case an event missfired (it's happened),
                //we should remove every .hover-state class
                $('.quickviewpro-block.hover-state')
                    .removeClass('hover-state');
            });

        //Astars Reserve hover functionality
        // (becuase IE8 doesn't support CSS transitions...)
        var as_reserve_anim_opt = {
            delay : 500,
            queue : false
        }
        $('.astars-reserve-gallery a').hover(function(){
            $(this)
                .find('img')
                    .first()
                        .animate({visibility: 0, opacity: 0}, as_reserve_anim_opt)
                    .end()
                    .last()
                        .animate({visibility: 1, opacity: 1}, as_reserve_anim_opt);
        }, function(){
            $(this)
                .find('img')
                    .first()
                        .animate({visibility: 1, opacity: 1}, as_reserve_anim_opt)
                    .end()
                    .last()
                        .animate({visibility: 0, opacity: 0}, as_reserve_anim_opt);
        });
    });
    
    var newsPageScrolling = Class.create({
        init: function(container) {
            //Config variables
            this.show_by_default = 5;      //How many articles are shown when the page loads?
            this.load_each_time = 5;        //How many articles are shown each time we
                                            //scroll to the bottom of the page?

            //Global object variables
            this.news_shown_index = 0;

            //Objects
            this.news_page = $('#news-stories-block');
            this.articles = this.news_page.find('.news-story');

            //Initialial function calls
            if (this.news_page.length)
            {
                this.show_items(this.show_by_default, true);
                this.bind_news_scroll();
            }
        },
        bind_news_scroll : function(){
            //Bind to scroll
            $(window).scroll(
                $.throttle(500, $.proxy(this.check_news_on_scroll, this))
            );
        },
        unbind_news_scroll : function(){
            //Unbind scroll
            $(window).unbind( 'scroll', this.check_news_on_scroll );
        },
        //Callback for page scroll to check if we need to load more elements
        check_news_on_scroll : function(){
            var last_article = this.news_page.find('.article-shown').last();
            if (!this.isScrolledIntoView(last_article))
            {
                return false;
            }
            this.show_items(this.load_each_time);
        },
        show_items : function(num, initial_load){
            num = parseInt(num);
            if (num <= 0) return false;

            for (var i = 0; i < num; i++)
            {
                var current_index = this.news_shown_index++;
                if (typeof this.articles[current_index] !== 'undefined')
                {
                    $(this.articles[current_index])
                        .css({opacity : 0})
                        .slideDown({
                            duration: initial_load ? 0 : 500,
                            queue : false
                        })
                        .animate({
                            opacity: 1
                        },{
                            queue: false, 
                            duration: initial_load ? 0 : 2000
                        })
                        .addClass('article-shown');
                }
                else
                {
                    this.unbind_news_scroll();
                    return false;
                }
            }
        },
        //Check if an element is on the page
        isScrolledIntoView : function(elem){
            if (elem.length <= 0)
            {
                return false;
            }

            var docViewTop = $(window).scrollTop();
            var docViewBottom = docViewTop + $(window).height();

            var elemTop = elem.offset().top;
            var elemBottom = elemTop + elem.height();

            return (elemTop < docViewBottom);
        }
    });

    //News page auto-loading feature
    $(function(){
        news_page_scrolling_functions = new newsPageScrolling();
        news_page_scrolling_functions.init();
    });

    miniCartAjax.prototype = {
        init: function(form_element){
            this.form = typeof form_element === 'undefined' ? false : form_element;
            if (this.form !== false)
            {
                giftcartOptionWrapper = document.getElementById('giftcard-options-wrapper');
				
                if (giftcartOptionWrapper){
					this.options_container = this.form.find('#giftcard-options-wrapper');
					this.options_fields = this.options_container.find('select');
					this.other_fields = this.form.find('input, textarea');
					this.quantity_field = this.form.find('.qty'); 
					this.submit_action = this.form.attr('action');
					this.post_data = {};					
				}else{
					this.options_container = this.form.find('#product-options-wrapper');
					this.options_fields = this.options_container.find('select');
					this.other_fields = this.form.find('.no-display input, #product-options-wrapper.product-options input');
					this.quantity_field = this.form.find('.qty');
					this.submit_action = this.form.attr('action');
					this.post_data = {};
				}
                //this.old_cart_html = ""; #deprecated
            }
        },
        cartLock: function(){
            //Prevent auto close for the time being
            Enterprise.TopCart.preventAutoClose = true;
            $(".btn-cart.use-ajax").attr('disabled',true);
            if(typeof($('.button.standard-black.add-all-products-button')) != undefined)
                    $('.button.standard-black.add-all-products-button').attr('disabled',true);

            if(typeof($('.add-all-products-button')) != undefined)
                    $('.add-all-products-button').attr('disabled',true);
            //Stop new events
            active_cart_request = true;

            //Prevent an old unlock from firing
            allow_unlock = false;
        },
        cartUnlock: function(){
            if (allow_unlock)
            {
                $(".btn-cart.use-ajax").attr('disabled',false);

                //Allow auto close for the time being
                Enterprise.TopCart.preventAutoClose = false;
                if(typeof($('.button.standard-black.add-all-products-button')) != undefined)
                    $('.button.standard-black.add-all-products-button').attr('disabled',false);
                if(typeof($('.add-all-products-button')) != undefined)
                    $('.add-all-products-button').attr('disabled',false);

                //Allow new events
                active_cart_request = false;
            }
        },
        checkLock: function(){
            //Validate form data
            if (active_cart_request)
            {
                alert("Please wait for the current cart request to complete before adding or removing another item.");
            }
            return !active_cart_request;
        },
        beginAddToCart: function(){
            if (!this.checkLock())
            {
                return false;
            }
            if (!this.validateForm() || this.form === false)
            {
                return false;
            }

            //Prevent new cart events from starting
            this.cartLock();            

            // Insert data into cart info mobile popup
            $('#show-cartInfo-popup').val('true');
            var productInfo = $(this.form).parent();
            if (productInfo.hasClass('product-details-panel')) {
                // Form is on product page
                var name = $(productInfo).find('.product-details-panel__product-title').html();
                var desc = $(productInfo).find('.product-details-panel__product-sub-title').html();
                var price = $('#product-price-' + this.post_data['product']).html();
                $('.cartInfo-popup .product-name').html(name);
                $('.cartInfo-popup .product-desc').html(desc);
                $('.cartInfo-popup .product-cost-value').html(price);

            } else if (productInfo.hasClass('product-item-container') || productInfo.find('.product-item-container').length != 0) {
                // Form is on category page
                var name = $(productInfo).find('.product-item-title').clone();
                $(name).find('span').remove();
                var desc = $(productInfo).find('.product-item-subtitle-size').html();
                var price = $(productInfo).find('.regular-price').html();
                $('.cartInfo-popup .product-name').html(name.html());
                $('.cartInfo-popup .product-desc').html(desc);
                $('.cartInfo-popup .product-cost-value').html(price);
            }
            $('.cartInfo-popup .product-qty-value').html(this.post_data['qty']);

            //Fix the height issue
            $('#topCartContent').css('height','auto !important');

            //If quick cart is not open, show it
            if ($('.top-cart .block-title').is('.active'))
            {
                //Hide current items in the cart
                $('#mini-cart')
                    .animate({
                        height: '0px',
                        opacity: '0'
                    },{
                        duration : 500,
                        queue : true,
                        done : $.proxy(function(){
                            //Start loading animations
                            //Timeout ends up providing smoother animations
                            setTimeout($.proxy(function(){
                                this.startAddToCartLoading();
                            }, this), 10);
                        }, this)
                    });
            }
            else
            {
                //Start loading animations
                this.startAddToCartLoading(true);
            } 
            return false;
        },

        updateCart: function(){
            if (!this.checkLock())
            {
                return false;
            }

            //Prevent new cart events from starting
            this.cartLock();


            // $('#mini-cart-wrap')
            //     .find('#mini-cart, .cart-empty, .block-subtitle')
            //         .remove()
            //     .end()
            //     .prepend('<ol id="mini-cart" class="mini-products-list"><li class="loading"></li></ol>')
            //         .find('.loading')
            //             .css({opacity:0})
            //             .delay(700)
            //             .animate({opacity:1}, {duration: 500, queue: true });
            $.ajax({
                type        : "POST",
                url         : location.protocol + "//" + location.host + "/ajaxcart/index/update",
                dataType    : "html",
                cache       : false
            })
            .done($.proxy(this.submitSuccess, this));
        },


        beginRemoveFromCart: function(this_link){
            if (!this.checkLock())
            {
                return false;
            }
            if (typeof this_link === 'undefined')
            {
                return false;
            }

            //Prevent new cart events from starting
            this.cartLock();

            var this_id = this_link.attr('data-remove-id');
            var this_name = $('.item-id-'+this_id+' .product-name a').text();
            var request_url = this_link.attr('href');

            // this_link
            //     .attr('href','#');
            // this_link
            //     .parents('li.item')
            //     .animate({opacity: 0.25}, 2000)
            //     .addClass('removing');

            // var self = this;

            $('#mini-cart-wrap')
                .find('#mini-cart, .cart-empty, .block-subtitle')
                    .remove()
                .end()
                .prepend('<ol id="mini-cart" class="mini-products-list"><li class="loading"></li></ol>')
                    .find('.loading')
                        .css({opacity:0})
                        .delay(700)
                        .animate({opacity:1}, {duration: 500, queue: true });
            $.ajax({
                type        : "POST",
                url         : location.protocol + "//" + location.host + "/ajaxcart/index/remove",
                data        : {'product':this_id},
                dataType    : "html",
                cache       : false
            })
            .done($.proxy(this.submitSuccess, this))
     //            .done(function(data){
     //                //Process the data we just recieved
     //                data = self.processHtmlData(data);

     //                //Allow unlock
     //                allow_unlock = true;

     //                this_link
     //                    .parents('li.item')
     //                    .animate(
     //                        { height: 'toggle', opacity: 0 },
     //                        { duration: 500, queue: false, done: function(){
     //                            this_link.remove();
     //                        }
     //                    });

     //                this_link
     //                    .parents('li.item')
     //                    .find('.qty-amt')
     //                    .removeClass('qty-amt');

     //                //Update subtotal
     //                self.updateMiscCartItems(data.new_subtotal_data.html());
					// self.cartUnlock();
     //            })
                .fail(function(){
                    alert("There was an error removing \""+this_name+"\" from your cart. Please try again after the page reloads.");
                    // location.reload();
                });
                
        },
        startAddToCartLoading: function(show_cart){
            //Start animations
            //this.old_cart_html = $('#mini-cart').html();  #deprecated

            $('#mini-cart-wrap')
                .find('#mini-cart, .cart-empty, .block-subtitle')
                    .remove()
                .end()
                .prepend('<ol id="mini-cart" class="mini-products-list"><li class="loading"></li></ol>')
                    .find('.loading')
                        .css({opacity:0})
                        .delay(700)
                        .animate({opacity:1}, {duration: 500, queue: true });

            //Make ajax request
            $.ajax({
                type        : "POST",
                url         : location.protocol + "//" + location.host + "/ajaxcart/index",
                data        : this.post_data,
                dataType    : "html",
                cache       : false
            })
                .done($.proxy(this.submitSuccess, this))
                .fail($.proxy(this.submitError, this));

            //If we need to show mini cart, do it now
            if (typeof show_cart !== 'undefined' && show_cart == true && !$(".top-cart-content").hasClass('active'))
            {
                Enterprise.TopCart.showCart();
            }
        },
        validateForm: function(){
            var qty = this.quantity_field.val();
            if(isNaN(qty) || qty == 0 )
               var qty = 1;

            //Check quantity
            if (isNaN(qty) || qty <= 0)
            {
                alert('You must enter a quantity greater than 0.');
                return false;
            }
            else
            {
                //Add quantity to our post data
                this.post_data['qty'] = qty;
            }

            //Check product option fields
            if (this.options_fields.length)
            {
                for(var i = 0; i < this.options_fields.length; i++)
                {
                    var this_field = $(this.options_fields[i]);
                    var field_val = this_field.val();
                    var field_swatches = this_field.parent('.input-box').find('.colorswatch-icon-set li');

                    //Make sure the option selected exists and is not disabled
                    var passed = true;//false;
                    var all_disabled = false;

                    field_swatches.each(function(){
                        var this_swatch = $(this);
                        if (parseInt(this_swatch.attr('rel')) === parseInt(field_val))
                        {
                            if (!this_swatch.is('.disabled'))
                            {
                                passed = true;
                            }
                        }
                    });
                    if (this_field.is('.size-attr'))
                    {
                        all_disabled = field_swatches.filter('.disabled').length === field_swatches.length;
                    }

                    if (!passed || all_disabled)
                    {
                        this.form.find(".colorswatch-outofstock-notice").remove();
                        this.form.find('.size-attr .input-box').after($("<div />", {
                            'class' : "colorswatch-outofstock-notice",
                            'text'   : all_disabled ? "This product is currently out of stock." : "You must select a product color and size."
                        }));
                        return false;
                    }

                    //It passed - add this option to our post data
                    this.post_data[this_field.attr('name')] = this_field.val();

                }
            }

            //Grab other fields and add to post data
			//alert(this.other_fields.length);
            if (this.other_fields.length)
            {
                for(var i = 0; i < this.other_fields.length; i++)
                {
                    var this_field = $(this.other_fields[i]);
                    this.post_data[this_field.attr('name')] = this_field.val();
					//alert(this_field.val());
                }
            }

            //We're validated!
            return true;
        },
        updateMiscCartItems: function(subtotal_paragraph)
        {
            //Remove several items
            $('#topCartContent .subtotal, #topCartContent .cart-empty, #topCartContent .actions').remove();

            //Add back some of these items based on the status of our cart
            var actions_paragraph = "";
            if (subtotal_paragraph === undefined || $.trim(subtotal_paragraph).length == 0)
            {
                subtotal_paragraph = "<p class='cart-empty'>You have no items in your shopping cart.</p>";
            }
            else
            {
                subtotal_paragraph = "<p class='subtotal'>"+subtotal_paragraph+"</p>";
                actions_paragraph = "<div class='actions'><a href='/checkout/cart/' class='product-button'>View Your Cart</a></div>";
            }
            $('#mini-cart-wrap')
                .after( subtotal_paragraph + actions_paragraph);

            //Update the cart quantity
            var new_qty = 0;
            $('#mini-cart-wrap .qty-amt').each(function(){
                new_qty += parseInt($(this).text());
            });

            $('.cartInfo-popup .cart-items-amount-value').html(new_qty);
            if (new_qty > 1) {
                $('.cartInfo-popup .multi-amount').show();
            } else {
                $('.cartInfo-popup .multi-amount').hide();
            }
            if (new_qty > 0 && screen.width <= 768) {
                if ($('#show-cartInfo-popup').val() == 'true') {
                    $('#show-cartInfo-popup').val(false);
                    $('.cartInfo-popup').addClass('active');
                }
            }

            if (new_qty > 0)
            {
                $('.mini-cart-quantity-amt').addClass('cart-has-item').text('('+new_qty+')');
                $('#header-qty-in-cart').text('('+new_qty+')');
				
                $('.cart-container__bottom-panel').show();
            }
            else
            {
                $('.mini-cart-quantity-amt').removeClass('cart-has-item').text('('+new_qty+')');
				$('#header-qty-in-cart').text('('+new_qty+')');
                $('.cart-container__bottom-panel').hide();

            }
        },
        submitSuccess: function(data){
            if (data.length == 0)
            {
                this.submitError();
                return false;
            }

            //Allow unlock
            allow_unlock = true;

            //Process the data we just recieved
            data = this.processHtmlData(data);
            //Stop loading and show our new content
            var self = this;
            $('#mini-cart-wrap')
                .find('.loading')
                    .animate(
                        {opacity:0},
                        {
                            duration: 500, 
                            queue: true
                        })
                    .slideUp(500, function(){
                        //And inject it into our mini cart!
                        $('#mini-cart')
                            .css({opacity:0})
                            .slideUp(20, function(){
                                //Add items
                                $('#mini-cart')
                                    .animate({opacity:1}, {duration:1000, queue: false})
                                    .append(data.new_cart_data)
                                    .slideDown(700);
                                //Update subtotal
                                self.updateMiscCartItems(data.new_subtotal_data.html());
								//Allow another request to happen
								self.cartUnlock();
                                if(!$('.top-cart-content').is('.active'))
                                {
                                    Enterprise.TopCart.showCart();
                                }
                            });                      
                    });

            $('#topCartContent .close-btn').remove();
			quickview.close();
            // Set a callback to auto close after X seconds if safe
            setTimeout(function(){
                // Is it even still expanded?
                // Are you hovering over it?
                // if ($('.top-cart .block-title').is('.active') && !$('.top-cart ').is(':hover') && !active_cart_request)
                if ($('.top-cart-content').is('.active') && !$('.top-cart-content').is(':hover') && !active_cart_request)
                {
                    // Safe to close
                    Enterprise.TopCart.hideCart();
                }
            }, 5000);
			
            $('.cartInfo-popup .cart-subtotal').html(data.new_subtotal_data.html());
        },
        submitError: function(e,f,g){
            if (typeof console !== 'undefined')
            {
                console.error(e,f,g);
            }
            alert('An error was encountered trying to add this product to the cart. Please try again after the page reloads.');
            // location.reload();
        },
        processHtmlData: function(data){
            //So we got the return data
            //Now let's figure out where are our AJAX markers
            var cart_start = data.indexOf('<!-- AJAX-CART-J5wJIfOmQE -->');
            var cart_finish = data.indexOf('<!-- AJAX-CART-m5lsXE77hr -->');
            var subtotal_start = data.indexOf('<!-- AJAX-SUBTOTAL-J5wJIfOmQE -->');
            var subtotal_finish = data.indexOf('<!-- AJAX-SUBTOTAL-m5lsXE77hr -->');

            //Invalid start or finish?
            if (cart_start < 0 || cart_finish < 0)
            {
                this.submitError();
                return false;
            }

            //Check if we have any errors
            this.processHtmlErrors(data);

            //Let's slice the return html based on these markers
            //Make sure start has 31 chars to remove the html comment
            var cart_data = $.trim(data.slice(cart_start+31, cart_finish));
            var subtotal_data = $.trim(data.slice(subtotal_start+31, subtotal_finish));

            //Now it's safe to create a jquery object out of all this
            var new_cart_data = $(cart_data);
            var new_subtotal_data = $(subtotal_data);

            return {
                new_cart_data : new_cart_data,
                new_subtotal_data : new_subtotal_data
            };
        },
        processHtmlErrors: function(html)
        {
            if (html.indexOf('error-msg') !== -1)
            {
                //Let jQuery do the heavy lifting to read the error...
                var error = $(html);
                error.find('li.error-msg').each(function(){
                    alert($(this).text());
                });
                //$('#mini-cart').html(this.old_cart_html);  #deprecated
            }
        }
    }

    doSwatchFixes.prototype = {
        init: function(container) {
            this.container = $(container);
            this.setEvents();
            this.setSizeText();
            this.pickFirstColor();
        },
        pickFirstColor: function() {
            var self = this;
            setTimeout(function() {
                self.container.find(".color-attr .colorswatch-icon-item").not(".disabled").eq(0).click();
            }, 150)
        },
        setEvents: function() {
            var self = this;
            // Add a live click event for the color chooser to display
            // the chosen color, ie. "Selected Color: Black"
            this.container.find('dl.product-options-block dd.color-attr .colorswatch-icon-item').click(function() {
                //Find the container of the item we clicked
                var this_swatch = $(this);
                var this_container = this_swatch.parents('.input-box');

                //If this is currently disabled then end what we're doing
                if (this_swatch.is('.disabled'))
                {
                    return false;
                }

                //Remove any existing message
                this_container.find('.selected-message').remove();

                //Get our color and check that it's valid
                var this_color = this_swatch.find('img').attr('title');
                if (this_color === null || this_color.length === 0)
                {
                    return false;
                }

                //Generate our new message and append it
                var message = "<strong>Selected Color:</strong> " + this_color;
                this_container.append("<div class='selected-message'>"+message+"</div>");

                // Set image size attribute images to plain text
                self.setSizeText();
            });
            
            //Set auto error messages
            this.container.on('click', ".colorswatch-icon-item", function() {
                var this_swatch = $(this);
                var parent_dd = this_swatch.parents("dd");
                var color = parent_dd.parent('dl').find('select.color-attr').val();
                self.container.find(".colorswatch-outofstock-notice").remove();
                if (parent_dd.is('.size-attr') && (color === undefined || color.length <= 0))
                { 
                    $(this).parent().after($("<div />", {
                        "class": "colorswatch-outofstock-notice",
                        text   : "Please select a color prior to selecting a size."
                    }));
                }
                else if (this_swatch.is(".disabled"))
                {
                    var color_name = parent_dd.parent('dl').find('dd.color-attr .active img').attr('title');
                    color_name = color_name.length ? " in \""+color_name+"\" " : "";
                    $(this).parent().after($("<div />", {
                        "class": "colorswatch-outofstock-notice",
                        text   : "Size \""+this_swatch.text()+"\" "+color_name+" is out of stock."
                    }));
                }
                //If we have a current_color, and everything is disabled, then
                //we should fire a click event on the first swatch which will
                //throw an "out of stock" error for us
                var current_color = self.container.find('select.color-attr').val();
                if (current_color && current_color.length)
                {
                    if ($(".size-attr .colorswatch-icon-item:not(.disabled)").length <= 0)
                    {
                        $(".color-attr .colorswatch-icon-set").after($("<div />", {
                            'class' : "colorswatch-outofstock-notice",
                            'text'   : "This color is currently out of stock."
                        }));
                    }
                }
                    
            });
            this.container.find('.product-options').animate({opacity:1}, 500);
        },
        // Cycle through each of the last product swatch items
        // Replace the image inside with plain text
        setSizeText: function() {
            //Remove all the (sold out) indicators, which cause image issues,
            //may not necessarily be accurate, etc.
            this.container.find('.colorswatch-icon-item img').each(function(){
                var this_img = $(this);
                var this_alt = this_img.attr('alt');
                var this_src = this_img.attr('src');
                var this_title = this_img.attr('title');
                if (this_alt && this_alt.indexOf(" (sold out)") !== -1)
                {
                    this_img.attr('alt', this_alt.replace(' (sold out)',''));
                }
                if (this_src && this_src.indexOf("_(sold_out)") !== -1)
                {
                    this_img.attr('src', this_src.replace('_(sold_out)',''));
                }
                if (this_title && this_title.indexOf(" (sold out)") !== -1)
                {
                    this_img.attr('title', this_title.replace(' (sold out)',''));
                }
            });
        }
    };

    doPopupFixes.prototype = {
        init: function(container) {
            this.container = $(container);
            this.rearrangeElements();
            this.skinSelectBox();
            this.setSizeGuideLink();
        },
        // Moves elements in the popup window since we have limited space and can't
        // change their position in the html without affecting the product page
        rearrangeElements: function(){
            //Move wishlist to the end of .product-options-bottom
            this.container
                .find('.add-to-wishlist')
                .appendTo('#popup .product-options-bottom');

            //Move wishlist to the end of .product-options-bottom
            this.container
                .find('.view-details-button')
                .appendTo('#popup .add-to-cart');

            //No longer need this container
            this.container
                .find('.goto-product-view')
                .remove();

            //Remove the lightbox link since we don't want it clickable in popup
            this.container
                .find('.altview-lightbox-trigger img')
                .appendTo(this.container.find('.images-block'));
            this.container
                .find('.altview-lightbox-trigger')
                .remove();

            //Mark .product-options-bottom to let us know things have been JS'ed
            this.container
                .find('.product-options-bottom')
                .addClass('popup-fixes');
        },
        //Skin the select box for the popup window
        skinSelectBox: function(){
            return false; //disabled as we swapped these for type="number" boxes
            //Run selectBoxIt on quantity box ONLY
            var popup = this.container.find("select.qty");
            if (popup.length)
            {
                popup.selectBoxIt({
                    autoWidth: false
                });
            }
        },
        //Set sizing guide link to popup in new window, but only for the quickview store
        //We don't want this happening on normal store pages
        setSizeGuideLink: function() {
            this.container.find('.size-guide-link').attr('target','_blank');
        }
    };
})(jQuery);

/**
 * Gets called once on page load
 */
function product_swatch_fix(){
    new doSwatchFixes(".product-view");
}
/**
 * Gets called each time a popup is triggered
 */
function product_popup_fix(){
    new doSwatchFixes("#popup");
    new doPopupFixes("#popup");
}

/**
 * Fancy ajax add-to-cart functionality
 *
 * @param string container jQuery selector of the form we want to submit
 *
 * @method init
 * @method beginAddToCart Call this function to begin the process of submitting the form
 * @method validateForm Validates that we have relevant options and a correct quantity. Adds all form data to post_data array.
 * @method submitSuccess Callback on sucessful submit
 * @method submitError Callback on submit error
 * @method processHtmlErrors Finds any errors from the ajax request
 *
 * @return miniCartAjax
 */
function miniCartAjax(container) {
    this.init(container);
}
/**
 * Applies various fixes to swatch functionality
 *
 * @param string container jQuery selector to work inside of
 *
 * @method init
 * @method setEvents Adds "selected color" text
 * @method setSizeText Replaces "size" swatch images with plain text
 *
 * @return doSwatchFixes
 */
function doSwatchFixes(container) {
    this.init(container);
}
/**
 * Applies various fixes to popup functionality
 *
 * @param string container jQuery selector to work inside of
 *
 * @method init
 * @method rearrangeElements Moves/changes several elements in window to correct position/states
 * @method skinSelectBox Calls the method to skin the quantity box
 * @method setSizeGuideLink Adds target='_blank' to size guide link in popup
 *
 * @return doPopupFixes
 */
function doPopupFixes(container) {
    this.init(container);
}
