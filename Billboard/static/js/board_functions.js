
board = {}


function formatDate(date) {

  var day = date.getDate();
  var monthIndex = parseInt(date.getMonth()) +1;
  var year = date.getFullYear();
  return day + '/0' + monthIndex.toString() + '/' + year;
}


function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

$(document).mouseup(function (e)
{
    var container = $(".dropdown-menu");
    if(!$("#account").is(e.target)){
        if (!container.is(e.target) // if the target of the click isn't the container...
            && container.has(e.target).length === 0) // ... nor a descendant of the container
        {
            container.hide();
        }
     }
});

board.show_create_account_form = function(){
    $("#login").toggle();
    $("#create_user_form").toggle()
}



board.start = function(){
    $(document).ready(function () {
        setInterval(board.poll_posts_and_comments, 3000);
        board.bind_event_handlers();
        ﻿$("#account").unbind("click").bind("click", function(){$(".sign_in").slideToggle();});

        $("#create_user_form").hide();

    });
};

board.bind_event_handlers = function(){
    $("#new_post").bind("click",board.show_post_form);
    $("#send_form").bind("click", board.send_form);
    $("#cancel_form").bind("click",board.hide_form);
    $(".show_comments").bind("click",board.show_hide_comments);
    $(".add_comment").bind("click",board.add_comment);
    $("#send_form").bind("click",board.send_post);
    $(".cancel_comment").bind("click",board.hide_comment_form);
    $(".form-control").on("keyup",board.validate_input);
    $("#create_account").unbind("click").bind("click",board.show_create_account_form);
    $(".collapsed_nav").unbind("click").bind("click",function(){
        $(".navbar-collapse.collapse.in").slideToggle()});

//        $(".delete_comment").bind("click",board.delete_comment);
}

board.validate_input = function()
{
    board.validate_form([$(this)])
}

board.flasher = function(input){
    var flash = setInterval(function(){
        input.toggleClass("form-error")
    },300)
            setTimeout(function(){
                clearInterval(flash)
                input.addClass("form-error")
            },1600)
    return flash;
}

board.flash_form_inputs = function(input_list){
    for(var i=0;i<input_list.length;i++){
        if(!input_list[i].val()){
            board.flasher(input_list[i]);

        }
    }
}

board.validate_form = function(input_list){
    validated=true;
    for(var i=0;i<input_list.length;i++){
        if(!input_list[i].val()){
            input_list[i].addClass("form-error")
            validated=false;
        }
        else{
            input_list[i].removeClass("form-error")
        }
    }
    return validated;

}

board.send_post = function(){
    var post_author = $("#post_author").val()
    var post_text = $("#post_text").val()
    var post_title = $("#post_title").val()
    var csrftoken = getCookie('csrftoken');

    board.flash_form_inputs([$("#post_text"),$("#post_title")])
    if(!board.validate_form([$("#post_text"),$("#post_title")])){
        return;
    }

    $("#new_post_form").slideUp();
    $("#new_post_button_div").slideDown();

    $("#post_author").val("")
    $("#post_text").val("")
    $("#post_title").val("")

    $.ajax("/board/create_post",{
    type: "POST",
    data: {"post_text":post_text,
           "post_author":post_author,
           "post_title":post_title},
    beforeSend: function(xhr, settings) {

        if (!csrfSafeMethod(settings.type)) {
            xhr.setRequestHeader("x-csrftoken", csrftoken);
    }
    }
});


}

board.send_comment = function(){

    var csrftoken = getCookie('csrftoken');
    var post_id = this.closest(".comments_div").id

    board.flash_form_inputs([$("#new_comment_text_"+post_id)])
    if(!board.validate_form([$("#new_comment_text_"+post_id)])){
        return;
    }

    var comment_text = $("#new_comment_text_"+post_id).val();
    var comment_author = $("#new_comment_author_"+post_id).val();

    $("#new_comment_text_"+post_id).val("");
    $("#new_comment_author_"+post_id).val("");

    $(this).closest("div").siblings(".add_comment_div").slideUp();
    $(this).text("add a comment");
    $(this).siblings(".cancel_comment").hide()
    $(this).unbind("click").bind("click",board.add_comment);
//
    $.ajax("/board/save_comment",{
        type: "POST",
        data: {"new_comment_text":comment_text,
               "new_comment_author":comment_author,
               "board_post_id":post_id},
        beforeSend: function(xhr, settings) {

            if (!csrfSafeMethod(settings.type)) {
                xhr.setRequestHeader("x-csrftoken", csrftoken);
        }
        }
    });
};


board.hide_comment_form = function(){
    $(this).closest("div").siblings(".add_comment_div").slideUp();
    $(this).closest("div").siblings(".add_comment_div").find(".new_comment_text").val("").removeClass("form-error");
    $(this).closest("div").siblings(".add_comment_div").find(".author_name").val("").removeClass("form-error")
    $("#author_name").text("");
    $(this).hide('slow').siblings(".add_comment").text("add a comment").unbind("click").bind("click",board.add_comment)
}


board.add_comment = function(){
    $(this).siblings(".cancel_comment").show();
    if($(this).text() == "add a comment"){
        $(this).closest("div").siblings(".add_comment_div").slideDown();
        $(this).text("send comment")
        $(this).unbind("click").bind("click",board.send_comment)
    }
    else
    {
        $(this).closest("div").siblings(".add_comment_div").slideUp();
        $(this).text("add comment");

    }
}

board.show_hide_comments = function(){
    if($(this).text() == "show comments"){
        $(this).closest("div").siblings(".comment").slideDown();
        $(this).text("hide comments")
    }
    else
    {
        $(this).closest("div").siblings(".comment").slideUp();
        $(this).text("show comments");
    }
}



board.hide_form = function(){
    $("#post_author").val("").removeClass("form-error")
    $("#post_text").val("")
    $("#post_title").val("")
    $("#new_post_form").slideUp();
    $("#new_post_button_div").slideDown();

}


board.show_post_form = function(){
    $("#new_post_legend").text(formatDate(new Date()))
    $("#new_post_form").slideDown();
    $("#new_post_button_div").hide();
}


//*************************************add later for an admin role****************************************
//board.delete_comment = function(){
//
//    var csrftoken = getCookie('csrftoken')
//    $(this).closest("div").hide('slow', function(){ $(this).closest("div").remove(); });
//    $.ajax("/"+$(this).val(),{
//        type: "POST",
//        data: {"value":$(this).val()},
//        beforeSend: function(xhr, settings) {
//
//            if (!csrfSafeMethod(settings.type)) {
//                xhr.setRequestHeader("x-csrftoken", csrftoken);
//        }
//        },
//
//    });
//};

board.create_new_comments = function(post_id,comment_html, update){
    update=update || false
    $("#"+post_id).prepend(comment_html)
//    $("#"+post_id + " div.comment:first").children(".delete_comment").bind("click", board.delete_comment)
    if(!update){
            $("#add_comment_div_"+post_id).slideUp();
        }
    if( $("#show_comments_"+post_id).text() != "show comments"){
            $("#"+post_id + " div.comment:first").show();
        }
}

board.create_new_posts = function(post_html){
    num_posts_before_update = $(".post_div").length;
    $("#post_container").prepend(post_html);
    number_of_new_comments = $(".post_div").length - num_posts_before_update;

    for(var i=0;i<number_of_new_comments;i++)
    {
        new_comment_buttons = $($("#post_container").find(".comments_div")[i]).find(".add_show_comments");
        new_comment_buttons.find(".cancel_comment").bind("click",board.hide_comment_form);
        new_comment_buttons.find(".add_comment").bind("click",board.add_comment);
        new_comment_buttons.find(".show_comments").bind("click",board.show_hide_comments);
    }
}


board.poll_posts_and_comments = function(){
    post_ids = [];
    comment_ids = [];
    $("#post_container").find(".post_div").each(function(){ post_ids.push(this.id.replace("#post_",""));});
    $("#post_container").find(".comment").each(function(){comment_ids.push(this.id.replace("comment_",""));});
    if(post_ids.length>0){
        $("#alert").hide()
    }
    else{
        $("#alert").show()
    }
    var csrftoken = getCookie('csrftoken');
    $.ajax("/board/refresh_posts",{
    type: "POST",
    data: {"current_post_ids":JSON.stringify(post_ids),
           "current_comment_ids":JSON.stringify(comment_ids)
    },
    beforeSend: function(xhr, settings) {
        if (!csrfSafeMethod(settings.type)) {
            xhr.setRequestHeader("x-csrftoken", csrftoken);
    }
    },
    success: function (data) {
        board.create_new_posts(data["new_posts"])
        for (i in data["new_comments"]){
            board.create_new_comments(data["new_comments"][i]["post_id"], data["new_comments"][i]["comment_html"], true);
        }
    }
});
}

board.start()
