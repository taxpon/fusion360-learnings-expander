function adjustContentSize() {
    $('.fusion-ref-expander-bottom-space').remove();

    var w_height = $(window).height();
    var content_heght = w_height - 257;  // subtract header size
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
    console.log(location.href);
    if(location.href.indexOf('fusion360.autodesk.com/learning/learning.html') != -1) {
        console.log('This website is autodesk reference website.');
        adjustContentSize();

        $(window).resize(function(){
           adjustContentSize();
        });

    } else {
        console.log('This website is NOT autodesk reference website.')
    }


}

main();

