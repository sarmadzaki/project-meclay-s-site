var EWQuickView = Class.create({
	width: 812,
    overlay: true,
    overlayClose: true,
    transitions: true,
    
    initialize: function (options) {
        Object.extend(this, options || {});
    },
    
	rewritePage: function () {
		if (!$('ewquickview_overlay')) {
			$$('body').first().insert({bottom:'<button id="ewquickview_overlay" style="display: none" title="Quick view">Quick view</button>'});
		
			$('ewquickview_overlay').stopObserving('mouseover').observe('mouseover', function(t2) {
				this.show();
			}.bind(this));
			
			$('ewquickview_overlay').stopObserving('mouseout').observe('mouseout', function(t2) {
				this.hide();
			}.bind(this));
			
			$('ewquickview_overlay').stopObserving('click').observe('click', function(t2) {
				var e = Event.element(t2);
				var pid = e.readAttribute('pid');
				if (pid > 0) {
					this.open(this.url('http://www.pcaskin.com/ewquickview/product/view/', 'id='+pid), "Product Quick View");
				}
			}.bind(this));
		}
		
		$$('div[class*="category-products"] [class*="item"]').each(function(t) {
			var pid = 0;
			var span = t.select("span[id*='product-price-']", "span[id*='product-minimal-price-']", "span[id*='old-price-']", "span[id*='price-excluding-tax-']", "span[id*='extendware-pid-']").first();
			if (span) pid = span.identify().replace('product-price-', '').replace('product-minimal-price-', '').replace('old-price-', '').replace('price-excluding-tax-', '').replace('extendware-pid-', '');
			if (!parseInt(pid)) {
				var btn = t.select("button[class*='btn-cart']").first();
				if (btn) pid = btn.readAttribute('onclick').replace(/.*product\/(\d+)\/.*/g,'$1');
			}
			
			if (!parseInt(pid)) {
				var a = t.select("a[class*='link-wishlist']").first();
				if (a) pid = a.readAttribute('href').replace(/.*product\/(\d+)\/.*/g,'$1');
			}
			pid = parseInt(pid);

			var img = t.select('a[class*="product-image"] img').first();
			if (img && pid > 0) {
				img.stopObserving('mouseover').observe('mouseover', function(t2) {
					this.moveAndShow(Event.element(t2), $('ewquickview_overlay'), pid);
				}.bind(this));
				
				img.stopObserving('mouseout').observe('mouseout', function(t2) {
					this.hide();
				}.bind(this));
			}
		}.bind(this));
	},
	
	url: function(u, p) {
		if (u.indexOf('?') >= 0) {
			u += '&' + p;
		} else u += '?' + p;
		
		return u;
	},
	
	moveAndShow: function(e, e2, pid) {
		if (e.getWidth() > e2.getWidth() && e.getHeight() > e2.getHeight()) {
			var o = e.cumulativeOffset();
			e2.center(e);
	        				var ot = o[1];
				e2.setStyle({
	    			top : ot + 'px'
	    		});
						e2.writeAttribute('pid', pid);
			this.show();
		} else {
			this.hide();
		}
	},
	
	show: function() {
		$('ewquickview_overlay').show();
	}, 
	
	hide: function() {
		$('ewquickview_overlay').hide();
	},
	
	open: function(url,title,params){    
	    url=this.rewriteUrl(url);
	    EWModalbox.setOptions({
	        title:title,
	        width:this.width,
	        overlay:this.overlay,
	        overlayClose:this.overlayClose,
	        transitions: this.transitions,
	        maxTop: 999999,
	        transitions: true	    });
	    EWModalbox.show(url,params);
	},
	
	close: function(s){
		EWModalbox.hide(s, {transitions:true});
	},
	
	rewriteUrl:function(url){
		url = url.replace('http://', window.location.protocol+'//');
        return url.replace('https://', window.location.protocol+'//');
	}
});

var EWQuickViewTrigger = function(){
	ewquickview = new EWQuickView();
	ewquickview.rewritePage();
};
Event.observe(document, 'dom:loaded', EWQuickViewTrigger);	
