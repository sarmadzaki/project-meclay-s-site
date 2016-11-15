var Userstorysearch = Class.create();
var Userstorysearch = Class.create();
var idInput = '';
Userstorysearch.prototype = {
    initialize: function(searchUrl,maxThumb, idInput){
        this.idInput = idInput;
        this.searchUrl = searchUrl;
        ////////////////this.loadProductUrl = loadProductUrl;
        this.onSuccess = this.onSuccess.bindAsEventListener(this);
        this.onFailure = this.onFailure.bindAsEventListener(this);
        this.currentSearch = '';
        this.currentSuggestion = '';
        this.searchWorking = false;
        this.loadWorking = false;
        this.loadPending = false;
        this.pendingProductId = '';
        this.pendingMoreProductNum = '';
        this.searchPending = false;
        this.moreProductsShowing = false;
        this.currentMoreProductNum = 0;
        this.maxThumb = maxThumb;
    },

    search: function(){
        this.currentMoreProductNum = 0;
        if (this.searchWorking) {
            this.searchPending = true;
            return;
        }
        var searchBox = $(this.idInput);

        if(searchBox.value=='')
        {
            this.updateSuggestedKeyword("Search Product Instantly");
            return;
        }

        if ((this.currentSearch!="") &&(searchBox.value == this.currentSearch)) {
            return;
        }
        this.currentSearch = searchBox.value;

        searchBox.className = 'statusLoading input-text global-search__input';
        var keyword = searchBox.value;

        url = this.searchUrl;

        var parameters = {keyword: keyword};

        new Ajax.Request(url, {
            method: 'post',
            parameters: parameters,
            onSuccess: this.onSuccess,
            onFailure: this.onFeailure
        });

        this.searchWorking = true;
    },

    onFailure: function(transport){
        $(this.idInput).className ="global-search__input";
    },


    onSuccess: function(transport)
    {
        var searchBox = $(this.idInput);
        var showNumResults = $('showNumResults');
        var showViewAll = $('showViewAll');
        if (transport && transport.responseText) {
            try{
                response = eval('(' + transport.responseText + ')');
            }
            catch (e) {
                response = {};
            }

            if (response.stories) {
                this.updateSuggestedKeyword("Search Userstory Instantly");
                this.updateStoryDisplay(response.stories);
                if(response.stories.length > 6)
                    showNumResults.innerHTML = '6 of '+response.stories.length+' RESULTS FOR <span class="global-search__results-search-term" style="text-transform:uppercase">'+this.currentSearch+'</span>';
                else
                    showNumResults.innerHTML = response.stories.length + ' of '+response.stories.length+' results for <span class="global-search__results-search-term">'+this.currentSearch+'</span>';

                showNumResults.style.display = "block";
                showViewAll.style.display = "block";
                searchBox.className = 'statusPlaying input-text global-search__input';
            }
            else
            {
                this.updateSuggestedKeyword('No results for "'+this.currentSearch+'"');
                showNumResults.innerHTML = 'No results for "'+this.currentSearch+'"';
                showNumResults.style.display = "block";
                showViewAll.style.display = "none";
                searchBox.className ="input-text global-search__input";
            }
        }
        this.doneWorking();
    },

    updateStoryDisplay: function(stories) {
        var showProduct = $('showProduct');

        showProduct.style.display = "block";

        var numThumbs = (stories.length >= this.maxThumb) ? this.maxThumb  : stories.length;

        var moreProducts =  new Element('div', { 'id': 'moreProducts'});

        var productContainer = $('productContainer');
        while(productContainer.firstChild){
            productContainer.removeChild(productContainer.firstChild);
        }
        var mainStoryWapper =  new Element('div', { 'id': 'mainStoryWapper', 'class': 'product-item single', 'style': 'display:none'});
        var gridBlock =  new Element('div', { 'id': 'mainStory', 'class': 'product-item-container', 'style': 'display:none'});
        mainStoryWapper.appendChild(gridBlock);
        productContainer.appendChild(mainStoryWapper);
        var display = '';
        var row_style = 1;

        for (var i = 0; i < numThumbs; i++) {
            var storyId = stories[i].id;
            if(i >= 6)
                display = 'display:none';
            mainStoryWapper =  new Element('div', { 'id': 'mainStoryWapper'+storyId, 'class': 'grid-items row', 'style':display});
            var a = new Element('a', {"href": window.location.origin + "/pcatrending/index/view/id/" + stories[i].id, 'class':'grid-item'});
            var image = new Element('div', { 'class':"grid-item__media grid-item__media--full grid-item__block", 'style':"width:657px; background:url(" +  window.location.origin + "/media/" + stories[i].image + ");"});
            var content = new Element('div', { 'class':"grid-item__content grid-item__block"});
            content.innerHTML = "<h3 class='title'>" + stories[i].header + "</h3>" +
                "<p>" + stories[i].quote + "</p>" +
                "<footer>" +
                "<button class='btn btn-rounded'>Read more</button>" +
                "</footer>";

            if ( row_style == 1) {
                mainStoryWapper.className = mainStoryWapper.className + " row--style1";
                a.appendChild(image);
                a.appendChild(content);
                row_style++;
            } else if ( row_style == 2) {
                mainStoryWapper.className = mainStoryWapper.className + " row--style2";
                a.appendChild(content);
                a.appendChild(image);
                row_style++;
            } else if ( row_style == 3) {
                mainStoryWapper.className = mainStoryWapper.className + " row--style3";
                a.appendChild(content);
                a.appendChild(image);
                row_style = 1;
            }

            if ( i == numThumbs-1 || i == 5) {;
                mainStoryWapper.style.paddingBottom = "50px";
            }

            mainStoryWapper.appendChild(a);
            productContainer.appendChild(mainStoryWapper);
        }
        var moreProductsWrapper = $('moreProductsWapper');

        $('moreProducts').remove();
        moreProductsWrapper.appendChild(moreProducts);

        /* all products will be displaying as main product, so we not need display this one
         if (!this.moreProductsShowing) {

         this.moreProductsShowing = true;
         }
         */
       /* this.moreProductsShowing = false;
        for (var i = 0; i < numThumbs; i++) {
            this.loadProductDetail(products[i].id,(i+1));
        }*/
        this.loadWorking = true;
    },

    doneWorking: function() {
        this.searchWorking = false;

        if (this.searchPending) {
            // another search happened while we were processing this one, so we need to take care of it.
            this.searchPending = false;
            this.search();
        }
    },

    updateSuggestedKeyword: function(message)
    {
        $("searchTermkeyword").update(message);
    }

}