function hideUnnecessaryRegion(){
    $(".fullContainer.autodesk").hide();
    $(".fullContainer.imgHolder").hide();
    $("#sticky_navigation").hide();
}

function setupLinkHistory(){
    console.log('Setup Link History');

    // Left pane
    $("#leftNav").on("click", "a", function(){
        console.log("Clicked Linked Object");
        var title;
        var url;
        var guid = $(this).attr("guid");

        if(guid != "undefined") {
            title = guid;
            url = "learning.html?" + guid;
            var s = {
                'type': 'guid',
                'guid': guid
            };
            window.history.pushState(s, title, url);
        }
    });

    // Right pane
    $("#contentResults").on("click", "a[caaskey]", function(e){
        var title, url;
        var caaskey = $(this).attr("caaskey");

        if(caaskey != "undefined") {
            title = caaskey;
            url = "learning.html?" + caaskey;
            var s = {
                "type": "caaskey",
                "caaskey": caaskey
            };
            window.history.pushState(s, title, url);
        }
    });

    $(window).on("popstate", function(e){
        var state = e.originalEvent.state;
        if(state.type == "guid" && state.guid !== "undefined") {
            BuildBreadcrumb($(this));
            GetCaasKey(state.guid);
        }

        if(state.type == "caaskey" && state.caaskey !== "undefined") {
            GetContent(state.caaskey);
        }
    });

    // Copy from original source
    function BuildBreadcrumb(link) {
        var fullBreadcrumb;
        var $ascendants = $(link).parents('li'), output = [];

        if ($ascendants.length == 1) {
            return;
        }

        $.each($ascendants, function (index, value) {
            var parentLink;
            var parentNextLink;
            var linkTitle;
            var linkGuid;
            var breadcrumbLink;

            if (index == $ascendants.length - 1) {
                parentLink = $(value).children('a:first');
                parentNextLink = $(value).children('ul').children('li').children('a:first');
                linkTitle = removeElements(parentLink.html(), "span");
                linkGuid = parentNextLink.attr('guid');
            } else {
                parentLink = $(value).children('a:first');
                linkTitle = removeElements(parentLink.html(), "span");
                linkGuid = parentLink.attr('guid');
            }

            breadcrumbLink = "<a onclick=\"HandleBreadcrumbClick('" + linkGuid + "');return false;\" class='breadcrumbLink' href='#' contentguid='" + linkGuid + "'>" + linkTitle + "</a>";
            output.push(breadcrumbLink);
        });

        output.reverse();
        fullBreadcrumb = output.join(" / ");
        fullBreadcrumb = "<a href='index.html'>Learning</a> / " + fullBreadcrumb;

        $('#breadcrumb').empty();
        $('#breadcrumb').html(fullBreadcrumb);
    }

    function GetCaasKey(guid) {
        $.ajax({
            url: "http://beehive.autodesk.com/community/service/rest/cloudhelp/resource/cloudhelpchannel/search/jsonp/",
            dataType: "jsonp",
            jsonp: "cb",
            jsonpCallback: "jsonp_" + CryptoJS.SHA1($.param(data)).toString(),
            scriptCharset: "utf-8",
            cache: true,
            data: {
                guid: guid,
                maxresults: "1"
            }
        }).then(function (response) {
            GetContent(response.entries.item[0].caasKey);
        });
    }

    function GetContent(caaskey) {
        var data = {
            key: caaskey
        };

        var scriptMatcher = /<script.+?src=['"](.+?)['"].*?>.*?<\/script>/g;
        $.ajax({
            url: "http://beehive.autodesk.com/community/service/rest/caas/resource/caasdoc2/jsonp",
            dataType: "jsonp",
            jsonp: "cb",
            jsonpCallback: "jsonp_" + CryptoJS.SHA1($.param(data)).toString(),
            scriptCharset: "utf-8",
            cache: true,
            data: data
        }).then(function (data) {
            if (data.entries.item[0]) {
                return data.entries.item[0];
            } else {
                return $.Deferred().reject();
            }
        }).then(function (data) {
            // search for <script src="..."> tags and load them before giving back control
            if (scriptMatcher.test(data.caasContent)) {
                //alert("scriptMatcher true");
                // create loaders for every script
                var scripts = $.map(data.caasContent.match(scriptMatcher), function (tag) {
                    //alert("script match");
                    return $.getScript(scriptMatcher.exec(data.caasContent)[1], document);
                });

                // remove those scripts from the content
                data.caasContent = data.caasContent.replace(scriptMatcher, '');

                // this is a temp fix, should be handled by backend script generator
                data.caasContent = data.caasContent.replace("OO.Player.create('", "if (window.learningVideoPlayer && window.learningVideoPlayer.destroy) window.learningVideoPlayer.destroy(); window.learningVideoPlayer = OO.Player.create('")

                var scriptTags = findElements(data.caasContent, "script");

                //return data;
                return $.when.apply(null, scripts).then(function () { return data; });
            } else {
                return data;
            }
        }).then(function (response) {
            //alert("apply content");
            $('#contentTitle').html(response.title);

            //console.log(found);

            $('#caasContent').html(response.caasContent);
            //$('#caasContent').append(found);

            var linkHandler = "<script>";
            linkHandler += "  $(function () {";
            linkHandler += "    $('#tabs').tabs();";
            linkHandler += "    $('a[caaskey]').on('click', function (e) {";
            linkHandler += "      e.preventDefault();";
            linkHandler += "      HandleCaasContentLinks($(this));";
            linkHandler += "    });";
            linkHandler += "  });";
            linkHandler += "<\/script>";

            $('#caasContent').append(linkHandler);


        });
    }
}

function adjustContentSize() {
    $('.fusion-ref-expander-bottom-space').remove();

    var w_height = $(window).height();
    var content_heght = w_height;
    var $bottom_space = $("<div>");
    $bottom_space.addClass('fusion-ref-expander-bottom-space');
    $bottom_space.height(100);

    // All area
    $(".fullContainer.columns").height(content_heght);

    // Left Nav
    $("#leftNav").height(content_heght);
    $("#leftNav>div:nth-child(3)").height(content_heght);
    $("#leftNav>div:nth-child(3)").append($bottom_space.clone());

    // Content Area
    $("#contentResults").height(content_heght);
    $("#contentResults").append($bottom_space.clone());
}


function main() {
    if(location.href.indexOf('fusion360.autodesk.com/learning/learning.html') != -1) {
        setupLinkHistory();
        hideUnnecessaryRegion();
        adjustContentSize();

        $(window).resize(function () {
            adjustContentSize();
        });
    }
}

$(document).ready(function(){
    main();
});


