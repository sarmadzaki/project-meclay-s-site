document.addEventListener("DOMContentLoaded",function(){
/*==================== Klaviyo Pop-up ===============================*/
	// show popup on click on the footer 'sign up' button
	jQuery(".newsletter-sign-up .button").on('click',function(){
	  jQuery(".klaviyo_modal").fadeIn('slow');
	  ga('send', 'event', { 
	    eventCategory: 'EmailSubscibe', eventAction: 'Offer' }
	  );
	});

	// offer event, if popup is showing
	if (document.cookie.indexOf("klaClosedPopup") < 0) {
        ga('send', 'event', { 
          eventCategory: 'EmailSubscibe', eventAction: 'Offer' }
        );
    }

    // close event
    jQuery('.klaviyo_modal .klaviyo_header_close').on('click',function(){
      ga('send', 'event', { 
        eventCategory: 'EmailSubscibe', eventAction: 'Declined' }
      );
    });

    // success event
    jQuery('.klaviyo_modal').on('success_subscription',function(){
       	ga('send', 'event',{ 
        	eventCategory: 'EmailSubscibe', eventAction: 'Subscribed' }
       	);
        setTimeout(function(e){
        	KlaviyoSubscribe._setCookie("klaClosedPopup","1",31536E6);
            jQuery(".klaviyo_modal").fadeOut('slow');
          }, 2000);
	});

/*==================== Klaviyo Pop-up end ============================*/

// add to cart event for ajax search
  jQuery('.global-search__inner').on('click','.btn-cart.use-ajax',function(e){
    var sku = jQuery(jQuery(e.target).parents('form').children('.no-display').children('input[name^=productSku]')).attr('value');
    ga('send', 'event',{ 
      eventCategory: 'cart', eventAction: 'Add to cart', eventLabel: sku}
    );
  });
  
  jQuery('.btn-cart.use-ajax').on('click',function(e){
    var sku = jQuery(jQuery(e.target).parents('form').children('.no-display').children('input[name^=productSku]')).attr('value');
    ga('send', 'event',{ 
      eventCategory: 'cart', eventAction: 'Add to cart', eventLabel: sku}
    );
  });

  jQuery('.button.standard-black.add-all-products-button').on('click',function(e){
    var sku = jQuery('.no-display').children('input[name^=productSku]').attr('value');
    ga('send', 'event',{ 
      eventCategory: 'cart', eventAction: 'Add to cart', eventLabel: sku}
    );
  });



/*=============================== Checkout events =============================================*/
  jQuery('#checkout-step-login').on('guestCheckout',function(){
    ga('send',{
        hitType: 'event',
        eventCategory: 'CheckoutType', 
        eventAction: 'Guest', 
        eventLabel: 'new customer'
      }
    );
  });
  
  jQuery('#checkout-step-login').on('createUserCheckout',function(){
    ga('send',{
     hitType: 'event', 
     eventCategory: 'CheckoutType', 
     eventAction: 'User Create Account', 
     eventLabel: 'new registered customer' 
   });
  });

  jQuery('#checkout-step-login').on('loginCheckout',function(){
    ga('send',{
     hitType: 'event', 
     eventCategory: 'CheckoutType', 
     eventAction: 'User Login', 
     eventLabel: 'returning registered customer' 
    });
  });
  

  /*==================== Cart info mobile popup events ====================*/
  jQuery('.cartInfo-popup .keep-shopping').on('click', function(e) {
    ga('send', 'event', 'MobileCheckout', 'ContinueOrCheckout', 'continue');
  });

  jQuery('.cartInfo-popup .goto-checkout').on('click', function(e) {
    ga('send', 'event', 'MobileCheckout', 'ContinueOrCheckout', 'checkout');
  });

});