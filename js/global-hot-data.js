$(document).ready(setTimeout(function () { // 延迟1s执行，保证其余的先加载

        var COMMENT_ARR = {};
        var COMMENT_COOKIE = document.cookie;
        var COMMENT = {};

        if (COMMENT_COOKIE != '') {
            console.log("load cache data...");
            COMMENT = JSON.parse(COMMENT_COOKIE.split("=")[1]);
            COMMENT_ARR = COMMENT["data"];
        }


        if (COMMENT_COOKIE == '' || new Date().getTime() - COMMENT["date"] > 60 * 1000 * 10) { // request per 10 minutes
            console.log("load data...");
            var resultMap = {};
            var resultArr = [];
            $.ajaxSettings.async = false;
            // sort=comments可以按评论数排序，此处更适合按更新时间排序,可以根据updated排序，但是0条评论的也会出来，所以此处还是全部查出来，内存排序
            // per_page 每页数量，根据需求配置
            console.log("request url:" + "https://api.github.com/repos/jwzzz/blog_comment/issues/comments?sort=created&direction=desc&per_page=10&page=1");
            $.getJSON("https://api.github.com/repos/removeif/blog_comment/issues/comments?sort=created&direction=desc&per_page=10&page=1", function (result) {
                $.each(result, function (i, item) {
                    var contentStr = item.body.trim();
                    if (contentStr.lastIndexOf(">") != -1) {
                        contentStr = contentStr.substr(contentStr.lastIndexOf(">") + 1);
                    }
                    // 替换图片
                    contentStr = contentStr.replace(/![\s\w\](?:http(s)?:\/\/)+[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\*\+,;=.]+\)/g, "[图片]");

                    // 替换网址
                    contentStr = contentStr.replace(/(?:http(s)?:\/\/)+[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\*\+,;=.]+/g, "[网址]");
                    if (contentStr.length > 50) {
                        contentStr = contentStr.substr(0, 60);
                        contentStr += "...";

                    }

                    // 获取跳转url
                    var itemUrl = "";
                    $.ajaxSettings.async = false;
                    $.getJSON(item.issue_url, function (result) {
                        itemUrl = result.body.substr(0, result.body.indexOf("\n") - 1);
                    });
                    // 放入
                    resultArr.push({
                        "content": contentStr,
                        "date": item.created_at,
                        "userName": item["user"].login,
                        "userUrl": item["user"].html_url,
                        "url": itemUrl
                    });
                });
            });

            resultMap["date"] = new Date().getTime();
            resultMap["data"] = resultArr;
            COMMENT_ARR = resultArr;
            if (COMMENT_ARR.length > 0) {
                document.cookie = "comment=" + JSON.stringify(resultMap) + ";path=/";
            }
        }


        if (COMMENT_ARR.length > 0) {
            // 热门评论内容
            var htmlContentWidget = "<h3 class=\"menu-label\">" + "最新评论<br></h3>" + "<div class='comment-content'>";
            for (var i = 0; i < COMMENT_ARR.length; i++) {
                var item = COMMENT_ARR[i];
                var contentStr = item.content;
                htmlContentWidget +=
                    "<div class=\"tag is-success item\">" + "<a href=\"" + item.userUrl + "\"target=\"_blank\">" + item.userName + "</a>&nbsp;" + ">&nbsp;" + "<a href =\"" + item.url + '#comment-container' + "\"target=\"_blank\">" + contentStr + "</a></div><br>";
            }
            htmlContentWidget += "</div>"
            $("#body_hot_comment").html(htmlContentWidget);
        }
        // 加载热门推荐 最多每个小时请求60次
        var classDiv = "";
        var hotContent = "";
        if ($("#index_hot_div").length > 0) {
            var hotDiv = $("#index_hot_div");
            $.ajaxSettings.async = false;
            console.log("request url:" + "https://api.github.com/repos/removeif/blog_comment/issues?per_page=10&sort=comments");
            $.getJSON("https://api.github.com/repos/removeif/blog_comment/issues?per_page=10&sort=comments", function (result) {
                $.each(result, function (i, item) {
                    // 标签配色
                    if (i % 4 == 0) {
                        classDiv = "class=\"tag is-danger\"";
                    } else if (i % 4 == 2) {
                        classDiv = "class=\"tag is-warning\"";
                    } else if (i % 4 == 1) {
                        classDiv = "class=\"tag is-success\"";
                    } else {
                        classDiv = "class=\"tag is-white\"";
                    }
                    hotContent += "<a href =\"" + item.body.substr(0, item.body.indexOf("\n") - 1) + "\"target=\"_blank\"" + classDiv + ">" + item.title.substr(0, item.title.indexOf("-") - 1) + "&nbsp;🔥" + (item.comments*101) + "</a>&nbsp;&nbsp;"
                })
                hotDiv.html("");
                hotDiv.append(hotContent);
            });
        }

        console.clear();
        console.log("~~~~xiu xiu xiu 欢迎光临~~~");
        console.log("~~~~唉，控制台太多报错了，呜呜呜呜~~~");
        console.log("~~~~记得有时间多来看看哦，https://removeif.github.io/")
    }
    ,
    1000
))
;