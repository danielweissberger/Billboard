
board = {}

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

board.start = function(){
    $(document).ready(function () {
        setInterval(board.poll_posts_and_comments, 500);
        board.bind_event_handlers();
    });
};

board.bind_event_handlers = function(){
    $("#new_post").bind("click",board.show_post_form);
    $("#cancel_form").bind("click",board.hide_form);
    $(".show_comments").bind("click",board.show_hide_comments);
    $(".add_comment").bind("click",board.add_comment);
    $("#send_form").bind("click",board.send_post);
    $(".cancel_comment").bind("click",board.hide_comment_form);
//        $(".delete_comment").bind("click",board.delete_comment);
}

board.send_post = function(){

    var post_author = $("#post_author").val();
    var post_text = $("#post_text").val();
    var post_title = $("#post_title").val();
    var csrftoken = getCookie('csrftoken');

    $("#post_author").val("")
    $("#post_text").val("")
    $("#post_title").val("")

    $.ajax("/create_post",{
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
    board.hide_form();
}

board.send_comment = function(){

    var csrftoken = getCookie('csrftoken');
    var post_id = this.closest(".comments_div").id

    var comment_text = $("#new_comment_text_"+post_id).val();
    var comment_author = $("#new_comment_author_"+post_id).val();
    $("#new_comment_text_"+post_id).val("");
    $("#new_comment_author_"+post_id).val("");

    $(this).closest("div").siblings(".add_comment_div").slideUp();
    $(this).text("add a comment");
    $(this).siblings(".cancel_comment").hide()
    $(this).unbind("click").bind("click",board.add_comment);
//
    $.ajax("/save_comment",{
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
    $("#new_comment_text").text("");
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
    $("#new_post_form").slideUp();
    $("#new_post").slideDown();
    $("#post_text").val("Enter your post text here");
    $("#post_title").val("Title");
    $("#post_author").val("Author");
}


board.show_post_form = function(){
    $("#alert").hide();
    $("#new_post_form").slideDown();
    $("#new_post").hide();
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
    var csrftoken = getCookie('csrftoken');
    $.ajax("/refresh_posts",{
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